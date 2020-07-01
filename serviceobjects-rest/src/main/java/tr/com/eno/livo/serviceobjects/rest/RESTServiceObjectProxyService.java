package tr.com.eno.livo.serviceobjects.rest;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.request.HttpRequest;
import com.mashape.unirest.request.HttpRequestWithBody;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.text.MessageFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import javax.xml.bind.JAXBException;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectConfigurationException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;
import tr.com.eno.livo.server.serviceobjects.SimpleServiceObject;
import tr.com.eno.livo.serviceobjects.rest.description.Header;
import static tr.com.eno.livo.serviceobjects.rest.description.HttpMethod.GET;
import static tr.com.eno.livo.serviceobjects.rest.description.HttpMethod.POST;
import tr.com.eno.livo.serviceobjects.rest.description.Operation;
import tr.com.eno.livo.serviceobjects.rest.description.Parameter;
import tr.com.eno.livo.serviceobjects.rest.description.ServiceDescription;

public class RESTServiceObjectProxyService implements ServiceObjectProxyService {

    public static final Logger LOGGER = LoggerFactory.getLogger(RESTServiceObjectProxyService.class);
    public static final String REST_SERVICE_NAME_CONF = "rest.name";
    public static final String REST_SERVICE_DESCRIPTION_CONF = "rest.description";
    public static final String SERVICEOBJECT_NAME = "RESTServiceObject";
    public static final String SERVICEOBJECT_TYPE = "rest";
    private Set<UUID> UUIDs;
    private Map<String, Operation> operationDescriptions;
    private Map<AuthenticationToken, ServiceObject> serviceObjects;
    private String name;
    private SimpleServiceObject dummyServiceObject;
    private ServiceDescription serviceDescription;
    private URI baseUrl;

