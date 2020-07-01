package tr.com.eno.livo.server.serviceobjects;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;
import java.util.UUID;

public abstract class ServiceObject {

	@Override
	public boolean equals(Object obj) {

		if (!obj.getClass().equals(ServiceObject.class))
			return false;

		return ((ServiceObject) obj).getURI().equals(this.getURI());
	}

	/**
	 * Service object's general name. This name is used to retrieve an instance
	 * of a service object and shared among the instances.
	 * 
	 * @return Service object's general name.
	 */
	public abstract String getName();

	/**
	 * Service object's exposed operation names.
	 * 
	 * @return Service object's exposed operation names.
	 */
	public abstract Set<String> getOperationNames();

	/**
	 * Service object's type specifier. This type string is a schema for the
	 * service type that the service object expose (i.e. websrv for web
	 * services, jmx for Java Management Extensions).
	 * 
	 * @return Service object's type specifier.
	 */
	public abstract String getType();

	/**
	 * Service object's internal unique ID. This ID is used to discriminate
	 * different instances of a ServiceObject with same general names.
	 * 
	 * @return Service object's internal unique ID.
	 */
	public abstract UUID getUniqueID();

	/**
	 * Service object's unique URL. URL is in the form of
	 * <i>type://name:uuid</i> (i.e.
	 * "websrv://AmazonProducts:38400000-8cf0-11bd-b23e-10b96e4ef00d").
	 * 
	 * @return Service object's unique URL.
	 * @throws MalformedURLException
	 */
	public URI getURI() {

		try {

			return new URI(this.getType() + "://" + this.getName() + ":"
					+ this.getUniqueID());

		} catch (URISyntaxException e) {

			throw new RuntimeException(e);
		}
	}

	@Override
	public int hashCode() {

		return this.getURI().hashCode();
	}
}
