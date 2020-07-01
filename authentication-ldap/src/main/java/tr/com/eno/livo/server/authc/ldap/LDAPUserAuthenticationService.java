package tr.com.eno.livo.server.authc.ldap;

import com.unboundid.ldap.sdk.LDAPConnection;
import com.unboundid.ldap.sdk.LDAPException;
import com.unboundid.util.ssl.SSLUtil;
import com.unboundid.util.ssl.TrustAllTrustManager;
import java.security.GeneralSecurityException;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class LDAPUserAuthenticationService implements UserAuthenticationService {

    private final static String USER_DOMAIN_PREFIX = "LDAP";
    private final static Logger LOGGER = LoggerFactory.getLogger(LDAPUserAuthenticationService.class);

    private boolean isConfigured = false;

    private boolean isSSLEnable = false;

    private LDAPConnection connection;

    private String baseDn;

    private String dnkey;
    private String userDomain;

    protected void start(Map<String, Object> props) throws NoSuchFieldException {

        this.handleConfiguration(props);
    }

    protected void stop(Map<String, Object> props) {

        this.connection.close();
    }

    private void handleConfiguration(Map<String, Object> configuration) throws NoSuchFieldException {

        try {

            this.assertNotNull(configuration.get("ldap.baseDn"));
            this.assertNotNull(configuration.get("ldap.dnKey"));
            this.assertNotNull(configuration.get("ldap.serverAdress"));
            this.assertNotNull(configuration.get("ldap.serverPort"));

            synchronized (this.connection) {

                if ((boolean) configuration.get("ldap.sslEnabled") == true) {
                    this.isSSLEnable = true;

                    this.baseDn = configuration.get("ldap.baseDn").toString();

                    this.dnkey = configuration.get("ldap.dnKey").toString();
                    //TODO Enabling thrust all certificates is a problem for MiM attacks. Needs to add server certificate to thrust store.
                    SSLUtil util = new SSLUtil(new TrustAllTrustManager());

                    this.connection = new LDAPConnection(util.createSSLSocketFactory(), configuration.get("ldap.serverAdress").toString(), Integer.parseInt(configuration.get("ldap.serverPort").toString()));
                } else {
                    this.isSSLEnable = false;

                    this.connection = new LDAPConnection(configuration.get("ldap.serverAdress").toString(), Integer.parseInt(configuration.get("ldap.serverPort").toString()));
                }
            }
            this.isConfigured = true;

            this.userDomain = USER_DOMAIN_PREFIX + "@" + configuration.get("ldap.serverAdress").toString();

        } catch (GeneralSecurityException ex) {

            LOGGER.error("GeneralSecurityException : '{}'", ex);
        } catch (LDAPException ex) {
            LOGGER.error("LDAPException : '{}'", ex);
        }

    }

    private void checkAuthenticationTokenSanity(AuthenticationToken token, String methodName) {

        // sanity checks on Authentication token
        if ((token.getExpirationTime().getTime() - System.currentTimeMillis()) <= 0
                || token == null) {

            LOGGER.debug("Token is invalid @ServiceObjectsConfigurationAdmin on method: " + methodName);

            throw new SecurityException("Token is invalid.");
        }
    }

    private void assertNotNull(Object obj) throws NoSuchFieldException {

        //TODO using assertions are better here but assertions needs to be vm enabled via -ea argument. 
        if (obj == null) {
            throw new NoSuchFieldException("Required field is null.");
        }
    }

    @Override
    public AuthenticationToken login(AuthenticationToken companyAuthToken, String id, String secret) throws SecurityException {

        if (!this.isConfigured) {
            throw new RuntimeException("LDAPAuthentication service is not enabled yet.");
        }

        this.checkAuthenticationTokenSanity(companyAuthToken, "LDAPUserAuthenticationService.login");

        String DN = this.dnkey + "=" + id + "," + this.baseDn;

        try {
            this.connection.bind(DN, secret);

            Calendar calendar = Calendar.getInstance();

            Date currentDate = calendar.getTime();

            calendar.add(Calendar.MINUTE, 10);

            Date expirationDate = calendar.getTime();

            return new AuthenticationToken(companyAuthToken.getCompanyId(), id, null, this.userDomain, companyAuthToken.getUniqueValue(), currentDate, expirationDate);
        } catch (LDAPException ex) {
            throw new SecurityException("Failed LDAP authentication", ex);
        }

    }

    @Override
    public void logout(AuthenticationToken token) throws SecurityException {
    }
}
