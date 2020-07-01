package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.*;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.analytics.Report;

public class ServiceObjectRequestCountReportTaskTest {

    private long rowCount;
    private String firstServiceObjectName;
    private long firstServiceObjectRequestCount;
    private String secondServiceObjectName;
    private long secondServiceObjectRequestCount;
    private ResultSet resultSet;

    @BeforeClass
    public void setUpData() {

        rowCount = RandomUtils.nextInt(10, 100);

        firstServiceObjectName = RandomStringUtils.randomAlphanumeric(5);
        secondServiceObjectName = RandomStringUtils.randomAlphanumeric(5);

        firstServiceObjectRequestCount = RandomUtils.nextLong(1, rowCount);
        secondServiceObjectRequestCount = rowCount - firstServiceObjectRequestCount;

        List<Row> rows = new LinkedList<>();

        for (int i = 0; i < firstServiceObjectRequestCount; i++) {

            Row row = mock(Row.class);

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            Map<String, String> data = new HashMap();
            data.put("serviceObjectName", firstServiceObjectName);

            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);

            rows.add(row);
        }

        for (int i = 0; i < secondServiceObjectRequestCount; i++) {

            Row row = mock(Row.class);

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            HashMap data = new HashMap();
            data.put("serviceObjectName", secondServiceObjectName);

            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);

            rows.add(row);
        }

        resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());
    }

    @Test
    public void testCalculate() {

        ServiceObjectRequestCountReportTask task = new ServiceObjectRequestCountReportTask();

        Set<Report> reports = task.calculate(resultSet);

        assertNotNull(reports);
        assertEquals(reports.size(), 1);

        Report report = reports.iterator().next();

        assertNotNull(report);

        if (firstServiceObjectRequestCount == 0) {
            assertFalse(report.getData().containsKey(firstServiceObjectName));
        } else {
            assertTrue(report.getData().containsKey(firstServiceObjectName));
        }
        if (secondServiceObjectRequestCount == 0) {
            assertFalse(report.getData().containsKey(secondServiceObjectName));
        } else {
            assertTrue(report.getData().containsKey(secondServiceObjectName));
        }

        assertEquals(report.getData().get(firstServiceObjectName), firstServiceObjectRequestCount);
        assertEquals(report.getData().get(secondServiceObjectName), secondServiceObjectRequestCount);
    }
}
