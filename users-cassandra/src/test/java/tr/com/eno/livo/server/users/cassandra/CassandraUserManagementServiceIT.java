package tr.com.eno.livo.server.users.cassandra;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.apache.shiro.codec.Hex;
import org.apache.shiro.crypto.hash.Sha512Hash;
import org.apache.shiro.util.ByteSource;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.slf4j.LoggerFactory;
import static org.testng.Assert.*;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.users.InvalidPasswordException;
import tr.com.eno.livo.server.users.InvalidUserException;
import tr.com.eno.livo.server.users.InvalidUserGroupException;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserAlreadyExistsException;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.UserGroupAlreadyExistsException;
import tr.com.eno.livo.server.users.UserGroupNotFoundException;
import tr.com.eno.livo.server.users.UserNotFoundException;

@Test(singleThreaded = true, dependsOnGroups = "readOnly")
public class CassandraUserManagementServiceIT {

    private static ClassPathCQLDataSet dataSet;
    private CassandraUserManagementService instance;
    private CassandraUserQueryService queryService;

    @BeforeSuite
    public static void setUpSuite() {

        Logger logger = (Logger) LoggerFactory.getLogger("com.datastax.driver");
        logger.setLevel(Level.OFF);

        logger = (Logger) LoggerFactory.getLogger("org.cassandraunit");
        logger.setLevel(Level.OFF);
    }

    @BeforeClass
    public static void setUpDataSet() {

        dataSet = new ClassPathCQLDataSet("dataSet.cql");
    }

    @BeforeMethod
    public void setUpData() {

        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        Session session = cluster.connect();

        CQLDataLoader dataLoader = new CQLDataLoader(session);

        dataLoader.load(dataSet);

        session.close();
        cluster.close();
    }

    @BeforeMethod(dependsOnMethods = "setUpData")
    public void setUpInstance() throws IOException {

        instance = new CassandraUserManagementService();
        queryService = new CassandraUserQueryService();

        Map<String, Object> config = new HashMap<>();
        config.put("cassandra.host", "127.0.0.1");
        config.put("cassandra.port", 9042);

        instance.start(config);
        queryService.start(config);
    }

    @AfterMethod(dependsOnMethods = "tearDownInstance")
    public void tearDownData() {

        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        Session session = cluster.connect();

        session.execute("DROP TABLE IF EXISTS security.users;");
        session.execute("DROP TABLE IF EXISTS security.user_groups;");

        session.close();
        cluster.close();
    }

    @AfterMethod
    public void tearDownInstance() {

        instance.stop();
        queryService.stop();
    }

