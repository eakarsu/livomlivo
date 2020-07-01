package tr.com.eno.livo.server.application.cassandra;

import static org.testng.Assert.*;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedSet;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.slf4j.LoggerFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.application.AuthorizationPolicy;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

/**
 *
 * @author dacay
 */
public class CassandraApplicationServiceIT {

    private static ClassPathCQLDataSet dataSet;
    private CassandraApplicationService instance;

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

        instance = new CassandraApplicationService();

        Map<String, Object> config = new HashMap<>();
        config.put("cassandra.host", "127.0.0.1");
        config.put("cassandra.port", 9042);

        instance.start(config);
    }

    @AfterMethod(dependsOnMethods = "tearDownInstance")
    public void tearDownData() {

        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        Session session = cluster.connect();

        session.execute("DROP TABLE IF EXISTS application.applications;");
        session.execute("DROP TABLE IF EXISTS application.deployments;");
        session.execute("DROP TABLE IF EXISTS application.authorized_users;");
        session.execute("DROP TABLE IF EXISTS application.authorized_user_groups;");

        session.close();
        cluster.close();
    }

    @AfterMethod
    public void tearDownInstance() {

        instance.stop();
    }

//    /**
//     * Test of createApplication method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testCreateApplication() throws Exception {
//        System.out.println("createApplication");
//        Application application = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.createApplication(application);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
////
//    /**
//     * Test of deleteApplication method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testDeleteApplication() throws Exception {
//        System.out.println("deleteApplication");
//        String domain = "";
//        String applicationName = "";
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.deleteApplication(domain, applicationName);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of deployApplication method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testDeployApplication() throws Exception {
//        System.out.println("deployApplication");
//        Application application = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.deployApplication(application);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of getApplicationHistory method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testGetApplicationHistory() throws Exception {
//        System.out.println("getApplicationHistory");
//        String domain = "";
//        String applicationName = "";
//        byte limit = 0;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        List expResult = null;
//        List result = instance.getApplicationHistory(domain, applicationName, limit);
//        assertEquals(result, expResult);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
    /**
     * Test of listApplications method, of class CassandraApplicationService.
     */
    @Test
    public void testListApplications() {
        
        SortedSet<Application> applications = instance.listApplications(Application.DEFAULT_DOMAIN);
        
        assertNotNull(applications);
        assertEquals(applications.size(), 2);
        
        applications = instance.listApplications("someDomain");

        assertNotNull(applications);
        assertEquals(applications.size(), 1);

        applications = instance.listApplications("someOtherDomain");

        assertNotNull(applications);
        assertTrue(applications.isEmpty());
    }
//
//    /**
//     * Test of loadApplication method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testLoadApplication() throws Exception {
//        System.out.println("loadApplication");
//        String domain = "";
//        String applicationName = "";
//        CassandraApplicationService instance = new CassandraApplicationService();
//        Application expResult = null;
//        Application result = instance.loadApplication(domain, applicationName);
//        assertEquals(result, expResult);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of saveApplication method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testSaveApplication() throws Exception {
//        System.out.println("saveApplication");
//        Application application = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.saveApplication(application);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of authorizeUsers method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testAuthorizeUsers() throws Exception {
//        System.out.println("authorizeUsers");
//        String domain = "";
//        String applicationName = "";
//        User[] users = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.authorizeUsers(domain, applicationName, users);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of deauthorizeUsers method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testDeauthorizeUsers() throws Exception {
//        System.out.println("deauthorizeUsers");
//        String domain = "";
//        String applicationName = "";
//        User[] users = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.deauthorizeUsers(domain, applicationName, users);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of authorizeGroups method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testAuthorizeGroups() throws Exception {
//        System.out.println("authorizeGroups");
//        String domain = "";
//        String applicationName = "";
//        UserGroup[] groups = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.authorizeGroups(domain, applicationName, groups);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of deauthorizeGroups method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testDeauthorizeGroups() throws Exception {
//        System.out.println("deauthorizeGroups");
//        String domain = "";
//        String applicationName = "";
//        UserGroup[] groups = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.deauthorizeGroups(domain, applicationName, groups);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of setAuthorizationPolicy method, of class CassandraApplicationService.
//     */
//    @Test
//    public void testSetAuthorizationPolicy() throws Exception {
//        System.out.println("setAuthorizationPolicy");
//        String domain = "";
//        String applicationName = "";
//        AuthorizationPolicy policy = null;
//        CassandraApplicationService instance = new CassandraApplicationService();
//        instance.setAuthorizationPolicy(domain, applicationName, policy);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
}
