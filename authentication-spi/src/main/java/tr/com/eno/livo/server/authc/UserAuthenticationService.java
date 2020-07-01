package tr.com.eno.livo.server.authc;

public interface UserAuthenticationService extends AuthenticationService {

    public static final String AUTHENTICATED_USER_EVENT_TOPIC = "tr/com/eno/livo/server/authentication/user/authenticated";

    /**
     * Authenticates current with given credentials.
     *
     * @param companyAuthToken
     * @param userPrincipal
     * @param userCredentials
     * @return token @{AuthenticationToken}
     * @throws SecurityException
     */
    public AuthenticationToken login(AuthenticationToken companyAuthToken,
            String userPrincipal, String userCredentials) throws SecurityException;
}