    /**
     * Test of activateUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testActivateUserByDomain() throws Exception {

        User user = queryService.findUser("user1", "System");
        assertFalse(user.isActive());

        instance.activateUser("user1", "SomeDomain"); // Wrong domain

        user = queryService.findUser("user1", "System");
        assertFalse(user.isActive());

        instance.activateUser("user1", "System");

        user = queryService.findUser("user1", "System");
        assertTrue(user.isActive());

        instance.activateUser("someUser", "SomeDomain"); // User is not found but since domain is wrong, we are not even considering processing
    }

    /**
     * Test of activateUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserNotFoundException.class)
    public void testActivateUserByDomainWithException() throws Exception {

        instance.activateUser("someUser", "System");
    }

    /**
     * Test of activateUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testActivateUser() throws Exception {

        User user = queryService.findUser("user1", "System");
        assertFalse(user.isActive());

        instance.activateUser(new User("user1", "SomeDomain", null, null, null)); // Wrong domain

        user = queryService.findUser("user1", "System");
        assertFalse(user.isActive());

        instance.activateUser(new User("user1", "System", null, null, null));

        user = queryService.findUser("user1", "System");
        assertTrue(user.isActive());

        instance.activateUser(new User("someUser", "SomeDomain", null, null, null)); // User is not found but since domain is wrong, we are not even considering processing
    }

    /**
     * Test of activateUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserNotFoundException.class)
    public void testActivateUserWithException() throws Exception {

        instance.activateUser(new User("someUser", "System", null, null, null));
    }

    /**
     * Test of suspendUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testSuspendUserByDomain() throws Exception {

        User user = queryService.findUser("user2", "System");
        assertTrue(user.isActive());

        instance.suspendUser("user2", "SomeDomain"); // Wrong domain

        user = queryService.findUser("user2", "System");
        assertTrue(user.isActive());

        instance.suspendUser("user2", "System");

        user = queryService.findUser("user2", "System");
        assertFalse(user.isActive());

        instance.suspendUser("someUser", "SomeDomain"); // User is not found but since domain is wrong, we are not even considering processing
    }

    @Test(expectedExceptions = UserNotFoundException.class)
    public void testSuspendUserByDomainWithException() throws Exception {

        instance.suspendUser("someUser", "System");
    }

    /**
     * Test of suspendUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testSuspendUser() throws Exception {

        User user = queryService.findUser("user2", "System");
        assertTrue(user.isActive());

        instance.suspendUser(new User("user2", "SomeDomain", null, null, null)); // Wrong domain

        user = queryService.findUser("user2", "System");
        assertTrue(user.isActive());

        instance.suspendUser(new User("user2", "System", null, null, null));

        user = queryService.findUser("user2", "System");
        assertFalse(user.isActive());

        instance.suspendUser(new User("someUser", "SomeDomain", null, null, null)); // User is not found but since domain is wrong, we are not even considering processing
    }

    /**
     * Test of suspendUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserNotFoundException.class)
    public void testSuspendUserWithException() throws Exception {

        instance.suspendUser(new User("someUser", "System", null, null, null));
    }

    /**
     * Test of createUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testCreateUser() throws Exception {

        User user = new User("user5", "SomeDomain", null, null, null); // Wrong domain

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(12));

        assertEquals(queryService.listUsers().size(), 3);

        String id = RandomStringUtils.randomAlphabetic(6);
        String mail = id + "@example.com";
        String firstName = RandomStringUtils.randomAlphabetic(6);
        String lastName = RandomStringUtils.randomAlphabetic(6);
        boolean active = RandomUtils.nextInt(100, 1000) % 2 == 0;

        user = new User(id, "System", mail, firstName, lastName, active);

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(12));

        assertEquals(queryService.listUsers().size(), 4);

        user = queryService.findUser(id, "System");
        assertEquals(user.getId(), id.toLowerCase(Locale.ENGLISH));
        assertEquals(user.getMail(), mail.toLowerCase(Locale.ENGLISH));
        assertEquals(user.getFirstName(), firstName);
        assertEquals(user.getLastName(), lastName);
        assertEquals(user.isActive(), active);

        user = new User("user1", "SomeDomain", null, null, null);

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(12)); // User already exists but since domain is wrong, we are not even considering processing
    }

    /**
     * Test of createUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = InvalidUserException.class)
    public void testCreateUserWithInvalidUser() throws Exception {

        User user = new User("someUser", "System", "thisIsDefinitelyNotAnEmailAddress", null, null);

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(12));
    }

    /**
     * Test of createUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = InvalidPasswordException.class)
    public void testCreateUserWithInvalidPassword() throws Exception {

        User user = new User("someUser", "System", "someUser@somedomain.com", null, null);

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(3));
    }

    /**
     * Test of createUser method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserAlreadyExistsException.class)
    public void testCreateUserWithExistingUser() throws Exception {

        User user = new User("user1", "System", "user1@example.com", null, null);

        instance.createUser(user, RandomStringUtils.randomAlphanumeric(12));
    }

    /**
     * Test of updateUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testUpdateUser() throws Exception {

        User user = queryService.findUser("user1", "System");

        String newFirstName = RandomStringUtils.randomAlphabetic(8);

        instance.updateUser(new User(user.getId(), user.getDomain(), user.getMail(), newFirstName, user.getLastName()));

        user = queryService.findUser("user1", "System");
        assertEquals(user.getFirstName(), newFirstName);

        String oldMail = user.getMail();
        String newMail = RandomStringUtils.randomAlphabetic(8);

        instance.updateUser(new User(user.getId(), user.getDomain(), newMail, user.getFirstName(), user.getLastName()));

        user = queryService.findUser("user1", "System");
        assertEquals(user.getMail(), newMail);

        boolean active = user.isActive();

        instance.updateUser(new User(user.getId(), user.getDomain(), user.getMail(), user.getFirstName(), user.getLastName(), !active));

        user = queryService.findUser("user1", "System");
        assertEquals(user.isActive(), active);
    }

    /**
     * Test of deleteUser method, of class CassandraUserManagementService.
     */
    @Test
    public void testDeleteUser() throws Exception {

        instance.deleteUser(new User("user1", "SomeDomain", null, null, null)); // Wrong domain

        queryService.findUser("user1", "System");

        instance.deleteUser(new User("user1", "System", null, null, null));

        try {

            queryService.findUser("user1", "System");

            fail();

        } catch (Exception e) {
        }
    }

