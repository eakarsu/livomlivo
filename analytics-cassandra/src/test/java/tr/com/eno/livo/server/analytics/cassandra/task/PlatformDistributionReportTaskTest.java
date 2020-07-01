package tr.com.eno.livo.server.analytics.cassandra.task;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.analytics.Report;

public class PlatformDistributionReportTaskTest {

    private long rowCount;
    private String firstPlatformName;
    private long firstPlatformCount;
    private String secondPlatformName;
    private long secondPlatformCount;
    private ResultSet resultSet;

    @BeforeClass
    public void setUpData() {

        rowCount = RandomUtils.nextInt(10, 100);

        firstPlatformName = RandomStringUtils.randomAlphanumeric(5);
        secondPlatformName = RandomStringUtils.randomAlphanumeric(5);

        firstPlatformCount = RandomUtils.nextLong(1, rowCount);
        secondPlatformCount = rowCount - firstPlatformCount;

        List<Row> rows = new LinkedList<>();

        for (int i = 0; i < firstPlatformCount; i++) {

            Row row = mock(Row.class);

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            Map<String, String> data = new HashMap();
            data.put("platform", firstPlatformName);

            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);

            rows.add(row);
        }

        for (int i = 0; i < secondPlatformCount; i++) {

            Row row = mock(Row.class);

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            HashMap data = new HashMap();
            data.put("platform", secondPlatformName);

            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);

            rows.add(row);
        }

        resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());
    }

    @Test
    public void testCalculate() {

        PlatformDistributionReportTask task = new PlatformDistributionReportTask();

        Set<Report> reports = task.calculate(resultSet);

        assertNotNull(reports);
        assertEquals(reports.size(), 1);

        Report report = reports.iterator().next();

        assertNotNull(report);

        if (firstPlatformCount == 0) {
            assertFalse(report.getData().containsKey(firstPlatformName));
        } else {
            assertTrue(report.getData().containsKey(firstPlatformName));
        }
        if (secondPlatformCount == 0) {
            assertFalse(report.getData().containsKey(secondPlatformName));
        } else {
            assertTrue(report.getData().containsKey(secondPlatformName));
        }

        assertEquals(report.getData().get(firstPlatformName), firstPlatformCount);
        assertEquals(report.getData().get(secondPlatformName), secondPlatformCount);
    }
}
