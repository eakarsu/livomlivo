package tr.com.eno.livo.server.analytics.cassandra;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;
import java.util.UUID;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.slf4j.LoggerFactory;
import static org.testng.Assert.*;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.Report.Period;

public class CassandraHelperIT {

    private static final String COMPANY_ID_ONE = "company1";
    private static final String COMPANY_ID_TWO = "company2";
    private static final String COMPANY_ID_THREE = "company3";
    private static final String USER_PRINCIPAL_ONE = "user1";
    private static final String USER_PRINCIPAL_TWO = "user2";
    private static final String USER_PRINCIPAL_THREE = "user3";
    private static final Date SOME_REPORT_2_DATE = new Date(1296691200000L);
    private static final String REPORT_NAME_1 = "Report1";
    private static final String REPORT_NAME_2 = "Report2";
    private static final String REPORT_NAME_3 = "Report3";
    private static ClassPathCQLDataSet dataSet;
    private Session session;

    @BeforeSuite
    public static void setUpSuite() {

        Logger logger = (Logger) LoggerFactory.getLogger("com.datastax.driver");
        logger.setLevel(Level.OFF);

        logger = (Logger) LoggerFactory.getLogger("org.cassandraunit");
        logger.setLevel(Level.OFF);
    }

    @BeforeClass
    public static void setUpClass() throws Exception {

        dataSet = new ClassPathCQLDataSet("dataSet.cql");
    }

    @BeforeMethod
    public void setUpMethod() {

        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        session = cluster.connect();

        CQLDataLoader dataLoader = new CQLDataLoader(session);

        dataLoader.load(dataSet);

        CassandraHelper.connect("127.0.0.1", 9042);
    }

    @AfterMethod
    public static void tearDownMethod() throws Exception {

        CassandraHelper.disconnect();

        Cluster cluster = Cluster.builder().addContactPoints("127.0.0.1").withPort(9042).build();
        Session session = cluster.connect();

        session.execute("DROP KEYSPACE analytics;");

        cluster.closeAsync();
    }

    @Test
    public void isUserOptedIn() {

        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_ONE, USER_PRINCIPAL_TWO));
        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_TWO, USER_PRINCIPAL_ONE));
        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_TWO, USER_PRINCIPAL_TWO));

        assertTrue(CassandraHelper.isUserOptedIn(COMPANY_ID_ONE, USER_PRINCIPAL_ONE));
        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_THREE, USER_PRINCIPAL_THREE));
    }

    @Test(dependsOnMethods = "isUserOptedIn")
    public void optInUser() {

        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_TWO, USER_PRINCIPAL_TWO));
        CassandraHelper.optInUser(COMPANY_ID_TWO, USER_PRINCIPAL_TWO);
        assertTrue(CassandraHelper.isUserOptedIn(COMPANY_ID_TWO, USER_PRINCIPAL_TWO));

        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_THREE, USER_PRINCIPAL_THREE));
        CassandraHelper.optInUser(COMPANY_ID_THREE, USER_PRINCIPAL_THREE);
        assertTrue(CassandraHelper.isUserOptedIn(COMPANY_ID_THREE, USER_PRINCIPAL_THREE));
    }

    @Test(dependsOnMethods = "isUserOptedIn")
    public void optOutUser() {

        assertTrue(CassandraHelper.isUserOptedIn(COMPANY_ID_ONE, USER_PRINCIPAL_ONE));
        CassandraHelper.optOutUser(COMPANY_ID_ONE, USER_PRINCIPAL_ONE);
        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_ONE, USER_PRINCIPAL_ONE));

        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_THREE, USER_PRINCIPAL_THREE));
        CassandraHelper.optOutUser(COMPANY_ID_THREE, USER_PRINCIPAL_THREE);
        assertFalse(CassandraHelper.isUserOptedIn(COMPANY_ID_THREE, USER_PRINCIPAL_THREE));
    }

    @Test
    public void loadReport() {

        Report report1 = CassandraHelper.loadReport(REPORT_NAME_1, Report.Period.ALL_TIME);

        assertNotNull(report1);
        assertEquals(report1.getPeriod(), Report.Period.ALL_TIME);
        assertNull(report1.getDate());
        assertNull(report1.getData());

        Report report2 = CassandraHelper.loadReport(REPORT_NAME_2, Report.Period.ALL_TIME);

        assertNull(report2);

        report2 = CassandraHelper.loadReport(REPORT_NAME_2, Report.Period.MONTHLY);

        assertNull(report2);

        report2 = CassandraHelper.loadReport(REPORT_NAME_2, Report.Period.MONTHLY, SOME_REPORT_2_DATE);

        assertNotNull(report2);
        assertEquals(report2.getPeriod(), Report.Period.MONTHLY);
        assertEquals(report2.getDate(), SOME_REPORT_2_DATE);

        Report report3 = CassandraHelper.loadReport(REPORT_NAME_3, Report.Period.ALL_TIME);

        assertNull(report3);
    }

    @Test(dependsOnMethods = "loadReport")
    public void saveReport() {

        HashMap data = new HashMap();
        data.put("id", UUID.randomUUID().toString());

        Report report = new Report();
        report.setType(REPORT_NAME_1);
        report.setData(data);
        report.setPeriod(Report.Period.WEEKLY);

        Report loadedReport = CassandraHelper.loadReport(REPORT_NAME_1, Period.WEEKLY);

        assertNull(loadedReport);

        CassandraHelper.saveReport(report);

        loadedReport = CassandraHelper.loadReport(REPORT_NAME_1, Period.WEEKLY);

        assertNotNull(loadedReport);
        assertEquals(report.getPeriod().toInteger(), loadedReport.getPeriod().toInteger());

        Report report2 = new Report();
        report2.setType(REPORT_NAME_2);
        report2.setPeriod(Period.WEEKLY);

        loadedReport = CassandraHelper.loadReport(REPORT_NAME_2, Period.WEEKLY);

        assertNull(loadedReport);

        CassandraHelper.saveReport(report2);

        loadedReport = CassandraHelper.loadReport(REPORT_NAME_2, Period.WEEKLY);

        assertNotNull(loadedReport);
    }
}
