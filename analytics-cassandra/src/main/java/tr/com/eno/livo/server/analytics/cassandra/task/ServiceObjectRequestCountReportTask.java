package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.Report;

public class ServiceObjectRequestCountReportTask extends AbstractReportTask {

    public ServiceObjectRequestCountReportTask() {
        super("serviceObjectRequestReceived", Report.Type.SERVICEOBJECT_REQUEST_COUNT, LoggerFactory.getLogger(ServiceObjectRequestCountReportTask.class));
    }

    @Override
    protected Set<Report> calculate(ResultSet results) {

        HashMap<String, Long> data = new HashMap<>();

        for (Row row : results) {

            if (row.isNull("parameters")) {
                continue;
            }

            Map<String, String> parameters = row.getMap("parameters", String.class, String.class);

            if (!parameters.containsKey("serviceObjectName")) {
                continue;
            }

            String serviceObjectName = parameters.get("serviceObjectName");

            if (data.containsKey(serviceObjectName)) {

                Long currentCount = data.get(serviceObjectName);

                data.put(serviceObjectName, currentCount + 1L);

            } else {

                data.put(serviceObjectName, 1L);
            }
        }

        Report report = new Report();
        report.setType(Report.Type.SERVICEOBJECT_REQUEST_COUNT);
        report.setPeriod(Report.Period.ALL_TIME);
        report.setData(data);

        return Collections.singleton(report);
    }
}
