package tr.com.eno.livo.server.web.bean;

import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Session;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.prefs.Preferences;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.servlet.ServletContext;
import org.apache.commons.io.FileUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.ServletContextAware;
import tr.com.eno.livo.server.web.CassandraConnector;
import tr.com.eno.livo.server.web.DeveloperPermissions;
import tr.com.eno.livo.server.web.LivoCassandraRealm;

public class InstallationBean implements ServletContextAware {

    private static final Logger LOGGER = LoggerFactory.getLogger(InstallationBean.class);
    private static final String PREFERENCE_INSTALLATION_COMPLETE = "installation.completed";
    private static final Preferences PREFERENCES = Preferences.systemRoot().node("tr.com.eno.livo.server.web");
    private Path assetsPath;
    private ServletContext servletContext;

    public void init() throws IOException, URISyntaxException {

        if (this.isInstalled()) {

            LOGGER.info("Skipping installation as installation is completed successfully before...");

            return;
        }

        this.calculatePaths();

        this.installFrameworkFiles();
    }

    private boolean isInstalled() {

        return PREFERENCES.getBoolean(PREFERENCE_INSTALLATION_COMPLETE, false);
    }

    private void calculatePaths() throws IOException {

        LOGGER.debug("Calculating paths...");

        String homePathString = System.getenv("AEON_HOME");

        if (homePathString == null) {

            LOGGER.error("AEON_HOME environment variable is not defined.");

            throw new RuntimeException("AEON_HOME environment variable is not defined.");
        }

        Path homePath = FileSystems.getDefault().getPath(homePathString);

        if (!Files.exists(homePath, LinkOption.NOFOLLOW_LINKS)) {

            LOGGER.debug("AEON_HOME directory does not exist.");

            LOGGER.debug("Creating home directory at '{}'...", homePath.toAbsolutePath());

            Files.createDirectories(homePath);
        }

        this.assetsPath = homePath.resolve("assets");

        if (!Files.exists(this.assetsPath, LinkOption.NOFOLLOW_LINKS)) {

            LOGGER.debug("Application assets directory does not exist.");

            LOGGER.debug("Creating application assets directory at '{}'...", this.assetsPath.toAbsolutePath());

            Files.createDirectories(this.assetsPath);
        }

        try {

            LOGGER.debug("Checking security manager.");
            org.apache.shiro.mgt.SecurityManager manager = SecurityUtils.getSecurityManager();

            if (manager == null) {
                throw new RuntimeException();
            } else {
                LOGGER.debug("Security manager is ready.");
            }
        } catch (Exception ex) {

            LOGGER.debug("Configuring security manager...");
            DefaultWebSecurityManager man = new DefaultWebSecurityManager(new LivoCassandraRealm());
            man.setSessionManager(new DefaultWebSessionManager());
            SecurityUtils.setSecurityManager(man);
        }

        /**
         * User name and is are same for users table; Other tables gets other
         * two table names as ids which stands for multiplication of same lines
         * on different time.
         */
        try {
            LOGGER.debug("Configuring Cassandra for web-ui if it's not configured yet ...");
            CassandraConnector connector = new CassandraConnector();
            Session session = connector.getSession();
            LOGGER.debug("Creating keyspace for web-ui...");
            session.execute("CREATE KEYSPACE IF NOT EXISTS web WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");
            LOGGER.debug("Creating tables if they are not created yet ...");
            session.execute("CREATE TABLE IF NOT EXISTS web.users (userid int, username text, userpassword blob, passwordsalt blob, usermail text,creationtime bigint,creator text, PRIMARY KEY (userid));");
            session.execute("CREATE TABLE IF NOT EXISTS web.userroles (roleid int,username text, userrole text,time bigint, PRIMARY KEY(roleid));");
            session.execute("CREATE TABLE IF NOT EXISTS web.rolepermissions(permissionid int,permission text,rolename text,time bigint, PRIMARY KEY(permissionid));");
            PreparedStatement statement = session.prepare("INSERT INTO web.users (userid, username, userpassword, passwordsalt, usermail,creationtime,creator) VALUES (?, ?, ?, ?, ?,?,?) IF NOT EXISTS USING TTL 31536000;");
            session.execute(statement.bind("Administrator".hashCode(), "Administrator", ByteBuffer.wrap(new SimpleHash("SHA-256", "Livo", "Livo".getBytes("UTF-8")).getBytes()), ByteBuffer.wrap("Livo".getBytes()), "mail@change.me", new Date().getTime(), "LivoTeam"));
            statement = session.prepare("Insert into web.userroles (roleid,username, userrole,time) values(?,?,?,?) IF NOT EXISTS USING TTL 31536000;");
            session.execute(statement.bind(("Administrator" + "Administrator").hashCode(), "Administrator", "Administrator", new Date().getTime()));
            statement = session.prepare("Insert into web.rolepermissions (permissionid,permission, rolename, time) values (?,?,?,?) IF NOT EXISTS USING TTL 31536000;");
            session.execute(statement.bind("*Administrator".hashCode(), "*", "Administrator", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.MODIFY_SELF.getPermission() + "Developer").hashCode(), DeveloperPermissions.MODIFY_SELF.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.CREATE_MWUSER.getPermission() + "Developer").hashCode(), DeveloperPermissions.CREATE_MWUSER.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.MODIFY_MWUSER.getPermission() + "Developer").hashCode(), DeveloperPermissions.MODIFY_MWUSER.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.DELETE_MWUSER.getPermission() + "Developer").hashCode(), DeveloperPermissions.DELETE_MWUSER.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.CREATE_APPLICATION.getPermission() + "Developer").hashCode(), DeveloperPermissions.CREATE_APPLICATION.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.MODIFY_APPLICATION.getPermission() + "Developer").hashCode(), DeveloperPermissions.MODIFY_APPLICATION.getPermission(), "Developer", new Date().getTime()));
            session.execute(statement.bind((DeveloperPermissions.DELETE_APPLICATION.getPermission() + "Developer").hashCode(), DeveloperPermissions.DELETE_APPLICATION.getPermission(), "Developer", new Date().getTime()));

            connector.disconnect();
            LOGGER.debug("Configured...");

        } catch (Exception e) {

            LOGGER.error("Error during configuration of Cassandra for web-ui : {}", e);
        }
    }

    private void installFrameworkFiles() throws IOException, URISyntaxException {

        LOGGER.debug("Installing framework files...");

        Path frameworkFilesPath = this.assetsPath.resolve("frameworkfiles");

        if (!Files.exists(frameworkFilesPath, LinkOption.NOFOLLOW_LINKS)) {

            LOGGER.debug("Framework files directory does not exist.");

            LOGGER.debug("Creating framework files directory at '{}'...", this.assetsPath.toAbsolutePath());

            Files.createDirectories(frameworkFilesPath);
        }

        LOGGER.debug("Copying framework files...");

        String frameworkFilesSourceString = this.servletContext.getRealPath("/WEB-INF/frameworkfiles/");

        if (frameworkFilesSourceString == null) {

            LOGGER.error("Failed to find the framework files inside the distribution.");

            throw new RuntimeException("Failed to find the framework files inside the distribution.");
        }

        LOGGER.debug("Using source directory '{}' for framework files...", frameworkFilesSourceString);

        Path frameworkFilesSourcePath = Paths.get(frameworkFilesSourceString);

        FileUtils.copyDirectory(frameworkFilesSourcePath.toFile(), frameworkFilesPath.toFile());

        File emdot = new File(frameworkFilesPath.toFile().getPath() + File.separator + "templates" + File.separator + "jquery", "emdot");

        this.writeZipFile(emdot);

        File nightly = new File(frameworkFilesPath.toFile().getPath() + File.separator + "templates" + File.separator + "jquery", "nightly");

        this.writeZipFile(nightly);

        File template1 = new File(frameworkFilesPath.toFile().getPath() + File.separator + "templates" + File.separator + "jquery", "template1");

        this.writeZipFile(template1);

        File template2 = new File(frameworkFilesPath.toFile().getPath() + File.separator + "templates" + File.separator + "jquery", "template2");

        this.writeZipFile(template2);

        LOGGER.debug("Installing cordova files...");

        Path cordovaFilesPath = this.assetsPath.resolve("cordovaFiles");

        if (!Files.exists(cordovaFilesPath, LinkOption.NOFOLLOW_LINKS)) {

            LOGGER.debug("Cordova files directory does not exist.");

            LOGGER.debug("Creating Cordova files directory at '{}'...", this.assetsPath.toAbsolutePath());

            Files.createDirectories(cordovaFilesPath);
        }

        LOGGER.debug("Copying cordova files...");
        String cordovaFilesSourceString = this.servletContext.getRealPath("/WEB-INF/cordovaFiles/");

        if (cordovaFilesSourceString == null) {

            LOGGER.error("Failed to find the cordova files inside the distribution.");

            throw new RuntimeException("Failed to find the cordova files inside the distribution.");
        }

        LOGGER.debug("Using source directory '{}' for cordova files...", cordovaFilesSourceString);

        Path cordovaFilesSourcePath = Paths.get(cordovaFilesSourceString);

        FileUtils.copyDirectory(cordovaFilesSourcePath.toFile(), cordovaFilesPath.toFile());

        File cordovaFiles = new File(cordovaFilesPath.toFile().getPath()+File.separator+"requiredFiles");
        this.writeZipFile(cordovaFiles);

    }

    @Override
    public void setServletContext(ServletContext servletContext) {

        this.servletContext = servletContext;
    }

    private void getAllFiles(File dir, List<File> fileList) throws IOException {

        File[] files = dir.listFiles();

        if (files != null) {

            for (File file : files) {
                fileList.add(file);
                if (file.isDirectory()) {
//                    LOGGER.debug("directory:" + file.getCanonicalPath());
                    getAllFiles(file, fileList);
                }
            }
        } else {
            LOGGER.debug("File not found in application : " + dir.getAbsolutePath());
        }

    }

    private void writeZipFile(File directoryToZip) throws FileNotFoundException, IOException {

        List<File> fileList = new ArrayList<File>();

        this.getAllFiles(directoryToZip, fileList);

        String zipFilePath = directoryToZip.getParentFile().getPath() + File.separator + directoryToZip.getName();

        FileOutputStream fos = new FileOutputStream(zipFilePath + ".zip");

        ZipOutputStream zos = new ZipOutputStream(fos);

        for (File file : fileList) {
            if (!file.isDirectory()) { // we only zip files, not directories
                addToZip(directoryToZip, file, zos);
            }
        }
        zos.close();
        fos.close();
    }

    private void addToZip(File directoryToZip, File file, ZipOutputStream zos) throws FileNotFoundException, IOException {
//        LOGGER.debug("addToZip() with {} :" + " directoryToZip : " + directoryToZip.getAbsolutePath() + " File Name : " + file.getName() + " ZipOutputStream : " + zos.toString());

        FileInputStream fis = new FileInputStream(file);
        // we want the zipEntry's path to be a relative path that is relative to the directory being zipped, so chop off the rest of the path
        String zipFilePath = file.getCanonicalPath().substring(directoryToZip.getCanonicalPath().length() + 1, file.getCanonicalPath().length());
        zipFilePath = zipFilePath.replaceAll("\\\\", "/");
//        LOGGER.debug("Writing '" + zipFilePath + "' to zip file.");
        ZipEntry zipEntry = new ZipEntry(zipFilePath);

        zos.putNextEntry(zipEntry);

        byte[] bytes = new byte[1024];

        int length;

        while ((length = fis.read(bytes)) >= 0) {
            zos.write(bytes, 0, length);
        }

        zos.closeEntry();
        fis.close();
    }
}
