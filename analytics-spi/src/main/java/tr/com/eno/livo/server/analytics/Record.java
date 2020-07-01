package tr.com.eno.livo.server.analytics;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public abstract class Record {

	private String id;
	private Map<String, String> parameters;

	{
		this.id = UUID.randomUUID().toString();
		this.parameters = new HashMap<String, String>();
	}

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @return the parameters
	 */
	public Map<String, String> getParameters() {
		return parameters;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @param parameters
	 *            the parameters to set
	 */
	public void setParameters(Map<String, String> parameters) {
		this.parameters = parameters;
	}
}