    /**
     * Test of createGroup method, of class CassandraUserManagementService.
     */
    @Test
    public void testCreateGroup() throws Exception {

        instance.createGroup(new UserGroup("SomeGroup", "SomeDomain", null, null)); // Wrong domain

        assertEquals(queryService.listGroups().size(), 4);

        String groupName = RandomStringUtils.randomAlphabetic(8);

        Set<User> users = new HashSet<>();
        users.add(new User("user1", "System", null, null, null));
        users.add(new User("user2", "System", null, null, null));

        UserGroup group = new UserGroup(groupName, "System", null, users);

        instance.createGroup(group);

        assertEquals(queryService.listGroups().size(), 5);

        group = queryService.findGroup(groupName, "System");

        assertEquals(group.getName(), groupName);
        assertEquals(group.getUsers().size(), 2);
        assertTrue(group.getUsers().contains(new User("user1", "System", null, null, null)));
        assertTrue(group.getUsers().contains(new User("user2", "System", null, null, null)));
    }

    /**
     * Test of createGroup method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = InvalidUserGroupException.class)
    public void testCreateGroupWithInvalidGroup() throws Exception {

        Set<User> users = new HashSet<>();
        users.add(new User("someUser", "System", null, null, null));
        users.add(new User("someUser2", "SomeDomain", null, null, null));

        UserGroup group = new UserGroup("SomeGroup", "System", null, users);

        instance.createGroup(group);
    }

    /**
     * Test of createGroup method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserGroupAlreadyExistsException.class)
    public void testCreateGroupWithExistingGroup() throws Exception {

        UserGroup group = new UserGroup("group1", "System", null, new HashSet<User>());

        instance.createGroup(group);
    }

    /**
     * Test of updateGroup method, of class CassandraUserManagementService.
     */
    @Test
    public void testUpdateGroup() throws Exception {

        UserGroup group = queryService.findGroup("group1", "System");

        instance.updateGroup(new UserGroup("group1", "SomeDomain", null, new HashSet<User>())); // Wrong domain
        group = queryService.findGroup("group1", "System");
        assertEquals(group.getUsers().size(), 2);

        String userId = RandomStringUtils.randomAlphanumeric(8);

        group.addUser(new User(userId, "System", null, null, null));
        assertEquals(group.getUsers().size(), 3);

        instance.updateGroup(group);
        group = queryService.findGroup("group1", "System");
        assertEquals(group.getUsers().size(), 2); // Won't update because the newly added user does not exist
        
        group.addUser(new User("user3", "System", null, null, null));
        assertEquals(group.getUsers().size(), 3);
        
        instance.updateGroup(group);
        group = queryService.findGroup("group1", "System");
        assertEquals(group.getUsers().size(), 3);
    }

    /**
     * Test of updateGroup method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserGroupNotFoundException.class)
    public void testUpdateGroupWithException() throws Exception {

        instance.updateGroup(new UserGroup("someUser", "System", null, null));
    }

    /**
     * Test of deleteGroup method, of class CassandraUserManagementService.
     */
    @Test
    public void testDeleteGroup() throws Exception {

        instance.deleteGroup(new UserGroup("group1", "SomeDomain", null, null)); // Wrong domain

        queryService.findGroup("group1", "System");

        instance.deleteGroup(new UserGroup("group1", "System", null, null));

        try {
            queryService.findGroup("group1", "System");

            fail();

        } catch (Exception e) {
        }
    }

    /**
     * Test of updateUserID method, of class CassandraUserManagementService.
     */
    @Test
    public void testUpdateUserID() throws Exception {
        
        instance.updateUserID(new User("someUser", "SomeDomain", null, null, null), "someOtherUser"); // Wrong domain
        
        String newId = RandomStringUtils.randomAlphanumeric(8);
        
        instance.updateUserID(new User("user1", "System", null, null, null), newId);
        
        User user = queryService.findUser(newId, "System");
        
        assertEquals(user.getFirstName(), "John");
        assertEquals(user.getLastName(), "Doe");
        assertEquals(user.isActive(), false);
    }

