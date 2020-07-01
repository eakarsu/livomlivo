package tr.com.eno.livo.server.notification;

import java.beans.ConstructorProperties;
import java.util.Date;

public class IOSNotification {

    private final String alertTitle;
    private final String alertBody;
    private final Date invalidationTime;
    private final boolean conservePower;

    public IOSNotification(String alertTitle, String alertBody) {
        this.alertTitle = alertTitle;
        this.alertBody = alertBody;
        this.invalidationTime = null;
        this.conservePower = false;
    }

    @ConstructorProperties({"alertTitle", "alertBody", "invalidationTime", "conversePower"})
    public IOSNotification(String alertTitle, String alertBody, Date invalidationTime, boolean conservePower) {
        this.alertTitle = alertTitle;
        this.alertBody = alertBody;
        this.invalidationTime = invalidationTime;
        this.conservePower = conservePower;
    }

    /**
     * @return the alertTitle
     */
    public String getAlertTitle() {
        return alertTitle;
    }

    /**
     * @return the alertBody
     */
    public String getAlertBody() {
        return alertBody;
    }

    /**
     * @return the invalidationTime
     */
    public Date getInvalidationTime() {
        return invalidationTime;
    }

    /**
     * @return the conservePower
     */
    public boolean isConservePower() {
        return conservePower;
    }
}
