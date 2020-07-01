package tr.com.eno.livo.server.web.formgenerator.ws;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.xml.bind.annotation.XmlElement;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.jaxws.endpoint.dynamic.JaxWsDynamicClientFactory;
import org.apache.cxf.service.model.BindingOperationInfo;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WSInspector {

    private static final Logger LOGGER = LoggerFactory.getLogger(WSInspector.class);
    
    private static final String TAG="WSInspector";
    
    private static final String SERVICEOBJECT_NAME = "WSServiceObject";

    private final String wsdlUrl;

    private final String serviceName;

    private final Client client;
    
    private Map<String, Pair<Class, List<WebField>>> operationTypes;

    public  Map<String, Pair<Class, List<WebField>>> getOperationTypes() {

        return this.operationTypes;
    }
    
    /**
     * Classes stands there in case of necessity of later usage.
     * @param types 
     */
    public void setOperationTypes(Map<String, Pair<Class, List<WebField>>> types){
    
        this.operationTypes = types;
    }

    public final String getMWServiceName() {

        return this.serviceName;
    }

    public WSInspector(String wsdlUrl, String serviceName) throws RuntimeException {

        if (wsdlUrl == null || serviceName == null) {

            throw new RuntimeException("wsdl url or service name can not be null.");
        }

        Locale.setDefault(Locale.ENGLISH);

        operationTypes = new HashMap<>();
        
        this.wsdlUrl = wsdlUrl;

        this.serviceName = MessageFormat.format("{0}-{1}", SERVICEOBJECT_NAME, serviceName);

        JaxWsDynamicClientFactory clientFactory = JaxWsDynamicClientFactory.newInstance();

        this.client = clientFactory.createClient(wsdlUrl, getClass().getClassLoader());

        for (BindingOperationInfo info : this.client.getEndpoint().getBinding().getBindingInfo().getOperations()) {

            MutablePair<Class, List<WebField>> pair = new MutablePair<>();

            LOGGER.debug("");
            pair.setLeft(info.getInput().getMessageParts().get(0).getTypeClass());

            List<WebField> fields = new LinkedList<>();
            
            for (Field f : info.getInput().getMessageParts().get(0).getTypeClass().getDeclaredFields()) {

                if(new DataType().getInputType(f.getType())==InputType.SERVICETYPE){
                
                    LOGGER.debug("Adding complex field with name '{}'",f.getName());
                    fields.add(new ComplexWebField(f));                  
                }
                else{
                    
                    LOGGER.debug("Adding simple field with name '{}'",f.getName());
                    fields.add(new SimpleWebField(f,this.isFieldRequired(f),new DataType().getInputType(f.getType())));
                
                
                }
            }

            pair.setRight(fields);

            this.operationTypes.put(info.getName().getLocalPart(), pair);
        }

    }

    private boolean isFieldRequired(Field field){
        
        for(Annotation a : field.getDeclaredAnnotations())
        
        if(a.annotationType().getSimpleName().equals(XmlElement.class.getSimpleName())){
             
            for(Method m:a.annotationType().getDeclaredMethods()){
                
                if(m.getName().equals("required")){
                
                    try {
                        return (boolean)m.invoke(a, (Object[])null);
                    } catch (IllegalAccessException ex) {
                        LOGGER.warn(TAG,"Counldn't access method of XmlElement");
                    } catch (IllegalArgumentException ex) {
                        LOGGER.warn(TAG," Interestingly method is unhappy with the argument given.");
                    } catch (InvocationTargetException ex) {
                        LOGGER.warn(TAG,"Couldn't invoke method.");
                    }
                }
            }        
        }
        
        LOGGER.warn(TAG,"Couldn't find expected annotation for the field, returning false");
        return false;
    }
}
