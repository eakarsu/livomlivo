package tr.com.eno.livo.serviceobjects.rest.description;

public class Parameter {

    private String name;
    private String value;
    private boolean required;
    private ParameterType type;
    private String fieldName;
    private boolean hidden;

    public Parameter() {
    }

    public Parameter(String name, String value, boolean required, ParameterType type, String fieldName, boolean hidden) {
        this.name = name;
        this.value = value;
        this.required = required;
        this.type = type;
        this.fieldName = fieldName;
        this.hidden = hidden;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the value
     */
    public String getValue() {
        return value;
    }

    /**
     * @param value the value to set
     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * @return the required
     */
    public boolean isRequired() {
        return required;
    }

    /**
     * @param required the required to set
     */
    public void setRequired(boolean required) {
        this.required = required;
    }

    /**
     * @return the type
     */
    public ParameterType getType() {
        return type;
    }

    /**
     * @param type the type to set
     */
    public void setType(ParameterType type) {
        this.type = type;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }
}
