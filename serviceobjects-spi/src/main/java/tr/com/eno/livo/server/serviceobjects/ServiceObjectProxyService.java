package tr.com.eno.livo.server.serviceobjects;

import java.util.Map;
import java.util.Set;
import tr.com.eno.livo.server.authc.AuthenticationToken;

public interface ServiceObjectProxyService {
	
	public static final String SERVICE_OBJECT_REQUEST_RECEIVED_EVENT_TOPIC = "tr/com/eno/livo/server/serviceobjects/requestReceived";
	public static final String SERVICE_OBJECT_OPERATION_PERFORMED_EVENT_TOPIC = "tr/com/eno/livo/server/serviceobjects/operationPerformed";

	ServiceObject getServiceObject(AuthenticationToken token, String name,
			Map<String, String> configuration)
			throws ServiceObjectNotFoundException,
			ServiceObjectConfigurationException;

	Set<ServiceObject> listServiceObjects(AuthenticationToken token);

	ServiceObjectOperationPayload performOperation(AuthenticationToken token,
			ServiceObject serviceObject, String operationName,
			ServiceObjectOperationPayload payload)
			throws ServiceObjectOperationFailedException;
}
