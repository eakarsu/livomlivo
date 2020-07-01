package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.AbstractMap;
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
import tr.com.eno.livo.server.analytics.cassandra.task.ServiceObjectTotalOperationPayloadSizeReportTask.Entry;

public class ServiceObjectTotalOperationPayloadSizeReportTaskTest {

    private long rowCount;
    private String firstServiceObjectName;
    private Entry firstServiceObjectPayloadSizes;
    private String secondServiceObjectName;
    private Entry secondServiceObjectPayloadSizes;
    private ResultSet resultSet;

    @BeforeClass
    public void setUpData() {

        rowCount = RandomUtils.nextInt(10, 100);

        firstServiceObjectName = RandomStringUtils.randomAlphanumeric(5);
        secondServiceObjectName = RandomStringUtils.randomAlphanumeric(5);

        firstServiceObjectPayloadSizes = new ServiceObjectTotalOperationPayloadSizeReportTask.Entry(0L, 0L);
        secondServiceObjectPayloadSizes = new ServiceObjectTotalOperationPayloadSizeReportTask.Entry(0L, 0L);

        List<Row> rows = new LinkedList<>();

        for (int i = 0; i < rowCount; i++) {

            Row row = mock(Row.class);

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            String serviceObjectName = new String[]{firstServiceObjectName, secondServiceObjectName}[RandomUtils.nextInt(0, 2)];

            long inputSize = RandomUtils.nextLong(0, 1000L);
            long outputSize = RandomUtils.nextLong(0, 1000L);

            if (serviceObjectName.equals(firstServiceObjectName)) {
                firstServiceObjectPayloadSizes.setKey(firstServiceObjectPayloadSizes.getKey() + inputSize);
                firstServiceObjectPayloadSizes.setValue(firstServiceObjectPayloadSizes.getValue() + outputSize);
            } else {
                secondServiceObjectPayloadSizes.setKey(secondServiceObjectPayloadSizes.getKey() + inputSize);
                secondServiceObjectPayloadSizes.setValue(secondServiceObjectPayloadSizes.getValue() + outputSize);
            }

            HashMap data = new HashMap();
            data.put("serviceObjectName", serviceObjectName);
            data.put("inputPayloadSize", Long.toString(inputSize));
            data.put("outputPayloadSize", Long.toString(outputSize));

            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);

            rows.add(row);
        }

        resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());
    }

    @Test
    public void testCalculate() {

        ServiceObjectTotalOperationPayloadSizeReportTask task = new ServiceObjectTotalOperationPayloadSizeReportTask();

        Set<Report> reports = task.calculate(resultSet);

        assertNotNull(reports);
        assertEquals(reports.size(), 1);

        Report report = reports.iterator().next();

        assertNotNull(report);
        
        assertTrue(report.getData().containsKey(firstServiceObjectName));
        assertTrue(report.getData().containsKey(secondServiceObjectName));
        
        assertEquals(((Map.Entry<Long, Long>) report.getData().get(firstServiceObjectName)).getKey(), firstServiceObjectPayloadSizes.getKey());
        assertEquals(((Map.Entry<Long, Long>) report.getData().get(firstServiceObjectName)).getValue(), firstServiceObjectPayloadSizes.getValue());
        assertEquals(((Map.Entry<Long, Long>) report.getData().get(secondServiceObjectName)).getKey(), secondServiceObjectPayloadSizes.getKey());
        assertEquals(((Map.Entry<Long, Long>) report.getData().get(secondServiceObjectName)).getValue(), secondServiceObjectPayloadSizes.getValue());
    }
}
