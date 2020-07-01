package tr.com.eno.livo.server.provision;

import tr.com.eno.livo.server.authc.AuthenticationToken;

public interface ProvisioningService {

	public Profile checkProvision(AuthenticationToken token,
			String applicationName, Profile currentProfile);
}
