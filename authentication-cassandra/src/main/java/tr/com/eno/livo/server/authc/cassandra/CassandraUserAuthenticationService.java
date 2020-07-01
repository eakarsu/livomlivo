package tr.com.eno.livo.server.authc.cassandra;

import java.io.IOException;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class CassandraUserAuthenticationService implements UserAuthenticationService {

    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final String CASSANDRA_USER_DOMAIN = "System";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraUserAuthenticationService.class);

    protected void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based UserAuthenticationService implementation...");

        String host = config.containsKey(CASSANDRA_HOST_CONFIGURATION_KEY) && config.get(CASSANDRA_HOST_CONFIGURATION_KEY) != null ? (String) config
                .get(CASSANDRA_HOST_CONFIGURATION_KEY) : "localhost";

        LOGGER.debug("Using Cassandra host '{}'...", host);

        int port = config.containsKey(CASSANDRA_PORT_CONFIGURATION_KEY) && config.get(CASSANDRA_PORT_CONFIGURATION_KEY) != null ? (Integer) config
                .get(CASSANDRA_PORT_CONFIGURATION_KEY) : 9042;

        LOGGER.debug("Using Cassandra port {}...", port);

        CassandraHelper.connect(host, port);

        LOGGER.debug("Registering shutdown hook to disconnect from Cassandra...");

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {

            @Override
            public void run() {

                CassandraHelper.disconnect();
            }
        }));

        LOGGER.info("Successfully started Cassandra-based UserAuthenticationService implementation.");
    }

    protected void stop() {

        LOGGER.info("Stopping Cassandra-based UserAuthenticationService implementation...");

        CassandraHelper.disconnect();

        LOGGER.info("Successfully stopped Cassandra-based UserAuthenticationService implementation.");
    }

    @Override
    public AuthenticationToken login(AuthenticationToken companyAuthToken, String userPrincipal, String userCredentials) throws SecurityException {

        if (userPrincipal == null) {

            LOGGER.error("Passed user ID is null.");

            throw new NullPointerException();
        }

        if (userCredentials == null) {

            LOGGER.error("Passed user password is null.");

            throw new NullPointerException();
        }

        if (companyAuthToken == null) {

            LOGGER.error("Passed authentication token is null.");

            throw new NullPointerException();
        }
        
        LOGGER.debug("Logging in user '{}'...", userPrincipal);
        
        if (!CassandraHelper.checkPassword(userPrincipal, userCredentials)) {
            
            LOGGER.error("Authentication of user '{}' failed.", userPrincipal);
            
            throw new SecurityException("Authentication failed.");
        }
        
        AuthenticationToken token = new AuthenticationToken(companyAuthToken.getCompanyId(), userPrincipal.toLowerCase(Locale.ENGLISH), null, CASSANDRA_USER_DOMAIN, companyAuthToken.getUniqueValue(), new Date(), companyAuthToken.getExpirationTime());
        
        return token;
    }

    @Override
    public void logout(AuthenticationToken token) throws SecurityException {
        
        LOGGER.debug("Logging out user '{}'...", token.getUserPrincipal());
    }
}
