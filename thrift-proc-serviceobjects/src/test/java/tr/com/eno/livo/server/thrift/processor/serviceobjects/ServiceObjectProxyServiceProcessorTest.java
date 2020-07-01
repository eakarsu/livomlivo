package tr.com.eno.livo.server.thrift.processor.serviceobjects;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;
import java.io.StringReader;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import org.apache.thrift.TException;
import org.apache.thrift.protocol.TBinaryProtocol;
import org.apache.thrift.protocol.TProtocol;
import org.apache.thrift.server.TSimpleServer;
import org.apache.thrift.transport.TServerSocket;
import org.apache.thrift.transport.TSocket;
import org.apache.thrift.transport.TTransport;
import org.osgi.framework.Constants;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectConfigurationException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectProxyService;
import tr.com.eno.livo.server.serviceobjects.SimpleServiceObject;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectConfigurationError;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectNotFoundError;
import tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationFailedError;

public class ServiceObjectProxyServiceProcessorTest {

	private static tr.com.eno.livo.thrift.serviceobjects.ServiceObjectProxyService.Client client;
	private static TTransport clientTransport;
	private static int port;
	private static ServiceObjectProxyServiceProcessor processor;
	private static TSimpleServer server;
	private static Thread serverThread;
	private static tr.com.eno.livo.thrift.shared.AuthenticationToken token;

	@BeforeMethod
	public static void setUpClient() throws Exception {

		clientTransport = new TSocket("localhost", port);
		clientTransport.open();

		TProtocol protocol = new TBinaryProtocol(clientTransport);

		client = new tr.com.eno.livo.thrift.serviceobjects.ServiceObjectProxyService.Client(
				protocol);

		token = new tr.com.eno.livo.thrift.shared.AuthenticationToken(UUID
				.randomUUID().toString(), "test", new Date().getTime());

		Calendar c = new GregorianCalendar();
		c.add(Calendar.HOUR, 1);
		token.setExpirationTime(c.getTimeInMillis());
	}

	@BeforeClass
	public static void setUpServer() throws Exception {

		port = new Random().nextInt(8975) + 1025;

		processor = new ServiceObjectProxyServiceProcessor();
		processor
				.registerService(
						new ReverserServiceObjectProxyService(),
						Collections
								.singletonMap(
										Constants.SERVICE_PID,
										(Object) "tr.com.eno.livo.server.thrift.processor.serviceobjects.Reverser"));

		TServerSocket serverSocket = new TServerSocket(port);

		server = new TSimpleServer(
				new TSimpleServer.Args(serverSocket).processor(processor));

		serverThread = new Thread(new Runnable() {

			@Override
			public void run() {

				server.serve();
			}
		});

		serverThread.start();
	}

	@AfterMethod
	public static void tearDownClient() throws Exception {

		if (clientTransport.isOpen()) {
			clientTransport.close();
		}

		client = null;
		clientTransport = null;
	}

	@AfterClass
	public static void tearDownServer() throws Exception {

		if (server.isServing()) {
			server.stop();
		}

		server = null;

		if (serverThread.isAlive()) {
			serverThread.interrupt();
		}
	}

	public ServiceObjectProxyServiceProcessorTest() {
	}

	@Test(description = "Test for the 'getServiceObject' method")
	public void testGetServiceObject() throws ServiceObjectConfigurationError,
			TException {

		tr.com.eno.livo.thrift.serviceobjects.ServiceObject object = client
				.getServiceObject(token, "Reverser", Collections.singletonMap(
						"someRequiredConfiguration", "testValue"));

		assertNotNull(object);

		assertEquals(object.getName(), "Reverser");
	}

	@Test(description = "Test for the 'getServiceObject' method that uses an incorrect name", expectedExceptions = ServiceObjectNotFoundError.class)
	public void testGetServiceObjectWithIncorrectName()
			throws ServiceObjectConfigurationError, TException {

		client.getServiceObject(token, "Reversee", null);
	}

	@Test(description = "Test for the 'getServiceObject' method that uses an incomplete configuration", expectedExceptions = ServiceObjectConfigurationError.class)
	public void testGetServiceObjectWithMissingConfiguration()
			throws ServiceObjectConfigurationError, TException {

		client.getServiceObject(token, "Reverser",
				new HashMap<String, String>());
	}

