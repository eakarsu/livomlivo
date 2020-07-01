package tr.com.eno.livo.server.web.formgenerator.ws;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonException;
import javax.json.JsonObjectBuilder;
import javax.json.stream.JsonParsingException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.tika.io.IOUtils;

/**
 * This class' purpose is to provide javascript form generation from
 * serviceobjects configuration. Client side application developers should add
 * the generated file to their htmls and must change or add classes to fit their
 * designs or frameworks. This class is for soap services.
 */
public class ServiceToFormGeneratorWS {

    private String currentFormat;

    private final File generatedFile;

    private final String serviceName;

    private String serviceDesc;

    private WSInspector inspector;

    private final Map<String, Pair<Class, List<WebField>>> operationInfo;

    /**
     *
     * @param inspector modified inspector.
     * @param path file path
     * @throws JsonException
     * @throws JsonParsingException
     * @throws FileNotFoundException
     * @throws IOException
     */
    public ServiceToFormGeneratorWS(WSInspector inspector,
            String path) throws JsonException, JsonParsingException,
            FileNotFoundException, IOException {

        this.currentFormat = IOUtils.toString(new FileInputStream(
                new File(getClass().getClassLoader().
                        getResource("generation-pilot-ws.txt").getFile())),
                "UTF-8");

        this.operationInfo = inspector.getOperationTypes();

        this.generatedFile = new File(path, "Livo.ServiceObjects.WS-"
                + inspector.getMWServiceName().replace("WSServiceObject-", "")
                + ".js");

        this.serviceName = inspector.getMWServiceName();

        this.inspector = inspector;

    }

    public void generateServiceJavascriptFile() throws IOException {
        this.insertServiceName();

        this.insertOperationDefinitions();

        this.insertServiceObject();

        FileUtils.write(this.generatedFile, this.currentFormat, "UTF-8", false);

    }

    private void insertOperationDefinitions() {

        //Get operation definitions as opName:[{inputProps},...]
        JsonObjectBuilder definitionsBuilder = Json.createObjectBuilder();

        Map<String, Pair<Class, List<WebField>>> operationTypes
                = this.inspector.getOperationTypes();

        for (String operationName : operationTypes.keySet()) {

            JsonArrayBuilder fields = Json.createArrayBuilder();

            for (WebField field : operationTypes.get(operationName).getRight()) {

                fields.add(field.getJavaScriptObject());

            }

            definitionsBuilder.add(operationName, fields);

        }

        this.currentFormat = this.currentFormat.replaceAll("\\{definitions\\}",
                definitionsBuilder.build().toString());

    }

    private void insertServiceName() {

        this.currentFormat = this.currentFormat.replaceAll("\\{servicename\\}", this.serviceName.replace("WSServiceObject-", ""));
    }

    private void insertServiceObject() {

//        //Generate json formatted serviceobject definition.
//        JsonObjectBuilder builder = Json.createObjectBuilder();
//
//        builder.add("name", this.serviceName);
//
//        builder.add("type", "json");
//
//        JsonArrayBuilder operations = Json.createArrayBuilder();
//
//        JsonArray ops = this.confObject.getJsonArray("operations");
//
//        for (int i = 0; i < ops.size(); i++) {
//            operations.add(ops.getJsonObject(i).getString("name"));
//        }
//
//        builder.add("operations", operations.build());
        this.currentFormat = this.currentFormat.replaceAll("\\{serviceObject\\}", "\"" + this.serviceName + "\"");

    }
}
