package tr.com.eno.livo.server.users.cassandra;

import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.InvalidPasswordException;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.InvalidUserGroupException;
import tr.com.eno.livo.server.users.UserGroupNotFoundException;
import tr.com.eno.livo.server.users.InvalidUserException;
import tr.com.eno.livo.server.users.UserAlreadyExistsException;
import tr.com.eno.livo.server.users.UserGroupAlreadyExistsException;
import tr.com.eno.livo.server.users.UserManagementService;
import tr.com.eno.livo.server.users.UserNotFoundException;

public class CassandraUserManagementService implements UserManagementService {

    public static final String DOMAIN = "System";
    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraUserQueryService.class);

    public void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based UserManagementService implementation...");

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

        LOGGER.info("Successfully started Cassandra-based UserManagementService implementation.");
    }

    public void stop() {

        LOGGER.info("Stopping Cassandra-based UserManagementService implementation...");
        
        CassandraHelper.disconnect();

        LOGGER.info("Successfully stopped Cassandra-based UserManagementService implementation.");
    }

    @Override
    public void activateUser(String id, String domain) throws UserNotFoundException {

        if (id == null) {

            LOGGER.debug("Passed user ID is null.");

            throw new NullPointerException();
        }

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; ignoring...");

            return;
        }

        User user = CassandraHelper.findUser(id);

        if (user == null) {
            throw new UserNotFoundException();
        }

        LOGGER.debug("Activating user ''{}''...", user);

        CassandraHelper.activateUser(user);
    }

    @Override
    public void activateUser(User user) throws UserNotFoundException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        User currentUser = CassandraHelper.findUser(user.getId());

        if (currentUser == null) {

            throw new UserNotFoundException();
        }

        LOGGER.debug("Activating user ''{}''...", user);

        CassandraHelper.activateUser(currentUser);
    }

    @Override
    public void suspendUser(String id, String domain) throws UserNotFoundException {

        if (id == null) {

            LOGGER.debug("Passed user ID is null.");

            throw new NullPointerException();
        }

        if (domain == null) {

            LOGGER.debug("Passed domain is null.");

            throw new NullPointerException();
        }

        if (!domain.equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; ignoring...");

            return;
        }

        User user = CassandraHelper.findUser(id);

        if (user == null) {
            throw new UserNotFoundException();
        }

        LOGGER.debug("Suspending user ''{}''...", user);

        CassandraHelper.suspendUser(user);
    }

    @Override
    public void suspendUser(User user) throws UserNotFoundException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        User currentUser = CassandraHelper.findUser(user.getId());

        if (currentUser == null) {

            throw new UserNotFoundException();
        }

        LOGGER.debug("Suspending user ''{}''...", user);

        CassandraHelper.suspendUser(currentUser);
    }

    @Override
    public void createUser(User user, String password) throws InvalidUserException, InvalidPasswordException, UserAlreadyExistsException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        this.validatePassword(password);

        this.validateUser(user);

        LOGGER.debug("Creating user ''{}''...", user);

        CassandraHelper.insertUser(user, password);
    }

    @Override
    public void updateUser(User user) throws UserNotFoundException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        User currentUser = CassandraHelper.findUser(user.getId());

        if (currentUser == null) {

            throw new UserNotFoundException();
        }

        LOGGER.debug("Updating user ''{}''...", user);

        User updatedUser = new User(currentUser.getId(), currentUser.getDomain(), user.getMail(), user.getFirstName(), user.getLastName(), currentUser.isActive());

        CassandraHelper.updateUser(updatedUser);
    }

    @Override
    public void deleteUser(User user) {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        CassandraHelper.deleteUser(user);
    }

    @Override
    public void createGroup(UserGroup group) throws InvalidUserGroupException, UserGroupAlreadyExistsException {

        if (group == null) {

            LOGGER.debug("Passed user group is null.");

            throw new NullPointerException();
        }

        if (group.getDomain() == null) {

            LOGGER.debug("Passed user group's domain is null.");

            throw new NullPointerException();
        }

        if (group.getName() == null) {

            LOGGER.debug("Passed user group's name is null.");

            throw new NullPointerException();
        }

        if (!group.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed domain is different from implementation's; ignoring...");

            return;
        }

        this.validateGroup(group);

        LOGGER.debug("Creating group ''{}''...", group);

        CassandraHelper.insertGroup(group);
    }

    @Override
    public void updateGroup(UserGroup group) throws UserGroupNotFoundException {

        if (group == null) {

            LOGGER.debug("Passed user group is null.");

            throw new NullPointerException();
        }

        if (group.getDomain() == null) {

            LOGGER.debug("Passed user group's domain is null.");

            throw new NullPointerException();
        }

        if (group.getName() == null) {

            LOGGER.debug("Passed user group's name is null.");

            throw new NullPointerException();
        }

        if (!group.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user group's domain is different from implementation's; ignoring...");

            return;
        }

        UserGroup currentGroup = CassandraHelper.findGroup(group.getName());

        if (currentGroup == null) {

            throw new UserGroupNotFoundException();
        }

        LOGGER.debug("Updating user group ''{}''...", group);

        UserGroup updatedGroup = new UserGroup(currentGroup.getName(), currentGroup.getDomain(), group.getDescription(), group.getUsers());

        CassandraHelper.updateGroup(updatedGroup);
    }

    @Override
    public void deleteGroup(UserGroup group) {

        if (group == null) {

            LOGGER.debug("Passed user group is null.");

            throw new NullPointerException();
        }

        if (group.getDomain() == null) {

            LOGGER.debug("Passed user group's domain is null.");

            throw new NullPointerException();
        }

        if (group.getName() == null) {

            LOGGER.debug("Passed user group's name is null.");

            throw new NullPointerException();
        }

        if (!group.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        CassandraHelper.deleteGroup(group);
    }

    @Override
    public void updateUserID(User user, String newId) throws UserNotFoundException, UserAlreadyExistsException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }

        String oldId = user.getId();

        if (oldId == null || newId == null || oldId.trim().isEmpty() || newId.trim().isEmpty()) {

            throw new NullPointerException();
        }

        User oldUser = CassandraHelper.findUser(oldId);

        if (oldUser == null) {

            throw new UserNotFoundException();
        }

        User newUser = CassandraHelper.findUser(newId);

        if (newUser != null) {

            throw new UserAlreadyExistsException();
        }

        LOGGER.debug("Changing user ID ''{}'' with ''{}''...", oldId, newId);

        CassandraHelper.updateUserId(oldId, newId);
    }

    @Override
    public void updateUserPassword(User user, String password) throws UserNotFoundException, InvalidPasswordException {

        if (user == null) {

            LOGGER.debug("Passed user is null.");

            throw new NullPointerException();
        }

        if (user.getDomain() == null) {

            LOGGER.debug("Passed user's domain is null.");

            throw new NullPointerException();
        }

        if (user.getId() == null) {

            LOGGER.debug("Passed user's ID is null.");

            throw new NullPointerException();
        }

        if (!user.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user's domain is different from implementation's; ignoring...");

            return;
        }
        
        User currentUser = CassandraHelper.findUser(user.getId());
        
        if (currentUser == null) {
            
            LOGGER.debug("User '{}' not found.");
            
            throw new UserNotFoundException();
        }
        
        this.validatePassword(password);

        LOGGER.debug("Updating password for user ''{}''...", user);

        CassandraHelper.updateUserPassword(user.getId(), password);
    }

    @Override
    public void updateGroupName(UserGroup group, String newName) throws UserGroupNotFoundException, UserGroupAlreadyExistsException {

        if (group == null) {

            LOGGER.debug("Passed user group is null.");

            throw new NullPointerException();
        }

        if (group.getDomain() == null) {

            LOGGER.debug("Passed user group's domain is null.");

            throw new NullPointerException();
        }

        if (group.getName() == null) {

            LOGGER.debug("Passed user group's name is null.");

            throw new NullPointerException();
        }

        if (!group.getDomain().equals(DOMAIN)) {

            LOGGER.debug("Passed user group's domain is different from implementation's; ignoring...");

            return;
        }

        String oldName = group.getName();

        if (oldName == null || newName == null || oldName.trim().isEmpty() || newName.trim().isEmpty()) {

            throw new NullPointerException();
        }

        UserGroup oldGroup = CassandraHelper.findGroup(oldName);

        if (oldGroup == null) {

            throw new UserGroupNotFoundException();
        }

        UserGroup newGroup = CassandraHelper.findGroup(newName);

        if (newGroup != null) {

            throw new UserGroupAlreadyExistsException();
        }

        LOGGER.debug("Changing name of group ''{}'' with ''{}''...", oldName, newName);

        CassandraHelper.updateGroupName(oldName, newName);
    }

    private void validateUser(User user) throws InvalidUserException, UserAlreadyExistsException {

        User currentUser = CassandraHelper.findUser(user.getId());

        if (currentUser != null) {

            throw new UserAlreadyExistsException();
        }

        if (user.getMail() != null) {

            try {

                InternetAddress address = new InternetAddress(user.getMail());

                address.validate();

            } catch (AddressException ex) {

                LOGGER.debug("E-mail address ''{}'' is invalid.", user.getMail());

                throw new InvalidUserException("E-mail address is not valid.");
            }
        }
    }

    private void validatePassword(String password) throws InvalidPasswordException {

        if (password == null || password.trim().isEmpty()) {

            LOGGER.debug("Password is null or empty.");

            throw new InvalidPasswordException("Password cannot be empty.");
        }

        String trimmedPassword = password.trim();
        
        if (trimmedPassword.length() < 6) {
            
            throw new InvalidPasswordException("Password must be at least 6 characters long.");
        }
    }

    private void validateGroup(UserGroup group) throws InvalidUserGroupException, UserGroupAlreadyExistsException {

        UserGroup currentGroup = CassandraHelper.findGroup(group.getName());

        if (currentGroup != null) {

            throw new UserGroupAlreadyExistsException();
        }

        if (group.getUsers() != null) {

            for (User user : group) {

                if (user.getDomain() == null || !user.getDomain().equals(DOMAIN)) {
                    throw new InvalidUserGroupException();
                }
            }
        }
    }
}
