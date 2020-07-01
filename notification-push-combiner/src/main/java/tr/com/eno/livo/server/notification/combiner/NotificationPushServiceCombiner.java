package tr.com.eno.livo.server.notification.combiner;

import java.util.HashMap;
import java.util.Map;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.notification.Notifications;
import tr.com.eno.livo.server.notification.NotificationPushService;

public class NotificationPushServiceCombiner implements NotificationPushService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationPushServiceCombiner.class);

    private final Map<String, NotificationPushService> services = new HashMap<>();

    protected void registerService(NotificationPushService service, Map<String, Object> properties) {

        LOGGER.debug("Registering NotificationPushService with pid '{}'", properties.get(Constants.SERVICE_PID).toString());

        synchronized (this.services) {
            
            this.services.put(properties.get(Constants.SERVICE_PID).toString(), service);
        }

    }

    protected void unregisterService(Map<String, Object> props) {

        LOGGER.debug("Unregistering NotificationPushService with pid '{}'", props.get(Constants.SERVICE_PID).toString());
        
        synchronized(this.services){
        
            this.services.remove(props.get(Constants.SERVICE_PID));
        }
    }

    @Override
    public void push(String appId, Notifications notification) throws RuntimeException {
        
        synchronized(this.services){
        
            for(String s : this.services.keySet()){
            
                LOGGER.debug("Sending notification via '{}'",s);
                
                this.services.get(s).push(appId, notification);
            
            }
        
        }
        
    }

}
