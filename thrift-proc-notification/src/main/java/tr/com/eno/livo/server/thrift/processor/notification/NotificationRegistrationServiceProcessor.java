package tr.com.eno.livo.server.thrift.processor.notification;

//import com.codahale.metrics.MetricRegistry;
//import com.codahale.metrics.Timer;
import java.util.Date;
import java.util.Map;
import org.apache.thrift.TException;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.thrift.notification.DeviceRegistrationFailedError;
import tr.com.eno.livo.thrift.notification.DeviceRegistrationInfo;
import tr.com.eno.livo.server.notification.NotificationRegistrationService;
import tr.com.eno.livo.thrift.notification.NotificationRegistrationService.Iface;
import tr.com.eno.livo.thrift.shared.AuthenticationToken;

public class NotificationRegistrationServiceProcessor extends tr.com.eno.livo.thrift.notification.NotificationRegistrationService.Processor<Iface> {

    private static final AsyncIfaceImpl iface = new AsyncIfaceImpl();
    private final static Logger LOGGER = LoggerFactory.getLogger(NotificationRegistrationServiceProcessor.class);
//    private static Timer registerDeviceTotalResponseTime;
//    private static Timer checkDeviceRegistrationTotalResponseTime;
//    private static Timer unregisterDeviceTotalResponseTime;
//    private static MetricRegistry metrics;

    public NotificationRegistrationServiceProcessor() {
        super(iface);

    }

    protected void registerService(NotificationRegistrationService service, Map<String, Object> config) {

        iface.registerService(config.get(Constants.SERVICE_PID).toString(), service);

    }

    protected void unregisterService(NotificationRegistrationService service, Map<String, Object> config) {

        iface.unregisterService(config.get(Constants.SERVICE_PID).toString(), service);

    }

//    protected void registerMetrics(MetricRegistry metrics) {
//
//        LOGGER.debug("Registering metric registry...");
//
//        NotificationRegistrationServiceProcessor.metrics = metrics;
//
//        LOGGER.debug("Creating timers...");
//
//        NotificationRegistrationServiceProcessor.registerDeviceTotalResponseTime = metrics.timer("thrift.registerDevice.total.responseTimes");
//        NotificationRegistrationServiceProcessor.checkDeviceRegistrationTotalResponseTime = metrics.timer("thrift.checkDeviceRegistration.total.responseTimes");
//        NotificationRegistrationServiceProcessor.unregisterDeviceTotalResponseTime = metrics.timer("thrift.unregisterDevice.total.responseTimes");
//    }
//
//    protected void unregisterMetrics() {
//
//        LOGGER.debug("Unregistering metric registry...");
//
//        NotificationRegistrationServiceProcessor.metrics = null;
//    }
    private static class AsyncIfaceImpl implements Iface {

        //Its coded for multiple registration area but for now there is one service implementation.
        NotificationRegistrationService service;

        protected void registerService(String name, NotificationRegistrationService service) {

            LOGGER.debug("Registering service with the name '{}'", name);

            this.service = service;
        }

        protected void unregisterService(String name, NotificationRegistrationService service) {

            this.service = null;
        }

        @Override
        public void registerDevice(AuthenticationToken token, String appName, String clientType, String deviceId, String nspToken) throws DeviceRegistrationFailedError, TException {

            try {
                this.service.registerDevice(new tr.com.eno.livo.server.authc.AuthenticationToken(
                        token.getCompanyId(), token.getUserPrincipal(), null, token.getUserDomain(),
                        token.getUniqueValue(), new Date(token.getAuthenticationTime()),
                        new Date(token.getExpirationTime())), appName, clientType, deviceId, nspToken);
            } catch (Exception ex) {

                LOGGER.error("Error during device registration '{}'", ex);

                throw new DeviceRegistrationFailedError(ex.getMessage());
            }
        }

        @Override
        public DeviceRegistrationInfo checkDeviceRegistration(AuthenticationToken token, String appName, String deviceId, String clientType) throws TException {

            tr.com.eno.livo.server.notification.DeviceRegistrationInfo info = this.service.checkDeviceRegistration(new tr.com.eno.livo.server.authc.AuthenticationToken(
                    token.getCompanyId(), token.getUserPrincipal(), null, token.getUserDomain(),
                    token.getUniqueValue(), new Date(token.getAuthenticationTime()),
                    new Date(token.getExpirationTime())), appName, deviceId, clientType);

            DeviceRegistrationInfo tInfo = new DeviceRegistrationInfo();
            tInfo.setRegistered(info.isRegistered());
            tInfo.setNspToken(info.getNspToken());
            tInfo.setSenderIdentifier(info.getSenderIdentifier());

            return tInfo;
        }

        @Override
        public boolean unregisterDevice(AuthenticationToken token, String appName, String deviceId, String clientType) throws TException {

            return this.service.unregisterDevice(new tr.com.eno.livo.server.authc.AuthenticationToken(
                    token.getCompanyId(), token.getUserPrincipal(), null, token.getUserDomain(),
                    token.getUniqueValue(), new Date(token.getAuthenticationTime()),
                    new Date(token.getExpirationTime())), appName, deviceId, clientType);
        }
    }
}
