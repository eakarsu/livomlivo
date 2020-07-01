package tr.com.eno.livo.server.web;


import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringReader;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonException;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.stream.JsonParsingException;
import org.apache.commons.io.FileUtils;
import org.apache.tika.io.IOUtils;


/**
 *This class' purpose is to provide javascript form generation from 
 * serviceobjects configuration. Client side application developers should add 
 * the generated file to their htmls and must change or add classes to fit their
 * designs or frameworks. This class is for rest services.
 */
public class ServiceToFormGeneratorRS {
    
    private final JsonObject confObject;
    
    private  String currentFormat;
    
    private final File generatedFile;
    
    private final String serviceName;
    
    private String serviceDesc;
    
    /**
     * @param serviceName Name of the service that's configured.
     * @param desc Configuration string as json.
     * @param path The folder path of the file that will be generated.
     * @throws java.io.FileNotFoundException 
     */
    public ServiceToFormGeneratorRS(String serviceName, String desc,String path) throws JsonException, JsonParsingException, FileNotFoundException, IOException{
    
        this.currentFormat =  IOUtils.toString( new FileInputStream(new File(getClass().getClassLoader().getResource("generation-pilot-rs.txt").getFile())),"UTF-8");
       
        JsonReader reader = Json.createReader(new StringReader(desc));
        
        this.confObject = reader.readObject();
        
        this.generatedFile = new File(path,"Livo.ServiceObjects.RS-"+serviceName+".js");
        
        this.serviceName = serviceName;
       
    }
    
    public void generateServiceJavascriptFile() throws IOException{
        this.insertServiceName();
        
        this.insertOperationDefinitions();
        
        this.insertServiceObject();
        
        FileUtils.write(this.generatedFile, this.currentFormat, "UTF-8", false);
    
    }
    
    private void insertOperationDefinitions(){
            
        //Get operation definitions as opName:[{inputProps},...]
        
        JsonObjectBuilder definitionsBuilder = Json.createObjectBuilder();
        
        JsonArray operations = this.confObject.getJsonArray("operations");
        
        for(int i = 0; i<operations.size();i++){
        
            JsonObject object = operations.getJsonObject(i);
            
            definitionsBuilder.add(object.getString("name"), object.getJsonArray("parameters"));
        }
        
        this.currentFormat = this.currentFormat.replaceAll("\\{definitions\\}", definitionsBuilder.build().toString());
        
    }
    private void insertServiceName(){
    
        this.currentFormat = this.currentFormat.replaceAll("\\{servicename\\}", this.serviceName);
    }
    private void insertServiceObject(){
        
        //Generate json formatted serviceobject definition.
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        builder.add("name", "RESTServiceObject-"+this.confObject.getString("name"));
        
        builder.add("type", "json");
        
        JsonArrayBuilder operations = Json.createArrayBuilder();
        
        JsonArray ops = this.confObject.getJsonArray("operations");
        
        for(int i = 0; i < ops.size(); i++)
            operations.add(ops.getJsonObject(i).getString("name"));
        
        builder.add("operations", operations.build());
        
        this.currentFormat = this.currentFormat.replaceAll("\\{serviceObject\\}", builder.build().toString());
    
    }
}
