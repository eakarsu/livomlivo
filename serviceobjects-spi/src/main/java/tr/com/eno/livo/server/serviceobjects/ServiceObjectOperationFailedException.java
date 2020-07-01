package tr.com.eno.livo.server.serviceobjects;

public class ServiceObjectOperationFailedException extends
		ServiceObjectBaseException {

	private static final long serialVersionUID = -4668176123696698381L;

	private String message;
	private String operationName;

	public ServiceObjectOperationFailedException(String serviceObjectName) {
		super(serviceObjectName);
	}

	public ServiceObjectOperationFailedException(String operationName,
			String serviceObjectName, String message) {
		super(serviceObjectName);
		this.operationName = operationName;
		this.message = message;
	}

	/**
	 * @return the message
	 */
	@Override
	public String getMessage() {
		return message;
	}

	public String getOperationName() {
		return operationName;
	}

	/**
	 * @param message
	 *            the message to set
	 */
	public void setMessage(String message) {
		this.message = message;
	}

	public void setOperationName(String operationName) {
		this.operationName = operationName;
	}
}
