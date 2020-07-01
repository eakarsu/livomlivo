package tr.com.eno.livo.server.notification;

import java.beans.ConstructorProperties;
import java.util.HashMap;
import java.util.Map;

public class AndroidNotification {

    private String collapseKey;
    private boolean delayWhileIdle = false;
    private Map<String, String> data = new HashMap<>();
    private int timeToLive = 604800;

    public AndroidNotification() {
    }

    @ConstructorProperties({"collapseKey", "delayWhileIdle", "data", "timeToLive"})
    public AndroidNotification(String collapseKey, boolean delayWhileIdle, Map<String, String> data, int timeToLive) {

        this.collapseKey = collapseKey;
        this.delayWhileIdle = delayWhileIdle;
        this.data = data;
        this.timeToLive = timeToLive;

    }

    public void addData(String key, String value) {

        this.data.put(key, value);
    }

    public void setTimeToLive(int timeToLive) {

        this.timeToLive = timeToLive;
    }

    public void setData(Map<String, String> data) {

        this.data = data;
    }

    public void setDelayWhileIdle(boolean delayWhileIdle) {

        this.delayWhileIdle = delayWhileIdle;
    }

    public void setCollapseKey(String collapseKey) {

        this.collapseKey = collapseKey;
    }

    public String getCollapseKey() {
        return this.collapseKey;
    }

    public boolean getDelayWhileIdle() {

        return this.delayWhileIdle;
    }

    public Map<String, String> getData() {

        return this.data;
    }

    public int getTimeToLive() {

        return this.timeToLive;
    }
}
