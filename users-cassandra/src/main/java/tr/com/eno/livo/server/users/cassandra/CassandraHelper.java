package tr.com.eno.livo.server.users.cassandra;

import com.datastax.driver.core.BatchStatement;
import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.apache.shiro.codec.Hex;
import org.apache.shiro.crypto.SecureRandomNumberGenerator;
import org.apache.shiro.crypto.hash.Sha512Hash;
import org.apache.shiro.util.ByteSource;
import org.apache.shiro.util.SimpleByteSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static final SecureRandomNumberGenerator RANDOM_NUMBER_GENERATOR = new SecureRandomNumberGenerator();
    private static final int HASH_ITERATIONS = 3;
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement selectAllUsersStatement;
    private static PreparedStatement selectGroupStatement;
    private static PreparedStatement selectAllGroupsStatement;
    private static PreparedStatement selectUserStatement;
    private static PreparedStatement updateUserStatement;
    private static PreparedStatement updateGroupStatement;
    private static PreparedStatement deleteUserStatement;
    private static PreparedStatement deleteGroupStatement;
    private static PreparedStatement insertUserStatement;
    private static PreparedStatement updateUserPasswordStatement;
    private static PreparedStatement updateUserIdStatement;
    private static PreparedStatement insertGroupStatement;
    private static PreparedStatement updateGroupNameStatement;

    static {

        RANDOM_NUMBER_GENERATOR.setDefaultNextBytesSize(32);
    }

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

            session.execute("CREATE KEYSPACE IF NOT EXISTS security WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS security.users (id text, mail text, first_name text, last_name text, password text, password_salt text, active boolean, PRIMARY KEY (id));");
            session.execute("CREATE TABLE IF NOT EXISTS security.user_groups (name text, description text, user_ids set<text>, PRIMARY KEY (name));");

            LOGGER.debug("Preparing statements...");

            selectAllUsersStatement = session.prepare("SELECT * FROM security.users;");
            selectAllGroupsStatement = session.prepare("SELECT * FROM security.user_groups;");
            selectUserStatement = session.prepare("SELECT * FROM security.users WHERE id = ?;");
            selectGroupStatement = session.prepare("SELECT * FROM security.user_groups WHERE name = ?;");
            insertUserStatement = session.prepare("INSERT INTO security.users (id, mail, first_name, last_name, password, password_salt, active) VALUES (?, ?, ?, ?, ?, ?, ?);");
            insertGroupStatement = session.prepare("INSERT INTO security.user_groups (name, description, user_ids) VALUES (?, ?, ?);");
            updateUserStatement = session.prepare("UPDATE security.users SET mail = ?, first_name = ?, last_name = ?, active = ? WHERE id = ?;");
            updateGroupStatement = session.prepare("UPDATE security.user_groups SET description = ?, user_ids = ? WHERE name = ?;");
            deleteUserStatement = session.prepare("DELETE FROM security.users WHERE id = ?;");
            deleteGroupStatement = session.prepare("DELETE FROM security.user_groups WHERE name = ?;");

            updateUserPasswordStatement = session.prepare("UPDATE security.users SET password = ?, password_salt = ? WHERE id = ?;");

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

        if (session != null && !session.isClosed()) {
            session.close();
        }

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        if (cluster != null && !cluster.isClosed()) {
            cluster.close();
        }
    }

    static Set<User> listUsers() {

        HashSet<User> results = new HashSet<>();

        ResultSet resultSet = session.execute(selectAllUsersStatement.bind());

        User user;

        for (Row row : resultSet) {

            user = createUser(row);

            if (user != null) {

                results.add(user);
            }
        }

        return Collections.unmodifiableSet(results);
    }

    static Set<UserGroup> listGroups() {

        HashSet<UserGroup> results = new HashSet<>();

        ResultSet resultSet = session.execute(selectAllGroupsStatement.bind());

        UserGroup group;

        for (Row row : resultSet) {

            group = createGroup(row);

            if (group != null) {

                results.add(group);
            }
        }

        return Collections.unmodifiableSet(results);
    }

    static User findUser(String id) {

        if (id == null) {

            LOGGER.debug("User ID to find is null; returning null...");

            return null;
        }

        LOGGER.debug("Looking up for user with ID '{}'...", id);

        BoundStatement statement = selectUserStatement.bind(id.toLowerCase(Locale.ENGLISH));

        Row row = session.execute(statement).one();

        return createUser(row);
    }

    static UserGroup findGroup(String name) {

        if (name == null) {

            LOGGER.debug("Group name to find is null; returning null...");

            return null;
        }

        BoundStatement statement = selectGroupStatement.bind(name);

        Row row = session.execute(statement).one();

        return createGroup(row);
    }

    static void insertUser(User user, String password) {

        String id = user.getId().toLowerCase(Locale.ENGLISH);
        String mail = user.getMail().toLowerCase(Locale.ENGLISH);
        String firstName = user.getFirstName();
        String lastName = user.getLastName();

        String passwordSalt = generateRandomSalt();
        String hashedPassword = hashPassword(password, passwordSalt);

        BoundStatement statement = insertUserStatement.bind(id, mail, firstName, lastName, hashedPassword, passwordSalt, user.isActive());

        session.execute(statement);
    }

    static void insertGroup(UserGroup group) {

        String name = group.getName();
        String description = group.getDescription();
        Set<String> userIds = new HashSet<>();

        for (User user : group) {

            userIds.add(user.getId());
        }

        BoundStatement statement = insertGroupStatement.bind(name, description, userIds);

        session.execute(statement);
    }

    static void deleteUser(User user) {

        BoundStatement statement = deleteUserStatement.bind(user.getId());

        session.execute(statement);
    }

    static void deleteGroup(UserGroup group) {

        BoundStatement statement = deleteGroupStatement.bind(group.getName());

        session.execute(statement);
    }

    static void updateUser(User user) {

        BoundStatement statement = updateUserStatement.bind(user.getMail(), user.getFirstName(), user.getLastName(), user.isActive(), user.getId());

        session.execute(statement);
    }

    static void updateGroup(UserGroup group) {

        Set<String> userIds = new HashSet<>();

        for (User user : group) {

            userIds.add(user.getId());
        }

        BoundStatement statement = updateGroupStatement.bind(group.getDescription(), userIds, group.getName());

        session.execute(statement);
    }

    static void activateUser(User user) {

        User updatedUser = new User(user.getId(), user.getDomain(), user.getMail(), user.getFirstName(), user.getLastName(), true);

        updateUser(updatedUser);
    }

    static void suspendUser(User user) {

        User updatedUser = new User(user.getId(), user.getDomain(), user.getMail(), user.getFirstName(), user.getLastName(), false);

        updateUser(updatedUser);
    }

    static void updateUserId(String oldId, String newId) {

        BoundStatement statement = selectUserStatement.bind(oldId);

        Row row = session.execute(statement).one();

        String id = row.getString("id");
        String mail = row.getString("mail");
        String firstName = row.getString("first_name");
        String lastName = row.getString("last_name");
        String password = row.getString("password");
        String password_salt = row.getString("password_salt");
        boolean active = row.getBool("active");

        BatchStatement bs = new BatchStatement();

        BoundStatement deleteStatement = deleteUserStatement.bind(id);
        bs.add(deleteStatement);

        BoundStatement insertStatement = insertUserStatement.bind(newId.toLowerCase(Locale.ENGLISH), mail, firstName, lastName, password, password_salt, active);
        bs.add(insertStatement);

        session.execute(bs);

    }

    static void updateUserPassword(String id, String password) {

        String newSalt = generateRandomSalt();
        String newPassword = hashPassword(password, newSalt);

        BoundStatement statement = updateUserPasswordStatement.bind(newPassword, newSalt, id);

        session.execute(statement);
    }

    static void updateGroupName(String oldName, String newName) {

        BoundStatement statement = selectGroupStatement.bind(oldName);

        Row row = session.execute(statement).one();

        String name = row.getString("name");
        String description = row.getString("description");
        Set<String> userIds = row.getSet("user_ids", String.class);

        BatchStatement bs = new BatchStatement();

        BoundStatement deleteStatement = deleteGroupStatement.bind(name);
        bs.add(deleteStatement);

        BoundStatement insertStatement = insertGroupStatement.bind(newName, description, userIds);
        bs.add(insertStatement);

        session.execute(bs);
    }

    private static String hashPassword(String password, String salt) {

        ByteSource passwordSource = new SimpleByteSource(password);
        ByteSource saltSource = new SimpleByteSource(Hex.decode(salt));

        Sha512Hash hash = new Sha512Hash(passwordSource, saltSource, HASH_ITERATIONS);

        return hash.toHex();
    }

    private static String generateRandomSalt() {

        return RANDOM_NUMBER_GENERATOR.nextBytes().toHex();
    }

    private static User createUser(Row row) {

        if (row == null) {

            LOGGER.debug("Cassandra row is null.");

            return null;
        }

        if (row.isNull("id")) {

            LOGGER.error("User ID column of Cassandra row is null.");

            return null;
        }

        String id = row.getString("id");
        String mail = row.getString("mail");
        String firstName = row.getString("first_name");
        String lastName = row.getString("last_name");
        boolean active = row.getBool("active");

        User user = new User(id, CassandraUserQueryService.DOMAIN, mail, firstName, lastName, active);

        return user;
    }

    private static UserGroup createGroup(Row row) {

        if (row == null) {

            LOGGER.debug("Cassandra row is null.");

            return null;
        }

        if (row.isNull("name")) {

            LOGGER.error("Group name column of Cassandra row is null.");

            return null;
        }

        String name = row.getString("name");
        String description = row.getString("description");
        Set<String> userIDs = row.getSet("user_ids", String.class);

        Set<User> users = new HashSet<>();

        if (userIDs != null) {

            for (String userID : userIDs) {

                User user = findUser(userID);

                if (user != null) {
                    users.add(user);
                }
            }
        }

        UserGroup userGroup = new UserGroup(name, CassandraUserQueryService.DOMAIN, description, users);

        return userGroup;
    }
}
