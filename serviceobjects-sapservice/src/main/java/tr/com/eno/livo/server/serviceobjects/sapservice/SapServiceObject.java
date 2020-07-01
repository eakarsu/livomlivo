package tr.com.eno.livo.server.serviceobjects.sapservice;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;

public class SapServiceObject extends ServiceObject {

	private String functionName = null;
	private String SERVICE_OBJECT_NAME;
	private final Set<String> SERVICE_OBJECT_OPERATION_NAMES = new HashSet<>();
	private final String SERVICE_OBJECT_TYPE = "SAP";
	private final UUID SERVICE_OBJECT_UUID = UUID.randomUUID();

	protected SapServiceObject(String objectName) {

                this.SERVICE_OBJECT_NAME = objectName;
		this.SERVICE_OBJECT_OPERATION_NAMES.add("getImportStructure");
		this.SERVICE_OBJECT_OPERATION_NAMES.add("getExportStructure");
		this.SERVICE_OBJECT_OPERATION_NAMES.add("importAndGetExport");
	}

	@Override
	public String getName() {

		return this.SERVICE_OBJECT_NAME;
	}

	@Override
	public Set<String> getOperationNames() {

		return this.SERVICE_OBJECT_OPERATION_NAMES;
	}

	@Override
	public String getType() {

		return this.SERVICE_OBJECT_TYPE;
	}

	@Override
	public UUID getUniqueID() {
		return this.SERVICE_OBJECT_UUID;
	}


	protected String getFunctionName() {

		return this.functionName;
	}


	protected void setFunctionName(String arg) {

		this.functionName = arg;
	}

}
