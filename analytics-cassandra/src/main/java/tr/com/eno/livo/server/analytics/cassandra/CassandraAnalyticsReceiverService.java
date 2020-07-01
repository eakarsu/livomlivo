package tr.com.eno.livo.server.analytics.cassandra;

import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReceiverService;
import tr.com.eno.livo.server.analytics.ErrorRecord;
import tr.com.eno.livo.server.analytics.EventRecord;
import tr.com.eno.livo.server.analytics.EventRecordFailedException;
import tr.com.eno.livo.server.authc.AuthenticationToken;

public class CassandraAnalyticsReceiverService implements AnalyticsReceiverService {

    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraAnalyticsReceiverService.class);

    protected void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based AnalyticsReceiverService implementation...");

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

        LOGGER.info("Successfully started Cassandra-based AnalyticsReceiverService implementation.");
    }

    protected void stop() {

        LOGGER.info("Stopping Cassandra-based AnalyticsReceiverService implementation...");

        LOGGER.info("Successfully stopped Cassandra-based AnalyticsReceiverService implementation.");
    }

    @Override
    public boolean isOptedIn(AuthenticationToken token) {

        // Get and return the opt-in value
        return CassandraHelper.isUserOptedIn(token.getCompanyId(), token.getUserPrincipal());
    }

    @Override
    public void logError(AuthenticationToken token, ErrorRecord errorRecord) throws EventRecordFailedException {

        LOGGER.debug("Received error with message '{}' from the entity represented by the authentication token with unique ID '{}'.", errorRecord.getMessage(),
                token.getUniqueValue());

        CassandraHelper.saveErrorRecord(errorRecord);

        LOGGER.debug("Saved record for the error with message '{}' using the authentication token with unique ID '{}'.", errorRecord.getMessage(), token
                .getUniqueValue());
    }

    @Override
    public void logEvent(AuthenticationToken token, EventRecord eventRecord) throws EventRecordFailedException {

        LOGGER.debug("Received event named '{}' from the entity represented by the authentication token with unique ID '{}'.", eventRecord.getName(), token
                .getUniqueValue());

        if (eventRecord.getParameters() == null) {
            throw new NullPointerException("Parameters cannot be null.");
        }

        if (!eventRecord.getParameters().containsKey("userPrincipal")) {

            eventRecord.getParameters().put("userPrincipal", token.getUserPrincipal());
        }

        if (!eventRecord.getParameters().containsKey("companyId")) {

            eventRecord.getParameters().put("companyId", token.getCompanyId());
        }

        CassandraHelper.saveEventRecord(eventRecord);

        LOGGER.debug("Saved record for the event named '{}' using the authentication token with unique ID '{}'.", eventRecord.getName(), token.getUniqueValue());
    }

    @Override
    public void optIn(AuthenticationToken token) {

        LOGGER.debug("Opting in the entity represented by the authentication token with unique value '{}'...", token.getUniqueValue());

        CassandraHelper.optInUser(token.getCompanyId(), token.getUserPrincipal());

        LOGGER.debug("Successfully opted in the entity represented by the authentication token with unique value '{}'...", token.getUniqueValue());
    }

    @Override
    public void optOut(AuthenticationToken token) {

        LOGGER.debug("Opting out the entity represented by the authentication token with unique value '{}'...", token.getUniqueValue());

        CassandraHelper.optOutUser(token.getCompanyId(), token.getUserPrincipal());

        LOGGER.debug("Successfully opted out the entity represented by the authentication token with unique value '{}'...", token.getUniqueValue());
    }
}
