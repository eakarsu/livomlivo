package tr.com.eno.livo.server.analytics.cassandra;

import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReportingService;
import tr.com.eno.livo.server.analytics.ErrorRecord;
import tr.com.eno.livo.server.analytics.EventRecord;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.Report.Period;
import tr.com.eno.livo.server.authc.AuthenticationToken;

public class CassandraAnalyticsReportingService implements AnalyticsReportingService {

    private static final String CASSANDRA_HOST_CONFIGURATION_KEY = "cassandra.host";
    private static final String CASSANDRA_PORT_CONFIGURATION_KEY = "cassandra.port";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraAnalyticsReportingService.class);

    protected void start(Map<String, Object> config) throws IOException {

        LOGGER.info("Starting Cassandra-based AnalyticsReportingService implementation...");

        String host = config.containsKey(CASSANDRA_HOST_CONFIGURATION_KEY) && config.get(CASSANDRA_HOST_CONFIGURATION_KEY) != null ? (String) config
                .get(CASSANDRA_HOST_CONFIGURATION_KEY) : "localhost";

        LOGGER.debug("Using Cassandra host '{}'...", host);

        int port = config.containsKey(CASSANDRA_PORT_CONFIGURATION_KEY) && config.get(CASSANDRA_PORT_CONFIGURATION_KEY) != null ? (Integer) config
                .get(CASSANDRA_PORT_CONFIGURATION_KEY) : 9042;

        LOGGER.debug("Using Cassandra port {}...", port);

        CassandraHelper.connect(host, port);

        LOGGER.debug("Registering shutdown hook to disconnect from Cassandra...");

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {

            @Override
            public void run() {

                CassandraHelper.disconnect();
            }
        }));

        LOGGER.info("Successfully started Cassandra-based AnalyticsReportingService implementation.");
    }

    protected void stop() {

        LOGGER.info("Stopping Cassandra-based AnalyticsReportingService implementation...");

        LOGGER.info("Successfully stopped Cassandra-based AnalyticsReportingService implementation.");
    }

    @Override
    public Report getReport(String reportType, Date date, Period period) {

        LOGGER.debug("Getting report of type '{}' with the period '{}' of date '{}'...", reportType, period.toString(), date);

        return CassandraHelper.loadReport(reportType, period, date);
    }

    @Override
    public Report getReport(String reportType, Period period) {

        LOGGER.debug("Getting report of type '{}' with the period '{}'...", reportType, period.toString());

        return CassandraHelper.loadReport(reportType, period, null);
    }

    @Override
    public Set<EventRecord> listEvents(String eventName) {

        LOGGER.debug("Listing events recorded with the name '{}'...", eventName);

        return CassandraHelper.listEvents(eventName);
    }

    @Override
    public Set<EventRecord> listEvents(String eventName, Date startDate, Date endDate) {

        LOGGER.debug(
                "Listing events recorded between '{}' and '{}' with the name '{}'...",
                startDate, endDate, eventName);

        return CassandraHelper.listEvents(eventName, startDate, endDate);
    }

    @Override
    public Set<ErrorRecord> listErrors(Date startDate, Date endDate) {

        LOGGER.debug(
                "Listing errors recorded between '{}' and '{}'...",
                startDate, endDate);

        return CassandraHelper.listErrors(startDate, endDate);
    }
}
