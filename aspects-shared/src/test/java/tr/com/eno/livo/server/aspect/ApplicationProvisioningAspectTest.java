package tr.com.eno.livo.server.aspect;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.SortedSet;
import java.util.concurrent.Callable;
import org.apache.commons.lang3.RandomStringUtils;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventAdmin;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationAlreadyExistsException;
import tr.com.eno.livo.server.application.ApplicationDeploymentFailedException;
import tr.com.eno.livo.server.application.ApplicationNotFoundException;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.application.AuthorizationPolicy;
import tr.com.eno.livo.server.application.InvalidApplicationException;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

/**
 *
 * @author dacay
 */
@Test(groups = "application")
public class ApplicationProvisioningAspectTest {

    @Test
    public void testDeployApplication() throws Exception {
        
        String name = RandomStringUtils.random(10);
        String domain = RandomStringUtils.random(10);
        
        Application application = mock(Application.class);
        when(application.getName()).thenReturn(name);
        when(application.getDomain()).thenReturn(domain);

        EventAdmin eventAdmin = Mockito.mock(EventAdmin.class);
        
        ArgumentCaptor<Event> argument = new ArgumentCaptor<>();
        
        ApplicationService applicationService = new ApplicationServiceImpl(eventAdmin, new Callable() {

            @Override
            public Object call() throws Exception {
                
                return null;
            }
        });
        
        verifyZeroInteractions(eventAdmin);
        
        applicationService.deployApplication(application);
        
        verify(eventAdmin).sendEvent(argument.capture());
        
        Event event = argument.getValue();
        
        assertEquals(event.getTopic(), ApplicationService.APPLICATION_DEPLOYED_EVENT_TOPIC);
        
        assertTrue(Application.class.isInstance(event.getProperty("application")));
        
        Application eventApplication = (Application) event.getProperty("application");
        
        assertEquals(eventApplication.getName(), name);
        assertEquals(eventApplication.getDomain(), domain);
    }

    @Test(expectedExceptions = RuntimeException.class)
    public void testDeployApplicationWithMissingEventAdmin() throws Exception {

        ApplicationService applicationService = new ApplicationServiceImpl(null, new Callable() {

            @Override
            public Object call() throws Exception {
                
                return null;
            }
        });
        
        applicationService.deployApplication(mock(Application.class));
    }

    @Test(expectedExceptions = ApplicationDeploymentFailedException.class)
    public void testDeployApplicationWithDeploymentFailure() throws Exception {
        
        EventAdmin eventAdmin = Mockito.mock(EventAdmin.class);
        
        doThrow(SecurityException.class).when(eventAdmin).sendEvent(any(Event.class));

        ApplicationService applicationService = new ApplicationServiceImpl(eventAdmin, new Callable() {

            @Override
            public Object call() throws Exception {
                
                return null;
            }
        });
        
        applicationService.deployApplication(mock(Application.class));
    }

    private static class ApplicationServiceImpl implements ApplicationService {

        private final EventAdmin eventAdmin;
        private final Callable deployCallable;

        public ApplicationServiceImpl(EventAdmin eventAdmin, Callable deployCallable) {
            this.eventAdmin = eventAdmin;
            this.deployCallable = deployCallable;
        }

        @Override
        public void createApplication(Application application) throws ApplicationAlreadyExistsException, InvalidApplicationException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void deleteApplication(String domain, String applicationName) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void deployApplication(Application application) throws ApplicationNotFoundException, ApplicationDeploymentFailedException {

            try {
                
                deployCallable.call();
                
            } catch (Exception ex) {
                
                if (ex instanceof ApplicationNotFoundException) {
                    
                    throw (ApplicationNotFoundException) ex;
                    
                } else if (ex instanceof ApplicationDeploymentFailedException) {
                    
                    throw (ApplicationDeploymentFailedException) ex;
                    
                } else {
                    
                    throw new RuntimeException(ex);
                }
            }
        }

        @Override
        public List<Application> getApplicationHistory(String domain, String name, byte limit) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public SortedSet<Application> listApplications(String domain) {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public Application loadApplication(String domain, String name) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void saveApplication(Application application) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void authorizeUsers(String domain, String name, User... users) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void deauthorizeUsers(String domain, String name, User... users) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void authorizeGroups(String domain, String name, UserGroup... groups) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void deauthorizeGroups(String domain, String name, UserGroup... groups) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void setAuthorizationPolicy(String domain, String name, AuthorizationPolicy policy) throws ApplicationNotFoundException {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        /**
         * @return the eventAdmin
         */
        public EventAdmin getEventAdmin() {
            return eventAdmin;
        }
    }
}
