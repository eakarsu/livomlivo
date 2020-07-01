package tr.com.eno.livo.server.web.utility;

/**
 *
 * @author Livo
 */
public class ApplicationConstants {

    public static String ANDROID_PUSH_NOTIFICATION_FILE_NAME = "google-services.json";

    public static enum PUSH_NOTIFICATION_PLATFORMS {

        ANDROID(0, "ANDROID"), APPLE(1, "APPLE");

        public int value;
        public String text;

        PUSH_NOTIFICATION_PLATFORMS(int v, String t) {
            this.text = t;
            this.value = v;
        }
    }

}
