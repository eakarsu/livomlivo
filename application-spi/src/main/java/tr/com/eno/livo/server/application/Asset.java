package tr.com.eno.livo.server.application;

import java.io.Serializable;
import tr.com.eno.livo.server.file.File;

public class Asset implements Serializable {

    private static final long serialVersionUID = -2273094229427276228L;
    private File file;
    private String name;

    public File getFile() {
        return file;
    }

    public String getName() {

        return name;
    }

    public void setFile(File file) {
        this.file = file;
    }

    public void setName(String name) {

        this.name = name;
    }

}
