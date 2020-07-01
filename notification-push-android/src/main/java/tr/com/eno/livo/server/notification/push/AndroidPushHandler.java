package tr.com.eno.livo.server.notification.push;

import com.google.android.gcm.server.Message;
import com.google.android.gcm.server.MulticastResult;
import com.google.android.gcm.server.Sender;
import java.io.IOException;
import java.util.List;
import javax.json.JsonException;
import javax.json.stream.JsonParsingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.notification.AndroidNotification;

public class AndroidPushHandler implements Runnable {
    
    private final static Logger LOGGER = LoggerFactory.getLogger(AndroidPushHandler.class);

    private final String apiKey;
    private final List<String> nspTokens;
    private final Message notificationMessage;

    public AndroidPushHandler(String apiKey, List<String> nspTokens, AndroidNotification notification) throws JsonException,JsonParsingException {

        this.apiKey = apiKey;
        this.nspTokens = nspTokens;
        this.notificationMessage = new Message.Builder().
                collapseKey(notification.getCollapseKey()).
                delayWhileIdle(notification.getDelayWhileIdle()).
                setData(notification.getData()).
                timeToLive(notification.getTimeToLive()).build();
                
    }

    @Override
    public void run() {
        
        Sender notificationSender = new Sender(this.apiKey);
        
        try {
            
            MulticastResult result = notificationSender.send(this.notificationMessage, this.nspTokens, 1);
            
            this.resultHandler(result);
        
        } catch (IOException ex) {
            LOGGER.error("IO exception has been occured during notification sending, "
                    + "this handler must use listener style impl, "
                    + "store and retry after communication established again with the ns provider.");
        }catch(IllegalArgumentException ex){
            
            LOGGER.error("No registered clients found for android.");
        
        }
    }

    private void resultHandler(MulticastResult result){
    
        LOGGER.debug(result.toString());
    
    }
}
