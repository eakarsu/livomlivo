package tr.com.eno.livo.server.web.model;

/**
 *
 * @author Livo
 */
public class LdapConnection {

    private String connectionName;
    private String serverAddress;
    private String serverPort;
    private String baseDn;
    private String dnKey;

    public LdapConnection(String connectionName, String serverAddress, String serverPort, String baseDn, String dnKey) {
        this.connectionName = connectionName;
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        this.baseDn = baseDn;
        this.dnKey = dnKey;
    }

    public LdapConnection() {
    }

    public String getConnectionName() {
        return connectionName;
    }

    public void setConnectionName(String connectionName) {
        this.connectionName = connectionName;
    }

    public String getServerAddress() {
        return serverAddress;
    }

    public void setServerAddress(String serverAddress) {
        this.serverAddress = serverAddress;
    }

    public String getServerPort() {
        return serverPort;
    }

    public void setServerPort(String serverPort) {
        this.serverPort = serverPort;
    }

    public String getBaseDn() {
        return baseDn;
    }

    public void setBaseDn(String baseDn) {
        this.baseDn = baseDn;
    }

    public String getDnKey() {
        return dnKey;
    }

    public void setDnKey(String dnKey) {
        this.dnKey = dnKey;
    }

}
