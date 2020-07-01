package tr.com.eno.livo.serviceobjects.rest;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.mockito.internal.util.collections.Sets;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.testng.util.Strings;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationFailedException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;
import tr.com.eno.livo.serviceobjects.rest.description.Header;
import tr.com.eno.livo.serviceobjects.rest.description.HttpMethod;
import tr.com.eno.livo.serviceobjects.rest.description.Operation;
import tr.com.eno.livo.serviceobjects.rest.description.Parameter;
import tr.com.eno.livo.serviceobjects.rest.description.ParameterType;
import tr.com.eno.livo.serviceobjects.rest.description.ServiceDescription;

public class RESTServiceObjectProxyServiceTest {

    private RESTServiceObjectProxyService proxyService;
    private String countriesServiceDescription;
    private String emailValidateServiceDescription;
    private CompanyAuthenticationService authenticationService = new DummyCompanyAuthenticationService();

    @BeforeClass
    public void prepareCountriesDescription() throws IOException {

        ServiceDescription countriesService = new ServiceDescription();
        countriesService.setName("Countries");
        countriesService.setBaseUrl("https://restcountries-v1.p.mashape.com");
        countriesService.getDefaultHeaders().add(new Header("X-Mashape-Key", "I0KYYNi6q7mshmUZq7YW1kGShPX0p1VApbVjsn7CmsprYIuB3m"));
        countriesService.getOperations().add(new Operation("getAll", "all", HttpMethod.GET));
        countriesService.getOperations().add(new Operation("getByCode", "alpha/{code}", HttpMethod.GET, new Parameter("code", null, true, ParameterType.ROUTE,null,false)));
        countriesService.getOperations().add(new Operation("getByCodes", "alpha", HttpMethod.GET, new Parameter("codes", null, true, ParameterType.QUERY,null,false)));

        ObjectMapper objectMapper = new ObjectMapper();

        StringWriter sw = new StringWriter();

        objectMapper.writeValue(sw, countriesService);

        this.countriesServiceDescription = sw.toString();

        sw.close();
    }

    @BeforeClass
    public void prepareEMailValidateDescription() throws IOException {

        ServiceDescription emailValidateService = new ServiceDescription();
        emailValidateService.setName("E-Mail Validate");
        emailValidateService.setBaseUrl("https://community-neutrino-email-validate.p.mashape.com/");
        emailValidateService.getDefaultHeaders().add(new Header("X-Mashape-Key", "I0KYYNi6q7mshmUZq7YW1kGShPX0p1VApbVjsn7CmsprYIuB3m"));
        emailValidateService.getOperations().add(new Operation("validate", "email-validate", HttpMethod.POST, new Parameter("email", null, true, ParameterType.FORM,null,false)));

        ObjectMapper objectMapper = new ObjectMapper();

        StringWriter sw = new StringWriter();

        objectMapper.writeValue(sw, emailValidateService);

        this.emailValidateServiceDescription = sw.toString();

        sw.close();
    }

    @BeforeMethod
    public void beforeMethod() {

        this.proxyService = new RESTServiceObjectProxyService();
    }

    @Test
    public void testGetServiceObject() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        Field nameField = RESTServiceObjectProxyService.class.getDeclaredField("name");
        nameField.setAccessible(true);

