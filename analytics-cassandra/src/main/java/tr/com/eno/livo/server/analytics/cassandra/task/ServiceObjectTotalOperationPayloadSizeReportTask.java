package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.Report;
import tr.com.eno.livo.server.analytics.Report.Period;

public class ServiceObjectTotalOperationPayloadSizeReportTask extends AbstractReportTask {

    public ServiceObjectTotalOperationPayloadSizeReportTask() {
        super("serviceObjectOperationPerformed", Report.Type.SERVICEOBJECT_TOTAL_OPERATION_PAYLOAD_SIZE, LoggerFactory.getLogger(ServiceObjectTotalOperationPayloadSizeReportTask.class));
    }

    @Override
    protected Set<Report> calculate(ResultSet results) {

        HashMap<String, Map.Entry<Long, Long>> data = new HashMap<>();

        for (Row row : results) {

            if (row.isNull("parameters")) {
                continue;
            }

            Map<String, String> parameters = row.getMap("parameters", String.class, String.class);

            if (!parameters.containsKey("serviceObjectName")) {
                continue;
            }

            String serviceObjectName = parameters.get("serviceObjectName");

            long inputPayloadSize = 0L;
            long outputPayloadSize = 0L;

            if (parameters.containsKey("inputPayloadSize")) {

                String sizeString = parameters.get("inputPayloadSize");

                if (sizeString != null) {
                    inputPayloadSize = Long.parseLong(sizeString);
                }
            }

            if (parameters.containsKey("outputPayloadSize")) {

                String sizeString = parameters.get("outputPayloadSize");

                if (sizeString != null) {
                    outputPayloadSize = Long.parseLong(sizeString);
                }
            }

            if (data.containsKey(serviceObjectName)) {

                Entry entry = (Entry) data.get(serviceObjectName);

                entry.inputSize = entry.inputSize + inputPayloadSize;
                entry.outputSize = entry.outputSize + outputPayloadSize;

                data.put(serviceObjectName, entry);

            } else {

                data.put(serviceObjectName, new Entry(inputPayloadSize, outputPayloadSize));
            }
        }

        Report report = new Report();
        report.setType(Report.Type.SERVICEOBJECT_TOTAL_OPERATION_PAYLOAD_SIZE);
        report.setPeriod(Period.ALL_TIME);
        report.setData(data);

        return Collections.singleton(report);
    }

    static class Entry implements Map.Entry<Long, Long>, Serializable {
        
        private static final long serialVersionUID = 524137073671702081L;

        private long inputSize;
        private long outputSize;

        public Entry(long inputSize, long outputSize) {

            this.inputSize = inputSize;
            this.outputSize = outputSize;
        }

        public Entry() {

            this(0L, 0L);
        }

        @Override
        public Long getKey() {

            return this.inputSize;
        }

        public void setKey(Long k) {

            this.inputSize = k;
        }

        @Override
        public Long getValue() {

            return this.outputSize;
        }

        @Override
        public Long setValue(Long v) {

            long oldVal = this.outputSize;

            this.outputSize = v;

            return oldVal;
        }
    }
}
