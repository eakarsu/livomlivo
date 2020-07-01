package tr.com.eno.livo.server.serviceobjects.sapservice;

import java.io.StringReader;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.Timer;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectConfigurationException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;
import com.sap.conn.jco.JCoDestination;
import com.sap.conn.jco.JCoDestinationManager;
import com.sap.conn.jco.JCoException;
import com.sap.conn.jco.JCoField;
import com.sap.conn.jco.JCoFieldIterator;
import com.sap.conn.jco.JCoFunction;
import com.sap.conn.jco.JCoMetaData;
import com.sap.conn.jco.JCoTable;
import com.sap.conn.jco.ext.DestinationDataProvider;
import com.sap.conn.jco.ext.Environment;


public class SapServiceObjectProxyService implements ServiceObjectProxyService {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(SapServiceObjectProxyService.class);

    // Test code start
//	static String ABAP_AS = "ABAP_AS_WITHOUT_POOL";
//
//	static String ABAP_AS_POOLED = "ABAP_AS_WITH_POOL";
//
//	
//
//	static {
//
//		Properties connectProperties = new Properties();
//		connectProperties.setProperty(DestinationDataProvider.JCO_ASHOST,
//				"192.168.2.51");
//		connectProperties.setProperty(DestinationDataProvider.JCO_SYSNR, "00");
//		connectProperties
//				.setProperty(DestinationDataProvider.JCO_CLIENT, "710");
//		connectProperties.setProperty(DestinationDataProvider.JCO_USER,
//				"MOBILE");
//		connectProperties.setProperty(DestinationDataProvider.JCO_PASSWD,
//				"654321");
//		connectProperties.setProperty(DestinationDataProvider.JCO_LANG, "en");
//
//		createDestinationDataFile(ABAP_AS, connectProperties);
//		connectProperties.setProperty(
//				DestinationDataProvider.JCO_POOL_CAPACITY, "3");
//		connectProperties.setProperty(DestinationDataProvider.JCO_PEAK_LIMIT,
//				"10");
//		connectProperties.setProperty(
//				DestinationDataProvider.JCO_EXPIRATION_TIME, "50000000000");
//		createDestinationDataFile(ABAP_AS_POOLED, connectProperties);
//		connectToSAP();
//	}
//
//	private static void connectToSAP() {
//
//		try {
//			LOGGER.debug("Trying to connect SAP simply.");
//			JCoDestination destination = JCoDestinationManager
//					.getDestination(ABAP_AS);
//			LOGGER.debug("Attributes:");
//			destination.ping();
//			LOGGER.debug("Connected Successfully...");
//			SapFunctionAnalizer analzer = new SapFunctionAnalizer(destination
//					.getRepository().getFunction("ZLIVO"));
//			System.out.println(analzer.getImportStructure().toString());
//			System.out.println("============================================");
//			System.out.println(analzer.getExportStructure().toString());
//		} catch (JCoException ex) {
//
//			LOGGER.error("JCoException has been occured in simple connect.", ex);
//
//		}
//	}

//    private void createDestinationDataFile(String destName, Properties prop) {
//
//        File destConfig = new File(destName + ".jcoDestination");
//
//        try {
//
//            FileOutputStream fos = new FileOutputStream(destConfig, false);
//            prop.store(fos, destName);
//            fos.close();
//            fos.flush();
//        } catch (Exception ex) {
//            LOGGER.error("Destination file creation error", ex);
//
//        }
//    }

    private JCoDestination destination;;

    private SapServiceObject sapServiceObject;

    private final Map<String, SapServiceObject> serviceObjects = new HashMap<>();
    private Timer timer = new Timer();

    // Adds a configured service object to related token.getUniqueValue key in
    // order to differantiate configurations that can come from different apps.
    // Instead, does token based distinction.
    // TODO needs to remove dead tokens, waiting for related event admin service
    // to handle, also, in order to free unnecessary memory usage and
    // performance leak during subtracting from map.
    // Or application name must be added to token at the client side after
    // logging in.
    @Override
    public ServiceObject getServiceObject(AuthenticationToken token,
            String name, Map<String, String> configuration)
            throws ServiceObjectNotFoundException,
            ServiceObjectConfigurationException {

        if (!name.equalsIgnoreCase(this.sapServiceObject.getName())) {
            throw new ServiceObjectNotFoundException(name
                    + " in SAPServiceObject types.");
        }

        if ( !configuration.get("functionname").isEmpty()
                && configuration.get("functionname") != null) {
            

            this.sapServiceObject.setFunctionName(
                            configuration.get("functionname"));

            serviceObjects.put(token.getUniqueValue(), this.sapServiceObject);

            return this.sapServiceObject;
        } else {
            throw new ServiceObjectConfigurationException("SapServiceObject",
                    "Needs configuration.",
                    "Function name missing.");
        }
    }

