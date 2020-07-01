package tr.com.eno.livo.server.notification.push;

import com.relayrides.pushy.apns.ApnsEnvironment;
import com.relayrides.pushy.apns.ApnsPushNotification;
import com.relayrides.pushy.apns.DeliveryPriority;
import com.relayrides.pushy.apns.PushManager;
import com.relayrides.pushy.apns.PushManagerConfiguration;
import com.relayrides.pushy.apns.util.ApnsPayloadBuilder;
import com.relayrides.pushy.apns.util.MalformedTokenStringException;
import com.relayrides.pushy.apns.util.SSLContextUtil;
import com.relayrides.pushy.apns.util.SimpleApnsPushNotification;
import com.relayrides.pushy.apns.util.TokenUtil;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;
import javax.net.ssl.SSLContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.notification.NotificationPushService;
import tr.com.eno.livo.server.notification.Notifications;
import tr.com.eno.livo.server.notification.IOSNotification;

public class IOSNotificationPushService implements NotificationPushService {

    private static final String APPLICATION_ID_KEY = "application.id";
    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final String APNS_PROVISIONIN_PROFILE_PATH_KEY = "apns.provisioningProfile.path";
    private static final String APNS_PROVISIONIN_PROFILE_PASSWORD_KEY = "apns.provisioningProfile.password";
    private static final String APNS_USE_SANDBOX_KEY = "apns.useSandbox";
    private static final Logger LOGGER = LoggerFactory.getLogger(IOSNotificationPushService.class);
    private PushManager<SimpleApnsPushNotification> pushManager;
    private String applicationId;

    protected void start(Map<String, Object> config) throws Exception {

        this.applicationId = (String) config.get(APPLICATION_ID_KEY);

        if (applicationId == null) {

            LOGGER.error("Application ID configuration is missing.");

            throw new RuntimeException("Application ID configuration is missing.");
        }

        LOGGER.info("Starting NotificationPushService implementation for iOS...");

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

        String profilePath = (String) config.get(APNS_PROVISIONIN_PROFILE_PATH_KEY);

        if (profilePath == null) {

            LOGGER.error("APNS provisioning profile path is not configured.");

            throw new RuntimeException("APNS provisioning profile path is not configured.");
        }

        if (!Files.exists(Paths.get(profilePath))) {

            LOGGER.error("APNS provisioning profile path points to a non-existing file.");

            throw new RuntimeException("APNS provisioning profile path points to a non-existing file.");
        }

        LOGGER.debug("Using APNS provisioning profile '{}'...", profilePath);

        String profilePassword = (String) config.get(APNS_PROVISIONIN_PROFILE_PASSWORD_KEY);

        if (profilePassword != null && profilePassword.trim().isEmpty()) {
            profilePassword = null;
        }

        LOGGER.debug("Using APNS provisioning profile {} configured password.", profilePassword == null ? "without" : "with");

        boolean useSandbox = Boolean.parseBoolean((String) config.get(APNS_USE_SANDBOX_KEY));
        ApnsEnvironment environment = useSandbox ? ApnsEnvironment.getSandboxEnvironment() : ApnsEnvironment.getProductionEnvironment();

        LOGGER.debug("Using APNS {} endpoint...", useSandbox ? "development sandbox" : "production");

        LOGGER.debug("Loading APNS provisioning profile...");

        SSLContext context = SSLContextUtil.createDefaultSSLContext(profilePath, profilePassword);

        LOGGER.debug("Setting up APNS push manager...");

        this.pushManager = new PushManager<>(environment, context, null, null, new LinkedBlockingQueue<SimpleApnsPushNotification>(500), new PushManagerConfiguration(), "DefaultPushManager");

        LOGGER.info("Successfully started NotificationPushService implementation for iOS.");
    }

    protected void stop() {

        LOGGER.info("Stopping NotificationPushService implementation for iOS...");

        CassandraHelper.disconnect();

        LOGGER.info("Successfully stopped NotificationPushService implementation for iOS.");
    }

    @Override
    public void push(String applicationId, Notifications notifications) throws RuntimeException {

        if (!this.applicationId.equals(applicationId)) {

            LOGGER.debug("Passed application ID '{}' does not match with the service's application ID '{}'; ignoring...", applicationId, this.applicationId);

            return;
        }

        IOSNotification notification = notifications.getAppleNotification();

        if (notification == null) {

            LOGGER.debug("Passed notification bundle does not contain an iOS notification; ignoring...");

            return;
        }

        Set<String> tokenStrings = CassandraHelper.listTokens(applicationId);

        LOGGER.debug("Found '{}' devices to deliver notification.", tokenStrings.size());

        Set<SimpleApnsPushNotification> pushNotifications = new HashSet<>();

        String payload;
        for (String tokenString : tokenStrings) {

            payload = new ApnsPayloadBuilder()
                    .setAlertTitle(notification.getAlertTitle())
                    .setAlertBody(notification.getAlertBody())
                    .setLocalizedAlertTitle(notification.getAlertTitle(), null)
                    .setLocalizedAlertMessage(notification.getAlertBody(), null)
                    .buildWithDefaultMaximumLength();

            try {

                pushNotifications.add(new SimpleApnsPushNotification(TokenUtil.tokenStringToByteArray(tokenString), payload, notification.getInvalidationTime(), notification.isConservePower() ? DeliveryPriority.CONSERVE_POWER : DeliveryPriority.IMMEDIATE));

            } catch (MalformedTokenStringException ex) {

                LOGGER.warn("Malformed token string '{}'; ignoring...", tokenString);
            }
        }

        LOGGER.debug("Queueing '{}' notifications...", pushNotifications.size());

        this.pushManager.getQueue().addAll(pushNotifications);
    }
}
