package tr.com.eno.livo.server.thrift.processor.provision;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.apache.thrift.TException;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.file.File;
import tr.com.eno.livo.server.provision.ProvisioningService;
import tr.com.eno.livo.thrift.provision.ProvisioningService.Iface;
import tr.com.eno.livo.thrift.shared.AuthenticationToken;
import tr.com.eno.livo.thrift.shared.Profile;

public class ProvisioningServiceProcessor extends
		tr.com.eno.livo.thrift.provision.ProvisioningService.Processor<Iface> {

	private static final Profile EMPTY_PROFILE = new Profile("",
			new HashSet<tr.com.eno.livo.thrift.shared.File>());
	private static final AsyncIfaceImpl iface = new AsyncIfaceImpl();
	private static final Logger LOGGER = LoggerFactory
			.getLogger(ProvisioningServiceProcessor.class);

	public ProvisioningServiceProcessor() {
		super(iface);

		LOGGER.debug("Initialized an {} instance.",
				ProvisioningServiceProcessor.class.getSimpleName());
	}

	protected void registerService(ProvisioningService service,
			Map<String, Object> serviceProps) {

		// Get the service PID
		String pid = serviceProps.get(Constants.SERVICE_PID).toString();

		// Ignore internal services
		if (serviceProps.containsKey("service.internal")
				&& (Boolean) serviceProps.get("service.internal")) {
			return;
		}

		LOGGER.debug(
				"Registering the ProvisioningService instance with the name '{}' to the Thrift processor adaptor...",
				pid);

		// Register the service
		iface.registerService(pid, service);
	}

	protected void unregisterService(ProvisioningService service,
			Map<String, Object> serviceProps) {

		// Get the service PID
		String pid = ((String[]) serviceProps.get(Constants.SERVICE_PID))[0];

		LOGGER.debug(
				"Unregistering the CompanyAuthenticationService instance with the name '{}' from the Thrift processor adaptor...",
				pid);

		// Register the service
		iface.unregisterService(pid, service);
	}

	private static class AsyncIfaceImpl implements Iface {

		private final Map<String, ProvisioningService> services;

		public AsyncIfaceImpl() {

			this.services = new HashMap<String, ProvisioningService>();
		}

		@Override
		public Profile checkProvision(AuthenticationToken token,
				String applicationId, Profile localProfile) throws TException {

			LOGGER.debug("Checking provision for authentication token '{}'...",
					token.getUniqueValue());

			// Check sent local profile
			if (localProfile == null || localProfile.getHash().isEmpty()) {
				LOGGER.debug(
						"Provisioning for the first time for authentication token '{}'...",
						token.getUniqueValue());
			}

			// Nullify the local profile if it is empty
			if (localProfile != null && localProfile.getHash().isEmpty()) {
				localProfile = null;
			}

			// Create the result profile instance
			tr.com.eno.livo.server.provision.Profile resultProfile = null;

			// Convert the sent local profile to the server format
			tr.com.eno.livo.server.provision.Profile serverLocalProfile = convertToServerProfile(localProfile);

			// Convert the authentication token to server format
			tr.com.eno.livo.server.authc.AuthenticationToken serverAuthenticationToken = convertToServerToken(token);

			// Synchronize the services map for iteration
			synchronized (this.services) {

				// Iterate through the service implementations with reusing the
				// variable referencing them
				ProvisioningService service;
				for (String servicePid : this.services.keySet()) {

					LOGGER.debug(
							"Trying to provision using the service instance with the PID '{}'...",
							servicePid);

					service = this.services.get(servicePid);

					try {

						resultProfile = service.checkProvision(
								serverAuthenticationToken, applicationId,
								serverLocalProfile);

						if (resultProfile != null) {
							break;
						}

					} catch (Exception e) {

						LOGGER.debug(
								"Failed to provision token '{}' using the the service instance with the PID '{}' due to an exception.",
								token.getUniqueValue(), servicePid);

						LOGGER.warn(e.getMessage(), e);
					}
				}
			}

			if (resultProfile == null) {

				LOGGER.error(
						"Failed to provision the authentication token '{}' with any provisioning service.",
						token.getUniqueValue());

				return EMPTY_PROFILE;

			} else if (localProfile != null
					&& localProfile.getHash().equals(resultProfile.getHash())) {

				LOGGER.error(
						"Client with the authentication token '{}'  as the latest provision.",
						token.getUniqueValue());

				resultProfile = serverLocalProfile;

			} else {

				LOGGER.debug(
						"Successfully provisioned the authentication token '{}' and returning the profile with the hash '{}'...",
						token.getUniqueValue(), resultProfile.getHash());
			}

			return convertToThriftProfile(resultProfile);
		}

		private tr.com.eno.livo.server.provision.Profile convertToServerProfile(
				Profile profile) {

			if (profile == null) {
				return null;
			}

			Set<File> files = new HashSet<File>();

			if (profile.getFiles() != null) {
				for (tr.com.eno.livo.thrift.shared.File file : profile
						.getFiles()) {

					files.add(new File(file.getHash(), file.getPath(), file
							.getContentType()));
				}
			}

			return new tr.com.eno.livo.server.provision.Profile(
					profile.getHash(), files, profile.getPreferences());
		}

		private tr.com.eno.livo.server.authc.AuthenticationToken convertToServerToken(
				AuthenticationToken token) {

			return new tr.com.eno.livo.server.authc.AuthenticationToken(
					token.getCompanyId(), token.getUserPrincipal(), null, null,
					token.getUniqueValue(), new Date(
							token.getAuthenticationTime()), new Date(
							token.getExpirationTime()));
		}

		private Profile convertToThriftProfile(
				tr.com.eno.livo.server.provision.Profile currentProfile) {

			if (currentProfile == null) {

				LOGGER.error("Encountered an attempt to convert null into a Thrift profile object!");

				return EMPTY_PROFILE;
			}

			Set<tr.com.eno.livo.thrift.shared.File> files = new HashSet<tr.com.eno.livo.thrift.shared.File>();

			if (currentProfile.getFiles() != null) {
				for (File file : currentProfile.getFiles()) {

					files.add(new tr.com.eno.livo.thrift.shared.File(file
							.getPath(), file.getHash(), file.getSize()));
				}
			}

			Profile profile = new Profile(currentProfile.getHash(), files);
			profile.setPreferences(currentProfile.getPreferences());

			return profile;
		}

		private void registerService(String name, ProvisioningService service) {

			synchronized (this.services) {

				this.services.put(name, service);
			}
		}

		private void unregisterService(String name, ProvisioningService service) {

			synchronized (this.services) {

				this.services.remove(name);
			}
		}

	}
}
