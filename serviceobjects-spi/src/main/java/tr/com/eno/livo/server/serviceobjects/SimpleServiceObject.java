package tr.com.eno.livo.server.serviceobjects;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class SimpleServiceObject extends ServiceObject {

	private String name;
	private Set<String> operationNames;
	private String type;
	private UUID uniqueID;

	public SimpleServiceObject(String name, String type,
			String... operationNames) {

		this.name = name;
		this.type = type;
		this.operationNames = new HashSet<String>(Arrays.asList(operationNames));
	}

	public SimpleServiceObject(String name, UUID uniqueID, String type,
			String... operationNames) {

		this.name = name;
		this.uniqueID = uniqueID;
		this.type = type;
		this.operationNames = new HashSet<String>(Arrays.asList(operationNames));
	}

	/**
	 * @return the name
	 */
	@Override
	public String getName() {
		return name;
	}

	/**
	 * @return the operationNames
	 */
	@Override
	public Set<String> getOperationNames() {
		return operationNames;
	}

	/**
	 * @return the type
	 */
	@Override
	public String getType() {
		return type;
	}

	/**
	 * @return the uniqueID
	 */
	@Override
	public UUID getUniqueID() {
		return uniqueID;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @param operationNames
	 *            the operationNames to set
	 */
	public void setOperationNames(Set<String> operationNames) {
		this.operationNames = operationNames;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @param uniqueID
	 *            the uniqueID to set
	 */
	public void setUniqueID(UUID uniqueID) {
		this.uniqueID = uniqueID;
	}
}
