package tr.com.eno.livo.serviceobjects.rest.description;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class Operation {
 
    private String name;
    private String path;
    private HttpMethod method;
    private Authentication authentication;
    private Set<Parameter> parameters;

    public Operation() {
    }

    public Operation(String name, String path, HttpMethod method, Authentication authentication, Parameter... parameters) {
        this.name = name;
        this.path = path;
        this.method = method;
        this.authentication = authentication;
        this.parameters = new HashSet<>(Arrays.asList(parameters));
    }

    public Operation(String name, String path, HttpMethod method, Parameter... parameters) {
        this.name = name;
        this.path = path;
        this.method = method;
        this.parameters = new HashSet<>(Arrays.asList(parameters));
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
     * @return the method
     */
    public HttpMethod getMethod() {
        return method;
    }

    /**
     * @param method the method to set
     */
    public void setMethod(HttpMethod method) {
        this.method = method;
    }

    /**
     * @return the authentication
     */
    public Authentication getAuthentication() {
        return authentication;
    }

    /**
     * @param authentication the authentication to set
     */
    public void setAuthentication(Authentication authentication) {
        this.authentication = authentication;
    }

    /**
     * @return the parameters
     */
    public Set<Parameter> getParameters() {
        return parameters;
    }

    /**
     * @param parameters the parameters to set
     */
    public void setParameters(Set<Parameter> parameters) {
        this.parameters = parameters;
    }

    /**
     * @return the path
     */
    public String getPath() {
        return path;
    }

    /**
     * @param path the path to set
     */
    public void setPath(String path) {
        this.path = path;
    }
}
