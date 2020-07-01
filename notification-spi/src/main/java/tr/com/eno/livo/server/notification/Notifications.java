package tr.com.eno.livo.server.notification;

import java.beans.ConstructorProperties;


public class Notifications {
    
    private AndroidNotification gcmNotification;//Android payload as Json object string
    private IOSNotification appleNotification;//IOS              ||
    
    public Notifications(){}
    
    @ConstructorProperties({"gcmNotification","appleNotification"})
    public Notifications(AndroidNotification gcmNotification,IOSNotification appleNotification){
    
        this.gcmNotification = gcmNotification;
        this.appleNotification = appleNotification;
    }
    
    public void setGcmNotification(AndroidNotification gcmNotification){
    
        this.gcmNotification = gcmNotification;
    }
    
    public void setAppleNotification(IOSNotification appleNotification){
    
        this.appleNotification = appleNotification;
    }
    
    public AndroidNotification getGcmNotification(){
    
        return this.gcmNotification;
    }
    
    public IOSNotification getAppleNotification(){
    
        return this.appleNotification;
    }
}
