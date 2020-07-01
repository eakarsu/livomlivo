package tr.com.eno.livo.serviceobjects.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.cxf.common.jaxb.JAXBUtils;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.jaxws.endpoint.dynamic.JaxWsDynamicClientFactory;
import org.apache.cxf.service.model.BindingOperationInfo;
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

public final class WSServiceObjectProxyService implements ServiceObjectProxyService {

    public static final String WS_NAME_CONF = "ws.name";
    public static final String WS_DESCRIPTION_URL_CONF = "ws.descriptionUrl";
    public static final String SERVICEOBJECT_NAME = "WSServiceObject";
    public static final String SERVICEOBJECT_TYPE = "ws";
    private static final Logger LOGGER = LoggerFactory.getLogger(WSServiceObjectProxyService.class);

    private Set<UUID> UUIDs;
    private ServiceObject dummyServiceObject;
    private Map<AuthenticationToken, ServiceObject> serviceObjects;
    private String name;
    private Client client;
    private Map<String, Pair<Class, Class>> operationTypes;

    protected void start(Map<String, Object> config) throws Exception {

        // Sanity check
        if (config == null) {

            LOGGER.error("No configuration provided.");

            throw new NullPointerException("No configuration is provided.");
        }
        if (!(config.containsKey(WS_DESCRIPTION_URL_CONF) && config.containsKey(WS_NAME_CONF))) {

            LOGGER.error("Configuration is incomplete; aborting...");

            throw new RuntimeException("Incomplete configuration provided.");
        }

        // Initialize the UUIDs set
        this.UUIDs = Collections.synchronizedSet(new HashSet<UUID>());

        // Initialize the operation types map
        this.operationTypes = new HashMap<>();

        // Initialize the service objects map
        this.serviceObjects = new HashMap<>();

        // Get configuration values
        String name = (String) config.get(WS_NAME_CONF);
        String descriptionUrl = (String) config.get(WS_DESCRIPTION_URL_CONF);

        LOGGER.debug("Configuring a WSServiceObject instance for the web service configuration with the name '{}' and WSDL URL '{}'...", name, descriptionUrl);

        String postfix = calculatePostfix(name);

        this.setName(MessageFormat.format("{0}-{1}", SERVICEOBJECT_NAME, postfix));

        LOGGER.debug("Calculated name to be used for ServiceObjects backed by the web service named '{}' is '{}'.", name, this.getName());

        LOGGER.debug("Creating dynamic client for web service described at '{}'...", descriptionUrl);

        // Create client factory instance
        JaxWsDynamicClientFactory clientFactory = JaxWsDynamicClientFactory.newInstance();

        // Create client instance
        this.client = clientFactory.createClient(descriptionUrl, getClass().getClassLoader());

        // Add the operation names
        for (BindingOperationInfo operationInfo : client.getEndpoint().getBinding().getBindingInfo().getOperations()) {

            LOGGER.debug("Adding operation '{}' to ServiceObject backed by web service located at '{}'...", operationInfo.getOperationInfo().getName().getLocalPart(), client.getEndpoint().getEndpointInfo().getAddress());

            String operationName = operationInfo.getOperationInfo().getName().getLocalPart();

            Class inputType = operationInfo.getInput().getMessageParts().get(0).getTypeClass();
            Class outputType = operationInfo.getOutput().getMessageParts().get(0).getTypeClass();

            this.operationTypes.put(operationName, new ImmutablePair<>(inputType, outputType));
        }

        // Create the dummy ServiceObject
        this.dummyServiceObject = new SimpleServiceObject(this.getName(), SERVICEOBJECT_TYPE, this.operationTypes.keySet().toArray(new String[this.operationTypes.size()]));

        // Calculate package
        String classPackage = JAXBUtils.namespaceURIToPackage(client.getEndpoint().getEndpointInfo().getName().getNamespaceURI());

        LOGGER.debug("Package for generated classes is '{}'.", classPackage);
    }

    protected void stop(Map<String, Object> config) {

        // Destroy the client
        this.client.destroy();
    }

    @Override
    public ServiceObject getServiceObject(AuthenticationToken token, String name, Map<String, String> config) throws ServiceObjectNotFoundException, ServiceObjectConfigurationException {

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
        SimpleServiceObject serviceObject = new SimpleServiceObject(this.getName(), generateUniqueID(), SERVICEOBJECT_TYPE, this.operationTypes.keySet().toArray(new String[this.operationTypes.size()]));

        // Store the created ServiceObject
        synchronized (this.serviceObjects) {

            this.serviceObjects.put(token, serviceObject);
        }

        return serviceObject;
    }

    @Override
    public Set<ServiceObject> listServiceObjects(AuthenticationToken token) {

        return Collections.singleton(this.dummyServiceObject);
    }

    @Override
    public ServiceObjectOperationPayload performOperation(AuthenticationToken token, ServiceObject serviceObject, String operationName, ServiceObjectOperationPayload payload) throws ServiceObjectOperationFailedException {

        // Sanity check
        if (!this.name.equals(serviceObject.getName())) {

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Failed to find the requested ServiceObject.");
        }
        synchronized (this.operationTypes) {

            if (!this.operationTypes.containsKey(operationName)) {

                throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "Unknown operation.");
            }
        }

        // Configuration check
        synchronized (this.serviceObjects) {

            if (!this.serviceObjects.containsKey(token)) {

                throw new ServiceObjectOperationFailedException(operationName, serviceObject.getName(), "No configured ServiceObject found for the user.");
            }
        }

        // Create the Jackson object mapper
        ObjectMapper objectMapper = new ObjectMapper();

        // Get the input type
        Class inputClass;
        synchronized (this.operationTypes) {

            inputClass = this.operationTypes.get(operationName).getLeft();
        }

        // Sanity check
        if (inputClass == null) {

            LOGGER.error("Input type is null for ''.", this.name);

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Internal error.");
        }

        Object inputObject;
        try {

            inputObject = objectMapper.readValue(payload.getContent(), inputClass);

        } catch (Exception ex) {

            LOGGER.error("Failed to map the input payload toobject.");

            LOGGER.error(ex.getMessage(), ex);

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Internal error.");
        }

        Object outputObject;
        try {

            Object[] result = this.client.invokeWrapped(operationName, inputObject);

            outputObject = result[0];

        } catch (Exception ex) {

            LOGGER.error("Failed to invoke the web service operation '{}' on '{}'.", operationName, this.name);

            LOGGER.error(ex.getMessage(), ex);

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Internal error.");
        }

        outputObject = Collections.singletonMap("result", outputObject);

        String outputContent;
        try {

            outputContent = objectMapper.writeValueAsString(outputObject);

        } catch (IOException ex) {

            LOGGER.error("Failed to map the output payload toobject.");

            LOGGER.error(ex.getMessage(), ex);

            throw new ServiceObjectOperationFailedException(operationName, this.name, "Internal error.");
        }

        ServiceObjectOperationPayload outputPayload = new ServiceObjectOperationPayload();
        outputPayload.setContent(outputContent);

        return outputPayload;
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

    /**
     * @return the name
     */
    protected String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    protected void setName(String name) {
        this.name = name;
    }
}
