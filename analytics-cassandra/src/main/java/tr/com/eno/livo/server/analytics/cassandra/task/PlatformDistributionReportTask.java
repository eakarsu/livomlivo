package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.Report.Period;

public class PlatformDistributionReportTask extends AbstractReportTask {

    public PlatformDistributionReportTask() {
        super("platformUsed", Report.Type.PLATFORM_DISTRIBUTION, LoggerFactory.getLogger(PlatformDistributionReportTask.class));
    }

    @Override
    protected Set<Report> calculate(ResultSet results) {

        HashMap<String, Long> data = new HashMap<>();

        for (Row row : results) {

            if (row.isNull("parameters")) {
                continue;
            }

            Map<String, String> parameters = row.getMap("parameters", String.class, String.class);

            if (!parameters.containsKey("platform")) {
                continue;
            }

            String platform = String.valueOf(parameters.get("platform"));

            if (data.containsKey(platform)) {

                long val = data.get(platform);

                data.put(platform, val + 1);

            } else {

                data.put(platform, 1L);
            }
        }

        Report report = new Report();
        report.setType(Report.Type.PLATFORM_DISTRIBUTION);
        report.setPeriod(Period.ALL_TIME);
        report.setData(data);

        return Collections.singleton(report);
    }
}
