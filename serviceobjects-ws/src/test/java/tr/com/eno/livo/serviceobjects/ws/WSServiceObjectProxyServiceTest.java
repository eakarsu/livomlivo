package tr.com.eno.livo.serviceobjects.ws;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import static org.testng.Assert.*;

import java.io.StringWriter;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import org.mockito.internal.util.collections.Sets;
import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.serviceobjects.ServiceObject;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectNotFoundException;
import tr.com.eno.livo.server.serviceobjects.ServiceObjectOperationPayload;

public class WSServiceObjectProxyServiceTest {

    private WSServiceObjectProxyService proxyService;

    @BeforeMethod
    public void beforeMethod() {

        this.proxyService = new WSServiceObjectProxyService();
    }

    @Test
    public void testStart() throws Exception {
    }

    @Test
    public void testStop() {
    }

    @Test
    public void testGetServiceObject() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);
        String url = "http://www.predic8.com:8080/material/ArticleService?wsdl";

        Map<String, Object> config = new HashMap<>();
        config.put(WSServiceObjectProxyService.WS_NAME_CONF, name);
        config.put(WSServiceObjectProxyService.WS_DESCRIPTION_URL_CONF, url);

        this.proxyService.start(config);

        AuthenticationToken token = new AuthenticationToken("testCompany", "testUser", null, null, UUID.randomUUID().toString(), new Date(), null);

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        assertEquals(serviceObject.getName(), this.proxyService.getName());
        assertEquals(serviceObject.getType(), WSServiceObjectProxyService.SERVICEOBJECT_TYPE);
        assertEquals(serviceObject.getOperationNames(), Sets.newSet("create", "get", "getAll", "delete"));
        assertNotNull(serviceObject.getUniqueID());

        UUID previousUUID = serviceObject.getUniqueID();

        serviceObject = this.proxyService.getServiceObject(token, this.proxyService.listServiceObjects(token).iterator().next().getName(), Collections.EMPTY_MAP);

        assertEquals(serviceObject.getUniqueID(), previousUUID);
    }

    @Test(expectedExceptions = ServiceObjectNotFoundException.class)
    public void testGetServiceObjectWithWrongName() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);
        String url = "http://www.predic8.com:8080/material/ArticleService?wsdl";

        Map<String, Object> config = new HashMap<>();
        config.put(WSServiceObjectProxyService.WS_NAME_CONF, name);
        config.put(WSServiceObjectProxyService.WS_DESCRIPTION_URL_CONF, url);

        this.proxyService.start(config);

        AuthenticationToken token = new AuthenticationToken("testCompany", "testUser", null, null, UUID.randomUUID().toString(), new Date(), null);

        this.proxyService.getServiceObject(token, "WrongName", Collections.EMPTY_MAP);
    }

    @Test
    public void testListServiceObjects() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);
        String url = "http://www.predic8.com:8080/material/ArticleService?wsdl";

        Map<String, Object> config = new HashMap<>();
        config.put(WSServiceObjectProxyService.WS_NAME_CONF, name);
        config.put(WSServiceObjectProxyService.WS_DESCRIPTION_URL_CONF, url);

        this.proxyService.start(config);

        Collection<ServiceObject> serviceObjects = this.proxyService.listServiceObjects(null);

        assertNotNull(serviceObjects);
        assertEquals(serviceObjects.size(), 1);

        ServiceObject serviceObject = serviceObjects.iterator().next();

        assertEquals(serviceObject.getName(), WSServiceObjectProxyService.SERVICEOBJECT_NAME + "-" + name);
        assertEquals(serviceObject.getType(), WSServiceObjectProxyService.SERVICEOBJECT_TYPE);
        assertEquals(serviceObject.getOperationNames(), Sets.newSet("create", "get", "getAll", "delete"));
    }

    @Test
    public void testPerformOperationOnSimpleWS() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);
        String url = "http://soaptest.parasoft.com/calculator.wsdl";

        Map<String, Object> config = new HashMap<>();
        config.put(WSServiceObjectProxyService.WS_NAME_CONF, name);
        config.put(WSServiceObjectProxyService.WS_DESCRIPTION_URL_CONF, url);

        this.proxyService.start(config);

        AuthenticationToken token = new AuthenticationToken("testCompany", "testUser", null, null, UUID.randomUUID().toString(), new Date(), null);

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.getName(), Collections.EMPTY_MAP);

        JsonFactory jf = new JsonFactory();

        StringWriter sw = new StringWriter();

        JsonGenerator jg = jf.createJsonGenerator(sw);
        jg.writeStartObject();
        jg.writeObjectField("x", 1.5F);
        jg.writeObjectField("y", 2.5F);
        jg.writeEndObject();
        jg.flush();
        jg.close();

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent(sw.toString());

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "add", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode resultNode = objectMapper.readTree(outputPayload.getContent());

        assertEquals((float) resultNode.get("result").asDouble(), 4.0F);
    }

    @Test
    public void testPerformOperationOnComplexWS() throws Exception {

        String name = RandomStringUtils.randomAlphanumeric(7);
        String url = "http://www.predic8.com:8080/material/ArticleService?wsdl";

        Map<String, Object> config = new HashMap<>();
        config.put(WSServiceObjectProxyService.WS_NAME_CONF, name);
        config.put(WSServiceObjectProxyService.WS_DESCRIPTION_URL_CONF, url);

        this.proxyService.start(config);

        AuthenticationToken token = new AuthenticationToken("testCompany", "testUser", null, null, UUID.randomUUID().toString(), new Date(), null);

        ServiceObject serviceObject = this.proxyService.getServiceObject(token, this.proxyService.getName(), Collections.EMPTY_MAP);

        JsonFactory jf = new JsonFactory();

        StringWriter sw = new StringWriter();

        JsonGenerator jg = jf.createJsonGenerator(sw);
        jg.writeStartObject();

        jg.writeObjectFieldStart("article");

        jg.writeStringField("name", "ArticleName123");
        jg.writeStringField("description", "ArticleDescription123");

        jg.writeObjectFieldStart("price");
        jg.writeNumberField("amount", 10);
        jg.writeStringField("currency", "EUR");
        jg.writeEndObject();

        jg.writeStringField("id", "123123");

        jg.writeEndObject();

        jg.writeEndObject();
        jg.flush();
        jg.close();

        ServiceObjectOperationPayload inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent(sw.toString());

        ServiceObjectOperationPayload outputPayload = this.proxyService.performOperation(token, serviceObject, "create", inputPayload);

        assertNotNull(outputPayload);
        assertNotNull(outputPayload.getContent());

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode resultNode = objectMapper.readTree(outputPayload.getContent());

        String articleId = resultNode.get("result").asText();

        assertNotNull(articleId);

        inputPayload = new ServiceObjectOperationPayload();
        inputPayload.setContent(objectMapper.writeValueAsString(Collections.singletonMap("id", articleId)));

        outputPayload = this.proxyService.performOperation(token, serviceObject, "get", inputPayload);

        LoggerFactory.getLogger(WSServiceObjectProxyServiceTest.class).info(outputPayload.getContent());
    }

    @Test
    public void testCalculatePostfix() throws Exception {

        Method m = WSServiceObjectProxyService.class.getDeclaredMethod("calculatePostfix", String.class);
        m.setAccessible(true);

        assertEquals(m.invoke(this.proxyService, "Price Calculator"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "Price Calculator!!!"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "Price.Calculator"), "PriceCalculator");
        assertEquals(m.invoke(this.proxyService, "P!r.i;ce.Calculator"), "PriceCalculator");
    }
}
