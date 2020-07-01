package tr.com.eno.livo.server.analytics.cassandra.task;

import ch.qos.logback.classic.Level;
import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Duration;
import org.joda.time.Instant;
import org.joda.time.Interval;
import org.joda.time.Period;
import org.slf4j.LoggerFactory;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.annotations.BeforeClass;
import tr.com.eno.livo.server.analytics.Report;

public class ActiveUserCountReportTaskTest {

    @BeforeClass
    public void setUpLogging() {

        ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(ActiveUserCountReportTask.class)).setLevel(Level.INFO);
    }

    @DataProvider(name = "todaysHourlyCount")
    public Object[][] getTodaysHourlyCountData() {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        int rowCount = RandomUtils.nextInt(10, 100);

        List<String> users = randomUsers(10);

        List<Row> rows = new LinkedList<>();

        Map<Integer, Set<String>> tmpData = new HashMap<>();

        for (int i = 0; i < rowCount; i++) {

            Interval randomInterval = RandomUtils.nextInt(0, 10) % 2 == 0 ? randomHourlyInterval() : randomTodaysHourlyInterval();

            String user = users.get(RandomUtils.nextInt(0, 10));

            for (int hour : task.getTodaysSpannedHours(randomInterval)) {

                if (tmpData.containsKey(hour)) {

                    tmpData.get(hour).add(user);

                } else {

                    tmpData.put(hour, new HashSet<String>(Collections.singleton(user)));
                }
            }

            Row row = mock(Row.class);
            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));
            when(row.getLong("start_time")).thenReturn(randomInterval.getStartMillis());
            when(row.getLong("end_time")).thenReturn(randomInterval.getEndMillis());
            when(row.getMap("parameters", String.class, String.class)).thenReturn(Collections.singletonMap("userPrincipal", user));

            rows.add(row);
        }

        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());

        HashMap<Integer, Long> data = new HashMap<>(Maps.transformValues(tmpData, new Function<Set<String>, Long>() {

            @Override
            public Long apply(Set<String> input) {

                return (long) input.size();
            }
        }));

        return new Object[][]{
            {
                resultSet, data
            }
        };
    }

    @DataProvider(name = "hourlyCount")
    public Object[][] getHourlyCountData() {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        int rowCount = RandomUtils.nextInt(10, 100);

        List<String> users = randomUsers(10);

        List<Row> rows = new LinkedList<>();

        Map<Integer, Set<String>> tmpData = new HashMap<>();

        for (int i = 0; i < rowCount; i++) {

            Interval randomInterval = randomHourlyInterval();

            String user = users.get(RandomUtils.nextInt(0, 10));

            for (int hour : task.getSpannedHours(randomInterval)) {

                if (tmpData.containsKey(hour)) {

                    tmpData.get(hour).add(user);

                } else {

                    tmpData.put(hour, new HashSet<String>(Collections.singleton(user)));
                }
            }

            Row row = mock(Row.class);
            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));
            when(row.getLong("start_time")).thenReturn(randomInterval.getStartMillis());
            when(row.getLong("end_time")).thenReturn(randomInterval.getEndMillis());
            when(row.getMap("parameters", String.class, String.class)).thenReturn(Collections.singletonMap("userPrincipal", user));

            rows.add(row);
        }

        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());

        HashMap<Integer, Long> data = new HashMap<>(Maps.transformValues(tmpData, new Function<Set<String>, Long>() {

            @Override
            public Long apply(Set<String> input) {

                return (long) input.size();
            }
        }));

        return new Object[][]{
            {
                resultSet, data
            }
        };
    }

    @DataProvider(name = "dailyCount")
    public Object[][] getDailyCountData() {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        int rowCount = RandomUtils.nextInt(10, 100);

        List<String> users = randomUsers(10);

        List<Row> rows = new LinkedList<>();

        Map<Integer, Set<String>> tmpData = new HashMap<>();

        for (int i = 0; i < rowCount; i++) {

            Interval randomInterval = randomDailyInterval();

            String user = users.get(RandomUtils.nextInt(0, 10));

            for (int day : task.getSpannedDays(randomInterval)) {

                if (tmpData.containsKey(day)) {

                    tmpData.get(day).add(user);

                } else {

                    tmpData.put(day, new HashSet<String>(Collections.singleton(user)));
                }
            }

            Row row = mock(Row.class);
            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));
            when(row.getLong("start_time")).thenReturn(randomInterval.getStartMillis());
            when(row.getLong("end_time")).thenReturn(randomInterval.getEndMillis());
            when(row.getMap("parameters", String.class, String.class)).thenReturn(Collections.singletonMap("userPrincipal", user));

            rows.add(row);
        }

        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());

        HashMap<Integer, Long> data = new HashMap<>(Maps.transformValues(tmpData, new Function<Set<String>, Long>() {

            @Override
            public Long apply(Set<String> input) {

                return (long) input.size();
            }
        }));

        return new Object[][]{
            {
                resultSet, data
            }
        };
    }

    @DataProvider(name = "monthlyCount")
    public Object[][] getMonthlyCountData() {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        int rowCount = RandomUtils.nextInt(10, 100);

        List<String> users = randomUsers(10);

        List<Row> rows = new LinkedList<>();

        Map<Integer, Set<String>> tmpData = new HashMap<>();

        for (int i = 0; i < rowCount; i++) {

            Interval randomInterval = randomMonthlyInterval();

            String user = users.get(RandomUtils.nextInt(0, 10));

            for (int month : task.getSpannedMonths(randomInterval)) {

                if (tmpData.containsKey(month)) {

                    tmpData.get(month).add(user);

                } else {

                    tmpData.put(month, new HashSet<String>(Collections.singleton(user)));
                }
            }

            Row row = mock(Row.class);
            when(row.getString("id")).thenReturn(RandomStringUtils.randomAlphanumeric(12));
            when(row.getLong("start_time")).thenReturn(randomInterval.getStartMillis());
            when(row.getLong("end_time")).thenReturn(randomInterval.getEndMillis());
            when(row.getMap("parameters", String.class, String.class)).thenReturn(Collections.singletonMap("userPrincipal", user));

            rows.add(row);
        }

        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.iterator()).thenReturn(rows.iterator());

        HashMap<Integer, Long> data = new HashMap<>(Maps.transformValues(tmpData, new Function<Set<String>, Long>() {

            @Override
            public Long apply(Set<String> input) {

                return (long) input.size();
            }
        }));

        return new Object[][]{
            {
                resultSet, data
            }
        };
    }

    @DataProvider(name = "todaysSpannedHours")
    public Object[][] getTodaysSpannedHoursData() {

        Instant todaysStartInstant = DateTime.now().withHourOfDay(0).withMinuteOfHour(0).withSecondOfMinute(0).withMillisOfSecond(0).toInstant();

        Interval oneMinuteInterval = new Interval(todaysStartInstant, todaysStartInstant.plus(Duration.standardMinutes(1)));
        Interval oneHourInterval = new Interval(todaysStartInstant, todaysStartInstant.plus(Duration.standardHours(1)).plus(Duration.standardMinutes(1)));

        return new Object[][]{
            {
                oneMinuteInterval, Lists.newArrayList(0)
            },
            {
                oneHourInterval, Lists.newArrayList(0, 1)
            }
        };
    }

    @DataProvider(name = "spannedHours")
    public Object[][] getSpannedHoursData() {

        Instant epochInstant = new Instant(0);

        Interval oneDayInterval = new Interval(epochInstant, epochInstant.plus(Duration.standardDays(1)));
        Interval noonExclusiveInterval = new Interval(epochInstant.plus(Duration.standardHours(12)), epochInstant.plus(Duration.standardHours(18)));
        Interval noonInclusiveInterval = new Interval(epochInstant.plus(Duration.standardHours(12)), epochInstant.plus(Duration.standardHours(18).plus(Duration.standardMinutes(10))));

        return new Object[][]{
            {
                oneDayInterval, Lists.newArrayList(2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1)
            },
            {
                noonExclusiveInterval, Lists.newArrayList(14, 15, 16, 17, 18, 19)
            },
            {
                noonInclusiveInterval, Lists.newArrayList(14, 15, 16, 17, 18, 19, 20)
            }
        };
    }

    @DataProvider(name = "spannedDays")
    public Object[][] getSpannedDaysData() {

        Instant epochInstant = new Instant(0);

        Interval oneDayInterval = new Interval(epochInstant, epochInstant.plus(Duration.standardDays(1)));
        Interval threeDaysInterval = new Interval(epochInstant.plus(Duration.standardHours(1)), epochInstant.plus(Duration.standardHours(1)).plus(Duration.standardDays(3)));
        Interval otherThreeDaysInterval = new Interval(epochInstant.plus(Duration.standardHours(1)), epochInstant.plus(Duration.standardDays(4)).minus(Duration.standardHours(1)));

        return new Object[][]{
            {
                oneDayInterval, Lists.newArrayList(Calendar.THURSDAY)
            },
            {
                threeDaysInterval, Lists.newArrayList(Calendar.THURSDAY, Calendar.FRIDAY, Calendar.SATURDAY, Calendar.SUNDAY)
            },
            {
                otherThreeDaysInterval, Lists.newArrayList(Calendar.THURSDAY, Calendar.FRIDAY, Calendar.SATURDAY, Calendar.SUNDAY)
            }
        };
    }

    @DataProvider(name = "spannedMonths")
    public Object[][] getSpannedMonthsData() {

        Instant epochInstant = new Instant(0);

        Interval oneDayInterval = new Interval(epochInstant, epochInstant.plus(Duration.standardDays(1)));
        Interval threeDaysInterval = new Interval(epochInstant.plus(Duration.standardHours(1)), epochInstant.plus(Duration.standardHours(1)).plus(Duration.standardDays(3)));
        Interval oneMonthInterval = new Interval(epochInstant.plus(Duration.standardHours(1)), epochInstant.plus(Period.months(1).toDurationFrom(epochInstant)).minus(Duration.standardHours(1)));
        Interval twoMonthInterval = new Interval(epochInstant.plus(Duration.standardHours(1)), epochInstant.plus(Period.months(1).toDurationFrom(epochInstant)).plus(Duration.standardHours(1)));

        return new Object[][]{
            {
                oneDayInterval, Lists.newArrayList(Calendar.JANUARY)
            },
            {
                threeDaysInterval, Lists.newArrayList(Calendar.JANUARY)
            },
            {
                oneMonthInterval, Lists.newArrayList(Calendar.JANUARY)
            },
            {
                twoMonthInterval, Lists.newArrayList(Calendar.JANUARY, Calendar.FEBRUARY)
            }
        };
    }

    @Test(dataProvider = "todaysSpannedHours")
    public void testGetTodaysSpannedHours(Interval activityInterval, List<Integer> expectedHours) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        assertEquals(task.getTodaysSpannedHours(activityInterval), expectedHours);
    }

    @Test(dataProvider = "spannedHours")
    public void testGetSpannedHours(Interval activityInterval, List<Integer> expectedHours) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        assertEquals(task.getSpannedHours(activityInterval), expectedHours);
    }

    @Test(dataProvider = "spannedDays")
    public void testGetSpannedDays(Interval activityInterval, List<Integer> expectedDays) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        assertEquals(task.getSpannedDays(activityInterval), expectedDays);
    }

    @Test(dataProvider = "spannedMonths")
    public void testGetSpannedMonths(Interval activityInterval, List<Integer> expectedDays) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        assertEquals(task.getSpannedMonths(activityInterval), expectedDays);
    }

    @Test(dataProvider = "todaysHourlyCount", dependsOnMethods = {"testGetSpannedHours"})
    public void testTodaysHourlyCount(ResultSet resultSet, Map<Integer, Long> expectedData) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        Report report = findReport(task.calculate(resultSet), Report.Period.DAILY, DateTime.now().withTimeAtStartOfDay().toDateTime(DateTimeZone.getDefault()).toDate());

        assertNotNull(report);

        assertEquals(report.getData(), expectedData);
    }

    @Test(dataProvider = "hourlyCount", dependsOnMethods = {"testGetSpannedHours"})
    public void testHourlyCount(ResultSet resultSet, Map<Integer, Long> expectedData) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        Report report = findReport(task.calculate(resultSet), Report.Period.DAILY, null);

        assertEquals(report.getData(), expectedData);
    }

    @Test(dataProvider = "dailyCount", dependsOnMethods = {"testGetSpannedDays"})
    public void testDailyCount(ResultSet resultSet, Map<Integer, Long> expectedData) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        Report report = findReport(task.calculate(resultSet), Report.Period.WEEKLY, null);

        assertEquals(report.getData(), expectedData);
    }

    @Test(dataProvider = "monthlyCount", dependsOnMethods = {"testGetSpannedMonths"})
    public void testMonthlyCount(ResultSet resultSet, Map<Integer, Long> expectedData) {

        ActiveUserCountReportTask task = new ActiveUserCountReportTask();

        Report report = findReport(task.calculate(resultSet), Report.Period.MONTHLY, null);

        assertEquals(report.getData(), expectedData);
    }

    private Interval randomTodaysHourlyInterval() {

        Instant startInstant = DateTime.now().withTimeAtStartOfDay().toInstant();

        Instant endInstant = new Instant(RandomUtils.nextLong(startInstant.getMillis(), new Instant().getMillis()));

        return new Interval(startInstant, endInstant);
    }

    private Interval randomHourlyInterval() {

        Instant startInstant = new Instant(RandomUtils.nextLong(0, DateTime.now().getMillis()));

        return new Interval(startInstant, startInstant.plus(Duration.standardHours(RandomUtils.nextInt(0, 48))));
    }

    private Interval randomDailyInterval() {

        Instant startInstant = new Instant(RandomUtils.nextLong(0, DateTime.now().getMillis()));

        return new Interval(startInstant, startInstant.plus(Duration.standardDays(RandomUtils.nextInt(0, 7))));
    }

    private Interval randomMonthlyInterval() {

        Instant startInstant = new Instant(RandomUtils.nextLong(0, DateTime.now().getMillis()));

        return new Interval(startInstant, startInstant.plus(Duration.standardDays(RandomUtils.nextInt(31, 62))));
    }

    private List<String> randomUsers(int count) {

        Set<String> tmpUsers = new HashSet<>();

        for (int i = 0; i < count; i++) {

            tmpUsers.add(RandomStringUtils.randomAlphabetic(7));
        }

        return new LinkedList<>(tmpUsers);
    }

    private Report findReport(Set<Report> reports, Report.Period period, Date date) {

        if (reports == null || reports.isEmpty()) {
            return null;
        }

        for (Report report : reports) {

            if (report.getPeriod().toInteger() == period.toInteger() && (report.getDate() == date || (report.getDate() != null && report.getDate().equals(date)))) {
                return report;
            }
        }

        return null;
    }
}
