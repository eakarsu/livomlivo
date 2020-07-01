package tr.com.eno.livo.server.authc.dummy;

import java.util.Date;
import java.util.UUID;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class DummyUserAuthenticationService implements
		UserAuthenticationService {

	@Override
	public AuthenticationToken login(AuthenticationToken companyAuthToken,
			String id, String secret) throws SecurityException {

		if (id.equals(secret))
			return new AuthenticationToken(companyAuthToken.getCompanyId(), id, null,
					"System", UUID.randomUUID().toString(), new Date(), new Date(0));
		else
			throw new SecurityException("Authentication failed!");
	}

	@Override
	public void logout(AuthenticationToken token) throws SecurityException {
	}
}
