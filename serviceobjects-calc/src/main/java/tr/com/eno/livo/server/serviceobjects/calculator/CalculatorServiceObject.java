package tr.com.eno.livo.server.serviceobjects.calculator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;

public class CalculatorServiceObject extends ServiceObject {

	private static final String SERVICE_OBJECT_NAME = "Calculator";

	private Set<String> operationNames;
	private UUID uuid;

	public CalculatorServiceObject() {

		this.uuid = UUID.randomUUID();
		this.operationNames = new HashSet<String>();
		this.operationNames.add("add");
		this.operationNames.add("multiply");
	}

	@Override
	public String getName() {

		return SERVICE_OBJECT_NAME;
	}

	@Override
	public Set<String> getOperationNames() {

		return this.operationNames;
	}

	@Override
	public String getType() {

		return "json";
	}

	@Override
	public UUID getUniqueID() {

		return this.uuid;
	}
}
