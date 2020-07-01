package tr.com.eno.livo.server.application;

import java.awt.Color;
import java.beans.ConstructorProperties;
import java.io.Serializable;
import java.util.Collections;
import java.util.Hashtable;
import java.util.Map;

public class Theme implements Serializable {

    private static final long serialVersionUID = 7012196967190361938L;
    private Map<String, Asset> assets;
    private Map<String, Color> colors;
    private String name;

    public Theme() {
        this(new Hashtable<String, Asset>(), new Hashtable<String, Color>());
    }

    @ConstructorProperties({"assets", "colors"})
    public Theme(Map<String, Asset> assets, Map<String, Color> colors) {

        this.assets = assets;
        this.colors = colors;
    }

    public void addAsset(String name, Asset asset) {

        this.assets.put(name, asset);
    }

    public void addColor(String name, Color color) {

        this.colors.put(name, color);
    }

    public Map<String, Asset> getAssets() {

        return Collections.unmodifiableMap(this.assets);
    }

    public Map<String, Color> getColors() {

        return Collections.unmodifiableMap(this.colors);
    }

    public String getName() {
        return name;
    }

    public void removeAsset(String name) {

        this.assets.remove(name);
    }

    public void removeColor(String name) {

        this.colors.remove(name);
    }

    public void setName(String name) {
        this.name = name;
    }
}
