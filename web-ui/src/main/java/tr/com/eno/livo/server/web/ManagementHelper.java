package tr.com.eno.livo.server.web;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import javax.management.InstanceNotFoundException;
import javax.management.JMX;
import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReportingService;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.configurationadmin.proxy.ConfigurationAdminProxyServiceMBean;
import tr.com.eno.livo.server.mail.MailService;
import tr.com.eno.livo.server.management.jmx.ObjectNames;
import tr.com.eno.livo.server.notification.NotificationPushService;
import tr.com.eno.livo.server.users.UserManagementService;
import tr.com.eno.livo.server.users.UserQueryService;

public class ManagementHelper {

    private static final JMXServiceURL SERVICE_URL;
    private static final JMXConnector CONNECTOR;
    private static final Logger LOGGER = LoggerFactory.getLogger(ManagementHelper.class);
    private static final String ENVIRONMENT_LIVO_SERVER_HOST = "LIVO_SERVER_HOST";
    private static final String ENVIRONMENT_LIVO_SERVER_PORT = "LIVO_SERVER_PORT";

    static {

        // Get the server host for URL construction
        String serverHost = System.getenv(ENVIRONMENT_LIVO_SERVER_HOST);
        if (serverHost == null) {

            LOGGER.debug("Using the default server host 'localhost'...");

            serverHost = "";

        } else {

            LOGGER.debug("Using server host '{}'...", serverHost);

            serverHost = System.getenv(ENVIRONMENT_LIVO_SERVER_HOST);
        }

        // Get the server port for URL construction
        String serverPort = System.getenv(ENVIRONMENT_LIVO_SERVER_PORT);
        if (serverPort == null) {

            LOGGER.debug("Using the default server port 6667...");

            serverPort = "6667";

        } else {

            LOGGER.debug("Using server port {}...", serverPort);

            serverPort = System.getenv(ENVIRONMENT_LIVO_SERVER_PORT);
        }

        try {

            SERVICE_URL = new JMXServiceURL(MessageFormat.format("service:jmx:rmi:///jndi/rmi://{0}:{1}/jmxrmi", serverHost, serverPort));

            Map<String, Object> config = new HashMap<String, Object>();
            config.put("com.sun.management.jmxremote.ssl", false);
            config.put("com.sun.management.jmxremote.authenticate", false);

            CONNECTOR = JMXConnectorFactory.connect(SERVICE_URL, config);

            MBeanServerConnection serverConnection = CONNECTOR.getMBeanServerConnection();

            LOGGER.info("MBeanServer domains: {}", Arrays.toString(serverConnection.getDomains()));

            LOGGER.info("MBeanServer default domain: {}", serverConnection.getDefaultDomain());

            LOGGER.info("MBeanServer MBean count: {}", serverConnection.getMBeanCount());

        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }


    public static ApplicationService getApplicationService() throws IOException, InstanceNotFoundException, MalformedObjectNameException {

        // Get the connection
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();

        ApplicationService service = JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.APPLICATION_SERVICE), ApplicationService.class);

        return service;
    }

    public static UserManagementService getUserManagementService() throws MalformedObjectNameException, IOException {

        // Get the connection.
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();

        // Get the service.
        UserManagementService service = JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.USER_MANAGEMENT_SERVICE), UserManagementService.class);

        return service;
    }
    
    public static UserQueryService getUserQueryService() throws IOException, MalformedObjectNameException{  
    
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();

        // Get the service.
        UserQueryService service = JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.USER_QUERY_SERVICE), UserQueryService.class);

        return service;
    }

    public static AnalyticsReportingService getAnalyticsReportingService() throws MalformedObjectNameException, IOException {

//      Get the connection.
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();
//      Get the service.
        AnalyticsReportingService service = JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.ANALYTICS_REPORTING_SERVICE), AnalyticsReportingService.class);

        return service;
    }

    public static MailService getMailService() throws MalformedObjectNameException, IOException {

        // Get the connection.
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();

        // Get the service.
        MailService service = JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.MAIL_SERVICE), MailService.class);

        return service;
    }
    
    public static ConfigurationAdminProxyServiceMBean getPlatformConfigurationAdmin() throws MalformedObjectNameException, IOException, IllegalStateException{
    
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();
        
        return JMX.newMBeanProxy(connection, new ObjectName(ObjectNames.CONFIGURATIONADMIN_PROXY_SERVICE), ConfigurationAdminProxyServiceMBean.class);
    }
    
    public static NotificationPushService getNotificationPushService() throws IOException, MalformedObjectNameException{
    
        MBeanServerConnection connection = CONNECTOR.getMBeanServerConnection();
        
        return JMX.newMXBeanProxy(connection, new ObjectName(ObjectNames.NOTIFICATION_PUSH_SERVICE), NotificationPushService.class);
    }

}
