package tr.com.eno.livo.server.web.formgenerator.ws;

import java.lang.reflect.Field;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;


/**
 *
 * @author Beyhan
 */
public class SimpleWebField implements WebField {

    private final Field operationTypeClassField;
    private boolean isRequired = false;
    private String holderString;
    private InputType inputType;
    private final String fieldName;

    public SimpleWebField(Field javaClassField, boolean isRequired, String holderString, InputType type) {
        this.operationTypeClassField = javaClassField;
        this.isRequired = isRequired;
        this.holderString = holderString;
        this.inputType = type;
        this.fieldName = javaClassField.getName();
    }

    public SimpleWebField(Field f, boolean isRequired,InputType type) {
        this.operationTypeClassField = f;
        this.holderString = f.getName();
        this.isRequired = isRequired;
        this.inputType = type;
        this.fieldName = f.getName();
    }

    
    @Override
    public InputType getInputType() {
        return this.inputType;
    }

    @Override
    public void setInputType(InputType type) {
        this.inputType = type;
    }

    public Field getClassField() {
        return this.operationTypeClassField;
    }

    @Override
    public void setIsRequired(boolean arg) {

        this.isRequired = arg;
    }

    @Override
    public boolean getIsRequired() {

        return this.isRequired;
    }

    @Override
    public void setPlaceHolder(String placeHolder) {

        this.holderString = placeHolder;
    }

    @Override
    public String getPlaceHolder() {

        return this.holderString;
    }

    @Override
    public JsonObjectBuilder getJavaScriptObject() {
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        builder.add("name", this.getName());
        
        builder.add("placeholder", this.getPlaceHolder());
        
        builder.add("required", this.getIsRequired());
        
        builder.add("type", this.getInputType().getValue());
        
        builder.add("fields", Json.createArrayBuilder());
        
        return builder;
    }

    @Override
    public String getName() {
        
        return this.fieldName;
    }

}
