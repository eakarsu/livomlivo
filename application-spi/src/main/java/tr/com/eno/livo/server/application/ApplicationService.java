package tr.com.eno.livo.server.application;

import java.util.List;
import java.util.SortedSet;
import javax.management.MXBean;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

@MXBean
public interface ApplicationService {

    public static final String APPLICATION_DELETED_EVENT_TOPIC = "tr/com/eno/livo/server/application/deleted";
    public static final String APPLICATION_DEPLOYED_EVENT_TOPIC = "tr/com/eno/livo/server/application/deployed";
    public static final String APPLICATION_SAVED_EVENT_TOPIC = "tr/com/eno/livo/server/application/saved";

    public void createApplication(Application application) throws ApplicationAlreadyExistsException, InvalidApplicationException;

    /**
     * Deletes selected application.
     *
     * @param domain
     * @param applicationName Name of the application
     */
    public void deleteApplication(String domain,
            String applicationName) throws ApplicationNotFoundException;

    /**
     * Saves and deploys application to client devices.
     *
     * @param application Application {@link Application}
     */
    public void deployApplication(Application application) throws ApplicationNotFoundException, ApplicationDeploymentFailedException;

    /**
     * Returns the application's previous versions as application objects sorted
     * ascending (newest first), with an optional limit that limits the number
     * of results ascending (newest top 'limit' application objects). Note that
     * setting limit to -1 means there is no limit.
     *
     * @param domain
     * @param name Name of application
     * @param limit History limit
     * @return history of the application as list
     */
    public List<Application> getApplicationHistory(String domain, String name, byte limit) throws ApplicationNotFoundException;

    /**
     * Lists applications of the company.
     *
     * @param domain
     * @return Set of applications
     */
    public SortedSet<Application> listApplications(String domain);

    /**
     * Loads the application.
     *
     * @param domain
     * @param name Name of the application
     * @return Application
     * @throws tr.com.eno.livo.server.application.ApplicationNotFoundException
     */
    public Application loadApplication(String domain, String name) throws ApplicationNotFoundException;

    /**
     * Saves the application but DOES NOT deploys it to the client devices.
     *
     * @param application {@link Application}
     */
    public void saveApplication(Application application) throws ApplicationNotFoundException;
    
    public void authorizeUsers(String domain, String name, User... users) throws ApplicationNotFoundException;
    
    public void deauthorizeUsers(String domain, String name, User... users) throws ApplicationNotFoundException;
    
    public void authorizeGroups(String domain, String name, UserGroup... groups) throws ApplicationNotFoundException;
    
    public void deauthorizeGroups(String domain, String name, UserGroup... groups) throws ApplicationNotFoundException;
    
    public void setAuthorizationPolicy(String domain, String name, AuthorizationPolicy policy) throws ApplicationNotFoundException;
}
