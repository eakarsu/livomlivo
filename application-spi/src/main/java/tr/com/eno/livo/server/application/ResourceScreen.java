package tr.com.eno.livo.server.application;

import java.io.Serializable;

public class ResourceScreen extends Screen implements Serializable {

    private static final long serialVersionUID = -3675949274937081796L;
    private Asset resourceAsset;

    public Asset getResourceAsset() {

        return resourceAsset;
    }

    public void setResourceAsset(Asset resourceAsset) {

        this.resourceAsset = resourceAsset;
    }
}
