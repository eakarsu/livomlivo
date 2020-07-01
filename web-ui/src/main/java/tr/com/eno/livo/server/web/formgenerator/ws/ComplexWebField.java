package tr.com.eno.livo.server.web.formgenerator.ws;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.xml.bind.annotation.XmlElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Beyhan
 */
public class ComplexWebField implements WebField {

    private static final Logger LOGGER = LoggerFactory.getLogger(ComplexWebField.class);

    private static final String TAG = "ComplexWebField";

    private final List<WebField> subFields = new LinkedList<>();

    private InputType inputType = InputType.SERVICETYPE;

    private final Field field;

    private boolean isRequired = true;

    private String placeHolder;

    private final String fieldName;

    public ComplexWebField(Field field) throws RuntimeException {

        if (field == null) {
            throw new RuntimeException("Null parameters are not accepted.");
        }


        this.field = field;

        this.placeHolder = field.getName();

        this.fieldName = this.field.getName();

        this.inspectLevel();
    }

    private void inspectLevel() {

        for (Field f : this.field.getType().getDeclaredFields()) {

            if (new DataType().getInputType(f.getType())==InputType.SERVICETYPE) {
                
                this.subFields.add(new ComplexWebField(f));
            } else {
                
                this.subFields.add(new SimpleWebField(f, this.isFieldRequired(f), new DataType().getInputType(f.getType())));
            }
        }
    }

    public List<WebField> getSubfields(){
    
        return this.subFields;
    }
    //This check can be used later on in case of DataType is not enough to handle
    //types correctly.


    private boolean isFieldRequired(Field field) {

        for (Annotation a : field.getDeclaredAnnotations()) {
            if (a.annotationType().getSimpleName().equals(XmlElement.class.getSimpleName())) {

                for (Method m : a.annotationType().getDeclaredMethods()) {

                    if (m.getName().equals("required")) {

                        try {
                            return (boolean) m.invoke(a, (Object[]) null);
                        } catch (IllegalAccessException ex) {
                            LOGGER.warn(TAG, "Counldn't access method of XmlElement");
                        } catch (IllegalArgumentException ex) {
                            LOGGER.warn(TAG, " Interestingly method is unhappy with the argument given.");
                        } catch (InvocationTargetException ex) {
                            LOGGER.warn(TAG, "Couldn't invoke method.");
                        }
                    }
                }
            }
        }

        LOGGER.warn(TAG+": Subfield name: "+field.getName(), "Couldn't find expected annotation for the field, returning false by default");
        
        return false;
    }

    @Override
    public InputType getInputType() {

        return this.inputType;
    }

    /**
     * This method shouldn't be called externally on ComplexWebField(s).
     *
     * @param type
     */
    @Override
    public void setInputType(InputType type) {
        this.inputType = type;
    }

    /**
     * If one of the sub fields is required automatically parent field becomes
     * required. Better not touch this.
     *
     * @param arg
     */
    @Override
    public void setIsRequired(boolean arg) {

        this.isRequired = arg;
    }

    @Override
    public boolean getIsRequired() {
        
        return this.isRequired;
    }

    /**
     * Shouldn't be used externally, stays here for magicians.
     *
     * @param placeHolder
     */
    @Override
    public void setPlaceHolder(String placeHolder) {
        
        this.placeHolder = placeHolder;

    }

    @Override
    public String getPlaceHolder() {

        return this.placeHolder;
    }

    @Override
    public JsonObjectBuilder getJavaScriptObject() {
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        builder.add("name", this.getName());
        
        builder.add("placeholder",this.getPlaceHolder());
        
        builder.add("required", this.getIsRequired());
        
        builder.add("type", this.getInputType().getValue());
        
        JsonArrayBuilder fields = Json.createArrayBuilder();
        
        //LOGGER.debug("Size of fields of "+this.getName()+":"+this.getSubfields().size());
        for(WebField subField: this.getSubfields()){
        
            fields.add(subField.getJavaScriptObject());
        
        }
        builder.add("fields", fields);
        
        return builder;
        
    }

    @Override
    public String getName() {
        
       return this.fieldName;
    }

}
