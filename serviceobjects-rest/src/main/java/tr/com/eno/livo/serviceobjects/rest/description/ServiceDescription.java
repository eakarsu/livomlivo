package tr.com.eno.livo.serviceobjects.rest.description;

import java.util.HashSet;
import java.util.Set;

public class ServiceDescription {
    
    private String name;
    private String baseUrl;
    private Set<Operation> operations = new HashSet<>();
    private Set<Header> defaultHeaders = new HashSet<>();
    private Authentication authentication;

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
     * @return the baseUrl
     */
    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * @param baseUrl the baseUrl to set
     */
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * @return the operations
     */
    public Set<Operation> getOperations() {
        return operations;
    }

    /**
     * @param operations the operations to set
     */
    public void setOperations(Set<Operation> operations) {
        this.operations = operations;
    }

    /**
     * @return the defaultHeaders
     */
    public Set<Header> getDefaultHeaders() {
        return defaultHeaders;
    }

    /**
     * @param defaultHeaders the defaultHeaders to set
     */
    public void setDefaultHeaders(Set<Header> defaultHeaders) {
        this.defaultHeaders = defaultHeaders;
    }
}
