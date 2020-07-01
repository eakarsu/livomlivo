package tr.com.eno.livo.server.application.cassandra;

import com.datastax.driver.core.BatchStatement;
import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.nio.ByteBuffer;

import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import org.nustaq.serialization.FSTConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationNotFoundException;
import tr.com.eno.livo.server.application.Asset;
import tr.com.eno.livo.server.application.AuthorizationPolicy;
import tr.com.eno.livo.server.application.Screen;
import tr.com.eno.livo.server.application.Theme;
import tr.com.eno.livo.server.file.File;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static FSTConfiguration fstConfiguration;
    private static PreparedStatement selectApplicationStatement;
    private static PreparedStatement selectApplicationsStatement;
    private static PreparedStatement selectDeploymentsStatement;
    private static PreparedStatement selectAuthorizedUsersStatement;
    private static PreparedStatement selectAuthorizedGroupsStatement;
    private static PreparedStatement insertDeploymentStatement;
    private static PreparedStatement insertApplicationStatement;
    private static PreparedStatement deleteApplicationStatement;
    private static PreparedStatement deleteDeploymentsStatement;
    private static PreparedStatement deleteAuthorizedUsersStatement;
    private static PreparedStatement deleteAuthorizedGroupsStatement;
    private static PreparedStatement updateApplicationStatement;
    private static PreparedStatement insertAuthorizedUserStatement;
    private static PreparedStatement deleteAuthorizedUserStatement;
    private static PreparedStatement insertAuthorizedGroupStatement;
    private static PreparedStatement deleteAuthorizedGroupStatement;

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

            session.execute("CREATE KEYSPACE IF NOT EXISTS application WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS application.applications (domain text, name text, authorization_policy int, freeform boolean, asset_paths set<text>, screen_ids set<text>, theme_id text, PRIMARY KEY (domain, name));");
            session.execute("CREATE TABLE IF NOT EXISTS application.deployments (application_domain text, application_name text, time timeuuid, data blob, PRIMARY KEY (application_domain, application_name, time));");
            session.execute("CREATE TABLE IF NOT EXISTS application.authorized_users (application_domain text, application_name text, user_domain text, user_id text, PRIMARY KEY (application_domain, application_name, user_domain, user_id));");
            session.execute("CREATE TABLE IF NOT EXISTS application.authorized_user_groups (application_domain text, application_name text, group_domain text, group_name text, PRIMARY KEY (application_domain, application_name, group_domain, group_name));");

            LOGGER.debug("Preparing statements...");

            selectApplicationStatement = session.prepare("SELECT * FROM application.applications WHERE domain = ? AND name = ? LIMIT 1;");
            selectApplicationsStatement = session.prepare("SELECT * FROM application.applications WHERE domain = ?;");
            selectDeploymentsStatement = session.prepare("SELECT * FROM application.deployments WHERE application_domain = ? AND application_name = ? ORDER BY application_name DESC, time DESC LIMIT ?;");
            selectAuthorizedUsersStatement = session.prepare("SELECT * FROM application.authorized_users WHERE application_domain = ? AND application_name = ?;");
            selectAuthorizedGroupsStatement = session.prepare("SELECT * FROM application.authorized_user_groups WHERE application_domain = ? AND application_name = ?;");
            insertApplicationStatement = session.prepare("INSERT INTO application.applications (domain, name, authorization_policy, freeform, asset_paths, screen_ids, theme_id) VALUES (?, ?, ?, ?, ?, ?, ?);");
            insertDeploymentStatement = session.prepare("INSERT INTO application.deployments (application_domain, application_name, time, data) VALUES (?, ?, now(), ?);");
            insertAuthorizedUserStatement = session.prepare("INSERT INTO application.authorized_users (application_domain, application_name, user_domain, user_id) VALUES (?, ?, ?, ?);");
            insertAuthorizedGroupStatement = session.prepare("INSERT INTO application.authorized_user_groups (application_domain, application_name, group_domain, group_name) VALUES (?, ?, ?, ?);");
            updateApplicationStatement = session.prepare("UPDATE application.applications SET authorization_policy = ?, freeform = ?, asset_paths = ?, screen_ids = ?, theme_id = ? WHERE domain = ? AND name = ?;");
            deleteApplicationStatement = session.prepare("DELETE FROM application.applications WHERE domain = ? AND name = ?;");
            deleteDeploymentsStatement = session.prepare("DELETE FROM application.deployments WHERE application_domain = ? AND application_name = ?;");
            deleteAuthorizedUserStatement = session.prepare("DELETE FROM application.authorized_users WHERE application_domain = ? AND application_name = ? AND user_domain = ? AND user_id = ?;");
            deleteAuthorizedUsersStatement = session.prepare("DELETE FROM application.authorized_users WHERE application_domain = ? AND application_name = ?;");
            deleteAuthorizedGroupStatement = session.prepare("DELETE FROM application.authorized_user_groups WHERE application_domain = ? AND application_name = ? AND group_domain = ? AND group_name = ?;");
            deleteAuthorizedGroupsStatement = session.prepare("DELETE FROM application.authorized_user_groups WHERE application_domain = ? AND application_name = ?;");

            LOGGER.debug("Initializing FST...");

            fstConfiguration = FSTConfiguration.createDefaultConfiguration();
            fstConfiguration.registerClass(Application.class, Asset.class, File.class, Screen.class, Theme.class);

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

    static void insertApplication(Application application) {

        String name = application.getName();
        String domain = application.getDomain();
        boolean freeform = application.isFreeform();
        int authorizationPolicyCode = application.getAuthorizationPolicy() == null ? AuthorizationPolicy.ALLOW_ALL.getCode() : application.getAuthorizationPolicy().getCode();

        Set<String> assetPaths = new HashSet<>();

        if (application.getAssets() != null) {

            for (String assetName : application.getAssets().keySet()) {

                String assetPath = application.getAssets().get(assetName).getFile() == null ? assetName : application.getAssets().get(assetName).getFile().getPath();

                assetPaths.add(assetPath);
            }
        }

        BoundStatement statement = insertApplicationStatement.bind(domain, name, authorizationPolicyCode, freeform, assetPaths, Collections.EMPTY_SET, null);

        session.execute(statement);
    }

    static Application findApplication(String domain, String applicationName) throws ApplicationNotFoundException {

        BoundStatement statement = selectApplicationStatement.bind(domain, applicationName);

        Row applicationRow = session.execute(statement).one();

        if (applicationRow == null) {

            LOGGER.debug("Failed to find application '{}' of domain '{}'.", applicationName, domain);

            throw new ApplicationNotFoundException();
        }

        return createApplication(applicationRow);
    }

    static void deleteApplication(String domain, String applicationName) {

        BoundStatement deleteApplicationBoundStatement = deleteApplicationStatement.bind(domain, applicationName);
        BoundStatement deleteDeploymentsBoundStatement = deleteDeploymentsStatement.bind(domain, applicationName);
        BoundStatement deleteAuthorizedUsersBoundStatement = deleteAuthorizedUsersStatement.bind(domain, applicationName);
        BoundStatement deleteAuthorizedGroupsBoundStatement = deleteAuthorizedGroupsStatement.bind(domain, applicationName);

        BatchStatement batchStatement = new BatchStatement();

        batchStatement.add(deleteApplicationBoundStatement);
        batchStatement.add(deleteDeploymentsBoundStatement);
        batchStatement.add(deleteAuthorizedUsersBoundStatement);
        batchStatement.add(deleteAuthorizedGroupsBoundStatement);

        session.execute(batchStatement);
    }

    static void deployApplication(String domain, String name) throws ApplicationNotFoundException {

        Application application = findApplication(domain, name);

//        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
//
//            FSTObjectOutput out = fstConfiguration.getObjectOutput(baos);
//            out.writeObject(application, Application.class);
//            out.flush();
//
//            data = baos.toByteArray();
//
//        } catch (Exception exception) {
//
//            LOGGER.error("Failed to serialize application '{}' of domain '{}'.", name, domain);
//
//            LOGGER.error(exception.getMessage(), exception);
//
//            return;
//        }
        byte[] data = fstConfiguration.asByteArray(application);

        if (data == null) {

            LOGGER.error("Serialized application data is null.");

            return;
        }

        BoundStatement statement = insertDeploymentStatement.bind(domain, name, ByteBuffer.wrap(data));

        session.execute(statement);
    }

    static List<Application> listRecentDeployments(String domain, String applicationName, byte limit) {

        if (limit < 1 || limit > 10) {

            LOGGER.warn("Using default limit 10 instead of passed {} for listing deployments for application '{}' of domain '{}'...", limit, applicationName, domain);

            limit = 10;
        }

        BoundStatement statement = selectDeploymentsStatement.bind(domain, applicationName, limit);

        ResultSet resultSet = session.execute(statement);

        if (resultSet.isExhausted()) {

            LOGGER.debug("Failed to find any deployment for application '{}' of domain '{}'.", applicationName, domain);

            return Collections.EMPTY_LIST;
        }

        List<Application> deploymentList = new LinkedList<>();

        for (Row row : resultSet) {

            if (row.isNull("data")) {

                LOGGER.debug("Data column of row is null.");

                continue;
            }

            byte[] data = row.getBytes("data").array();

            Application deployment = (Application) fstConfiguration.asObject(data);

            deploymentList.add(deployment);
        }

        LOGGER.debug("Found {} deployments for application '{}' of domain '{}'.", deploymentList.size(), applicationName, domain);

        return Collections.unmodifiableList(deploymentList);
    }

    static SortedSet<Application> listApplications(String domain) {

        BoundStatement statement = selectApplicationsStatement.bind(domain);

        ResultSet resultSet = session.execute(statement);

        SortedSet<Application> applications = new TreeSet<>();

        for (Row applicationRow : resultSet) {

            Application application = createApplication(applicationRow);

            if (application != null) {
                applications.add(application);
            }
        }

        LOGGER.debug("Found {} applications in domain '{}'.", applications.size(), domain);

        return Collections.unmodifiableSortedSet(applications);
    }

    static void updateApplication(Application application) {

        String name = application.getName();
        String domain = application.getDomain();
        boolean freeform = application.isFreeform();
        int authorizationPolicyCode = application.getAuthorizationPolicy() == null ? AuthorizationPolicy.ALLOW_ALL.getCode() : application.getAuthorizationPolicy().getCode();

        Set<String> assetPaths = new HashSet<>();

        if (application.getAssets() != null) {

            for (String assetName : application.getAssets().keySet()) {

                String assetPath = application.getAssets().get(assetName).getFile() == null ? assetName : application.getAssets().get(assetName).getFile().getPath();

                assetPaths.add(assetPath);
            }
        }

        BoundStatement statement = updateApplicationStatement.bind(authorizationPolicyCode, freeform, assetPaths, Collections.EMPTY_SET, null, domain, name); // TODO Set screen_ids and theme_id columns property in future.

        session.execute(statement);
    }

    static void authorizeUsers(String domain, String applicationName, User[] users) {

        if (users == null) {
            return;
        }

        BatchStatement batchStatement = new BatchStatement();

        for (User user : users) {

            if (user.getDomain() != null && user.getId() != null && !user.getDomain().trim().isEmpty() && !user.getId().trim().isEmpty()) {

                BoundStatement statement = insertAuthorizedUserStatement.bind(domain, applicationName, user.getDomain(), user.getId());

                batchStatement.add(statement);
            }
        }

        session.execute(batchStatement);
    }

    static void deauthorizeUsers(String domain, String applicationName, User[] users) {

        if (users == null) {
            return;
        }

        BatchStatement batchStatement = new BatchStatement();

        for (User user : users) {

            if (user.getDomain() != null && user.getId() != null && !user.getDomain().trim().isEmpty() && !user.getId().trim().isEmpty()) {

                BoundStatement statement = deleteAuthorizedUserStatement.bind(domain, applicationName, user.getDomain(), user.getId());

                batchStatement.add(statement);
            }
        }

        session.execute(batchStatement);
    }

    static void authorizeGroups(String domain, String applicationName, UserGroup[] groups) {

        if (groups == null) {
            return;
        }

        BatchStatement batchStatement = new BatchStatement();

        for (UserGroup group : groups) {

            if (group.getDomain() != null && group.getName() != null && !group.getDomain().trim().isEmpty() && !group.getName().trim().isEmpty()) {

                BoundStatement statement = insertAuthorizedUserStatement.bind(domain, applicationName, group.getDomain(), group.getName());

                batchStatement.add(statement);
            }
        }

        session.execute(batchStatement);
    }

    static void deauthorizeGroups(String domain, String applicationName, UserGroup[] groups) {

        if (groups == null) {
            return;
        }

        BatchStatement batchStatement = new BatchStatement();

        for (UserGroup group : groups) {

            if (group.getDomain() != null && group.getName() != null && !group.getDomain().trim().isEmpty() && !group.getName().trim().isEmpty()) {

                BoundStatement statement = deleteAuthorizedGroupStatement.bind(domain, applicationName, group.getDomain(), group.getName());

                batchStatement.add(statement);
            }
        }

        session.execute(batchStatement);
    }

    private static Application createApplication(Row applicationRow) {

        String name = applicationRow.getString("name");
        String domain = applicationRow.getString("domain");
        int authorizationPolicyCode = applicationRow.getInt("authorization_policy");
        boolean freeform = applicationRow.getBool("freeform");

        Set<String> assetPaths = applicationRow.getSet("asset_paths", String.class);

        Set<String> screenIds = Collections.EMPTY_SET; //TODO Consider screen IDs in the future
        Theme theme = null; //TODO Consider themes in the future

        Set<User> authorizedUsers = listAuthorizedUsers(domain, name);
        Set<UserGroup> authorizedGroups = listAuthorizedGroups(domain, name);

        Application application = new Application(name, domain, AuthorizationPolicy.getAuthorizationPolicy(authorizationPolicyCode), freeform, null, null, null, authorizedUsers, authorizedGroups);

        if (assetPaths != null) {

            for (String assetPath : assetPaths) {

                File assetFile = new File(null, assetPath, null);
                Asset asset = new Asset();
                asset.setFile(assetFile);
                asset.setName(assetPath);

                application.addAsset(assetPath, asset);
            }
        }

        return application;
    }

    private static Set<User> listAuthorizedUsers(String domain, String name) {

        BoundStatement statement = selectAuthorizedUsersStatement.bind(domain, name);

        ResultSet resultSet = session.execute(statement);

        if (resultSet.isExhausted()) {

            return Collections.EMPTY_SET;
        }

        Set<User> users = new HashSet<>();

        for (Row authorizedUserRow : resultSet) {

            String userDomain = authorizedUserRow.getString("user_domain");
            String userId = authorizedUserRow.getString("user_id");

            users.add(new User(userId, userDomain, null, null, null));
        }

        return Collections.unmodifiableSet(users);
    }

    private static Set<UserGroup> listAuthorizedGroups(String domain, String name) {

        BoundStatement statement = selectAuthorizedGroupsStatement.bind(domain, name);

        ResultSet resultSet = session.execute(statement);

        if (resultSet.isExhausted()) {

            return Collections.EMPTY_SET;
        }

        Set<UserGroup> groups = new HashSet<>();

        for (Row authorizedGroupRow : resultSet) {

            String groupDomain = authorizedGroupRow.getString("group_domain");
            String groupName = authorizedGroupRow.getString("group_id");

            groups.add(new UserGroup(groupName, groupDomain, null, null));
        }

        return Collections.unmodifiableSet(groups);
    }
}
