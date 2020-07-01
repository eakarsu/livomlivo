package tr.com.eno.livo.server.analytics.event;

import java.util.Date;
import java.util.HashMap;
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
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class AnalyticsAuthenticationEventHandler implements EventHandler {

	private static final String AUTHENTICATED_COMPANY_EVENT_NAME = "authenticatedCompany";
	private static final String AUTHENTICATED_USER_EVENT_NAME = "authenticatedUser";
	private static final Logger LOGGER = LoggerFactory
			.getLogger(AnalyticsAuthenticationEventHandler.class);
	private final Map<String, AnalyticsReceiverService> services = new HashMap<String, AnalyticsReceiverService>();

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
				UserAuthenticationService.AUTHENTICATED_USER_EVENT_TOPIC)) {

			record.setName(AUTHENTICATED_USER_EVENT_NAME);
			record.setStartTime(token.getAuthenticationTime());
			record.getParameters().put("companyId", token.getCompanyId());
			record.getParameters().put("userPrincipal",
					token.getUserPrincipal());
			record.getParameters().put("uniqueTokenValue",
					token.getUniqueValue());

		} else if (event.getTopic().equals(
				CompanyAuthenticationService.AUTHENTICATED_COMPANY_EVENT_TOPIC)) {

			record.setName(AUTHENTICATED_COMPANY_EVENT_NAME);

			record.setStartTime(token.getAuthenticationTime());
			record.getParameters().put("companyId", token.getCompanyId());
			record.getParameters().put("uniqueTokenValue",
					token.getUniqueValue());
		}

		// Send the event record
		synchronized (this.services) {

			for (String pid : this.services.keySet()) {

				AnalyticsReceiverService receiverService = this.services
						.get(pid);

				try {

					receiverService.logEvent(token, record);

				} catch (EventRecordFailedException ex) {

					LOGGER.error(ex.getMessage(), ex);
				}
			}
		}
	}

	protected void registerAnalyticsReceiverService(
			AnalyticsReceiverService service, Map<String, Object> config) {

		String pid = (String) config.get(Constants.SERVICE_PID);

		LOGGER.debug(
				"Registering AnalyticsReceiverService with the PID '{}'...",
				pid);

		synchronized (this.services) {

			this.services.put(pid, service);
		}
	}

	protected void unregisterAnalyticsReceiverService(Map<String, Object> config) {

		String pid = (String) config.get(Constants.SERVICE_PID);

		LOGGER.debug(
				"Unregistering AnalyticsReceiverService with the PID '{}'...",
				pid);

		synchronized (this.services) {

			this.services.remove(pid);
		}
	}
}
