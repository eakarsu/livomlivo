package tr.com.eno.livo.server.notification;

import javax.management.MXBean;

@MXBean
public interface NotificationPushService {

    /**
     * Sends notification to the devices that registered to the application.
     * @param appId Name of the application that message will be sent.
     * @param notification Notifications object that contains different platform payloads.
     */
    public void push(String appId, Notifications notification) throws RuntimeException;
}
