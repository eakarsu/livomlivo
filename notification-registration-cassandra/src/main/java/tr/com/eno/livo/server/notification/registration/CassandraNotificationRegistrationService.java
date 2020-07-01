package tr.com.eno.livo.server.notification.registration;

import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.notification.DeviceRegistrationInfo;
import tr.com.eno.livo.server.notification.NotificationRegistrationService;

public class CassandraNotificationRegistrationService implements NotificationRegistrationService {

    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraNotificationRegistrationService.class);

    protected void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based NotificationRegistrationService implementation...");

        String host = config.containsKey(CASSANDRA_HOST_CONFIGURATION_KEY) && config.get(CASSANDRA_HOST_CONFIGURATION_KEY) != null ? (String) config
                .get(CASSANDRA_HOST_CONFIGURATION_KEY) : "localhost";

        LOGGER.debug("Using Cassandra host '{}'...", host);

        int port = config.containsKey(CASSANDRA_PORT_CONFIGURATION_KEY) && config.get(CASSANDRA_PORT_CONFIGURATION_KEY) != null ? (Integer) config
                .get(CASSANDRA_PORT_CONFIGURATION_KEY) : 9042;

        LOGGER.debug("Using Cassandra port {}...", port);

        CassandraHelper.connect(host, port);

        LOGGER.debug("Registering shutdown hook to disconnect from Cassandra...");

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {

            @Override
            public void run() {

                CassandraHelper.disconnect();
            }
        }));

        LOGGER.info("Successfully started Cassandra-based NotificationRegistrationService implementation.");
    }

    protected void stop() {

        LOGGER.info("Stopping Cassandra-based NotificationRegistrationService implementation...");

        CassandraHelper.disconnect();

        LOGGER.info("Successfully stopped Cassandra-based NotificationRegistrationService implementation.");
    }

    @Override
    public void registerDevice(AuthenticationToken token, String appName, String clientType, String deviceId, String nspToken) {
        try {

            if (clientType.equalsIgnoreCase("android")) {

                CassandraHelper.registerAndroidDevice(token, deviceId, appName, nspToken);

            } else if ("ios".equalsIgnoreCase(clientType)) {

                CassandraHelper.registeriOSDevice(token, deviceId, appName, nspToken);

            } else {

                throw new RuntimeException("Unknown client type.");
            }

        } catch (Exception ex) {

            throw new RuntimeException(ex);
        }
    }

    @Override
    public DeviceRegistrationInfo checkDeviceRegistration(AuthenticationToken token, String appName, String deviceId, String clientType) {

        if ("android".equalsIgnoreCase(clientType)) {
            return CassandraHelper.checkAndroidDeviceRegistration(token, appName, deviceId);
        }

        if ("ios".equalsIgnoreCase(clientType)) {

            return CassandraHelper.checkiOSDeviceRegistration(appName, deviceId);
        }

        throw new RuntimeException("Unknown client type.");
    }

    @Override
    public boolean unregisterDevice(AuthenticationToken token, String appName, String deviceId, String clientType) {

        try {
            if (clientType.equalsIgnoreCase("android")) {

                CassandraHelper.unregisterAndroidDevice(token, appName, deviceId);

                return true;
                
            } else if ("ios".equalsIgnoreCase(clientType)) {
                
                CassandraHelper.unregisteriOSDevice(token, appName, deviceId);
                
                return true;

            } else {
                throw new RuntimeException("Unknown client type.");
            }

        } catch (Exception ex) {

            LOGGER.error("Error during unregistering user '" + token.getUserPrincipal()
                    + "from domain " + token.getUserDomain() + "' with deviceId '{}' and appId '{}'", deviceId, appName);

            LOGGER.error("Error: '{}'", ex);

            return false;
        }
    }
}
