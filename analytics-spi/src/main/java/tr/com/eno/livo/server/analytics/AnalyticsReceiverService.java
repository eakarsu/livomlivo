package tr.com.eno.livo.server.analytics;

import javax.management.MXBean;
import tr.com.eno.livo.server.authc.AuthenticationToken;

@MXBean
public interface AnalyticsReceiverService {

	public static final String ERROR_RECEIVED_EVENT_TOPIC = "tr/com/eno/livo/server/analytics/error/received";
	public static final String EVENT_RECEIVED_EVENT_TOPIC = "tr/com/eno/livo/server/analytics/event/received";

	public boolean isOptedIn(AuthenticationToken token);

	public void logError(AuthenticationToken token, ErrorRecord errorRecord)
			throws EventRecordFailedException;

	public void logEvent(AuthenticationToken token, EventRecord eventRecord)
			throws EventRecordFailedException;

	public void optIn(AuthenticationToken token);

	public void optOut(AuthenticationToken token);
}