    protected void start(Map<String, Object> config) throws JAXBException, MalformedURLException, URISyntaxException, IOException {

        // Sanity check
        if (config == null) {

            LOGGER.error("No configuration provided.");

            throw new NullPointerException("No configuration is provided.");
        }
        if (!(config.containsKey(REST_SERVICE_NAME_CONF) && config.containsKey(REST_SERVICE_DESCRIPTION_CONF))) {

            LOGGER.error("Configuration is incomplete; aborting...");

            throw new RuntimeException("Incomplete configuration provided.");
        }

        // Initialize the UUIDs set
        this.UUIDs = Collections.synchronizedSet(new HashSet<UUID>());

        // Initialize the operation descriptions map
        this.operationDescriptions = new HashMap<>();

        // Initialize the service objects map
        this.serviceObjects = new HashMap<>();

        // Get configuration values
        String name = (String) config.get(REST_SERVICE_NAME_CONF);
        String description = (String) config.get(REST_SERVICE_DESCRIPTION_CONF);

        LOGGER.debug("Parsing description...");

        // Parse the description
        ObjectMapper objectMapper = new ObjectMapper();
        this.serviceDescription = objectMapper.readValue(description, ServiceDescription.class);

        if (this.serviceDescription == null || this.serviceDescription.getBaseUrl() == null) {

            LOGGER.error("Invalid description: {}", description);

            throw new NullPointerException("REST service description is invalid.");
        }

        this.baseUrl = new URI(this.serviceDescription.getBaseUrl());

        LOGGER.debug("Configuring a RESTServiceObject instance for the web service configuration with the name '{}' and base URL '{}'...", name, baseUrl);

        LOGGER.debug("Base URL for the REST service is '{}'.", this.baseUrl);

        String postfix = calculatePostfix(name);

        this.name = MessageFormat.format("{0}-{1}", SERVICEOBJECT_NAME, postfix);

        LOGGER.debug("Calculated name to be used for ServiceObjects backed by the web service named '{}' is '{}'.", name, this.name);

        for (Operation operation : this.serviceDescription.getOperations()) {

            LOGGER.debug("Adding operation '{}'...", operation.getName());

            this.operationDescriptions.put(operation.getName(), operation);
        }

        LOGGER.debug("Creating dummy ServiceObject...");

        this.dummyServiceObject = new SimpleServiceObject(this.name, SERVICEOBJECT_TYPE, this.operationDescriptions.keySet().toArray(new String[this.operationDescriptions.size()]));

        LOGGER.debug("Registering shutdown hook...");

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {

            @Override
            public void run() {

                try {

                    Unirest.shutdown();

                } catch (IOException ex) {

                    throw new RuntimeException(ex);
                }
            }
        }));
    }

    @Override
    public ServiceObject getServiceObject(AuthenticationToken token, String name, Map<String, String> configuration) throws ServiceObjectNotFoundException, ServiceObjectConfigurationException {

        // Sanity check
        if (!this.name.equals(name)) {
            throw new ServiceObjectNotFoundException(name);
        }

        // Check for existing configured ServiceObject
        synchronized (this.serviceObjects) {

            if (this.serviceObjects.containsKey(token)) {

                LOGGER.debug("Found an already configured ServiceObject for token '{}' and returning it.", token.getUniqueValue());

                return this.serviceObjects.get(token);
            }
        }

        // Create the ServiceObject instance
        SimpleServiceObject serviceObject = new SimpleServiceObject(this.name, generateUniqueID(), SERVICEOBJECT_TYPE, this.operationDescriptions.keySet().toArray(new String[this.operationDescriptions.size()]));

        // Store the created ServiceObject
        synchronized (this.serviceObjects) {

            this.serviceObjects.put(token, serviceObject);
        }

        return serviceObject;
    }

    @Override
    public Set<ServiceObject> listServiceObjects(AuthenticationToken token) {

        return Collections.<ServiceObject>singleton(this.dummyServiceObject);
    }

    @Override
    public ServiceObjectOperationPayload performOperation(AuthenticationToken token, ServiceObject serviceObject, String operationName, ServiceObjectOperationPayload payload) throws ServiceObjectOperationFailedException {

        // Sanity check
        if (!this.name.equals(serviceObject.getName())) {

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Failed to find the requested ServiceObject.");
        }
        synchronized (this.operationDescriptions) {

            if (!this.operationDescriptions.containsKey(operationName)) {

                throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "Unknown operation.");
            }
        }

        // Configuration check
        synchronized (this.serviceObjects) {

            if (!this.serviceObjects.containsKey(token)) {

                throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "No configured ServiceObject found for the user.");
            }
        }

        // Get the operation description
        Operation operation;
        synchronized (this.operationDescriptions) {

            operation = this.operationDescriptions.get(operationName);
        }

        try {

            // Parse the payload
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode payloadNode = objectMapper.readTree(payload.getContent());

            // Get the base request
            HttpRequest request = prepareBaseRequest(operation);

            // Iterate through the parameters
            for (Parameter parameter : operation.getParameters()) {

                String value;

                switch (parameter.getType()) {

                    case ROUTE:

                        value = null;

                        if (payloadNode.has(parameter.getName())) {

                            value = payloadNode.get(parameter.getName()).asText();

                        } else if (parameter.getValue() != null) {

                            value = parameter.getValue();
                        }

                        if (parameter.isRequired() && (value == null || value.isEmpty())) {

                            throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), MessageFormat.format("Required route parameter ''{0}'' is missing.", parameter.getName()));
                        }

                        request = request.routeParam(parameter.getName(), value);

                        break;

                    case HEADER:

                        value = null;

                        if (payloadNode.has(parameter.getName())) {

                            value = payloadNode.get(parameter.getName()).asText();

                        } else if (parameter.getValue() != null) {

                            value = parameter.getValue();
                        }

                        if (parameter.isRequired() && (value == null || value.isEmpty())) {

                            throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), MessageFormat.format("Required header parameter ''{0}'' is missing.", parameter.getName()));
                        }

                        request = request.header(parameter.getName(), value);

                        break;

                    case FORM:

                        if (!(request instanceof HttpRequestWithBody)) {
                            break;
                        }

                        value = null;

                        if (payloadNode.has(parameter.getName())) {

                            value = payloadNode.get(parameter.getName()).asText();

                        } else if (parameter.getValue() != null) {

                            value = parameter.getValue();
                        }

                        if (parameter.isRequired() && (value == null || value.isEmpty())) {

                            throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), MessageFormat.format("Required form parameter ''{0}'' is missing.", parameter.getName()));
                        }

                        request = request.header("Content-Type", "application/x-www-form-urlencoded");
                        HttpRequestWithBody requestWithBody = (HttpRequestWithBody) request;

                        request = requestWithBody.field(parameter.getName(), value).getHttpRequest();

                        break;

                    case QUERY:

                        value = null;

                        if (payloadNode.has(parameter.getName())) {

                            value = payloadNode.get(parameter.getName()).asText();

                        } else if (parameter.getValue() != null) {

                            value = parameter.getValue();
                        }

                        if (parameter.isRequired() && (value == null || value.isEmpty())) {

                            throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), MessageFormat.format("Required query string parameter ''{0}'' is missing.", parameter.getName()));
                        }

                        request = request.queryString(parameter.getName(), value);

                        break;
                }
            }

            HttpResponse<com.mashape.unirest.http.JsonNode> response = request.asJson();

            if (response.getStatus() >= 400) {

                LOGGER.error("HTTP response code is '{} {}'.", response.getStatus(), response.getStatusText());
                
                throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "Operation failed.");
            }

            ServiceObjectOperationPayload responsePayload = new ServiceObjectOperationPayload();
            responsePayload.setContent(response.getBody().toString());

            return responsePayload;

        } catch (ServiceObjectOperationFailedException ex) {
            
            throw ex;

        } catch (Exception ex) {

            LOGGER.error(ex.getMessage(), ex);

            throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "Operation failed.");
        }
    }

    private UUID generateUniqueID() {

        UUID result;

        do {

            result = UUID.randomUUID();

        } while (UUIDs.contains(result));

        UUIDs.add(result);

        return result;
    }

    private String calculatePostfix(String name) {

        return name.replaceAll("\\s+", "").replaceAll("[^\\w\\d]+", "");
    }

    private HttpRequest prepareBaseRequest(Operation operation) throws MalformedURLException {

        String operationUrl = new URL(this.baseUrl.toURL(), operation.getPath()).toExternalForm();

        LOGGER.debug("URL for the operation '{}' is '{}'.", operation.getName(), operationUrl);

        LOGGER.debug("HTTP method for operation is '{}'.", operation.getMethod());

        HttpRequest request = null;
        switch (operation.getMethod()) {

            case GET:
                request = Unirest.get(operationUrl);
                break;
            case POST:
                request = Unirest.post(operationUrl);
                break;
            case HEAD:
                request = Unirest.head(operationUrl);
                break;
            case PUT:
                request = Unirest.put(operationUrl);
                break;
            case DELETE:
                request = Unirest.delete(operationUrl);
                break;
            case OPTIONS:
                request = Unirest.options(operationUrl);
                break;
            case PATCH:
                request = Unirest.patch(operationUrl);
                break;
        }

        for (Header header : this.serviceDescription.getDefaultHeaders()) {

            LOGGER.debug("Setting default header named '{}' to '{}'...", header.getName(), header.getValue());

            request = request.header(header.getName(), header.getValue());
        }

        if (this.serviceDescription.getAuthentication() != null) {

            LOGGER.debug("Using default authentication information...");

            request = request.basicAuth(this.serviceDescription.getAuthentication().getUser(), this.serviceDescription.getAuthentication().getPassword());

        } else if (operation.getAuthentication() != null) {

            LOGGER.debug("Using operation-specific authentication information...");

            request = request.basicAuth(operation.getAuthentication().getUser(), operation.getAuthentication().getPassword());
        }

        return request;
    }
}
