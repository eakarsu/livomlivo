package tr.com.eno.livo.server.authc.cassandra;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.util.Collections;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import org.apache.shiro.codec.Hex;
import org.apache.shiro.crypto.hash.Sha512Hash;
import org.apache.shiro.util.ByteSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement selectDeviceIdsStatement;
    private static PreparedStatement updateDeviceIdsStatement;
    private static PreparedStatement selectUserPasswordStatement;

    private CassandraHelper() {
    }

    static void connect(String host, int port) {

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

            session.execute("CREATE KEYSPACE IF NOT EXISTS security WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS security.devices (company_id text, user_principal text, device_ids set<text>, PRIMARY KEY (company_id, user_principal));");
            session.execute("CREATE TABLE IF NOT EXISTS security.users (id text, mail text, first_name text, last_name text, password text, password_salt text, active boolean, PRIMARY KEY (id));");

            LOGGER.debug("Preparing statements...");

            selectDeviceIdsStatement = session.prepare("SELECT device_ids FROM security.devices WHERE company_id = ? AND user_principal = ? LIMIT 1;");
            updateDeviceIdsStatement = session.prepare("UPDATE security.devices SET device_ids = device_ids + ? WHERE company_id = ? AND user_principal = ?;");

            selectUserPasswordStatement = session.prepare("SELECT password, password_salt FROM security.users WHERE id = ?;");

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

            LOGGER.error("Failed to connect and setup the Cassandra server.");

            if (!cluster.isClosed()) {
                cluster.close();
            }

            cluster = null;
        }
    }

    static void disconnect() {

        LOGGER.debug("Closing session...");

        session.close();

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        cluster.close();
    }

    static Set<String> getDeviceIDs(String companyId, String userPrincipal) {

        BoundStatement statement = selectDeviceIdsStatement.bind(companyId, userPrincipal);

        Row row = session.execute(statement).one();

        if (row == null || row.isNull("device_ids")) {

            LOGGER.debug("No devices associated with the company ID '{}' and user principal '{}' were found.", companyId, userPrincipal);

            return Collections.EMPTY_SET;
        }

        Set<String> rawSet = row.getSet("device_ids", String.class);

        return Collections.unmodifiableSet(rawSet);
    }

    static void registerDeviceID(String companyId, String userPrincipal, String deviceId) {

        BoundStatement statement = updateDeviceIdsStatement.bind(Collections.singleton(deviceId), companyId, userPrincipal);

        session.execute(statement);
    }

    static boolean checkPassword(String id, String password) {

        BoundStatement statement = selectUserPasswordStatement.bind(id.toLowerCase(Locale.ENGLISH));

        Row row = session.execute(statement).one();

        if (row == null) {

            LOGGER.debug("User '{}' not found.", id);

            return false;
        }

        if (row.isNull("password")) {

            LOGGER.debug("Password retrieved from the database is null.");

            return false;

        }

        if (row.isNull("password_salt")) {

            LOGGER.debug("Password salt retrieved the from database is null.");

            return false;
        }

        String passwordHash = row.getString("password");
        String passwordSalt = row.getString("password_salt");

        ByteSource passwordSource = ByteSource.Util.bytes(password);
        ByteSource passwordSaltSource = ByteSource.Util.bytes(Hex.decode(passwordSalt));

        Sha512Hash hash = new Sha512Hash(passwordSource, passwordSaltSource, 3);

        return Objects.equals(hash.toHex(), passwordHash);
    }
}
