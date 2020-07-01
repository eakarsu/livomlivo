package tr.com.eno.livo.server.serviceobjects;

public class ServiceObjectNotFoundException extends ServiceObjectBaseException {

	private static final long serialVersionUID = -280648222537658367L;

	public ServiceObjectNotFoundException(String serviceObjectName) {
		super(serviceObjectName);
	}
}