    // handles destinatioons after configuration change.
    private void handleDestination(Map<String, Object> properties,String serviceName) {

        LOGGER.debug("Creating destination from properties");
      

        // JCoDestination dest =
        Properties prop = new Properties();
        
        for (String s : properties.keySet()) {

            LOGGER.debug(
                    "Adding configuration '{}' for destination in SapServiceObjectProxyService",
                    s);

                switch (s) {
                    case "jco.ashost":
                        prop.setProperty(DestinationDataProvider.JCO_ASHOST,
                                properties.get(s).toString());
                        break;
                    case "jco.sysnr":
                        prop.setProperty(DestinationDataProvider.JCO_SYSNR,
                                properties.get(s).toString());
                        break;
                    case "jco.client":
                        prop.setProperty(DestinationDataProvider.JCO_CLIENT,
                                properties.get(s).toString());
                        break;
                    case "jco.user":
                        prop.setProperty(DestinationDataProvider.JCO_USER,
                                properties.get(s).toString());
                        break;
                    case "jco.passwd":
                        prop.setProperty(DestinationDataProvider.JCO_PASSWD,
                                properties.get(s).toString());
                        break;
                    case "jco.lang":
                        prop.setProperty(DestinationDataProvider.JCO_LANG,
                                properties.get(s).toString());
                        break;
                    case "jco.expiration.time":
                        prop.setProperty(
                                DestinationDataProvider.JCO_EXPIRATION_TIME,
                                properties.get(s).toString());
                        break;
                    case "jco.pool.capacity":
                        prop.setProperty(
                                DestinationDataProvider.JCO_POOL_CAPACITY,
                                properties.get(s).toString());
                        break;
                    case "jco.peak.limit":
                        prop.setProperty(DestinationDataProvider.JCO_PEAK_LIMIT,
                                properties.get(s).toString());
                        break;
                    case "jco.saprouter":
                        prop.setProperty(DestinationDataProvider.JCO_SAPROUTER,
                                properties.get(s).toString());
                        break;

                }

                 }
            
            SapDestinationDataProvider provider = new SapDestinationDataProvider();
            
            provider.addDestination(serviceName, prop);
            
            Environment.registerDestinationDataProvider(provider);

            try {

                this.destination = JCoDestinationManager.getDestination(serviceName);

            } catch (JCoException ex) {
                LOGGER.error("Couldn't create destination with name : '{}'", serviceName);
            }
       
    }

