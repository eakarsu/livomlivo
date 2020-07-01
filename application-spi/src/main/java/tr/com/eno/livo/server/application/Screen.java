package tr.com.eno.livo.server.application;

import java.io.Serializable;

public class Screen implements Serializable {

    private static final long serialVersionUID = 5953096920936918314L;
    private String id;
    private String title;

    public Screen() {
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
