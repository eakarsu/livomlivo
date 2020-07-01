package tr.com.eno.livo.server.thrift.processor.authc;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import org.apache.thrift.TException;
import org.osgi.framework.Constants;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationService;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.DeviceAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;
import tr.com.eno.livo.thrift.authc.AuthenticationService.Iface;
import tr.com.eno.livo.thrift.authc.CompanyAuthenticationResult;
import tr.com.eno.livo.thrift.authc.DeviceAuthenticationResult;
import tr.com.eno.livo.thrift.authc.UserAuthenticationResult;
import tr.com.eno.livo.thrift.shared.AuthenticationToken;

public class AuthenticationServiceProcessor extends
        tr.com.eno.livo.thrift.authc.AuthenticationService.Processor<Iface> {

    private static final AsyncIfaceImpl iface = new AsyncIfaceImpl();
    private static final Logger LOGGER = LoggerFactory
            .getLogger(AuthenticationServiceProcessor.class);
    private static Timer companyAuthenticationTotalResponseTime;
    private static Timer userAuthenticationTotalResponseTime;
    private static Timer deviceAuthenticationTotalResponseTime;
    private static MetricRegistry metrics;

    public AuthenticationServiceProcessor() {
        super(iface);

        LOGGER.debug("Initialized an {} instance.",
                AuthenticationServiceProcessor.class.getSimpleName());
    }

    protected void registerService(CompanyAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        // Ignore internal services
        if (serviceProps.containsKey("service.internal")
                && (Boolean) serviceProps.get("service.internal")) {
            return;
        }

        LOGGER.debug(
                "Registering the CompanyAuthenticationService instance with the name '{}' to the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.registerService(pid, service);
    }

    protected void registerService(EventAdmin eventAdmin) {

        LOGGER.debug("Registering EventAdmin instance...");

        iface.eventAdmin = eventAdmin;
    }

    protected void registerService(DeviceAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        LOGGER.debug(
                "Registering the DeviceAuthenticationService instance with the name '{}' to the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.registerService(pid, service);
    }

    protected void registerService(UserAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        LOGGER.debug(
                "Registering the UserAuthenticationService instance with the name '{}' to the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.registerService(pid, service);
    }

    protected void unregisterService(CompanyAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        LOGGER.debug(
                "Unregistering the CompanyAuthenticationService instance with the name '{}' from the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.unregisterService(pid, service);
    }

    protected void unregisterService(EventAdmin eventAdmin) {

        LOGGER.debug("Unregistering EventAdmin instance...");

        iface.eventAdmin = null;
    }

    protected void unregisterService(UserAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        LOGGER.debug(
                "Unregistering the UserAuthenticationService instance with the name '{}' from the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.unregisterService(pid, service);
    }

    protected void unregisterService(DeviceAuthenticationService service,
            Map<String, Object> serviceProps) {

        // Get the service PID
        String pid = serviceProps.get(Constants.SERVICE_PID).toString();

        LOGGER.debug(
                "Unregistering the DeviceAuthenticationService instance with the name '{}' from the Thrift processor adaptor...",
                pid);

        // Register the service
        iface.unregisterService(pid, service);
    }

    protected void registerMetrics(MetricRegistry metrics) {

        LOGGER.debug("Registering metric registry...");

        AuthenticationServiceProcessor.metrics = metrics;

        LOGGER.debug("Creating timers...");

        AuthenticationServiceProcessor.companyAuthenticationTotalResponseTime = metrics.timer("thrift.companyAuthentication.total.responseTimes");
        AuthenticationServiceProcessor.userAuthenticationTotalResponseTime = metrics.timer("thrift.userAuthentication.total.responseTimes");
        AuthenticationServiceProcessor.deviceAuthenticationTotalResponseTime = metrics.timer("thrift.deviceAuthentication.total.responseTimes");
    }

    protected void unregisterMetrics() {

        LOGGER.debug("Unregistering metric registry...");

        AuthenticationServiceProcessor.metrics = null;
    }

    private static class AsyncIfaceImpl implements Iface {

        private final Map<String, CompanyAuthenticationService> companyAuthcServices;
        private final Map<String, String> tokenSources;
        private final Map<String, UserAuthenticationService> userAuthcServices;
        private final Map<String, DeviceAuthenticationService> deviceAuthcServices;
        private final Map<String, String> userDomains;
        private EventAdmin eventAdmin;

        public AsyncIfaceImpl() {

            this.userAuthcServices = new LinkedHashMap<>();
            this.companyAuthcServices = new LinkedHashMap<>();
            this.deviceAuthcServices = new LinkedHashMap<>();
            this.tokenSources = new LinkedHashMap<>();
            this.userDomains = new HashMap<>();
        }

        @Override
        public CompanyAuthenticationResult authenticateCompany(
                String companyId, String companySecret) throws TException {

            Timer.Context totalTime = companyAuthenticationTotalResponseTime.time();

            LOGGER.debug(
                    "Attempting to authenticate the company with the ID '{}'...",
                    companyId);

            // Create the result object
            CompanyAuthenticationResult result = new CompanyAuthenticationResult(
                    false, companyId);

            synchronized (this.companyAuthcServices) {

                // Iterate through the company authentication services
                for (String serviceName : this.companyAuthcServices.keySet()) {

                    Timer.Context time = metrics.timer(MetricRegistry.name("thrift.companyAuthentication", this.prepareServiceTimerName(serviceName), "responseTimes")).time();

                    try {

                        // Get the authentication service object
                        CompanyAuthenticationService service = this.companyAuthcServices
                                .get(serviceName);

                        // Attempt to authenticate
                        tr.com.eno.livo.server.authc.AuthenticationToken token = service
                                .login(companyId, companySecret);

                        LOGGER.debug(
                                "Authentication was successful with the CompanyAuthenticationService named '{}'.",
                                serviceName);

                        // Authentication is successful
                        AuthenticationToken resultToken = new AuthenticationToken(
                                token.getUniqueValue(), token.getCompanyId(),
                                token.getAuthenticationTime().getTime());
                        resultToken.setExpirationTime(token.getExpirationTime()
                                .getTime());
                        result.setAuthenticationToken(resultToken);
                        result.setSuccess(true);

                        // Associate the token with the service name
                        synchronized (this.tokenSources) {

                            this.tokenSources.put(token.getUniqueValue(),
                                    serviceName);
                        }

                        // Fire the company authentication event
                        fireCompanyAuthenticationEvent(token);

                        if (time != null) {
                            time.stop();
                        }

                        // Break the loop
                        break;

                    } catch (Exception e) {

                        LOGGER.debug(
                                "Authentication failed with the CompanyAuthenticationService named '{}'; will try the next service.'",
                                serviceName);

                        if (time != null) {
                            time.stop();
                        }
                    }
                }
            }

            totalTime.stop();

            // Return the result object
            return result;
        }

        @Override
        public UserAuthenticationResult authenticateUser(
                AuthenticationToken companyAuthenticationToken,
                String userPrincipal, String userCredentials) throws TException {

            Timer.Context totalTime = userAuthenticationTotalResponseTime.time();

            LOGGER.debug(
                    "Attempting to authenticate the user with the principal '{}'...",
                    userPrincipal);

            // Create the result object
            UserAuthenticationResult result = new UserAuthenticationResult(
                    false, userPrincipal);

            synchronized (this.userAuthcServices) {

                // Iterate through the company authentication services
                for (String serviceName : this.userAuthcServices.keySet()) {

                    Timer.Context time = metrics.timer(MetricRegistry.name("thrift.userAuthentication", this.prepareServiceTimerName(serviceName), "responseTimes")).time();

                    try {

                        // Get the authentication service object
                        UserAuthenticationService service = this.userAuthcServices
                                .get(serviceName);

                        // Attempt to authenticate
                        // TODO Fix this, we are passing userPrincipal as the
                        // companyId !!!!
                        tr.com.eno.livo.server.authc.AuthenticationToken token = service
                                .login(new tr.com.eno.livo.server.authc.AuthenticationToken(
                                                companyAuthenticationToken
                                                .getCompanyId(), null, null, null,
                                                companyAuthenticationToken
                                                .getUniqueValue(),
                                                new Date(companyAuthenticationToken
                                                        .getAuthenticationTime()),
                                                new Date(companyAuthenticationToken
                                                        .getExpirationTime())),
                                        userPrincipal, userCredentials);

                        LOGGER.debug(
                                "Authentication was successful with the UserAuthenticationService named '{}'.",
                                serviceName);

                        // Authentication is successful
                        AuthenticationToken resultToken = new AuthenticationToken(
                                token.getUniqueValue(), token.getCompanyId(),
                                token.getAuthenticationTime().getTime());
                        resultToken.setUserPrincipal(token.getUserPrincipal());
                        result.setAuthenticationToken(resultToken);
                        result.setSuccess(true);

                        // Associate user's domain with the token
                        synchronized (this.userDomains) {

                            this.userDomains.put(token.getUniqueValue(), token.getUserDomain());
                        }

                        // Associate the token with the service name
                        synchronized (this.tokenSources) {

                            this.tokenSources.put(token.getUniqueValue(),
                                    serviceName);
                        }

                        // Fire the user authentication event
                        fireUserAuthenticationEvent(token);

                        if (time != null) {
                            time.stop();
                        }

                        // Break the loop
                        break;

                    } catch (Exception e) {

                        LOGGER.debug(
                                "Authentication failed with the UserAuthenticationService named '{}'; will try the next service.'",
                                serviceName);

                        if (time != null) {
                            time.stop();
                        }
                    }
                }
            }

            totalTime.stop();

            // Return the result object
            return result;
        }

        @Override
        public DeviceAuthenticationResult authenticateDevice(AuthenticationToken userAuthenticationToken, String deviceId) throws TException {

            Timer.Context totalTime = deviceAuthenticationTotalResponseTime.time();

            LOGGER.debug(
                    "Attempting to authenticate the device with the id '{}'...",
                    deviceId);

            // Create the result object
            DeviceAuthenticationResult result = new DeviceAuthenticationResult(
                    false, deviceId);

            synchronized (this.deviceAuthcServices) {

                // Iterate through the device authentication services
                for (String serviceName : this.deviceAuthcServices.keySet()) {

                    Timer.Context time = metrics.timer(MetricRegistry.name("thrift.deviceAuthentication", this.prepareServiceTimerName(serviceName), "responseTimes")).time();

                    try {

                        // Get the authentication service object
                        DeviceAuthenticationService service = this.deviceAuthcServices
                                .get(serviceName);

                        // Get the token's domain
                        String userDomain;
                        synchronized (this.userDomains) {

                            userDomain = this.userDomains.get(userAuthenticationToken.getUniqueValue());
                        }

                        tr.com.eno.livo.server.authc.AuthenticationToken token = service
                                .login(new tr.com.eno.livo.server.authc.AuthenticationToken(
                                                userAuthenticationToken
                                                .getCompanyId(), userAuthenticationToken.getUserPrincipal(),
                                                null,
                                                userDomain,
                                                userAuthenticationToken
                                                .getUniqueValue(),
                                                new Date(userAuthenticationToken
                                                        .getAuthenticationTime()),
                                                new Date(userAuthenticationToken
                                                        .getExpirationTime())),
                                        deviceId);

                        LOGGER.debug(
                                "Authentication was successful with the DeviceAuthenticationService named '{}'.",
                                serviceName);

                        // Authentication is successful
                        AuthenticationToken resultToken = new AuthenticationToken(
                                token.getUniqueValue(), token.getCompanyId(),
                                token.getAuthenticationTime().getTime());
                        resultToken.setUserPrincipal(token.getUserPrincipal());
                        result.setAuthenticationToken(resultToken);
                        result.setDeviceId(deviceId);
                        result.setSuccess(true);

                        // Associate the token with the service name
                        synchronized (this.tokenSources) {

                            this.tokenSources.put(token.getUniqueValue(),
                                    serviceName);
                        }

                        if (time != null) {
                            time.stop();
                        }

                        // Fire the device authentication event
                        //fireDeviceAuthenticationEvent(token);
                        // Break the loop
                        break;

                    } catch (Exception e) {

                        LOGGER.debug(
                                "Authentication failed with the DeviceAuthenticationService named '{}'; will try the next service.'",
                                serviceName);

                        if (time != null) {
                            time.stop();
                        }
                    }

                }
            }

            totalTime.stop();

            // Return the result object
            return result;
        }

        @Override
        public void deauthenticate(AuthenticationToken token) throws TException {

            // Get the source service name
            String sourceService;
            synchronized (this.tokenSources) {

                sourceService = this.tokenSources.get(token.getUniqueValue());
            }

            if (sourceService == null) {

                LOGGER.debug("Failed to find the source service name for the token with unique value '{}'; ignoring...");

                return;
            }

            LOGGER.debug(
                    "Source service named '{}' for the token with unique value '{}' retrieved.",
                    sourceService, token.getUniqueValue());

            // Get the source service object if available
            AuthenticationService service;

            synchronized (this.userAuthcServices) {

                service = this.userAuthcServices.get(sourceService);
                
                this.userAuthcServices.remove(sourceService);
            }

            if (service == null) {
                
                synchronized (this.companyAuthcServices) {

                    service = this.companyAuthcServices.get(sourceService);
                    
                    this.companyAuthcServices.remove(sourceService);
                }
            }

            // Sanity check for service
            if (service == null) {

                LOGGER.debug("Failed to find the source service instance for the token with unique value '{}'; ignoring...");

                return;
            }

            // Get the token's domain
            String userDomain;
            synchronized (this.userDomains) {

                userDomain = this.userDomains.get(token.getUniqueValue());
                
                this.userDomains.remove(token.getUniqueValue());
            }

            // Deauthenticate the token
            service.logout(new tr.com.eno.livo.server.authc.AuthenticationToken(
                    token.getCompanyId(), token.getUserPrincipal(), null, userDomain, token
                    .getUniqueValue(), new Date(token
                            .getAuthenticationTime()), new Date(token
                            .getExpirationTime())));
        }

        private void fireCompanyAuthenticationEvent(
                tr.com.eno.livo.server.authc.AuthenticationToken token) {

            if (this.eventAdmin == null) {

                LOGGER.warn("Ignoring company authentication event because EventAdmin instance is not registered.");

                return;
            }

            Map<String, Object> eventProperties = new HashMap<String, Object>();
            eventProperties.put("authenticationToken", token);

            LOGGER.debug(
                    "Posting event for authentication of company ID '{}'...",
                    token.getCompanyId());

            this.eventAdmin
                    .postEvent(new Event(
                                    CompanyAuthenticationService.AUTHENTICATED_COMPANY_EVENT_TOPIC,
                                    eventProperties));
        }

        private void fireUserAuthenticationEvent(
                tr.com.eno.livo.server.authc.AuthenticationToken token) {

            if (this.eventAdmin == null) {

                LOGGER.warn("Ignoring company authentication event because EventAdmin instance is not registered.");

                return;
            }

            Map<String, Object> eventProperties = new HashMap<String, Object>();
            eventProperties.put("authenticationToken", token);

            LOGGER.debug(
                    "Posting event for authentication of user principal '{}'...",
                    token.getUserPrincipal());

            this.eventAdmin.postEvent(new Event(
                    UserAuthenticationService.AUTHENTICATED_USER_EVENT_TOPIC,
                    eventProperties));
        }

        //TODO deviceauthenticationevent in case of later usage.
//        private void fireDeviceAuthenticationEvent(
//                tr.com.eno.livo.server.authc.AuthenticationToken token) {
//
//            if (this.eventAdmin == null) {
//
//                LOGGER.warn("Ignoring device authentication event because EventAdmin instance is not registered.");
//
//                return;
//            }
//
//            Map<String, Object> eventProperties = new HashMap<String, Object>();
//            eventProperties.put("authenticationToken", token);
//
//            LOGGER.debug(
//                    "Posting event for authentication of user principal '{}'...",
//                    token.getUserPrincipal());
//
//            this.eventAdmin.postEvent(new Event(
//                    DeviceAuthenticationService.AUTHENTICATED_DEVICE_EVENT_TOPIC,
//                    eventProperties));
//        }
        private void registerService(String name,
                CompanyAuthenticationService service) {

            synchronized (this.companyAuthcServices) {

                this.companyAuthcServices.put(name, service);
            }
        }

        private void registerService(String name,
                UserAuthenticationService service) {

            synchronized (this.userAuthcServices) {

                this.userAuthcServices.put(name, service);
            }
        }

        private void registerService(String name,
                DeviceAuthenticationService service) {

            synchronized (this.deviceAuthcServices) {

                this.deviceAuthcServices.put(name, service);
            }
        }

        private void unregisterService(String name,
                CompanyAuthenticationService service) {

            synchronized (this.companyAuthcServices) {

                this.companyAuthcServices.remove(name);
            }
        }

        private void unregisterService(String name,
                UserAuthenticationService service) {

            synchronized (this.userAuthcServices) {

                this.userAuthcServices.remove(name);
            }
        }

        private void unregisterService(String name,
                DeviceAuthenticationService service) {

            synchronized (this.deviceAuthcServices) {

                this.deviceAuthcServices.remove(name);
            }
        }

        private String prepareServiceTimerName(String pid) {

            String[] pidParts = pid.split("\\.");

            String lastPart = pidParts.length == 0 ? pidParts[0] : pidParts[pidParts.length - 1];

            return lastPart.replaceFirst(Character.toString(lastPart.charAt(0)), Character.toString(lastPart.charAt(0)).toLowerCase(Locale.ENGLISH));
        }
    }
}