    private JsonArrayBuilder handleExport(JCoFieldIterator iterator) {

        JsonArrayBuilder returnArray = Json.createArrayBuilder();

        JsonObjectBuilder json = Json.createObjectBuilder();

        while (iterator.hasNextField()) {

            JCoField field = iterator.nextField();

            if (field.isStructure()) {

                json.add(field.getName(), this.handleExport(field
                        .getStructure().getFieldIterator()));
            } else if (field.isTable()) {

                JsonArrayBuilder builder = Json.createArrayBuilder();

                JCoTable table = field.getTable();

                try {
                    builder.add(this.handleExport(table.getFieldIterator()));

                    while (table.nextRow()) {

                        builder.add(this.handleExport(table.getFieldIterator()));
                    }
                } catch (Exception ex) {

                    LOGGER.error(field.getName() + " is not initialized after execution", ex);
                }

                json.add(field.getName(), builder);
            } else {

                switch (field.getType()) {

                    // Type Search
                    case JCoMetaData.TYPE_CHAR:// String
                        json.add(field.getName(), field.getString());
                        break;
                    case JCoMetaData.TYPE_NUM:// String
                        json.add(field.getName(), field.getString());
                        break;
                    case JCoMetaData.TYPE_STRING:// String
                        json.add(field.getName(), field.getString());
                        break;
                    case JCoMetaData.TYPE_INT:// int
                        json.add(field.getName(), field.getInt());
                        break;
                    case JCoMetaData.TYPE_INT1:// int
                        json.add(field.getName(), field.getInt());
                        break;
                    case JCoMetaData.TYPE_INT2:// int
                        json.add(field.getName(), field.getInt());
                        break;
                    case JCoMetaData.TYPE_FLOAT:// Double
                        json.add(field.getName(), field.getDouble());
                        break;
                    case JCoMetaData.TYPE_DATE:// Date
                        json.add(field.getName(), field.getDate().toString());
                        break;
                    case JCoMetaData.TYPE_TIME:// Date
                        json.add(field.getName(), field.getDate().toString());
                        break;
                    case JCoMetaData.TYPE_BCD:// Big Decimal
                        json.add(field.getName(), field.getBigDecimal());
                        break;
                    case JCoMetaData.TYPE_DECF16:// Big Decimal
                        json.add(field.getName(), field.getBigDecimal());
                        break;
                    case JCoMetaData.TYPE_DECF34:// Big Decimal
                        json.add(field.getName(), field.getBigDecimal());
                        break;
                    case JCoMetaData.TYPE_BYTE: // Byte
                        json.add(field.getName(), field.getByte());
                        break;
                    default:// Byte
                        json.add(field.getName(), field.getByte());
                        break;
                }
            }

        }

        return returnArray.add(json);
    }

    private void importFunctionValues(JCoFieldIterator fieldIterator,
            JsonArray jsonArray) {

        Iterator<?> jsonIterator = jsonArray.iterator();

        JCoField field;

        while (jsonIterator.hasNext()) {

            JsonObject json = (JsonObject) jsonIterator.next();

            // ================================================================
            String fieldName;

            // Check whether there is a field or not.
            if (fieldIterator.hasNextField()) {
                field = fieldIterator.nextField();
            } else {
                continue;
            }

            // Checks json object consistency against sap field.
            if (json.keySet().size() > 1) {
                throw new RuntimeException(
                        "Each json object that represents a field in sap system can have only one key-value pair for this service.");
            } else {

                fieldName = json.keySet().iterator().next();
            }

            // Checks, sap field-json object name match
            if (!field.getName().equalsIgnoreCase(fieldName)) {
                throw new RuntimeException(
                        "The order of parameters must be same with import structure.");
            }

            // Checks, field type.
            if (field.isStructure()) {

                JsonArray array;
                try {
                    array = json.getJsonArray(fieldName);
                } catch (Exception ex) {
                    throw new RuntimeException(
                            "Json array has not found where its expected, found "
                            + json.getValueType() + " instead.");
                }

                this.importFunctionValues(field.getStructure()
                        .getFieldIterator(), array);

            } else if (field.isTable()) {
                JsonArray array;
                try {
                    array = json.getJsonArray(fieldName);
                } catch (Exception ex) {
                    throw new RuntimeException(
                            "Json array has not found where its expected, found "
                            + json.getValueType() + " instead.");
                }

                int i = 0;

                while (i < array.size()) {

                    JsonArray subArray = array.getJsonArray(i);

                    JCoTable table = field.getTable();

                    this.importFunctionValues(field.getTable()
                            .getFieldIterator(), subArray);
                    table.appendRow();

                }

            } else {

                switch (field.getType()) {

                    // Type Search
                    case JCoMetaData.TYPE_CHAR:// String
                        field.setValue(json.getString(fieldName));
                        break;
                    case JCoMetaData.TYPE_NUM:// String
                        field.setValue(json.getString(fieldName));
                        break;
                    case JCoMetaData.TYPE_STRING:// String
                        field.setValue(json.getString(fieldName));
                        break;
                    case JCoMetaData.TYPE_INT:// int
                        field.setValue(json.getInt(fieldName));
                        break;
                    case JCoMetaData.TYPE_INT1:// int
                        field.setValue(json.getInt(fieldName));
                        break;
                    case JCoMetaData.TYPE_INT2:// int
                        field.setValue(json.getInt(fieldName));
                        break;
                    case JCoMetaData.TYPE_FLOAT:// Double
                        field.setValue(json.getJsonNumber(fieldName).doubleValue());
                        break;
                    case JCoMetaData.TYPE_DATE:// Date
                        field.setValue(new Date(json.getJsonNumber(fieldName)
                                .longValue()));
                        break;
                    case JCoMetaData.TYPE_TIME:// Date
                        field.setValue(new Date(json.getJsonNumber(fieldName)
                                .longValue()));
                        break;
                    case JCoMetaData.TYPE_BCD:// Big Decimal
                        field.setValue(json.getJsonNumber(fieldName).intValue());
                        break;
                    case JCoMetaData.TYPE_DECF16:// Big Decimal
                        field.setValue(json.getJsonNumber(fieldName).intValue());
                        break;
                    case JCoMetaData.TYPE_DECF34:// Big Decimal
                        field.setValue(json.getJsonNumber(fieldName).intValue());
                        break;
                    case JCoMetaData.TYPE_BYTE: // Byte
                        field.setValue(json.getJsonNumber(fieldName).intValue());
                        break;
                    default:// Byte
                        field.setValue(json.getJsonNumber(fieldName).intValue());
                        break;
                }

            }
            

        }
    }