    /**
     * Test of updateUserID method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserNotFoundException.class)
    public void testUpdateUserIDWithNonExistingUser() throws Exception {
        
        instance.updateUserID(new User("someUser", "System", null, null, null), "someOtherUser");
    }

    /**
     * Test of updateUserID method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserAlreadyExistsException.class)
    public void testUpdateUserIDWithAlreadyExistingUser() throws Exception {
        
        instance.updateUserID(new User("user1", "System", null, null, null), "user2");
    }

    /**
     * Test of updateUserPassword method, of class
     * CassandraUserManagementService.
     */
    @Test
    public void testUpdateUserPassword() throws Exception {
        
        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        Session session = cluster.connect();

        instance.updateUserPassword(new User("user1", "SomeDomain", null, null, null), RandomStringUtils.randomAlphanumeric(3)); // Wrong domain
        
        assertNull(getPasswordHash(session, "user1"));
        
        String password = RandomStringUtils.randomAlphanumeric(12);
        
        instance.updateUserPassword(new User("user1", "System", null, null, null), password);
        
        String passwordSalt = getPasswordSalt(session, "user1");
        
        Sha512Hash hash = new Sha512Hash(ByteSource.Util.bytes(password), ByteSource.Util.bytes(Hex.decode(getPasswordSalt(session, "user1"))), 3);
        
        assertEquals(getPasswordHash(session, "user1"), hash.toHex());
    }

    /**
     * Test of updateUserPassword method, of class
     * CassandraUserManagementService.
     */
    @Test(expectedExceptions = InvalidPasswordException.class)
    public void testUpdateUserPasswordWithInvalidPassword() throws Exception {
        
        instance.updateUserPassword(new User("user1", "System", null, null, null), RandomStringUtils.randomAlphanumeric(3));
    }

    /**
     * Test of updateUserPassword method, of class
     * CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserNotFoundException.class)
    public void testUpdateUserPasswordWithNonExistingUser() throws Exception {
        
        instance.updateUserPassword(new User("someUser", "System", null, null, null), RandomStringUtils.randomAlphanumeric(3));
    }

    /**
     * Test of updateGroupName method, of class CassandraUserManagementService.
     */
    @Test
    public void testUpdateGroupName() throws Exception {

        instance.updateGroupName(new UserGroup("someGroup", "SomeDomain", null, Collections.EMPTY_SET), "someOtherUser"); // Wrong domain
        
        String newName = RandomStringUtils.randomAlphanumeric(8);
        
        instance.updateGroupName(new UserGroup("group1", "System", null, Collections.EMPTY_SET), newName);
        
        UserGroup group = queryService.findGroup(newName, "System");
        
        assertEquals(group.getUsers().size(), 2);
    }
    
    /**
     * Test of updateGroupName method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserGroupNotFoundException.class)
    public void testUpdateGroupNameWithNonExistingGroup() throws Exception {
        
        instance.updateGroupName(new UserGroup("someGroup", "System", null, Collections.EMPTY_SET), "someOtherName");
    }
    
    /**
     * Test of updateGroupName method, of class CassandraUserManagementService.
     */
    @Test(expectedExceptions = UserGroupAlreadyExistsException.class)
    public void testUpdateGroupNameWithAlreadyExistingGroup() throws Exception {
        
        instance.updateGroupName(new UserGroup("group1", "System", null, Collections.EMPTY_SET), "group2");
    }
    
    private String getPasswordHash(Session session, String id) {
        
        PreparedStatement ps = session.prepare("SELECT * FROM security.users WHERE id = ?");
        
        BoundStatement bs = ps.bind(id.toLowerCase(Locale.ENGLISH));
        
        Row row = session.execute(bs).one();
        
        assertNotNull(row);
        
        return row.isNull("password") ? null : row.getString("password");
    }
    
    private String getPasswordSalt(Session session, String id) {
        
        PreparedStatement ps = session.prepare("SELECT * FROM security.users WHERE id = ?");
        
        BoundStatement bs = ps.bind(id.toLowerCase(Locale.ENGLISH));
        
        Row row = session.execute(bs).one();
        
        assertNotNull(row);
        
        return row.isNull("password_salt") ? null : row.getString("password_salt");
    }
}
