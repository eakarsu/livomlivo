package tr.com.eno.livo.server.notification.push;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.util.HashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement selectTokensStatement;

    public static void connect(String host, int port) {

        // Check if we are already connected
        if (cluster != null && !cluster.isClosed()) {

            LOGGER.debug("Already connected to the Cassandra cluster, ignoring...");

            return;
        }

        LOGGER.debug("Connecting to the Cassandra cluster at '{}:{}'...", host, port);

        cluster = Cluster.builder().addContactPoint(host).withPort(port).withoutJMXReporting().build();

        LOGGER.debug("Initiating session...");

        session = cluster.connect();

        try {

            LOGGER.debug("Creating keyspace...");

            session.execute("CREATE KEYSPACE IF NOT EXISTS notification WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS notification.ios_clients (company_id text, user_principal text, device_id text, user_domain text, application_id text, token text, PRIMARY KEY (application_id, token));");

            LOGGER.debug("Preparing statements...");

            selectTokensStatement = session.prepare("SELECT token FROM notification.ios_clients WHERE application_id = ?;");

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

            LOGGER.error("Failed to connect and setup the Cassandra server.");

            if (!cluster.isClosed()) {
                cluster.close();
            }

            cluster = null;
        }
    }

    public static void disconnect() {

        LOGGER.debug("Closing session...");

        session.close();

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        cluster.close();
    }

    static Set<String> listTokens(String applicationId) {

        BoundStatement statement = selectTokensStatement.bind(applicationId);

        ResultSet resultSet = session.execute(statement);

        Set<String> tokens = new HashSet<>();

        for (Row row : resultSet) {

            if (!row.isNull("token")) {
                tokens.add(row.getString("token"));
            }
        }

        return tokens;
    }
}
