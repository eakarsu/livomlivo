package tr.com.eno.livo.server.analytics.cassandra.task;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.MetricSet;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ReportTasksExecutor {

    static MetricRegistry metrics;
    private static final Logger LOGGER = LoggerFactory.getLogger(ReportTasksExecutor.class);
    private ScheduledExecutorService executorService;

    protected void start(Map<String, Object> config) {

        LOGGER.debug("Starting report tasks executor...");

        LOGGER.debug("Initializing scueduled executor service...");

        this.executorService = Executors.newScheduledThreadPool(5);

        LOGGER.debug("Initializing report calculation tasks...");

        PlatformDistributionReportTask platformDistributionReportTask = new PlatformDistributionReportTask();
        UserActivityDurationReportTask userActivityDurationReportTask = new UserActivityDurationReportTask();
        ActiveUserCountReportTask activeUserCountReportTask = new ActiveUserCountReportTask();
        ServiceObjectRequestCountReportTask serviceObjectRequestCountReportTask = new ServiceObjectRequestCountReportTask();
        ServiceObjectTotalOperationPayloadSizeReportTask serviceObjectTotalOperationPayloadSizeReportTask = new ServiceObjectTotalOperationPayloadSizeReportTask();

        long calculationInterval = (long) config.get("calculation.interval");

        LOGGER.debug("Using {} minutes as the calculation interval...", calculationInterval);

        LOGGER.debug("Scheduling tasks...");

        this.executorService.scheduleAtFixedRate(platformDistributionReportTask, 5L, calculationInterval, TimeUnit.SECONDS);
        this.executorService.scheduleAtFixedRate(userActivityDurationReportTask, 5L, calculationInterval, TimeUnit.SECONDS);
        this.executorService.scheduleAtFixedRate(activeUserCountReportTask, 5L, calculationInterval, TimeUnit.SECONDS);
        this.executorService.scheduleAtFixedRate(serviceObjectRequestCountReportTask, 5L, calculationInterval, TimeUnit.SECONDS);
        this.executorService.scheduleAtFixedRate(serviceObjectTotalOperationPayloadSizeReportTask, 5L, calculationInterval, TimeUnit.SECONDS);

        LOGGER.debug("Successfully started report tasks executor.");
    }

    protected void stop() {

        LOGGER.debug("Stopping report tasks executor...");

        this.executorService.shutdown();;

        LOGGER.debug("Successfully stopped report tasks executor.");
    }

    protected void registerMetrics(MetricRegistry metrics) {

        LOGGER.debug("Registering metric registry...");

        ReportTasksExecutor.metrics = metrics;
    }

    protected void unregisterMetrics() {

        LOGGER.debug("Unregistering metric registry...");

        ReportTasksExecutor.metrics = null;
    }
}
