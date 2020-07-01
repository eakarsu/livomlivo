package tr.com.eno.livo.server.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityHelper {

	public static WebUser getCurrentUser() {
		
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication == null)
			return null;
		
		return (WebUser)authentication.getPrincipal();
	}
}
