package tr.com.eno.livo.server.analytics.cassandra.task;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.datastax.driver.core.ResultSet;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.cassandra.CassandraHelper;

public abstract class AbstractReportTask implements Runnable {

    private final Timer calculationTimer;
    private final String eventName;
    private final Logger logger;
    private final Report.Type reportType;

    protected AbstractReportTask(String eventName, Report.Type reportType, Logger logger) {

        this.eventName = eventName;
        this.logger = logger;
        this.reportType = reportType;

        this.calculationTimer = ReportTasksExecutor.metrics.timer(MetricRegistry.name("analytics", reportType.toString().replaceFirst(Character.toString(reportType.toString().charAt(0)), Character.toString(reportType.toString().charAt(0)).toLowerCase(Locale.ENGLISH)), "calculations"));

        this.logger.debug("Initialized an instance of '{}Task'...", this.reportType);
    }

    @Override
    public void run() {

        ResultSet resultSet = CassandraHelper.queryEvents(this.eventName);

        this.logger.debug("Cassandra returned {} rows to process in initial fetch...", resultSet.getAvailableWithoutFetching());

        Timer.Context context = this.calculationTimer.time();

        try {

            Set<Report> reports = this.calculate(resultSet);

            context.stop();

            if (reports == null) {

                this.logger.info("Calculation task for the report of type '{}' returned null.", reportType);

            } else {

                this.logger.info("Saving {} report(s) of type '{}'...", reports.size(), reportType);

                for (Report report : reports) {

                    CassandraHelper.saveReport(report);
                }
            }

        } catch (Exception e) {

            context.stop();

            throw e;
        }
    }

    protected abstract Set<Report> calculate(ResultSet results);
}
