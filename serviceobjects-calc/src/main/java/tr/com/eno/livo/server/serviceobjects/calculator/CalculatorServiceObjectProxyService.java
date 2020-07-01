package tr.com.eno.livo.server.serviceobjects.calculator;

import java.io.StringReader;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonReader;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectConfigurationException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;

public class CalculatorServiceObjectProxyService implements
		ServiceObjectProxyService {

	private ServiceObject calcServiceObject;

	@Override
	public ServiceObject getServiceObject(AuthenticationToken token,
			String name, Map<String, String> configuration)
			throws ServiceObjectNotFoundException,
			ServiceObjectConfigurationException {

		return this.calcServiceObject = new CalculatorServiceObject();
	}

	@Override
	public Set<ServiceObject> listServiceObjects(AuthenticationToken token) {

		return Collections
				.<ServiceObject> singleton(new CalculatorServiceObject());
	}

	@Override
	public ServiceObjectOperationPayload performOperation(
			AuthenticationToken token, ServiceObject serviceObject,
			String operationName, ServiceObjectOperationPayload payload)
			throws ServiceObjectOperationFailedException {

		if (!this.calcServiceObject.getName().equalsIgnoreCase(
				serviceObject.getName()))
			throw new ServiceObjectOperationFailedException(operationName,
					serviceObject.getName(), null);

		JsonReader jr = Json
				.createReader(new StringReader(payload.getContent()));
		JsonObject obj = jr.readObject();
		jr.close();

		JsonArray operands = obj.getJsonArray("operands");

		double result = 0;

		if (operationName.equals("add")) {

			result = 0;

			for (JsonNumber operand : operands.getValuesAs(JsonNumber.class)) {

				result += operand.doubleValue();
			}
		}
		if (operationName.equals("multiply")) {

			result = 1;

			for (JsonNumber operand : operands.getValuesAs(JsonNumber.class)) {

				result *= operand.doubleValue();
			}
		}

		JsonObject resultObject = Json.createObjectBuilder()
				.add("result", result).build();

		ServiceObjectOperationPayload resultPayload = new ServiceObjectOperationPayload();
		resultPayload.setContent(resultObject.toString());

		return resultPayload;
	}
}
