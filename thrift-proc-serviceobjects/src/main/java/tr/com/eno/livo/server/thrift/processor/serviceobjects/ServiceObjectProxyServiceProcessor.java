package tr.com.eno.livo.server.thrift.processor.serviceobjects;

import java.nio.charset.Charset;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.activation.MimeType;
import javax.activation.MimeTypeParseException;
import org.apache.thrift.TException;
import org.osgi.framework.Constants;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectConfigurationException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObject;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectConfigurationError;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectNotFoundError;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationFailedError;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectProxyService.Iface;
import tr.com.eno.livo.thrift.shared.AuthenticationToken;

public class ServiceObjectProxyServiceProcessor
		extends
		tr.com.eno.livo.thrift.serviceobjects.ServiceObjectProxyService.Processor<Iface> {

	private static final AsyncIfaceImpl iface = new AsyncIfaceImpl();
	private static final Logger LOGGER = LoggerFactory
			.getLogger(ServiceObjectProxyServiceProcessor.class);

	public ServiceObjectProxyServiceProcessor() {
		super(iface);

		LOGGER.debug("Initialized an {} instance.",
				ServiceObjectProxyServiceProcessor.class.getSimpleName());
	}

	protected void registerService(EventAdmin eventAdmin) {

		LOGGER.debug("Registering EventAdmin instance...");

		iface.eventAdmin = eventAdmin;
	}

	protected void registerService(ServiceObjectProxyService service,
			Map<String, Object> serviceProps) {

		// Get the service PID
		String pid = serviceProps.get(Constants.SERVICE_PID).toString();

		// Ignore internal services
		if (serviceProps.containsKey("service.internal")
				&& (Boolean) serviceProps.get("service.internal")) {
			return;
		}

		LOGGER.debug(
				"Registering the ServiceObjectProxyService instance with the name '{}' to the Thrift processor adaptor...",
				pid);

		// Register the service
		iface.registerService(pid, service);
	}

	protected void unregisterService(EventAdmin eventAdmin) {

		LOGGER.debug("Unregistering EventAdmin instance...");

		iface.eventAdmin = null;
	}

	protected void unregisterService(ServiceObjectProxyService service,
			Map<String, Object> serviceProps) {

		// Get the service PID
		String pid = (String) serviceProps.get(Constants.SERVICE_PID);

		LOGGER.debug(
				"Unregistering the CompanyAuthenticationService instance with the name '{}' from the Thrift processor adaptor...",
				pid);

		// Register the service
		iface.unregisterService(pid, service);
	}

	private static class AsyncIfaceImpl implements Iface {

		// URI to
		// service
		// PID of
		// the
		// implementation
		// providing
		// it
		private final Map<String, Map<String, tr.com.eno.livo.server.serviceobjects.ServiceObject>> configuredServiceObjects; // Token
		private final Map<String, String> serviceObjectsSourceServices; // ServiceObject
		private final Map<String, ServiceObjectProxyService> services;
		private EventAdmin eventAdmin;

		protected AsyncIfaceImpl() {

			this.services = new HashMap<String, ServiceObjectProxyService>();
			this.serviceObjectsSourceServices = new HashMap<String, String>();
			this.configuredServiceObjects = new HashMap<String, Map<String, tr.com.eno.livo.server.serviceobjects.ServiceObject>>();
		}

		@Override
		public ServiceObject getServiceObject(AuthenticationToken token,
				String name, Map<String, String> conf)
				throws ServiceObjectNotFoundError,
				ServiceObjectConfigurationError, TException {

			// TODO token sanity check
			LOGGER.debug("Getting service object for the token '{}'...",
					token.getUniqueValue());

			tr.com.eno.livo.server.serviceobjects.ServiceObject serviceObject = null;

			// We have to call listServiceObjects with our token because due to
			// authorization, implementation may hide some ServiceObjects.
			this.listServiceObjects(token);

			// Now that source service PIDs map is up-to-date, we can search for
			// our source service.
			String sourceServicePid;

			synchronized (this.serviceObjectsSourceServices) {

				sourceServicePid = this.serviceObjectsSourceServices.get(name);
			}

			// Sanity check for source service PID
			if (sourceServicePid == null) {

				throw new ServiceObjectNotFoundError(name);
			}

			// Get the source service
			ServiceObjectProxyService proxyService;
			synchronized (this.services) {

				proxyService = this.services.get(sourceServicePid);
			}

			// Sanity check for service
			if (proxyService == null) {

				LOGGER.warn("Service that registered the ServiceObject with name '{}' is unregistered, updating index...");

				synchronized (this.serviceObjectsSourceServices) {

					this.serviceObjectsSourceServices.remove(name);
				}

				throw new ServiceObjectNotFoundError(name);
			}

			try {

				serviceObject = proxyService.getServiceObject(
						this.convertToServerToken(token), name, conf);

			} catch (ServiceObjectNotFoundException ex) {

				LOGGER.error(
						"Encountered a 'ServiceObjectNotFoundException' while trying to configure a ServiceObject with nme '{}'.",
						name);

				throw new ServiceObjectNotFoundError(name);

			} catch (ServiceObjectConfigurationException ex) {

				LOGGER.error(
						"Configuration error in ServiceObject with given name '{}'...",
						name);

				throw this.convertToThriftConfigurationError(ex);
			}

			LOGGER.debug(
					"Successfully configured an instance of the ServiceObject named '{}' for token '{}'...",
					name, token.getUniqueValue());

			// Save the ServiceObject instance
			synchronized (this.configuredServiceObjects) {

				if (!this.configuredServiceObjects.containsKey(token
						.getUniqueValue())) {

					this.configuredServiceObjects
							.put(token.getUniqueValue(),
									new HashMap<String, tr.com.eno.livo.server.serviceobjects.ServiceObject>());
				}

				this.configuredServiceObjects.get(token.getUniqueValue()).put(
						name, serviceObject);
			}

			return this.convertToThriftServiceObject(serviceObject);
		}

		@Override
		public Set<ServiceObject> listServiceObjects(AuthenticationToken token)
				throws TException {

			// TODO Check for token validity.
			LOGGER.debug("Listing service objects for the token '{}'...",
					token.getUniqueValue());

			Set<ServiceObject> resultServiceObjects = new HashSet<ServiceObject>();

			synchronized (this.services) {

				for (String servicePid : this.services.keySet()) {

					LOGGER.debug("Retrieving service objects from the ServiceObjectProxyService with the PID '{}'...");

					ServiceObjectProxyService proxyService = this.services
							.get(servicePid);

					Set<tr.com.eno.livo.server.serviceobjects.ServiceObject> serviceObjects;

					try {

						serviceObjects = proxyService.listServiceObjects(this
								.convertToServerToken(token));

					} catch (Exception e) {

						LOGGER.error(
								"Encountered an unexpected error while retrieving service objects from the ServiceObjectProxyService with the PID '{}'.",
								servicePid);
						LOGGER.error(e.getMessage(), e);

						continue;
					}

					if (serviceObjects != null) {

						for (tr.com.eno.livo.server.serviceobjects.ServiceObject serviceObj : serviceObjects) {

							LOGGER.debug(
									"ServiceObjectProxyService with the PID '{}' provided a service object with the name '{}'.",
									servicePid, serviceObj.getName());

							synchronized (this.serviceObjectsSourceServices) {

								this.serviceObjectsSourceServices.put(
										serviceObj.getName(), servicePid);
							}

							resultServiceObjects.add(this
									.convertToThriftServiceObject(serviceObj));
						}
					}
				}
			}

			return resultServiceObjects;
		}

		@Override
		public ServiceObjectOperationPayload performOperation(
				AuthenticationToken token, ServiceObject object,
				String operationName, ServiceObjectOperationPayload payload)
				throws ServiceObjectOperationFailedError, TException {

			LOGGER.debug("Trying to perform operation '" + operationName
					+ "' for ServiceObject with given name '{}'...",
					object.getName());

			// Get the appropriate ServiceObject instance
			tr.com.eno.livo.server.serviceobjects.ServiceObject serverServiceObject;
			synchronized (this.configuredServiceObjects) {

				if (!this.configuredServiceObjects.containsKey(token
						.getUniqueValue())
						|| !this.configuredServiceObjects.get(
								token.getUniqueValue()).containsKey(
								object.getName())) {

					LOGGER.warn(
							"User with token '{}' tried to call ServiceObject named '{}' without configuring it.",
							token.getUniqueValue(), object.getName());

					ServiceObjectOperationFailedError error = new ServiceObjectOperationFailedError(
							object.getName(), operationName);
					error.setMessage("ServiceObject not configured.");

					throw error;
				}

				serverServiceObject = this.configuredServiceObjects.get(
						token.getUniqueValue()).get(object.getName());
			}

			// Get the source service
			String servicePid;
			ServiceObjectProxyService proxyService;
			synchronized (this.serviceObjectsSourceServices) {

				servicePid = this.serviceObjectsSourceServices.get(object
						.getName());

				LOGGER.debug(
						"Found the PID of the source service of the ServiceObject with name '{}' as '{}'.",
						object.getName(), servicePid);

				synchronized (this.services) {

					if (!this.services.containsKey(servicePid)) {

						LOGGER.error(
								"Source service with the PID '{}' for the ServiceObject named '{}' is not registered.",
								servicePid, object.getName());

						throw new ServiceObjectOperationFailedError(
								object.getName(), operationName);
					}

					proxyService = this.services.get(servicePid);
				}
			} 

			tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload inputPayload = null;
			try {
				// Convert the input payload
				inputPayload = this.convertToServerOperationPayload(payload);

			} catch (MimeTypeParseException ex) {

				LOGGER.error(ex.getMessage(), ex);

				throw new ServiceObjectOperationFailedError(object.getName(),
						operationName);
			}

			// TODO Sanity check for input payload
			LOGGER.debug(
					"Performing operation '{}' on ServiceObject named '{}' provided by the ServiceObjectProxyService with the PID '{}'...",
					operationName, object.getName(), servicePid);
			
			tr.com.eno.livo.server.authc.AuthenticationToken serverToken = this.convertToServerToken(token);

			tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload outputPayload = null;
			try {
				
				Date startDate = new Date();
				
				outputPayload = proxyService.performOperation(
						serverToken, serverServiceObject,
						operationName, inputPayload);
				
				Date endDate = new Date();
				
				this.fireServiceObjectRequestReceivedEvent(serverToken, serverServiceObject.getName(), startDate);
				this.fireServiceObjectOperationPerformedEvent(serverToken, serverServiceObject.getName(), startDate, endDate, inputPayload, outputPayload);
				
			} catch (ServiceObjectOperationFailedException ex) {

				LOGGER.error(
						"Failed to perform operation '{}' on ServiceObject named '{}'.",
						operationName, object.getName());

				LOGGER.error(ex.getMessage(), ex);

				throw this.convertToThriftOperationFailedError(ex);
			}

			// Sanity check for output payload
			// Convert the output payload to Thrift type and return it
			return this.convertToThriftOperationPayload(outputPayload);
		}

		protected void registerService(String pid,
				ServiceObjectProxyService service) {

			synchronized (this.services) {

				this.services.put(pid, service);
			}
		}

		protected void unregisterService(String pid,
				ServiceObjectProxyService service) {

			synchronized (this.services) {

				this.services.remove(pid);
			}
		}
		
		private void fireServiceObjectRequestReceivedEvent(tr.com.eno.livo.server.authc.AuthenticationToken token, String serviceObjName, Date date) {
			
			if (this.eventAdmin == null) {

				LOGGER.warn("Ignoring service object request received event because EventAdmin instance is not registered.");

				return;
			}

			Map<String, Object> eventProperties = new HashMap<String, Object>();
			eventProperties.put("authenticationToken", token);
			eventProperties.put("date", date);
			eventProperties.put("serviceObjectName", serviceObjName);
			
			LOGGER.debug(
					"Posting event for request to the service object with name '{}'...",
					serviceObjName);

			this.eventAdmin.postEvent(new Event(
					ServiceObjectProxyService.SERVICE_OBJECT_REQUEST_RECEIVED_EVENT_TOPIC,
					eventProperties));
		}

		private void fireServiceObjectOperationPerformedEvent(tr.com.eno.livo.server.authc.AuthenticationToken token, String serviceObjName, Date startDate, Date endDate, tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload inputPayload, tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload outputPayload) {
			
			if (this.eventAdmin == null) {

				LOGGER.warn("Ignoring service object operation performed event because EventAdmin instance is not registered.");

				return;
			}

			Map<String, Object> eventProperties = new HashMap<String, Object>();
			eventProperties.put("authenticationToken", token);
			eventProperties.put("serviceObjectName", serviceObjName);
			eventProperties.put("startDate", startDate);
			eventProperties.put("endDate", endDate);
			eventProperties.put("inputPayloadSize", (long) inputPayload.getContent().getBytes(Charset.forName("UTF-8")).length);
			eventProperties.put("outputPayloadSize", (long) outputPayload.getContent().getBytes(Charset.forName("UTF-8")).length);
			
			LOGGER.debug(
					"Posting event for operation performance to the service object with name '{}'...",
					serviceObjName);

			this.eventAdmin.postEvent(new Event(
					ServiceObjectProxyService.SERVICE_OBJECT_OPERATION_PERFORMED_EVENT_TOPIC,
					eventProperties));
		}

		private tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload convertToServerOperationPayload(
				ServiceObjectOperationPayload payload)
				throws MimeTypeParseException {

			tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload sPayload = new tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload();

			sPayload.setContent(payload.getContent());
			sPayload.setContentType(new MimeType(payload.getContentType()));
			sPayload.setRootElement(payload.getRootElement());
			return sPayload;
		}

		private tr.com.eno.livo.server.authc.AuthenticationToken convertToServerToken(
				AuthenticationToken token) {

			return new tr.com.eno.livo.server.authc.AuthenticationToken(
					token.getCompanyId(), token.getUserPrincipal(), null, null,
					token.getUniqueValue(), new Date(
							token.getAuthenticationTime()), new Date(
							token.getExpirationTime()));
		}

		private ServiceObjectConfigurationError convertToThriftConfigurationError(
				ServiceObjectConfigurationException exception) {

			ServiceObjectConfigurationError error = new ServiceObjectConfigurationError(
					exception.getServiceObjectName());
			error.setErrorMessages(exception.getErrorMessages());

			return error;
		}

		private ServiceObjectOperationFailedError convertToThriftOperationFailedError(
				ServiceObjectOperationFailedException exception) {

			ServiceObjectOperationFailedError error = new ServiceObjectOperationFailedError(
					exception.getServiceObjectName(),
					exception.getOperationName());
			error.setMessage(exception.getMessage());

			return error;
		}

		private ServiceObjectOperationPayload convertToThriftOperationPayload(
				tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload payload) {

			ServiceObjectOperationPayload p = new ServiceObjectOperationPayload();
			p.setContent(payload.getContent());
			// TODO Handle MimeType problem later!!!!!!!!!
			p.setContentType("application/json");
			p.setRootElement(payload.getRootElement());
			return p;

		}

		private ServiceObject convertToThriftServiceObject(
				tr.com.eno.livo.server.serviceobjects.ServiceObject serviceObject) {

			return new ServiceObject(serviceObject.getName(),
					serviceObject.getType(), serviceObject.getOperationNames());
		}
	}
}
