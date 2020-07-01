package tr.com.eno.livo.server.users.cassandra;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.UserNotFoundException;
import tr.com.eno.livo.server.users.UserGroupNotFoundException;
import tr.com.eno.livo.server.users.UserQueryService;

public class CassandraUserQueryService implements UserQueryService {

    public static final String DOMAIN = "System";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraUserQueryService.class);
    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";

    public void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based UserQueryService implementation...");

        String host = config.containsKey(CASSANDRA_HOST_CONFIGURATION_KEY) && config.get(CASSANDRA_HOST_CONFIGURATION_KEY) != null ? (String) config
                .get(CASSANDRA_HOST_CONFIGURATION_KEY) : "localhost";

        LOGGER.debug("Using Cassandra host '{}'...", host);

        int port = config.containsKey(CASSANDRA_PORT_CONFIGURATION_KEY) && config.get(CASSANDRA_PORT_CONFIGURATION_KEY) != null ? (Integer) config
                .get(CASSANDRA_PORT_CONFIGURATION_KEY) : 9042;

        LOGGER.debug("Using Cassandra port {}...", port);

        LOGGER.debug("Connecting to Cassandra...");

        CassandraHelper.connect(host, port);

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {

            @Override
            public void run() {

                CassandraHelper.disconnect();
            }
        }));

        LOGGER.info("Successfully started Cassandra-based UserQueryService implementation.");
    }

    public void stop() {

        LOGGER.info("Stopping Cassandra-based UserQueryService implementation...");

        CassandraHelper.disconnect();

        LOGGER.info("Successfully stopped Cassandra-based UserQueryService implementation.");
    }

    @Override
    public Set<User> listUsers() {

        LOGGER.debug("Listing all users...");

        Set<User> users = CassandraHelper.listUsers();

        LOGGER.debug("Found {} users.", users.size());

        return users;
    }

    @Override
    public Set<User> listUsers(String domain) {

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; returning empty set...");

            return Collections.EMPTY_SET;
        }

        return this.listUsers();
    }

    @Override
    public Set<User> listUsers(UserGroup group) throws UserGroupNotFoundException {

        if (group == null) {

            LOGGER.debug("Passed group is null.");

            throw new NullPointerException();
        }

        if (group.getName() == null) {

            LOGGER.debug("Passed group's name is null.");

            throw new NullPointerException();
        }

        LOGGER.debug("Listing users for group ''{}''...", group);

        if (!DOMAIN.equals(group.getDomain())) {

            LOGGER.debug("Passed group's domain is different from implementation's; returning empty set...");

            return Collections.EMPTY_SET;
        }

        UserGroup userGroup = CassandraHelper.findGroup(group.getName());

        if (userGroup == null) {

            throw new UserGroupNotFoundException();
        }

        LOGGER.debug("Found {} users in group ''{}''.", userGroup.getUsers().size(), userGroup);

        return userGroup.getUsers();
    }

    @Override
    public Set<UserGroup> listGroups() {

        LOGGER.debug("Listing all user groups...");

        Set<UserGroup> userGroups = CassandraHelper.listGroups();

        LOGGER.debug("Found {} user groups.", userGroups.size());

        return userGroups;
    }

    @Override
    public Set<UserGroup> listGroups(String domain) {

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; returning empty set...");

            return Collections.EMPTY_SET;
        }

        return this.listGroups();
    }

    @Override
    public User findUser(String id, String domain) throws UserNotFoundException {

        if (id == null) {

            LOGGER.debug("Passed user ID is null.");

            throw new NullPointerException();
        }

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; returning null...");

            return null;
        }

        LOGGER.debug("Looking for user with ID '{}'...", id);

        User user = CassandraHelper.findUser(id);

        if (user == null) {

            throw new UserNotFoundException();
        }

        return user;
    }

    @Override
    public UserGroup findGroup(String name, String domain) throws UserGroupNotFoundException {

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (domain == null) {

            LOGGER.debug("Passed user group name is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; returning null...");

            return null;
        }

        LOGGER.debug("Looking for group with name '{}'...", name);

        UserGroup userGroup = CassandraHelper.findGroup(name);

        if (userGroup == null) {

            throw new UserGroupNotFoundException();
        }

        return userGroup;
    }
}
