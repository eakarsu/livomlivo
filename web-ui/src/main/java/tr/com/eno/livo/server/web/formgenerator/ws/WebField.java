
package tr.com.eno.livo.server.web.formgenerator.ws;

import javax.json.JsonObjectBuilder;

public interface WebField  {
    
    /**
     * Returns field name.
     * @return 
     */
    public String getName();
    
    /**
     * Gets the type of field that will be setted as HTML input.
     * @return input type of the field.
     */
    public InputType getInputType();
   
    /**
     * Sets type of the field, user must be sure about what they are doing in
     * order not the service to complain.
     * @param type 
     */
    public void setInputType(InputType type);
    
    /**
     * Sets the field as required.
     * @param arg 
     */
    public void setIsRequired(boolean arg);
    
    /**
     * Default is false if not set before.
     * @return 
     */
    public boolean getIsRequired();
    
    /**
     * Sets place holder of the field.
     * @param placeHolder 
     */
    public void setPlaceHolder(String placeHolder);
  
    /**
     * Place holder String, the value of later usage of label or input place holder.
     * @return 
     */
    public String getPlaceHolder();
    
   /**
    * Returns json representation of the WebField.
    * @return 
    */
    public JsonObjectBuilder getJavaScriptObject();

}
