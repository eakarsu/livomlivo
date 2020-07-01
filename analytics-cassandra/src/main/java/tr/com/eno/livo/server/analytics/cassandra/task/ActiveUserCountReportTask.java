package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.google.common.base.Function;
import com.google.common.collect.Maps;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.joda.time.DateTimeZone;
import org.joda.time.Duration;
import org.joda.time.Instant;
import org.joda.time.Interval;
import org.joda.time.Period;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.Report;

public class ActiveUserCountReportTask extends AbstractReportTask {

    private static final Logger LOGGER = LoggerFactory.getLogger(ActiveUserCountReportTask.class);
    private static final Function USER_COUNT_FUNCTION = new Function<Set<String>, Long>() {

        @Override
        public Long apply(Set<String> input) {

            return (long) input.size();
        }
    };
    private static final Map<Integer, Integer> JODA_DAYS_TO_CALENDAR_DAYS;
    private static final Map<Integer, Integer> JODA_MONTHS_TO_CALENDAR_MONTHS;

    static {

        LOGGER.debug("Initializing Joda to standard Calendar constant mappings...");

        HashMap<Integer, Integer> jodaDaysToCalendarDaysMap = new HashMap<>();
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.MONDAY, Calendar.MONDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.TUESDAY, Calendar.TUESDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.WEDNESDAY, Calendar.WEDNESDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.THURSDAY, Calendar.THURSDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.FRIDAY, Calendar.FRIDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.SATURDAY, Calendar.SATURDAY);
        jodaDaysToCalendarDaysMap.put(DateTimeConstants.SUNDAY, Calendar.SUNDAY);
        JODA_DAYS_TO_CALENDAR_DAYS = Collections.unmodifiableMap(jodaDaysToCalendarDaysMap);

