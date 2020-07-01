package tr.com.eno.livo.server.authc.dummy;

import java.util.Calendar;
import java.util.Date;
import java.util.UUID;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;

public class DummyCompanyAuthenticationService implements
		CompanyAuthenticationService {

	@Override
	public AuthenticationToken login(String companyId, String companySecret)
			throws SecurityException {

		Calendar calendar = Calendar.getInstance();

		Date currentDate = calendar.getTime();

		calendar.add(Calendar.MINUTE, 10);

		Date expirationDate = calendar.getTime();

		if (companyId.equals(companySecret))
			return new AuthenticationToken(companyId, null, null, null, UUID.randomUUID()
					.toString(), currentDate, expirationDate);
		else
			throw new SecurityException("Authentication failed!");
	}

	@Override
	public void logout(AuthenticationToken token) throws SecurityException {
	}
}
