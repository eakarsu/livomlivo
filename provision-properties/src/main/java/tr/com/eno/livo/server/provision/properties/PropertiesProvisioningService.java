package tr.com.eno.livo.server.provision.properties;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import org.apache.commons.codec.binary.Hex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.Asset;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.provision.Profile;
import tr.com.eno.livo.server.provision.ProvisioningService;

public class PropertiesProvisioningService implements ProvisioningService {

	public final static String ASSETS_PATH = "assets";
	public final static Charset ENCODING_CHARSET = Charset.forName("UTF-8");
	public final static String FILES_PATH = "files";
	public final static String PROVISION_PATH = "provision";
	private final static Logger LOGGER = LoggerFactory
			.getLogger(PropertiesProvisioningService.class);

	private java.io.File assetsDirectory;
	private java.io.File filesDirectory;
	private java.io.File provisionDirectory;

	@Override
	public Profile checkProvision(AuthenticationToken token,
			String applicationName, Profile currentProfile) {

		// Check authentication token.
		if (token.getExpirationTime().before(new Date())) {

			LOGGER.warn(
					"Authentication token with unique value '{}' is expired.",
					token.getUniqueValue());

			throw new SecurityException("Authentication token is expired.");
		}

		File appDirectory = new File(this.provisionDirectory, applicationName);

		if (!appDirectory.exists())
			appDirectory.mkdirs();

		File[] propertiesFiles = appDirectory.listFiles(new FilenameFilter() {

			@Override
			public boolean accept(File dir, String name) {

				return name.endsWith(".properties");
			}
		});

		Arrays.sort(propertiesFiles, new Comparator<File>() {

			@Override
			public int compare(File o1, File o2) {

				return Long.compare(o2.lastModified(), o1.lastModified());
			}
		});

		if (propertiesFiles.length == 0) {

                    LOGGER.warn("No provisioning profiles were found.");
                    
                    return null;
		}

		File latestProfileFile = propertiesFiles[0];

		String latestProfileHash = latestProfileFile.getName().replaceAll(
				".properties", "");

		if (currentProfile != null
				&& latestProfileHash.equalsIgnoreCase(currentProfile.getHash())) {

			LOGGER.debug(
					"Client's provided profile '{}' is already the most recent profile, ignoring...",
					currentProfile.getHash());
			return null;
		}

		Properties filesProps = new Properties();

		try {

			FileInputStream fis = new FileInputStream(latestProfileFile);
			filesProps.load(fis);
			fis.close();

		} catch (Exception e) {

			LOGGER.error(e.getMessage(), e);

			throw new RuntimeException(e);
		}

		Profile profile = new Profile();
		profile.setHash(latestProfileHash);

		tr.com.eno.livo.server.file.File file;
		for (Object hash : filesProps.keySet()) {

			File fileForHash = new File(this.filesDirectory, hash.toString());

			file = new tr.com.eno.livo.server.file.File(hash.toString(),
					filesProps.getProperty(hash.toString()), null);

			if (fileForHash.exists())
				file.setSize(fileForHash.length());
			else
				LOGGER.error(
						"Failed to find a file with the hash '{}' in the files directory...",
						hash);

			profile.getFiles().add(file);
		}

		return profile;
	}

        public Profile createProvision(Application application) {

		// Sanity check.
		if (application == null) {

			LOGGER.error("Passed application argument is null.");

			throw new NullPointerException(
					"Passed application argument is null.");
		}

                // Get the application directory inside assets
		File appDirectory = new File(this.assetsDirectory,
				application.getName());

		// Ensure that the directory exists.
		appDirectory.mkdir();

		// Create the properties object for the new profile
		Properties profileProperties = new Properties();

		// Create an empty set for files
		Set<tr.com.eno.livo.server.file.File> files = new HashSet<tr.com.eno.livo.server.file.File>();

		// Iterate through the assets
		for (String assetName : application.getAssets().keySet()) {

			// Create message digest object for the asset
			MessageDigest assetDigest;
			try {
				assetDigest = MessageDigest.getInstance("SHA-1");
			} catch (NoSuchAlgorithmException e) {
				throw new RuntimeException(e);
			}

			// Get the asset
			Asset asset = application.getAssets().get(assetName);

			// Add the asset path to the digest
			assetDigest.update(asset.getFile().getPath()
					.getBytes(ENCODING_CHARSET));

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

				LOGGER.debug("Moving file from '{}' to '{}'...",
						assetFile.getAbsolutePath(),
						destinationFile.getAbsolutePath());

				// Move the file from the assets directory to the files
				// directory
				try {
					Files.move(assetFile.toPath(), destinationFile.toPath(),
							StandardCopyOption.REPLACE_EXISTING);
				} catch (IOException e) {
					LOGGER.error(
							"Encountered an unexpected error while trying to move the file '{}' to '{}'.",
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
		if (!appProfilesFile.exists())
			appProfilesFile.mkdirs();

		// Create the file object for the profile
		File profileFile = new File(appProfilesFile, profileHash);

		// Save the properties file
		FileOutputStream fos = null;
		try {

			fos = new FileOutputStream(profileFile);
			profileProperties.store(fos, null);

		} catch (Exception e) {

			LOGGER.error(e.getMessage());

		} finally {

			try {
				fos.close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}

		// Create the profile object
		Profile profile = new Profile(profileHash, files,
				Collections.<String, String> emptyMap());

		// Return the profile object
		return profile;
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

	protected void start(Map<String, Object> config) {

		LOGGER.info("Starting properties-file based provisioning service...");

		// Get the AEON home environment variable
		String homePath = System.getenv("AEON_HOME");

		// Sanity check for AEON home path
		if (homePath == null) {

			LOGGER.error("\"AEON_HOME\" environment variable is not set, preventing the PropertiesProvisioningService from starting.");

			throw new RuntimeException(
					"Please set the \"AEON_HOME\" environment variable before launching AEON server.");
		}

		// Calculate the absolute file path to the files directory
		this.provisionDirectory = new java.io.File(homePath, PROVISION_PATH);

		// Calculate the absolute file path to the files directory
		this.filesDirectory = new java.io.File(homePath, FILES_PATH);

		// Calculate the absolute file path to the assets directory
		this.assetsDirectory = new java.io.File(homePath, ASSETS_PATH);

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

		LOGGER.info("Stopping properties-file based provisioning service...");
	}
}
