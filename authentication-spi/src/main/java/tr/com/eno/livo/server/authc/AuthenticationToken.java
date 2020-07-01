package tr.com.eno.livo.server.authc;

import java.beans.ConstructorProperties;
import java.io.Serializable;
import java.util.Date;

public final class AuthenticationToken implements Serializable {

    private static final long serialVersionUID = 7989390305874877101L;

    private final Date authenticationTime;
    private final String companyId;
    private final Date expirationTime;
    private final String uniqueValue;
    private final String userPrincipal;
    private final String userDomain;
    private final String deviceId;

    @ConstructorProperties({"companyId", "userPrincipal", "deviceId", "userDomain", "uniqueValue",
        "authenticationTime", "expirationTime"})
    public AuthenticationToken(String companyId, String userPrincipal, String deviceId,
            String userDomain, String uniqueValue, Date authenticationTime, Date expirationTime) {

        this.companyId = companyId;
        this.userPrincipal = userPrincipal;
        this.deviceId = deviceId;
        this.userDomain = userDomain;
        this.uniqueValue = uniqueValue;
        this.authenticationTime = authenticationTime;
        this.expirationTime = expirationTime;
    }

    public Date getAuthenticationTime() {

        return this.authenticationTime;
    }

    public String getCompanyId() {
        return companyId;
    }

    public Date getExpirationTime() {

        return this.expirationTime;
    }

    public String getUniqueValue() {

        return this.uniqueValue;
    }

    public String getUserPrincipal() {
        return userPrincipal;
    }

    /**
     * @return the deviceId
     */
    public String getDeviceId() {
        return deviceId;
    }

    /**
     * @return the userDomain
     */
    public String getUserDomain() {
        return userDomain;
    }

    @Override
    public boolean equals(Object o) {

        return this.uniqueValue.equals(((AuthenticationToken) o).uniqueValue);
    }

    @Override
    public int hashCode() {

        return this.uniqueValue.hashCode();
    }
}
