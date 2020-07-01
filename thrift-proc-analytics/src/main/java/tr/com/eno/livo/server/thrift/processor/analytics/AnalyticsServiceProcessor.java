package tr.com.eno.livo.server.thrift.processor.analytics;

import java.util.Collections;
import java.util.Date;
import java.util.Map;
import org.apache.thrift.TException;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.AnalyticsReceiverService;
import tr.com.eno.livo.server.analytics.ErrorRecord;
import tr.com.eno.livo.server.analytics.EventRecord;
import tr.com.eno.livo.server.analytics.EventRecordFailedException;
import tr.com.eno.livo.thrift.analytics.AnalyticsService;
import tr.com.eno.livo.thrift.analytics.AnalyticsService.Iface;
import tr.com.eno.livo.thrift.analytics.Error;
import tr.com.eno.livo.thrift.analytics.Event;
import tr.com.eno.livo.thrift.analytics.EventRecordFailedError;
import tr.com.eno.livo.thrift.shared.AuthenticationToken;

public class AnalyticsServiceProcessor extends
        AnalyticsService.Processor<Iface> {

    private static final AsyncIfaceImpl IFACE = new AsyncIfaceImpl();
    private static final Logger LOGGER = LoggerFactory
            .getLogger(AnalyticsServiceProcessor.class);

    public AnalyticsServiceProcessor() {

        super(IFACE);
    }

    protected void registerAnalyticsReceiverService(
            AnalyticsReceiverService receiverService, Map<String, Object> config) {

        String pid = (String) config.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Registering AnalyticsReceiverService implementation with the PID '{}'...",
                pid);

        IFACE.receiverService = receiverService;
    }

    protected void unregisterAnalyticsReceiverService(
            AnalyticsReceiverService receiverService, Map<String, Object> config) {

        String pid = (String) config.get(Constants.SERVICE_PID);

        LOGGER.debug(
                "Unregistering AnalyticsReceiverService implementation with the PID '{}'...",
                pid);

        IFACE.receiverService = null;
    }

    private static class AsyncIfaceImpl implements Iface {

        private static final Logger LOGGER = LoggerFactory
                .getLogger(AnalyticsServiceProcessor.class);
        private AnalyticsReceiverService receiverService;

        @Override
        public boolean isOptedIn(AuthenticationToken token) throws TException {

            if (this.receiverService == null) {

                LOGGER.error(
                        "AnalyticsReceiverService instance is not registered, failing 'isOptedIn' call for authentication token with unique value '{}'...",
                        token.getUniqueValue());

                throw new RuntimeException(
                        "No AnalyticsReceiverService instance is registered.");
            }

            LOGGER.debug(
                    "Checking for opt-in status of entity represented by the authentication token with unique value '{}'...",
                    token.getUniqueValue());

            boolean result = false;

            synchronized (this.receiverService) {

                result = this.receiverService.isOptedIn(this
                        .convertToServerToken(token));
            }

            LOGGER.debug(
                    "Entity represented by the authentication token with unique value '{}' is {}opted-in..",
                    result ? "" : "not ");

            return result;
        }

        @Override
        public void logError(AuthenticationToken token, Error error)
                throws EventRecordFailedError, TException {

            LOGGER.debug(
                    "Logging error with the ID '{}' that is reported by the entity represented by the authentication token with unique value '{}'...",
                    error.getId(), token.getUniqueValue());

            if (this.receiverService == null) {

                LOGGER.error(
                        "AnalyticsReceiverService instance is not registered, failing 'isOptedIn' call for authentication token with unique value '{}'...",
                        token.getUniqueValue());

                throw new RuntimeException(
                        "No AnalyticsReceiverService instance is registered.");
            }

            try {

                this.receiverService.logError(this.convertToServerToken(token),
                        this.convertToServerErrorRecord(error));

            } catch (EventRecordFailedException e) {

                LOGGER.error(e.getMessage(), e);

                throw new EventRecordFailedError(e.getMessage() == null ? "No message provided." : e.getMessage());
            }
        }

        @Override
        public void logEvent(AuthenticationToken token, Event event)
                throws EventRecordFailedError, TException {

            LOGGER.debug(
                    "Logging event named '{}' with the ID '{}' that is sent by the entity represented by the authentication token with unique value '{}'...",
                    event.getName(), event.getId(), token.getUniqueValue());

            if (this.receiverService == null) {

                LOGGER.error(
                        "AnalyticsReceiverService instance is not registered, failing 'isOptedIn' call for authentication token with unique value '{}'...",
                        token.getUniqueValue());

                throw new RuntimeException(
                        "No AnalyticsReceiverService instance is registered.");
            }

            try {

                this.receiverService.logEvent(this.convertToServerToken(token),
                        this.convertToServerEventRecord(event));

            } catch (EventRecordFailedException e) {

                LOGGER.error(e.getMessage(), e);

                throw new EventRecordFailedError(e.getMessage() == null ? "No message provided." : e.getMessage());
            }
        }

        @Override
        public void optIn(AuthenticationToken token) throws TException {

            LOGGER.debug(
                    "Opting-in the entity represented by the authentication token with the unique value '{}'...",
                    token.getUniqueValue());

            if (this.receiverService == null) {

                LOGGER.error(
                        "AnalyticsReceiverService instance is not registered, failing 'isOptedIn' call for authentication token with unique value '{}'...",
                        token.getUniqueValue());

                throw new RuntimeException(
                        "No AnalyticsReceiverService instance is registered.");
            }

            this.receiverService.optIn(this.convertToServerToken(token));
        }

        @Override
        public void optOut(AuthenticationToken token) throws TException {

            LOGGER.debug(
                    "Opting-out the entity represented by the authentication token with the unique value '{}'...",
                    token.getUniqueValue());

            if (this.receiverService == null) {

                LOGGER.error(
                        "AnalyticsReceiverService instance is not registered, failing 'isOptedIn' call for authentication token with unique value '{}'...",
                        token.getUniqueValue());

                throw new RuntimeException(
                        "No AnalyticsReceiverService instance is registered.");
            }

            this.receiverService.optOut(this.convertToServerToken(token));
        }

        private ErrorRecord convertToServerErrorRecord(Error error) {

            ErrorRecord errorRecord = new ErrorRecord();
            errorRecord.setId(error.getId());
            errorRecord.setMessage(error.getMessage());
            errorRecord.setTime(new Date(error.getTime()));

            if (error.getParameters() != null) {
                errorRecord.setParameters(error.getParameters());
            } else {
                errorRecord.setParameters(Collections.EMPTY_MAP);
            }

            return errorRecord;
        }

        private EventRecord convertToServerEventRecord(Event event) {

            EventRecord eventRecord = new EventRecord();

            eventRecord.setId(event.getId());
            eventRecord.setName(event.getName());
            eventRecord.setStartTime(new Date(event.getStartTime()));

            if (event.getEndTime() != 0) {
                eventRecord.setEndTime(new Date(event.getEndTime()));
            }

            if (event.getParameters() != null) {
                eventRecord.setParameters(event.getParameters());
            } else {
                eventRecord.setParameters(Collections.EMPTY_MAP);
            }

            return eventRecord;
        }

        private tr.com.eno.livo.server.authc.AuthenticationToken convertToServerToken(
                AuthenticationToken token) {

            return new tr.com.eno.livo.server.authc.AuthenticationToken(
                    token.getCompanyId(), token.getUserPrincipal(), null, null,
                    token.getUniqueValue(), new Date(
                            token.getAuthenticationTime()), new Date(
                            token.getExpirationTime()));
        }
    }
}
