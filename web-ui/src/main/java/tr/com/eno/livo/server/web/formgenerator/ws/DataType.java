package tr.com.eno.livo.server.web.formgenerator.ws;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import javax.xml.datatype.Duration;
import javax.xml.datatype.XMLGregorianCalendar;

/**
 *
 * @author Beyhan
 */
   public class DataType {

        private  final Map<String,InputType> inputClassMap = new HashMap<>();

        public DataType() {


            this.inputClassMap.put(Object.class.getSimpleName(),InputType.TEXT);
            this.inputClassMap.put(String.class.getSimpleName(),InputType.TEXT);
            this.inputClassMap.put(byte[].class.getSimpleName(),InputType.TEXT);
            this.inputClassMap.put(boolean.class.getSimpleName(),InputType.BOOLEAN);
            this.inputClassMap.put(byte.class.getSimpleName(),InputType.BYTE);
            this.inputClassMap.put(XMLGregorianCalendar.class.getSimpleName(),InputType.DURATION);
            this.inputClassMap.put(java.util.Date.class.getSimpleName(),InputType.DATE);
            this.inputClassMap.put(BigDecimal.class.getSimpleName(),InputType.NUMBER);
            this.inputClassMap.put(double.class.getSimpleName(),InputType.DOUBLE);
            this.inputClassMap.put(Duration.class.getSimpleName(),InputType.DURATION);
            this.inputClassMap.put(float.class.getSimpleName(),InputType.DOUBLE);
            this.inputClassMap.put(int.class.getSimpleName(),InputType.INT);
            this.inputClassMap.put(BigInteger.class.getSimpleName(),InputType.INT);
            this.inputClassMap.put(long.class.getSimpleName(),InputType.LONG);
            this.inputClassMap.put(short.class.getSimpleName(),InputType.SHORT);

        }

        /**
         * In case of necessity.
         * @param clazz Field's class type
         * @param type 
         */
        public  void insertBeforeGetType(Class clazz, InputType type){
        
            this.inputClassMap.put(clazz.getSimpleName(), type);            
        }
        
        public  InputType getInputType(Class clazz) {
       
            if(this.inputClassMap.get(clazz.getSimpleName())==null)
                return InputType.SERVICETYPE;
            else return this.inputClassMap.get(clazz.getSimpleName());
        }
    }
