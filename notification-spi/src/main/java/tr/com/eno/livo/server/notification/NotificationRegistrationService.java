package tr.com.eno.livo.server.notification;

import tr.com.eno.livo.server.authc.AuthenticationToken;

public interface NotificationRegistrationService {
    
    /**
     * Registers device with given appName for notification service.
     * @param token
     * @param appName
     * @param clientType
     * @param deviceId
     * @param nspToken 
     */
    public void registerDevice(AuthenticationToken token, String appName, String clientType, String deviceId,String nspToken);
   
    /**
     * Check device for registration.
     * @param token
     * @param appName
     * @param deviceId
     * @param clientType
     * @return 
     */
    public DeviceRegistrationInfo checkDeviceRegistration(AuthenticationToken token, String appName, String deviceId, String clientType);
    
    /**
     * Unregister device from notification service.
     * @param token
     * @param appName
     * @param deviceId
     * @param clientType
     * @return 
     */
    public boolean unregisterDevice(AuthenticationToken token,String appName,String deviceId,String clientType);
    
}
