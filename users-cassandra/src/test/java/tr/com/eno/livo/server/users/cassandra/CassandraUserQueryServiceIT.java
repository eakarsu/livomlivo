package tr.com.eno.livo.server.users.cassandra;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.slf4j.LoggerFactory;
import static org.testng.Assert.*;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.UserGroupNotFoundException;
import tr.com.eno.livo.server.users.UserNotFoundException;

@Test(singleThreaded = true, groups = "readOnly")
public class CassandraUserQueryServiceIT {

    private static ClassPathCQLDataSet dataSet;
    private CassandraUserQueryService instance;

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

        instance = new CassandraUserQueryService();

        Map<String, Object> config = new HashMap<>();
        config.put("cassandra.host", "127.0.0.1");
        config.put("cassandra.port", 9042);

        instance.start(config);
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
    }

    @Test
    public void testListUsers() {

        Set<User> result = instance.listUsers();

        assertEquals(result.size(), 3);
    }

    @Test
    public void testListUsersByDomain() {

        Set<User> result = instance.listUsers("SomeDomain");

        assertTrue(result.isEmpty());

        result = instance.listUsers("System");

        assertEquals(result.size(), 3);
    }

    @Test
    public void testListUsersByGroup() throws Exception {

        Set<User> result = instance.listUsers(new UserGroup("group1", "System", null, null));

        assertEquals(result.size(), 2);
    }

    @Test(expectedExceptions = UserGroupNotFoundException.class)
    public void testListUsersByGroupWithException() throws Exception {

        instance.listUsers(new UserGroup("SomeGroup", "System", null, null));
    }

    @Test
    public void testListGroups() {

        Set<UserGroup> result = instance.listGroups();

        assertEquals(result.size(), 4);
    }

    @Test
    public void testListGroupsByDomain() {

        Set<UserGroup> result = instance.listGroups("SomeDomain");

        assertTrue(result.isEmpty());

        result = instance.listGroups("System");

        assertEquals(result.size(), 4);
    }

    @Test
    public void testFindUser() throws Exception {

        User user = instance.findUser("user1", "SomeDomain");

        assertNull(user);

        user = instance.findUser("user1", "System");

        assertNotNull(user);
        assertEquals(user.getFirstName(), "John");

        user = instance.findUser("user2", "System");

        assertNotNull(user);
        assertEquals(user.getLastName(), "Doey");

        user = instance.findUser("user3", "System");

        assertNotNull(user);
        assertEquals(user.getMail(), "user3@example.com");
    }

    @Test(expectedExceptions = UserNotFoundException.class)
    public void testFindUserWithException() throws Exception {

        User user = instance.findUser("someUser", "SomeDomain");

        assertNull(user);

        instance.findUser("someUser", "System");
    }

    @Test
    public void testFindGroup() throws Exception {

        UserGroup group = instance.findGroup("group1", "SomeDomain");

        assertNull(group);

        group = instance.findGroup("group1", "System");

        assertNotNull(group);
        assertEquals(group.getUsers().size(), 2);

        group = instance.findGroup("group2", "System");

        assertNotNull(group);
        assertEquals(group.getUsers().size(), 1);

        group = instance.findGroup("group3", "System");

        assertNotNull(group);
        assertEquals(group.getUsers().size(), 3);
    }
}
