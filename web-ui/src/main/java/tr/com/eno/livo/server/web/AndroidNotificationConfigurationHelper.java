package tr.com.eno.livo.server.web;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.management.MalformedObjectNameException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.configurationadmin.proxy.ConfigurationAdminProxyServiceMBean;

public class AndroidNotificationConfigurationHelper {
    
    private final static Logger LOGGER = LoggerFactory.getLogger(AndroidNotificationConfigurationHelper.class);
            
    
    private final ConfigurationAdminProxyServiceMBean confAdmin;
    
    private final UUID androidUUID;
    
    private static final String ANDROID_NOTIFICATION_PUSH_SERVICE_PID = "tr.com.eno.livo.server.notification.push.android";
    
    //private static final String IOS_NOTIFICATION_PUSH_SERVICE_PID ="TODO";
    
    /**
     * Configures android push services inside mw.
     * So this class must not handle ios and android at the same time.
     * @throws MalformedObjectNameException
     * @throws IOException 
     */
    public AndroidNotificationConfigurationHelper() throws MalformedObjectNameException, IOException{
    
       this.confAdmin = ManagementHelper.getPlatformConfigurationAdmin();
       
       this.androidUUID = this.confAdmin.getConfiguration(ANDROID_NOTIFICATION_PUSH_SERVICE_PID);
    
    }
    /**
     * Do not create a new tabular data, get via getAndroidConfiguration method,
     * modify it and set it again. During this cycle do not remove any other pairs.
     * @param data configuration.
     * @throws IOException 
     */
    public void setAndroidConfiguration(Map data) throws IOException{
    
        this.confAdmin.update(this.androidUUID, data);
    
    } 
    
    public Map getAndroidConfiguration() throws Exception{
        
        Map config = this.confAdmin.getProperties(this.androidUUID);
        return (config!=null)?config:new HashMap();
    }
    
    public void finish(){
    
        this.confAdmin.removeIdentifier(this.androidUUID);
    }
    
}
