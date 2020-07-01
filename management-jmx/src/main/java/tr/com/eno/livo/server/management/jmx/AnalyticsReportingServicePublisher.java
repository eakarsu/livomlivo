package tr.com.eno.livo.server.management.jmx;

import java.lang.management.ManagementFactory;
import java.util.Map;
import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectName;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReportingService;

public class AnalyticsReportingServicePublisher {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(AnalyticsReportingServicePublisher.class);
    private ObjectName analyticsReportingObjectName;
    private AnalyticsReportingService reportingService;
    private MBeanServer server;

    protected void registerService(
            tr.com.eno.livo.server.analytics.AnalyticsReportingService reportingService,
            Map<String, Object> props) {

        String pid = (String) props.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Registering AnalyticsReportingService instance with PID '{}'...",
                pid);

        this.reportingService = reportingService;
    }

    protected void start(BundleContext context, Map<String, Object> config)
            throws MalformedObjectNameException,
            InstanceAlreadyExistsException, MBeanRegistrationException,
            NotCompliantMBeanException {

        LOGGER.info("Starting JMX publisher for Analytics Services...");

        this.analyticsReportingObjectName = new ObjectName(ObjectNames.ANALYTICS_REPORTING_SERVICE);

        this.server = ManagementFactory.getPlatformMBeanServer();

        this.server.registerMBean(this.reportingService,
                this.analyticsReportingObjectName);
    }

    protected void stop() throws MBeanRegistrationException,
            InstanceNotFoundException, MalformedObjectNameException {

        LOGGER.info("Stopping JMX publisher for Analytics Services...");

        if (this.server.isRegistered(this.analyticsReportingObjectName)) {
            this.server.unregisterMBean(this.analyticsReportingObjectName);
        }
    }

    protected void unregisterService(
            AnalyticsReportingService reportingService,
            Map<String, Object> props) {

        String pid = (String) props.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Unregistering AnalyticsReportingService instance with PID '{}'...",
                pid);

        this.reportingService = null;
    }
}
