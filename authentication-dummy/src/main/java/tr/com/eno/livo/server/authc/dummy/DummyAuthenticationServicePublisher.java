package tr.com.eno.livo.server.authc.dummy;

import java.util.Dictionary;
import java.util.Hashtable;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.framework.ServiceRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class DummyAuthenticationServicePublisher {

	static final String COMPANY_AUTH_ENABLED_PROPERTY = "dummyAuthentication.companyAuthenticationEnabled";
	static final String USER_AUTH_ENABLED_PROPERTY = "dummyAuthentication.userAuthenticationEnabled";

	private static final Logger LOGGER = LoggerFactory
			.getLogger(DummyAuthenticationServicePublisher.class);

	private ServiceRegistration<CompanyAuthenticationService> companyAuthcServiceRegistration;
	private ServiceRegistration<UserAuthenticationService> userAuthcServiceRegistration;

	public void start(BundleContext context) throws Exception {

		LOGGER.debug("Starting dummy authentication services...");

		if (Boolean.parseBoolean(System
				.getProperty(COMPANY_AUTH_ENABLED_PROPERTY)))
			this.registerCompanyAuthenticationService(context);

		if (Boolean
				.parseBoolean(System.getProperty(USER_AUTH_ENABLED_PROPERTY)))
			this.registerUserAuthenticationService(context);
	}

	public void stop(BundleContext context) throws Exception {

		LOGGER.debug("Starting dummy authentication services...");

		if (this.companyAuthcServiceRegistration != null)
			this.companyAuthcServiceRegistration.unregister();

		if (this.userAuthcServiceRegistration != null)
			this.userAuthcServiceRegistration.unregister();
	}

	private void registerCompanyAuthenticationService(BundleContext bc) {

		LOGGER.info("Activating DummyCompanyAuthenticationService...");

		Dictionary<String, Object> props = new Hashtable<String, Object>();
		props.put(Constants.SERVICE_PID,
				"tr.com.eno.livo.server.authc.DummyCompanyAuthenticationService");

		this.companyAuthcServiceRegistration = bc.registerService(
				CompanyAuthenticationService.class,
				new DummyCompanyAuthenticationService(), props);
	}

	private void registerUserAuthenticationService(BundleContext bc) {

		LOGGER.info("Activating DummyUserAuthenticationService...");

		Dictionary<String, Object> props = new Hashtable<String, Object>();
		props.put(Constants.SERVICE_PID,
				"tr.com.eno.livo.server.authc.DummyUserAuthenticationService");

		this.userAuthcServiceRegistration = bc.registerService(
				UserAuthenticationService.class,
				new DummyUserAuthenticationService(), props);
	}
}
