package tr.com.eno.livo.server.authc;

public interface CompanyAuthenticationService extends AuthenticationService {

	public static final String AUTHENTICATED_COMPANY_EVENT_TOPIC = "tr/com/eno/livo/server/authentication/company/authenticated";

	public AuthenticationToken login(String companyId, String companySecret)
			throws SecurityException;
}
