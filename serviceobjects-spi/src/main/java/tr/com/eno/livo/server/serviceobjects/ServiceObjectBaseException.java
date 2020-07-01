package tr.com.eno.livo.server.serviceobjects;

public abstract class ServiceObjectBaseException extends Exception {

	private static final long serialVersionUID = -3524738439319762153L;

	private String serviceObjectName;

	public ServiceObjectBaseException(String serviceObjectName) {
		this.serviceObjectName = serviceObjectName;
	}

	public String getServiceObjectName() {
		return serviceObjectName;
	}

	public void setServiceObjectName(String serviceObjectName) {
		this.serviceObjectName = serviceObjectName;
	}
}
