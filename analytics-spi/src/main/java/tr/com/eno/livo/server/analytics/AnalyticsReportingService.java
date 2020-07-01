package tr.com.eno.livo.server.analytics;

import java.util.Date;
import java.util.Set;
import javax.management.MXBean;
import tr.com.eno.livo.server.authc.AuthenticationToken;

@MXBean
public interface AnalyticsReportingService {

    public static final String SUPPORTED_REPORT_TYPES = "report.types";

    public Report getReport(String reportType, Date date, Report.Period period);

    public Report getReport(String reportType, Report.Period period);

    /**
     * Lists all events with the given name.
     *
     * @param eventName Name of the events to retrieve
     * @return Set of all events that have the given name
     */
    public Set<EventRecord> listEvents(String eventName);

    public Set<EventRecord> listEvents(String eventName, Date startDate, Date endDate);

    public Set<ErrorRecord> listErrors(Date startDate, Date endDate);
}
