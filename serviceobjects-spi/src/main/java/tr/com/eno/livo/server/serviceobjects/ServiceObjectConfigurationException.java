package tr.com.eno.livo.server.serviceobjects;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ServiceObjectConfigurationException extends
		ServiceObjectBaseException {

	private static final long serialVersionUID = 8175345775016512136L;

	private Map<String, Set<String>> errorMessages;

	public ServiceObjectConfigurationException(String serviceObjectName) {
		super(serviceObjectName);
	}

	public ServiceObjectConfigurationException(String serviceObjectName,
			String errorMessageKey, String errorMessageValue) {

		super(serviceObjectName);

		this.errorMessages = new HashMap<String, Set<String>>();
		this.errorMessages.put(errorMessageKey,
				Collections.singleton(errorMessageValue));
	}

	public Map<String, Set<String>> getErrorMessages() {
		return errorMessages;
	}

	public void setErrorMessages(Map<String, Set<String>> errorMessages) {
		this.errorMessages = errorMessages;
	}
}
