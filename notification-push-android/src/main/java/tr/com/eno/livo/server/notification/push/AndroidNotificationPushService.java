package tr.com.eno.livo.server.notification.push;

import com.datastax.driver.core.Row;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.notification.Notifications;
import tr.com.eno.livo.server.notification.NotificationPushService;

public class AndroidNotificationPushService implements NotificationPushService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(AndroidNotificationPushService.class);
    
    private Map<String, String> appApiKeys = new HashMap<>();
    
    protected void start(Map<String, Object> config) {
        
        CassandraHelper.connect("localhost", 9042);
        
        LOGGER.debug("Starting AndroidNotificationPushService...");
        
        for (String key : config.keySet()) {
            
            if (!key.equalsIgnoreCase(Constants.SERVICE_PID) && !key.equalsIgnoreCase("component.name")&&!key.equalsIgnoreCase("component.id")) {
                
                LOGGER.info("Adding '{}' with apiKey '{}'", key, config.get(key).toString());
                
                this.appApiKeys.put(key, config.get(key).toString());
            }
            
        }
        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            
            @Override
            public void run() {
                
                CassandraHelper.disconnect();
            }
        }));
    }
    
    protected void stop() {
        
        LOGGER.debug("Stopping AndroidNotificationService...");
        
        CassandraHelper.disconnect();
        
        LOGGER.debug("Disconnected from cassandra.");
        
    }
    
    protected synchronized void update(Map<String, Object> config) {
        
        LOGGER.info("Modifiying AndroidNotificationPushService");
        
        Map<String, String> newApiKeys = new HashMap<>();
        
        for (String key : config.keySet()) {
            
            if (!key.equalsIgnoreCase(Constants.SERVICE_PID) && !key.equalsIgnoreCase("component.name") &&!key.equalsIgnoreCase("component.id")) {
                
                LOGGER.info("Adding '{}' with apiKey '{}'", key, config.get(key).toString());
                
                newApiKeys.put(key, config.get(key).toString());
            }
            
        }
        
        this.appApiKeys = newApiKeys;
        
    }
    
    @Override
    public void push(String appId, Notifications notification) throws RuntimeException {
        
        if (this.appApiKeys.get(appId) == null || this.appApiKeys.get(appId).isEmpty()) {
           
            throw new RuntimeException("Given application's notification configuration is not found.");
        }
        
        List<Row> registryInfo = CassandraHelper.getAndroidDevices(appId);
        
        List<String> nspTokens = new ArrayList<>();
        
        for(Row row: registryInfo)
        {
            nspTokens.add(row.getString("nspToken"));
        }
        
        if(nspTokens.size()<1)
            LOGGER.debug("No android client(s) is(are) found for this application");
        
        new Thread(new AndroidPushHandler(this.appApiKeys.get(appId), nspTokens, notification.getGcmNotification())).start();
        
    }   
}