	@Test(description = "Test for the 'listServiceObjects' method")
	public void testListServiceObjects() throws TException {

		Set<tr.com.eno.livo.thrift.serviceobjects.ServiceObject> serviceObjects = client
				.listServiceObjects(token);

		assertNotNull(serviceObjects);
		assertFalse(serviceObjects.isEmpty());

		assertEquals(serviceObjects.size(), 1);

		tr.com.eno.livo.thrift.serviceobjects.ServiceObject object = serviceObjects
				.iterator().next();

		assertEquals(object.getName(), "Reverser");
	}

	@Test(description = "Test for the 'performOperation' method")
	public void testPerformOperationOnConfiguredServiceObject()
			throws ServiceObjectConfigurationError, TException {

		tr.com.eno.livo.thrift.shared.AuthenticationToken oneTimeToken = new tr.com.eno.livo.thrift.shared.AuthenticationToken(
				UUID.randomUUID().toString(), "test", new Date().getTime());
		oneTimeToken
				.setExpirationTime(oneTimeToken.getAuthenticationTime() + 100000);

		tr.com.eno.livo.thrift.serviceobjects.ServiceObject serviceObject = client
				.getServiceObject(oneTimeToken, "Reverser", Collections
						.singletonMap("someRequiredConfiguration", "testValue"));

		tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationPayload outputPayload = client
				.performOperation(
						oneTimeToken,
						serviceObject,
						"reverse",
						new tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationPayload(
								Json.createObjectBuilder().add("input", "test")
										.build().toString(), "application/json"));

		JsonReader reader = Json.createReader(new StringReader(outputPayload
				.getContent()));

		JsonObject outputObj = reader.readObject();

		assertTrue(outputObj.containsKey("output"));

		String output = outputObj.getString("output");

		assertEquals(output, new StringBuilder("test").reverse().toString());
	}

	@Test(description = "Test for the 'performOperation' method that uses a non-configured ServiceObject", expectedExceptions = ServiceObjectOperationFailedError.class, expectedExceptionsMessageRegExp = "ServiceObject not configured.")
	public void testPerformOperationOnNonConfiguredServiceObject()
			throws TException {

		tr.com.eno.livo.thrift.shared.AuthenticationToken oneTimeToken = new tr.com.eno.livo.thrift.shared.AuthenticationToken(
				UUID.randomUUID().toString(), "test", new Date().getTime());
		oneTimeToken
				.setExpirationTime(oneTimeToken.getAuthenticationTime() + 100000);

		Set<tr.com.eno.livo.thrift.serviceobjects.ServiceObject> serviceObjects = client
				.listServiceObjects(oneTimeToken);

		tr.com.eno.livo.thrift.serviceobjects.ServiceObject serviceObject = serviceObjects
				.iterator().next();

		client.performOperation(
				oneTimeToken,
				serviceObject,
				"reverse",
				new tr.com.eno.livo.thrift.serviceobjects.ServiceObjectOperationPayload(
						"{}", "application/json"));
	}

	public static class ReverserServiceObjectProxyService implements
			ServiceObjectProxyService {

		private static final SimpleServiceObject SERVICE_OBJECT = new SimpleServiceObject(
				"Reverser", "custom", "reverse");

		@Override
		public ServiceObject getServiceObject(AuthenticationToken token,
				String name, Map<String, String> configuration)
				throws ServiceObjectNotFoundException,
				ServiceObjectConfigurationException {

			if (!configuration.containsKey("someRequiredConfiguration")) {
				throw new ServiceObjectConfigurationException(name,
						"someRequiredConfiguration", "Required but null");
			}

			return SERVICE_OBJECT;
		}

		@Override
		public Set<ServiceObject> listServiceObjects(AuthenticationToken token) {

			return Collections.<ServiceObject> singleton(SERVICE_OBJECT);
		}

		@Override
		public ServiceObjectOperationPayload performOperation(
				AuthenticationToken token, ServiceObject serviceObject,
				String operationName, ServiceObjectOperationPayload payload)
				throws ServiceObjectOperationFailedException {

			try {

				JsonReader reader = Json.createReader(new StringReader(payload
						.getContent()));

				String input = reader.readObject().getString("input");

				String output = new StringBuilder(input).reverse().toString();

				ServiceObjectOperationPayload resultPayload = new ServiceObjectOperationPayload();
				resultPayload.setContent(Json.createObjectBuilder()
						.add("output", output).build().toString());

				return resultPayload;

			} catch (Exception e) {

				throw new ServiceObjectOperationFailedException(operationName,
						serviceObject.getName(), e.getMessage());
			}
		}
	}
}