        assertEquals(serviceObject.getName(), nameField.get(this.proxyService));
        assertEquals(serviceObject.getType(), RESTServiceObjectProxyService.SERVICEOBJECT_TYPE);
        assertEquals(serviceObject.getOperationNames(), Sets.newSet("getAll", "getByCode", "getByCodes"));
        assertNotNull(serviceObject.getUniqueID());
    }

    @Test(expectedExceptions = ServiceObjectNotFoundException.class)
    public void testGetServiceObjectWithWrongName() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        this.proxyService.getServiceObject(token, "WrongName", Collections.EMPTY_MAP);
    }

    @Test
    public void testListServiceObjects() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        Collection<ServiceObject> serviceObjects = this.proxyService.listServiceObjects(null);

        assertNotNull(serviceObjects);
        assertEquals(serviceObjects.size(), 1);

        ServiceObject serviceObject = serviceObjects.iterator().next();

        assertEquals(serviceObject.getName(), RESTServiceObjectProxyService.SERVICEOBJECT_NAME + "-" + name);
        assertEquals(serviceObject.getType(), RESTServiceObjectProxyService.SERVICEOBJECT_TYPE);
        assertEquals(serviceObject.getOperationNames(), Sets.newSet("getAll", "getByCode", "getByCodes"));
    }

    @Test
    public void testPerformOperationWithNoParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{}");

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "getAll", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        JsonNode countries = mapper.readTree(outputPayload.getContent());

        assertTrue(countries.isArray());

        JsonNode afghanistanCountry = countries.get(0);
        assertEquals(afghanistanCountry.get("name").asText(), "Afghanistan");
        assertEquals(afghanistanCountry.get("capital").asText(), "Kabul");
    }

    @Test
    public void testPerformOperationWithRouteParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{\"code\": \"tr\"}");

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "getByCode", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        JsonNode turkeyCountry = mapper.readTree(outputPayload.getContent());
        assertEquals(turkeyCountry.get("name").asText(), "Turkey");
        assertEquals(turkeyCountry.get("capital").asText(), "Ankara");
    }

    @Test(expectedExceptions = ServiceObjectOperationFailedException.class, expectedExceptionsMessageRegExp = "Required route parameter 'code' is missing.")
    public void testPerformOperationWithMissingRouteParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{}");

        this.proxyService.performOperation(token, serviceObject, "getByCode", inputPayload);
    }

    @Test
    public void testPerformOperationWithQueryParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{\"codes\": \"co;nor\"}");

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "getByCodes", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        JsonNode twoCountries = mapper.readTree(outputPayload.getContent());
        assertEquals(twoCountries.size(), 2);
        assertEquals(twoCountries.get(0).get("name").asText(), "Colombia");
        assertEquals(twoCountries.get(1).get("name").asText(), "Norway");
    }

    @Test(expectedExceptions = ServiceObjectOperationFailedException.class, expectedExceptionsMessageRegExp = "Required query string parameter 'codes' is missing.")
    public void testPerformOperationWithMissingQueryParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.countriesServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{}");

        this.proxyService.performOperation(token, serviceObject, "getByCodes", inputPayload);
    }

    @Test
    public void testPerformOperationWithFormParameter() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);

        Map<String, Object> config = new HashMap<>();
        config.put(RESTServiceObjectProxyService.REST_SERVICE_NAME_CONF, name);
        config.put(RESTServiceObjectProxyService.REST_SERVICE_DESCRIPTION_CONF, this.emailValidateServiceDescription);

        this.proxyService.start(config);

        AuthenticationToken token = this.authenticationService.login("123", "123");;

        ObjectMapper mapper = new ObjectMapper();

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent("{\"email\": \"info@livomobile.com\"}");

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "validate", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        JsonNode result = mapper.readTree(outputPayload.getContent());
        assertTrue(result.get("valid").asBoolean());

        inputPayload.setContent("{\"email\": \"info@livomobile\"}");

        outputPayload = this.proxyService.performOperation(token, serviceObject, "validate", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        result = mapper.readTree(outputPayload.getContent());
        assertFalse(result.get("valid").asBoolean());
    }

    @Test
    public void testCalculatePostfix() throws Exception {

        Method m = RESTServiceObjectProxyService.class.getDeclaredMethod("calculatePostfix", String.class);
        m.setAccessible(true);

        assertEquals(m.invoke(this.proxyService, "Price Calculator"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "Price Calculator!!!"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "Price.Calculator"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "P!r.i;ce.Calculator"), "PriceCalculator");
    }

    public static class DummyCompanyAuthenticationService implements CompanyAuthenticationService {

        @Override
        public AuthenticationToken login(String companyId, String companySecret) throws SecurityException {
 
            if (Objects.equals(companyId, companySecret)) {

                Calendar c = Calendar.getInstance();
                c.add(Calendar.HOUR, 2);

                return new AuthenticationToken(companyId, null, null, null, UUID.randomUUID().toString(), new Date(), c.getTime());

            } else {

                throw new SecurityException("Authentication failed.");
            }
        }

        @Override
        public void logout(AuthenticationToken token) throws SecurityException {
        }
    }
}
