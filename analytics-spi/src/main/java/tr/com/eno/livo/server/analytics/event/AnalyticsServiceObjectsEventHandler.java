package tr.com.eno.livo.server.analytics.event;

import java.util.Date;
import java.util.Map;
import org.osgi.framework.Constants;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReceiverService;
import tr.com.eno.livo.server.analytics.EventRecord;
import tr.com.eno.livo.server.analytics.EventRecordFailedException;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;

public class AnalyticsServiceObjectsEventHandler implements EventHandler {

    private static final String REQUEST_RECEIVED_EVENT_NAME = "serviceObjectRequestReceived";
    private static final String OPERATION_PERFORMED_EVENT_NAME = "serviceObjectOperationPerformed";
    private static final Logger LOGGER = LoggerFactory
            .getLogger(AnalyticsAuthenticationEventHandler.class);
    private AnalyticsReceiverService receiverService;

    @Override
    public void handleEvent(Event event) {

        LOGGER.debug("Received an event of topic '{}'.", event.getTopic());

        // Create an event record
        EventRecord record = new EventRecord();
        record.setStartTime(new Date());

        // Get the token
        AuthenticationToken token = (AuthenticationToken) event
                .getProperty("authenticationToken");

        // Check for the event
        if (event.getTopic().equals(
                ServiceObjectProxyService.SERVICE_OBJECT_REQUEST_RECEIVED_EVENT_TOPIC)) {

            record.setName(REQUEST_RECEIVED_EVENT_NAME);
            record.setStartTime((Date) event.getProperty("date"));
            record.getParameters().put("serviceObjectName", (String) event.getProperty("serviceObjectName"));

        } else if (event.getTopic().equals(
                ServiceObjectProxyService.SERVICE_OBJECT_OPERATION_PERFORMED_EVENT_TOPIC)) {

            record.setName(OPERATION_PERFORMED_EVENT_NAME);

            record.setStartTime((Date) event.getProperty("startDate"));
            record.setEndTime((Date) event.getProperty("endDate"));
            record.getParameters().put("serviceObjectName", (String) event.getProperty("serviceObjectName"));
            record.getParameters().put("inputPayloadSize", Long.toString((Long) event.getProperty("inputPayloadSize")));
            record.getParameters().put("outputPayloadSize", Long.toString((Long) event.getProperty("outputPayloadSize")));
        }

        try {

            receiverService.logEvent(token, record);

        } catch (EventRecordFailedException ex) {

            LOGGER.error(ex.getMessage(), ex);
        }
    }

    protected void registerAnalyticsReceiverService(
            AnalyticsReceiverService service, Map<String, Object> config) {

        String pid = (String) config.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Registering AnalyticsReceiverService with the PID '{}'...",
                pid);

        this.receiverService = service;
    }

    protected void unregisterAnalyticsReceiverService(Map<String, Object> config) {

        String pid = (String) config.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Unregistering AnalyticsReceiverService with the PID '{}'...",
                pid);

        this.receiverService = null;
    }
}
