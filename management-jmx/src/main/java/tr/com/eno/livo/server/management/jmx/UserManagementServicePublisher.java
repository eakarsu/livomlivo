package tr.com.eno.livo.server.management.jmx;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.Map;
import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectName;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.UserManagementService;
import tr.com.eno.livo.server.users.UserQueryService;

public class UserManagementServicePublisher {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(UserManagementServicePublisher.class);

    private ObjectName managementServiceObjectName;
    private MBeanServer server;
    private UserManagementService managementService;
    private UserQueryService queryService;
    private ObjectName queryServiceObjectName;

    protected void start(Map<String, Object> config) throws IOException,
            InstanceAlreadyExistsException, MBeanRegistrationException,
            NotCompliantMBeanException, MalformedObjectNameException {

        LOGGER.info("Starting JMX publisher for user related services...");

        this.managementServiceObjectName = new ObjectName(ObjectNames.USER_MANAGEMENT_SERVICE);

        LOGGER.debug("Using object name '{}' for user management service...",
                managementServiceObjectName);

        this.queryServiceObjectName = new ObjectName(ObjectNames.USER_QUERY_SERVICE);

        LOGGER.debug("Using object name '{}' for user query service...",
                queryServiceObjectName);

        this.server = ManagementFactory.getPlatformMBeanServer();

        this.server
                .registerMBean(this.managementService, this.managementServiceObjectName);
        this.server
                .registerMBean(this.queryService, this.queryServiceObjectName);
    }

    protected void stop() throws MBeanRegistrationException,
            InstanceNotFoundException, MalformedObjectNameException {

        LOGGER.info("Stopping JMX publisher for user related services...");

        this.server.unregisterMBean(this.managementServiceObjectName);
        this.server.unregisterMBean(this.queryServiceObjectName);
    }

    protected void registerService(UserManagementService service,
            Map<String, Object> serviceProps) {

        String pid = (String) serviceProps.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Registering the user management service instance with the PID '{}' to the platform MBean server...",
                pid);

        this.managementService = service;
    }

    protected void registerService(UserQueryService service,
            Map<String, Object> serviceProps) {

        String pid = (String) serviceProps.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Registering the user query service instance with the PID '{}' to the platform MBean server...",
                pid);

        this.queryService = service;
    }

    protected void unregisterService(UserManagementService service,
            Map<String, Object> serviceProps) {

        this.managementService = null;

        String pid = (String) serviceProps.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Unregistering the user management service instance with the PID '{}' from the platform MBean server...",
                pid);
    }

    protected void unregisterService(UserQueryService service,
            Map<String, Object> serviceProps) {

        this.queryService = null;

        String pid = (String) serviceProps.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Unregistering the user query service instance with the PID '{}' from the platform MBean server...",
                pid);
    }
}
