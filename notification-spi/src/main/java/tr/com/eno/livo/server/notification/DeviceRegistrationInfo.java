package tr.com.eno.livo.server.notification;

public class DeviceRegistrationInfo {

    private boolean registered;
    private String nspToken;
    private String senderIdentifier;

    public DeviceRegistrationInfo() {
    }

    public DeviceRegistrationInfo(boolean registered, String senderIdentifier) {
        
        this.registered = registered;
        this.senderIdentifier = senderIdentifier;
    }

    public DeviceRegistrationInfo(boolean isRegistered, String nspToken, String senderIdentifier) {

        this.registered = isRegistered;
        this.nspToken = nspToken;
        this.senderIdentifier = senderIdentifier;

    }

    public void setRegistered(boolean arg) {

        this.registered = arg;
    }

    public void setNspToken(String arg) {

        this.nspToken = arg;
    }

    public void setSenderIdentifier(String arg) {

        this.senderIdentifier = arg;
    }

    public boolean isRegistered() {

        return this.registered;
    }

    public String getNspToken() {

        return this.nspToken;
    }

    public String getSenderIdentifier() {

        return this.senderIdentifier;
    }
}