    // Test code ends.
    @Override
    public Set<ServiceObject> listServiceObjects(AuthenticationToken token) {
        return Collections.<ServiceObject>singleton(this.sapServiceObject);
    }

//    protected void modified(Map<String, Object> props) {
//
//        LOGGER.debug("SapServiceObjectProxyService modification call with properties");
//       
//        this.timer.cancel();
//        
//        this.timer = new Timer();
//        LOGGER.debug("Handling properties as destinations.");
//        try{this.handleDestinations(props);}catch(Exception ex){LOGGER.error("Exception has been occured '{}'",ex);}
//        
//        this.timer.schedule(new SapDestinationTimerTask(this.destinations),100,
//                5000);
//    }

    @Override
    public ServiceObjectOperationPayload performOperation(
            AuthenticationToken token, ServiceObject serviceObject,
            String operationName, ServiceObjectOperationPayload payload)
            throws ServiceObjectOperationFailedException {

        if (!serviceObject.getName().equalsIgnoreCase(
                this.sapServiceObject.getName())) {
            throw new ServiceObjectOperationFailedException(
                    "Expected service object: "
                    + this.sapServiceObject.getName() + " Found: "
                    + serviceObject.getName());
        }

        JsonReader jr = Json
                .createReader(new StringReader(payload.getContent()));

        JsonObject obj;
        try {

            obj = jr.readObject();

        } catch (Exception ex) {

            LOGGER.error("Can not read  incoming json object, reason: "
                    + ex.getMessage() + " in SapServiceObjectProxyService");

            throw new ServiceObjectOperationFailedException(operationName,
                    "SapServiceObjectProxyService",
                    "Can not read json object. Please check your json object to correct.");
        }

        JsonObject returnObject = null;

        jr.close();

        JsonArray imports;

        try {

            imports = obj.getJsonArray("imports");

        } catch (Exception ex) {

            LOGGER.error("Can not cast import(s) to json array.");

            throw new ServiceObjectOperationFailedException(operationName,
                    "SapServiceObjectProxyService",
                    "Can not cast import(s) to json array.");
        }

        JsonArray changings;

        try {

            changings = obj.getJsonArray("changings");

        } catch (Exception ex) {

            LOGGER.error("Can not cast changing(s) to json array.");

            throw new ServiceObjectOperationFailedException(operationName,
                    "SapServiceObjectProxyService",
                    "Can not cast changing(s) to json array.");
        }

        if (operationName.equalsIgnoreCase("getImportStructure")) {

            try {
                SapFunctionAnalizer analizer = new SapFunctionAnalizer(
                        this.destination
                        .getRepository()
                        .getFunction(
                                serviceObjects.get(
                                        token.getUniqueValue())
                                .getFunctionName()));

                returnObject = analizer.getImportStructure();
            } catch (JCoException ex) {

                LOGGER.debug(
                        "PerformOperation fail on  getImportStruture@SapServiceObjectProxyService reason: '{}'",
                        ex.getMessageText());

                throw new ServiceObjectOperationFailedException(
                        "getImportStructure", "SapServiceObject",
                        ex.getMessageText());
            }

        } else if (operationName.equalsIgnoreCase("getExportStructure")) {

            try {

                SapFunctionAnalizer analizer = new SapFunctionAnalizer(
                        this.destination
                        .getRepository()
                        .getFunction(
                                serviceObjects.get(
                                        token.getUniqueValue())
                                .getFunctionName()));

                returnObject = analizer.getExportStructure();

            } catch (JCoException ex) {

                LOGGER.debug(
                        "PerformOperation fail on  getExportStruture@SapServiceObjectProxyService reason: '{}'",
                        ex.getMessageText());

                throw new ServiceObjectOperationFailedException(
                        "getExportStructure", "SapServiceObject",
                        ex.getMessageText());
            }

        } else if (operationName.equalsIgnoreCase("importAndGetExport")) {

            if (imports == null && changings == null) {

                throw new ServiceObjectOperationFailedException(operationName,
                        "SapServiceObjectProxyService", "Empty json object.");
            } else {

                JCoFunction function;

                // import and execute
                try {

                    function = this.destination
                            .getRepository()
                            .getFunction(
                                    this.serviceObjects.get(
                                            token.getUniqueValue())
                                    .getFunctionName());

                    try {

                        this.importFunctionValues(function.getImportParameterList()
                                .getFieldIterator(), imports);
                    } catch (Exception ex) {

                        LOGGER.debug("No import parameters is found in given function '{}'", function.getName(), ex);
                    }

                    try {

                        this.importFunctionValues(function
                                .getChangingParameterList().getFieldIterator(),
                                changings);
                    } catch (Exception ex) {

                        LOGGER.debug("No changing parameters is found in given function '{}'", function.getName(), ex);

                    }

                    function.execute(this.destination);

                } catch (JCoException ex) {

                    LOGGER.error(
                            "JCo exception during execution of function with name: '{}' on destination '{}'",
                            this.serviceObjects.get(token.getUniqueValue())
                            .getFunctionName(), this.serviceObjects
                            .get(token.getUniqueValue())
                            .getName());

                    throw new ServiceObjectOperationFailedException(
                            operationName, "SapServiceObjectProxyService",
                            ex.getMessageText());
                }

                JsonObjectBuilder resultObject = Json.createObjectBuilder();
                // Handle response
                try {

                    resultObject.add("exports", this.handleExport(function
                            .getExportParameterList().getFieldIterator()));

                } catch (Exception ex) {
                    LOGGER.debug(
                            "No export parameters are found after execution of function '{}' @ SapServiceObjectProxyService",
                            function.getName(), ex);
                }

                try {

                    resultObject.add("changings", this.handleExport(function
                            .getChangingParameterList().getFieldIterator()));

                } catch (Exception ex) {
                    LOGGER.debug(
                            "No changing parameters are found after execution of function '{}' @ SapServiceObjectProxyService",
                            function.getName(), ex);
                }

                try {

                    resultObject.add("tables", this.handleExport(function
                            .getTableParameterList().getFieldIterator()));

                } catch (Exception ex) {
                    LOGGER.debug(
                            "No table is found after execution of function '{}' @ SapServiceObjectProxyService",
                            function.getName(), ex);
                }

                returnObject = resultObject.build();
            }

        } else {
            throw new ServiceObjectOperationFailedException(
                    "Valid operaiton names are 'getImportStructure,getExportStructure,importAndGetExport' but found "
                    + operationName);
        }

        ServiceObjectOperationPayload resultPayload = new ServiceObjectOperationPayload();

        resultPayload.setContent(returnObject.toString());

        return resultPayload;
    }

    protected void start(Map<String, Object> props) throws JCoException {

        if(props.get("sapservice.name")==null)
            throw new RuntimeException("Service name cannot be null.");
        
        LOGGER.debug("Starting SapServiceObjectProxyService with name",props.get("sapservice.name").toString());
        
        this.sapServiceObject = new SapServiceObject(props.get("sapservice.name").toString());

        this.handleDestination(props,props.get("sapservice.name").toString());
        

        this.timer.schedule(new SapDestinationTimerTask(this.destination),100,
              5000);
    }

    protected void stop(Map<String, Object> props) {

        LOGGER.debug("Service SapServiceObjectProxyService has been stop");

        this.timer.cancel();
    }

}
