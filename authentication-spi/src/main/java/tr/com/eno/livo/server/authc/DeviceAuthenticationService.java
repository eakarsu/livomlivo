package tr.com.eno.livo.server.authc;

public interface DeviceAuthenticationService extends AuthenticationService {
    
    public AuthenticationToken login(AuthenticationToken userAuthToken,
            String deviceId) throws SecurityException;
}
