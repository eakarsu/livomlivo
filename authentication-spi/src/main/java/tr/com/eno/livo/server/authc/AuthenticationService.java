package tr.com.eno.livo.server.authc;

public interface AuthenticationService {

	public void logout(AuthenticationToken token) throws SecurityException;
}