        HashMap<Integer, Integer> jodaMonthsToCalendarMonthsMap = new HashMap<>();
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.JANUARY, Calendar.JANUARY);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.FEBRUARY, Calendar.FEBRUARY);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.MARCH, Calendar.MARCH);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.APRIL, Calendar.APRIL);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.MAY, Calendar.MAY);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.MAY, Calendar.MAY);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.JUNE, Calendar.JUNE);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.JULY, Calendar.JULY);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.AUGUST, Calendar.AUGUST);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.SEPTEMBER, Calendar.SEPTEMBER);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.OCTOBER, Calendar.OCTOBER);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.NOVEMBER, Calendar.NOVEMBER);
        jodaMonthsToCalendarMonthsMap.put(DateTimeConstants.DECEMBER, Calendar.DECEMBER);
        JODA_MONTHS_TO_CALENDAR_MONTHS = Collections.unmodifiableMap(jodaMonthsToCalendarMonthsMap);
    }

    public ActiveUserCountReportTask() {
        super("userActive", Report.Type.ACTIVE_USER_COUNT, LOGGER);
    }

    @Override
    protected Set<Report> calculate(ResultSet results) {

        LOGGER.debug("Starting calculation...");

        HashMap<Integer, Set<String>> todaysHourByHourData = new HashMap<>();
        HashMap<Integer, Set<String>> hourByHourData = new HashMap<>();
        HashMap<Integer, Set<String>> dayByDayData = new HashMap<>();
        HashMap<Integer, Set<String>> monthByMonthData = new HashMap<>();

        for (Row row : results) {

            if (row.isNull("parameters")) {

                LOGGER.debug("Record has no value for parameters column; skipping...");
                continue;
            }

            if (row.isNull("start_time") || row.getLong("start_time") == 0) {

                LOGGER.debug("Record has no value for start_time column; skipping...");
                continue;
            }

            Date startTime = CassandraCalculationHelper.getStartTime(row);

            Instant startInstant = new Instant(startTime);

            LOGGER.debug("Record has the start time '{}'...", startInstant);

            Map<String, String> parameters = row.getMap("parameters", String.class, String.class);

            if (!parameters.containsKey("userPrincipal")) {

                LOGGER.debug("Record does not have a 'userPrincipal' parameter; skipping...");

                continue;
            }

            String userPrincipal = parameters.get("userPrincipal");

            LOGGER.debug("Using user principal '{}'...", userPrincipal);

            Instant endInstant;

            Interval activityInterval;

            if (row.isNull("end_time") || row.getLong("end_time") == 0L) {

                LOGGER.debug("Record does not have a value for end_time column; using predefined 10 minutes as activity duration...");

                endInstant = startInstant.plus(Duration.standardMinutes(10));

                LOGGER.debug("Record will be considered to have the end time '{}'...", endInstant);

                activityInterval = new Interval(startInstant, endInstant);

            } else {

                endInstant = new Instant(new Date(row.getLong("end_time")));

                LOGGER.debug("Record has the end time '{}'...", endInstant);

                activityInterval = new Interval(startInstant, endInstant);
            }

            LOGGER.debug("User associated with the record has been active for '{}' ...", activityInterval.toDuration());

            for (int hour : this.getTodaysSpannedHours(activityInterval)) {
                
                LOGGER.debug("User was active today for the hour of day '{}'.", hour);

                if (!todaysHourByHourData.containsKey(hour)) {

                    todaysHourByHourData.put(hour, new HashSet<String>());
                }

                todaysHourByHourData.get(hour).add(userPrincipal);
            }

            for (int hour : this.getSpannedHours(activityInterval)) {

                LOGGER.debug("User was active for the hour of day '{}'.", hour);

                if (!hourByHourData.containsKey(hour)) {

                    hourByHourData.put(hour, new HashSet<String>());
                }

                hourByHourData.get(hour).add(userPrincipal);
            }

            for (int dayOfWeek : this.getSpannedDays(activityInterval)) {

                LOGGER.debug("User was active for the day of week '{}'.", dayOfWeek);

                if (!dayByDayData.containsKey(dayOfWeek)) {

                    dayByDayData.put(dayOfWeek, new HashSet<String>());
                }

                dayByDayData.get(dayOfWeek).add(userPrincipal);
            }

            for (int month : this.getSpannedMonths(activityInterval)) {

                LOGGER.debug("User was active for the month of year '{}'.", month);

                if (!monthByMonthData.containsKey(month)) {

                    monthByMonthData.put(month, new HashSet<String>());
                }

                monthByMonthData.get(month).add(userPrincipal);
            }
        }

        Set<Report> reports = new LinkedHashSet<>();

        Report todaysReport = new Report();
        todaysReport.setType(Report.Type.ACTIVE_USER_COUNT);
        todaysReport.setPeriod(Report.Period.DAILY);
        todaysReport.setDate(DateTime.now().withTimeAtStartOfDay().toDate());
        todaysReport.setData(new HashMap(Maps.transformValues(todaysHourByHourData, USER_COUNT_FUNCTION)));
        reports.add(todaysReport);

        Report dailyReport = new Report();
        dailyReport.setType(Report.Type.ACTIVE_USER_COUNT);
        dailyReport.setPeriod(Report.Period.DAILY);
        dailyReport.setData(new HashMap(Maps.transformValues(hourByHourData, USER_COUNT_FUNCTION)));
        reports.add(dailyReport);

        Report weeklyReport = new Report();
        weeklyReport.setType(Report.Type.ACTIVE_USER_COUNT);
        weeklyReport.setPeriod(Report.Period.WEEKLY);
        weeklyReport.setData(new HashMap(Maps.transformValues(dayByDayData, USER_COUNT_FUNCTION)));
        reports.add(weeklyReport);

        Report monthlyReport = new Report();
        monthlyReport.setType(Report.Type.ACTIVE_USER_COUNT);
        monthlyReport.setPeriod(Report.Period.MONTHLY);
        monthlyReport.setData(new HashMap(Maps.transformValues(monthByMonthData, USER_COUNT_FUNCTION)));
        reports.add(monthlyReport);

        return reports;
    }

    protected List<Integer> getTodaysSpannedHours(Interval activityInterval) {

        // Get todays interval
        Interval todaysInterval = new Interval(DateTime.now().withTimeAtStartOfDay(), new Instant());

        LOGGER.debug("Today's interval to the current time is '{}'...", todaysInterval.toString());

        // If intervals do not overlap, we are not interested
        if (!activityInterval.overlaps(todaysInterval)) {

            LOGGER.debug("User activity interval does not overlap with today's interval...");

            return Collections.EMPTY_LIST;
        }

        // Get the overlap interval
        Interval overlapInterval = activityInterval.overlap(todaysInterval);

        return this.getSpannedHours(overlapInterval);
    }

    protected List<Integer> getSpannedHours(Interval activityInterval) {

        List<Integer> spannedHours = new LinkedList<>();

        Interval currentInterval = new Interval(activityInterval.getStart().withMinuteOfHour(0).withSecondOfMinute(0).withMillisOfSecond(0).toInstant(), Period.hours(1));

        do {

            spannedHours.add(currentInterval.getStart().toDateTime(DateTimeZone.getDefault()).getHourOfDay());

            currentInterval = new Interval(currentInterval.getStart().plusHours(1), currentInterval.getEnd().plusHours(1));

            LOGGER.debug("Current interval: {}", currentInterval);

        } while (activityInterval.overlaps(currentInterval));

        return spannedHours;
    }

    protected List<Integer> getSpannedDays(Interval activityInterval) {

        List<Integer> spannedDays = new LinkedList<>();

        Interval currentInterval = new Interval(activityInterval.getStart().withHourOfDay(0).withMinuteOfHour(0).withSecondOfMinute(0).withMillisOfSecond(0).toInstant(), Period.days(1));

        do {

            spannedDays.add(JODA_DAYS_TO_CALENDAR_DAYS.get(currentInterval.getStart().toDateTime(DateTimeZone.getDefault()).getDayOfWeek()));

            currentInterval = new Interval(currentInterval.getStart().plusDays(1), currentInterval.getEnd().plusDays(1));

            LOGGER.debug("Current interval: {}", currentInterval);

        } while (activityInterval.overlaps(currentInterval));

        return spannedDays;
    }

    protected List<Integer> getSpannedMonths(Interval activityInterval) {

        List<Integer> spannedMonths = new LinkedList<>();

        Interval currentInterval = new Interval(activityInterval.getStart().withDayOfMonth(1).withHourOfDay(0).withMinuteOfHour(0).withSecondOfMinute(0).withMillisOfSecond(0).toInstant(), Period.months(1));

        do {

            spannedMonths.add(JODA_MONTHS_TO_CALENDAR_MONTHS.get(currentInterval.getStart().toDateTime(DateTimeZone.getDefault()).getMonthOfYear()));

            currentInterval = new Interval(currentInterval.getStart().plusMonths(1), currentInterval.getEnd().plusMonths(1));

            LOGGER.debug("Current interval: {}", currentInterval);

        } while (activityInterval.overlaps(currentInterval));

        return spannedMonths;
    }
}
