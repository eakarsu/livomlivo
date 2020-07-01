package tr.com.eno.livo.server.provision.properties;

import static tr.com.eno.livo.server.provision.properties.PropertiesProvisioningService.ENCODING_CHARSET;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import org.apache.commons.codec.binary.Hex;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.application.Asset;


public class PropertiesProvisioningApplicationEventHandler implements
        EventHandler {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(PropertiesProvisioningApplicationEventHandler.class);
    private File assetsDirectory;
    private File filesDirectory;
    private File provisionDirectory;

    @Override
    public void handleEvent(Event event) {

        LOGGER.debug("Received event of topic '{}'...", event.getTopic());

        if (event.getTopic().equals(
                ApplicationService.APPLICATION_DEPLOYED_EVENT_TOPIC)) {

            this.applicationDeployed((Application) event
                    .getProperty("application"));
        }
    }

    protected void applicationDeployed(
            Application application) {

        LOGGER.debug(
                "Calculating provisioning profile for the deployed application with the unique name '{}'...",
                application.getName());

//        // Check authentication token.
//        if (token.getExpirationTime().before(new Date())) {
//
//            LOGGER.warn(
//                    "Authentication token with unique value '{}' is expired.",
//                    token.getUniqueValue());
//
//            throw new SecurityException("Authentication token is expired.");
//        }

        // Get the application directory inside assets
        File appDirectory = new File(this.assetsDirectory,
                application.getName());

        // Ensure that the directory exists
        appDirectory.mkdir();

        // Create the properties object for the new profile
        Properties profileProperties = new Properties();

        // Create an empty set for files
        Set<tr.com.eno.livo.server.file.File> files = new HashSet<tr.com.eno.livo.server.file.File>();

        // Iterate through the assets
        for (String assetName : application.getAssets().keySet()) {

            // Get the asset
            Asset asset = application.getAssets().get(assetName);

            // Get the file for the asset
            File assetFile = new File(appDirectory, asset.getFile().getPath());

            // Calculate the hash for the file
            String fileHash = this.calculateHashForFile(assetFile);

            LOGGER.debug(
                    "Calculated the hash of the asset with path '{}' belonging to application named '{}' as '{}'.",
                    asset.getFile().getPath(), application.getName(),
                    fileHash);

            // Create the destination file
            File destinationFile = new File(this.filesDirectory, fileHash);

            // Check whether the file exists
            if (destinationFile.exists()) {

                LOGGER.debug(
                        "File with the hash '{}' already exists, skipping file movement...",
                        fileHash);
            } else {

                LOGGER.debug("Copying file from '{}' to '{}'...",
                        assetFile.getAbsolutePath(),
                        destinationFile.getAbsolutePath());

				// Copy the file from the assets directory to the files
                // directory
                try {
                    Files.copy(assetFile.toPath(), destinationFile.toPath(),
                            StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    LOGGER.error(
                            "Encountered an unexpected error while trying to copy the file '{}' to '{}'.",
                            assetFile.getAbsolutePath(),
                            destinationFile.getAbsolutePath());
                    throw new RuntimeException(e);
                }
            }

			// Create the file object
            // TODO Set an appropriate content type
            tr.com.eno.livo.server.file.File file = new tr.com.eno.livo.server.file.File(
                    fileHash, asset.getFile().getPath(), null);

			// Add the file object to the set
            // TODO What is the reason of this "files" set?
            files.add(file);

            // Add the asset to the provisioning profile
            profileProperties.put(fileHash, asset.getFile().getPath());
        }

        // Calculate the profile hash
        String profileHash = this.calculateHashForProfile(profileProperties);

        // Create the file object for the application profiles directory
        File appProfilesFile = new File(this.provisionDirectory,
                application.getName());

        // Create the application provisioning directory if needed
        if (!appProfilesFile.exists()) {
            appProfilesFile.mkdirs();
        }

        // Create the file object for the profile
        File profileFile = new File(appProfilesFile, profileHash
                + ".properties");

        // Save the properties file
        FileOutputStream fos = null;
        try {

            fos = new FileOutputStream(profileFile);
            profileProperties.store(fos, null);

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

        } finally {

            try {
                fos.close();
            } catch (IOException e) {
                
                LOGGER.error(e.getMessage(), e);
                
                throw new RuntimeException(e);
            }
        }
        
        LOGGER.debug("Successfully completed provisioning of '{}'.", application.getName());
    }

    protected void applicationSaved(Application application) {
    }

    protected String calculateHashForFile(File file) {

        // Create a MessageDigest instance
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-1");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        // Create a file input stream to read the file
        FileInputStream fis = null;
        try {

            // Open the file for reading
            fis = new FileInputStream(file);

            // Update the digest as file is read
            int readByte;
            while ((readByte = fis.read()) != -1) {

                digest.update((byte) readByte);
            }

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

        } finally {

            // Try to close the stream
            try {

                if (fis != null) {
                    fis.close();
                }

            } catch (IOException e) {

                LOGGER.error("Failed to close the file '{}'.",
                        file.getAbsolutePath());
            }
        }

        // Create a Hex instance
        Hex hex = new Hex(ENCODING_CHARSET.name());

        // Return the Hex encoded string
        return new String(hex.encode(digest.digest()));
    }

    protected String calculateHashForProfile(Properties properties) {

        // Create a MessageDigest instance
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-1");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        // Iterate through the profile items
        for (Object hash : properties.keySet()) {

            // Update the profile hash with file hash
            digest.update(hash.toString().getBytes(ENCODING_CHARSET));

            // Update the profile hash with file path
            digest.update(properties.getProperty(hash.toString()).getBytes(
                    ENCODING_CHARSET));
        }

        // Create a Hex instance
        Hex hex = new Hex(ENCODING_CHARSET.name());

        // Return the Hex encoded string
        return new String(hex.encode(digest.digest()));
    }

    protected void start() {

        // Get the AEON home environment variable
        String homePath = System.getenv("AEON_HOME");

        // Sanity check for AEON home path
        if (homePath == null) {

            LOGGER.error("\"AEON_HOME\" environment variable is not set, preventing the PropertiesProvisioningService from starting.");

            throw new RuntimeException(
                    "Please set the \"AEON_HOME\" environment variable before launching AEON server.");
        }

        // Calculate the absolute file path to the files directory
        this.provisionDirectory = new java.io.File(homePath,
                PropertiesProvisioningService.PROVISION_PATH);

        // Calculate the absolute file path to the files directory
        this.filesDirectory = new java.io.File(homePath,
                PropertiesProvisioningService.FILES_PATH);

        // Calculate the absolute file path to the assets directory
        this.assetsDirectory = new java.io.File(homePath,
                PropertiesProvisioningService.ASSETS_PATH);

        // Create the assets directory if needed
        if (!this.assetsDirectory.exists()) {

            LOGGER.info("AEON assets directory does not exist.");

            if (this.assetsDirectory.mkdirs()) {

                LOGGER.info("AEON assets directory is successfully created.");

            } else {

                LOGGER.info("AEON assets directory could not be created.");

                throw new RuntimeException(
                        "AEON assets directory could not be created at path \""
                        + this.assetsDirectory.getAbsolutePath()
                        + "\", please check the write permissons or create it manually.");
            }
        }

        // Create the files directory if needed
        if (!this.filesDirectory.exists()) {

            LOGGER.info("AEON files directory does not exist.");

            if (this.filesDirectory.mkdirs()) {

                LOGGER.info("AEON files directory is successfully created.");

            } else {

                LOGGER.info("AEON files directory could not be created.");

                throw new RuntimeException(
                        "AEON files directory could not be created at path \""
                        + this.filesDirectory.getAbsolutePath()
                        + "\", please check the write permissons or create it manually.");
            }
        }

        // Create the provision directory if needed
        if (!this.provisionDirectory.exists()) {

            LOGGER.info("AEON provisioning directory does not exist.");

            if (this.provisionDirectory.mkdirs()) {

                LOGGER.info("AEON provisioning directory is successfully created.");

            } else {

                LOGGER.info("AEON provisioning directory could not be created.");

                throw new RuntimeException(
                        "AEON provisioning directory could not be created at path \""
                        + this.provisionDirectory.getAbsolutePath()
                        + "\", please check the write permissons or create it manually.");
            }
        }
    }

    protected void stop() {

    }
}
