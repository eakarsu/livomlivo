package tr.com.eno.livo.server.authc.dummy;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyZeroInteractions;
import java.util.Dictionary;
import org.mockito.Matchers;
import org.osgi.framework.BundleContext;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

public class DummyAuthenticationServicePublisherTest {

	private BundleContext bundleContext;
	private DummyAuthenticationServicePublisher publisher;

	@BeforeMethod
	public void setUp() throws Exception {

		this.publisher = new DummyAuthenticationServicePublisher();
		this.bundleContext = mock(BundleContext.class);

		System.clearProperty(DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY);
		System.clearProperty(DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY);
	}

	@AfterMethod
	public void tearDown() throws Exception {

		this.publisher = null;
		this.bundleContext = null;
	}

	@Test(description = "Test for checking that when both system properties are provided, both services are registered.")
	public void testBothSystemProperties() throws Exception {

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"false");
		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"false");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"123");
		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"123");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"true");
		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"true");

		publisher.start(bundleContext);

		verify(bundleContext).registerService(
				eq(CompanyAuthenticationService.class),
				Matchers.<CompanyAuthenticationService> any(),
				Matchers.<Dictionary<String, Object>> any());
		verify(bundleContext).registerService(
				eq(UserAuthenticationService.class),
				Matchers.<UserAuthenticationService> any(),
				Matchers.<Dictionary<String, Object>> any());

		verifyNoMoreInteractions(bundleContext);
	}

	@Test(description = "Test for checking that when no system properties are provided, there are no services registered.")
	public void testNoSystemProperties() throws Exception {

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);
	}

	@Test(description = "Test for checking that when only company authentication system property is provided, only the company authentication service is registered.")
	public void testOnlyCompanyAuthcSystemProperties() throws Exception {

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"false");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"123");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.COMPANY_AUTH_ENABLED_PROPERTY,
				"true");

		publisher.start(bundleContext);

		verify(bundleContext).registerService(
				eq(CompanyAuthenticationService.class),
				Matchers.<CompanyAuthenticationService> any(),
				Matchers.<Dictionary<String, Object>> any());

		verifyNoMoreInteractions(bundleContext);
	}

	@Test(description = "Test for checking that when only user authentication system property is provided, only the user authentication service is registered.")
	public void testOnlyUserAuthcSystemProperties() throws Exception {

		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"false");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"123");

		publisher.start(bundleContext);

		verifyZeroInteractions(bundleContext);

		System.setProperty(
				DummyAuthenticationServicePublisher.USER_AUTH_ENABLED_PROPERTY,
				"true");

		publisher.start(bundleContext);

		verify(bundleContext).registerService(
				eq(UserAuthenticationService.class),
				Matchers.<UserAuthenticationService> any(),
				Matchers.<Dictionary<String, Object>> any());

		verifyNoMoreInteractions(bundleContext);
	}
}
