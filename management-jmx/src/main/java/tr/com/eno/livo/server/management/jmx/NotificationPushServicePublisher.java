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
import tr.com.eno.livo.server.notification.NotificationPushService;

public class NotificationPushServicePublisher {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationPushServicePublisher.class);
    
    private ObjectName notifObjectName;
    
    private MBeanServer mBeanServer;
    
    private NotificationPushService service;
    
    protected void start(BundleContext context, Map<String,Object> config) throws MalformedObjectNameException, InstanceAlreadyExistsException, MBeanRegistrationException, NotCompliantMBeanException{
        
        LOGGER.info("Starting jmx  publisher for NotificationPushService...");
        
        this.notifObjectName = new ObjectName(ObjectNames.NOTIFICATION_PUSH_SERVICE);
        
        this.mBeanServer = ManagementFactory.getPlatformMBeanServer();
       
        this.mBeanServer.registerMBean(this.service, this.notifObjectName);
        
       
    
    }
    
    protected void stop() throws InstanceNotFoundException, MBeanRegistrationException{
    
        LOGGER.info("Stopping jmx publisher for NotificationPushService...");
        
        if(this.mBeanServer.isRegistered(this.notifObjectName))
            this.mBeanServer.unregisterMBean(this.notifObjectName);
    
    }
    
    protected void registerService(NotificationPushService service,Map<String,Object> props){
    
        LOGGER.debug("Registering NotificationPushService to the jmx publisher with pid '{}'",props.get(Constants.SERVICE_PID).toString());
        
        this.service = service;
        
    }
    
    protected void unregisterService(Map<String,Object> props){
    
        LOGGER.debug("Unregistering NotificationPushService from the jmx publisher with pid '{}'",props.get(Constants.SERVICE_PID).toString());
        
        this.service = null;
    
    }
    
}
