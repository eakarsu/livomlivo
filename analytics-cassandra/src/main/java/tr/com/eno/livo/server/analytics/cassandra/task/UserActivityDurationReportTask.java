package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.google.common.base.Function;
import com.google.common.collect.Maps;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.joda.time.Duration;
import org.joda.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.Report.Period;

public class UserActivityDurationReportTask extends AbstractReportTask {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserActivityDurationReportTask.class);

    public UserActivityDurationReportTask() {
        super("userActive", Report.Type.USER_ACTIVITY_DURATION, LOGGER);
    }

    @Override
    protected Set<Report> calculate(ResultSet results) {

        LOGGER.debug("Starting calculation...");

        HashMap<String, Duration> durationsMap = new HashMap<>();

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

            Duration activityDuration;

            if (row.isNull("end_time") || row.getLong("end_time") == 0L) {

                LOGGER.debug("Record does not have a value for end_time column; using predefined 10 minutes as activity duration...");

                activityDuration = Duration.standardMinutes(10);

            } else {

                Date endTime = CassandraCalculationHelper.getEndTime(row);

                Instant endInstant = new Instant(endTime);

                LOGGER.debug("Record has the end time '{}'...", endInstant);

                activityDuration = new Duration(startInstant, endInstant);
            }

            LOGGER.debug("User associated with the record has been active for '{}' ...", activityDuration);

            if (durationsMap.containsKey(userPrincipal)) {

                LOGGER.debug("Data map already has a record for user '{}'; appending '{}' to it's current value...", userPrincipal, activityDuration);

                Duration duration = durationsMap.get(userPrincipal);

                LOGGER.debug("Current total duration for user '{}' is '{}'...", userPrincipal, duration);

                durationsMap.put(userPrincipal, duration.plus(activityDuration));

            } else {

                LOGGER.debug("Data map has no record for user '{}'; setting '{}' to it's initial value...", userPrincipal, activityDuration);

                durationsMap.put(userPrincipal, activityDuration);
            }
        }

        LOGGER.debug("Transforming duration values in the data map to long values...");

        HashMap<String, Long> data = new HashMap<>(Maps.transformValues(durationsMap, new Function<Duration, Long>() {

            @Override
            public Long apply(Duration input) {

                LOGGER.debug("Transforming duration '{}' in the data map to long value '{}'...", input, input.getStandardMinutes());

                return input.getStandardMinutes();
            }
        }));
        
        LOGGER.debug("Preparing report with report data '{}'...", data);

        Report report = new Report();
        report.setType(Report.Type.USER_ACTIVITY_DURATION);
        report.setPeriod(Period.ALL_TIME);
        report.setData(data);

        LOGGER.debug("Completed calculation.");
        
        return Collections.singleton(report);
    }
}
