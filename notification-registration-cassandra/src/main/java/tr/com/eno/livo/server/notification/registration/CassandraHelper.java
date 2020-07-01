package tr.com.eno.livo.server.notification.registration;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.notification.DeviceRegistrationInfo;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement registerAndroidDevice;
    private static PreparedStatement checkAndroidDeviceRegistration;
    private static PreparedStatement unregisterAndroidDevice;
    private static PreparedStatement registeriOSDevice;
    private static PreparedStatement checkiOSDeviceRegistration;
    private static PreparedStatement unregisteriOSDevice;

    private CassandraHelper() {
    }

    static void connect(String host, int port) {

        // Check if we are already connected
        if (cluster != null && !cluster.isClosed()) {

            LOGGER.debug("Already connected to the Cassandra cluster, ignoring...");

            return;
        }

        LOGGER.debug("Connecting to the Cassandra cluster at '{}:{}'...", host, port);

        cluster = Cluster.builder().addContactPoint(host).withPort(port).withoutJMXReporting().build();

        LOGGER.debug("Initiating session...");

        session = cluster.connect();

        try {

            LOGGER.debug("Creating keyspace...");

            session.execute("CREATE KEYSPACE IF NOT EXISTS notification WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS notification.androidclients (companyId text, userPrincipal text,userDomain text,deviceId text, appName text,nspToken text, PRIMARY KEY ((appName,deviceId)));");
            session.execute("CREATE TABLE IF NOT EXISTS notification.ios_clients (company_id text, user_principal text, device_id text, user_domain text, application_id text, token text, PRIMARY KEY (application_id, token));");

            LOGGER.debug("Preparing statements...");

            registerAndroidDevice = session.prepare("Insert into notification.androidclients(companyId,userPrincipal,userDomain,deviceId,appName,nspToken) values (?,?,?,?,?,?) using ttl 86400;");
            registeriOSDevice = session.prepare("INSERT INTO notification.ios_clients (company_id, user_principal, device_id, user_domain, application_id, token) values (?, ?, ?, ?, ?, ?);");
            checkAndroidDeviceRegistration = session.prepare("select * from notification.androidclients where  appName = ? and deviceId = ?");
            checkiOSDeviceRegistration = session.prepare("SELECT * FROM notification.ios_clients WHERE application_id = ? AND token = ?;");
            unregisterAndroidDevice = session.prepare("delete from notification.androidclients where  appName = ? and deviceId = ? ;");
            unregisteriOSDevice = session.prepare("DELETE FROM notification.ios_clients WHERE application_id = ? AND token = ?;");

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

            LOGGER.error("Failed to connect and setup the Cassandra server.");

            if (!cluster.isClosed()) {
                cluster.close();
            }

            cluster = null;
        }
    }

    static void disconnect() {

        LOGGER.debug("Closing session...");

        session.close();

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        cluster.close();
    }

    static DeviceRegistrationInfo checkiOSDeviceRegistration(String applicationId, String token) {

        LOGGER.debug("Checking device registration for '{}'", token);

        BoundStatement statement = checkiOSDeviceRegistration.bind(applicationId, token);

        Row row = session.execute(statement).one();

        if (row == null || row.isNull("token")) {

            return new DeviceRegistrationInfo(false, null);
        }

        return new DeviceRegistrationInfo(true, token);
    }

    static DeviceRegistrationInfo checkAndroidDeviceRegistration(AuthenticationToken token, String appName, String deviceId) {

        LOGGER.debug("Checking device registration for '{}'", deviceId);
        DeviceRegistrationInfo info = new DeviceRegistrationInfo();

        BoundStatement statement = checkAndroidDeviceRegistration.bind(appName, deviceId);

        Row row = session.execute(statement).one();

        if (row != null && !row.getString("nspToken").isEmpty()) {
            LOGGER.debug("NSP token is " + row.getString("nspToken"));
            info.setRegistered(true);
            info.setNspToken(row.getString("nspToken"));
            info.setSenderIdentifier(CassandraHelper.getGCMSenderIdentifier(appName));
        } else {
            info.setRegistered(false);
            info.setSenderIdentifier(CassandraHelper.getGCMSenderIdentifier(appName));
        }

        return info;
    }

    static void registeriOSDevice(AuthenticationToken authenticationToken, String deviceId, String applicationId, String token) {

        BoundStatement statement = registeriOSDevice.bind(authenticationToken.getCompanyId(), authenticationToken.getUserPrincipal(), deviceId, authenticationToken.getUserDomain(), applicationId, token);

        session.execute(statement);
    }

    static void registerAndroidDevice(AuthenticationToken token, String deviceId, String appName, String nspToken) {

        LOGGER.debug("Registering device with id '{}' to notification service with token '{}'", deviceId, nspToken);

        BoundStatement statement = registerAndroidDevice.bind(token.getCompanyId(), token.getUserPrincipal(), token.getUserDomain(), deviceId, appName, nspToken);

        session.execute(statement);

        LOGGER.debug("Registered the device to the notification service.");
    }

    static void unregisteriOSDevice(AuthenticationToken token, String appName, String deviceId) {

        BoundStatement statement = unregisteriOSDevice.bind(appName, deviceId);

        session.execute(statement);
    }

    static void unregisterAndroidDevice(AuthenticationToken token, String appName, String deviceId) {

        BoundStatement statement = unregisterAndroidDevice.bind(appName, deviceId);

        session.execute(statement);
    }

    private static synchronized String getGCMSenderIdentifier(String appName) {

        //TODO handle senderIdentifier from files. google-services.json 
        //for android and certificates for ios under %AEON_HOME%/data/notification/{appName}/{clientType} folder.
        String filePath = System.getenv("AEON_HOME") + File.separator
                + "data" + File.separator + "notification" + File.separator + appName
                + File.separator + "android" + File.separator + "google-services.json";

        LOGGER.debug("Notification configuration file path'{}' for app '{}'", filePath, appName);

        File file = new File(filePath);

        InputStream fileStream = null;

        try {

            fileStream = new FileInputStream(file);

            String jsonTypeData = IOUtils.toString(fileStream);

            JsonReader reader = Json.createReader(new StringReader(jsonTypeData));

            JsonObject dataObject = reader.readObject();

            fileStream.close();
            //{"project_info":{"project_id":"default-demo-app-199af","project_number":"558150689420","name":"Default Demo App"}

            return dataObject.getJsonObject("project_info").getString("project_number");

        } catch (FileNotFoundException ex) {

            LOGGER.debug("Couldn't found notification service file for the app '{}'", appName);

        } catch (IOException ex) {

            LOGGER.debug("Couldn't read service file for the app '{}'", appName);

        } finally {

            try {
                if (fileStream != null) {
                    fileStream.close();
                }
            } catch (IOException ex) {
                LOGGER.debug("Funny java error, it can become a problem :(");
            }
        }

        return null;

    }
}
