package tr.com.eno.livo.server.authc.cassandra;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.mockito.Mockito;
import org.slf4j.LoggerFactory;
import static org.testng.Assert.*;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.authc.AuthenticationToken;

/**
 *
 * @author dacay
 */
public class CassandraUserAuthenticationServiceIT {
    
    private static final String PASSWORD = "UjHewdAvKes8";
    private static ClassPathCQLDataSet dataSet;
    
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
    private CassandraUserAuthenticationService instance;

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

        instance = new CassandraUserAuthenticationService();

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

        session.close();
        cluster.close();
    }

    @AfterMethod
    public void tearDownInstance() {

        instance.stop();
    }

    /**
     * Test of login method, of class CassandraUserAuthenticationService.
     */
    @Test
    public void testLogin() {
        
        AuthenticationToken beforeToken = new AuthenticationToken("someCompany", null, null, "System", UUID.randomUUID().toString(), new Date(), new Date());
        
        AuthenticationToken afterToken = instance.login(beforeToken, "someUser", PASSWORD);
        
        assertEquals(afterToken.getUniqueValue(), beforeToken.getUniqueValue());
        assertEquals(afterToken.getUserPrincipal(), "someuser");
    }

    /**
     * Test of login method, of class CassandraUserAuthenticationService.
     */
    @Test(expectedExceptions = SecurityException.class)
    public void testLoginWithWrongPassword() {
        
        AuthenticationToken token = new AuthenticationToken("someCompany", null, null, "System", UUID.randomUUID().toString(), new Date(), new Date());
        
        instance.login(token, "someUser", RandomStringUtils.randomAlphanumeric(12));
    }

    /**
     * Test of login method, of class CassandraUserAuthenticationService.
     */
    @Test(expectedExceptions = NullPointerException.class)
    public void testLoginWithMissingArguments() {
        
        instance.login(null, "someUser", RandomStringUtils.randomAlphanumeric(12));
    }
}
