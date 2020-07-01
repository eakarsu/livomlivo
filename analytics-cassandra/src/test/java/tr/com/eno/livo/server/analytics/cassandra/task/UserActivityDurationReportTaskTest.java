package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.joda.time.Duration;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.*;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.analytics.Report;

public class UserActivityDurationReportTaskTest {

    private long rowCount;
    private long userCount;
    private ResultSet resultSet;
    private Map<String, Long> userActivityDurations;

    @BeforeClass
    public void setUpData() {

        rowCount = RandomUtils.nextLong(10, 100);

        List<String> users = new LinkedList<>();

        for (int i = 0; i < RandomUtils.nextInt(1, (int) rowCount); i++) {

            users.add(RandomStringUtils.randomAlphabetic(7));
        }

        userActivityDurations = new HashMap<>();

        List<Row> rows = new LinkedList<>();

        for (int i = 0; i < rowCount; i++) {

            Row row = mock(Row.class);

            String userPrincipal = users.get(RandomUtils.nextInt(0, users.size()));

            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));

            long startTimeMillis = RandomUtils.nextLong(1, new Date().getTime() - 1000);
            long endTimeMillis = RandomUtils.nextInt(0, 100) % 2 == 0 ? RandomUtils.nextLong(startTimeMillis, new Date().getTime()) : 0;

            HashMap data = new HashMap();
            data.put("userPrincipal", userPrincipal);

            when(row.getLong("start_time")).thenReturn(startTimeMillis);
            when(row.getLong("end_time")).thenReturn(endTimeMillis);
            when(row.getMap("parameters", String.class, String.class)).thenReturn(data);
            
            if (endTimeMillis == 0) {
                
                endTimeMillis = startTimeMillis + Duration.standardMinutes(10).getMillis();
            }

            if (userActivityDurations.containsKey(userPrincipal)) {

                long currentVal = userActivityDurations.get(userPrincipal);

                userActivityDurations.put(userPrincipal, currentVal + endTimeMillis - startTimeMillis);

            } else {

                userActivityDurations.put(userPrincipal, endTimeMillis - startTimeMillis);
            }

            rows.add(row);
        }

        userCount = userActivityDurations.size();

        resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());

        for (String userPrincipal : userActivityDurations.keySet()) {

            long duration = userActivityDurations.get(userPrincipal);

            userActivityDurations.put(userPrincipal, Duration.millis(duration).getStandardMinutes());
        }
    }

    @Test
    public void testCalculate() {

        UserActivityDurationReportTask task = new UserActivityDurationReportTask();

        Set<Report> reports = task.calculate(resultSet);

        assertNotNull(reports);
        assertEquals(reports.size(), 1);

        Report report = reports.iterator().next();

        assertNotNull(report);

        assertEquals(report.getData().size(), userCount);

        for (Object userPrincipalObj : report.getData().keySet()) {

            String userPrincipal = (String) userPrincipalObj;

            assertEquals((Long) report.getData().get(userPrincipal), userActivityDurations.get(userPrincipal));
        }
    }
}
