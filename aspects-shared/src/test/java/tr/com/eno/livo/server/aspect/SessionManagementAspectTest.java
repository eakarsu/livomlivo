package tr.com.eno.livo.server.aspect;

import static org.testng.Assert.*;

import java.util.Calendar;
import java.util.Date;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.LoggerFactory;
import org.testng.annotations.Test;
import org.testng.internal.thread.TestNGThread;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

@Test(singleThreaded = true, groups = "session")
public class SessionManagementAspectTest {

    @Test(singleThreaded = true)
    public void testCompanyAuthenticationTokenCaching() throws InterruptedException {

        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(10);

        String companyId = RandomStringUtils.randomAlphabetic(10);

        AuthenticationToken firstToken = companyAuthenticationService.login(companyId, companyId);

        TestNGThread.sleep(1000);

        AuthenticationToken secondToken = companyAuthenticationService.login(companyId, companyId);

        assertEquals(firstToken.getUniqueValue(), secondToken.getUniqueValue());
        assertEquals(firstToken.getAuthenticationTime(), secondToken.getAuthenticationTime());
        assertEquals(firstToken.getCompanyId(), secondToken.getCompanyId());
        assertNotEquals(firstToken.getExpirationTime(), secondToken.getExpirationTime());

        assertNull(firstToken.getUserPrincipal());
        assertNull(secondToken.getUserPrincipal());

        companyAuthenticationService.logout(secondToken);

        AuthenticationToken thirdToken = companyAuthenticationService.login(companyId, companyId);

        assertNotEquals(firstToken.getUniqueValue(), thirdToken.getUniqueValue());
        assertEquals(firstToken.getCompanyId(), secondToken.getCompanyId());
    }

    @Test(singleThreaded = true)
    public void testUserAuthenticationTokenCaching() throws InterruptedException {

        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(60);
        UserAuthenticationService userAuthenticationService = new DummyUserAuthenticationService(60);

        String companyId = RandomStringUtils.randomAlphabetic(10);
        String userPrincipal = RandomStringUtils.randomAlphabetic(10);

        AuthenticationToken companyAuthenticationToken = companyAuthenticationService.login(companyId, companyId);

        AuthenticationToken userAuthenticationToken = userAuthenticationService.login(companyAuthenticationToken, userPrincipal, userPrincipal);

        assertEquals(companyAuthenticationToken.getUniqueValue(), userAuthenticationToken.getUniqueValue());
        assertEquals(userAuthenticationToken.getCompanyId(), companyId);
        assertEquals(userAuthenticationToken.getUserPrincipal(), userPrincipal);

        AuthenticationToken secondCompanyAuthenticationToken = companyAuthenticationService.login(companyId, companyId);

        assertNotEquals(companyAuthenticationToken.getUniqueValue(), secondCompanyAuthenticationToken.getUniqueValue());

        AuthenticationToken secondUserAuthenticationToken = userAuthenticationService.login(secondCompanyAuthenticationToken, userPrincipal, userPrincipal);

        assertEquals(userAuthenticationToken.getUniqueValue(), secondUserAuthenticationToken.getUniqueValue());
        assertEquals(userAuthenticationToken.getAuthenticationTime(), secondUserAuthenticationToken.getAuthenticationTime());
        assertNotEquals(userAuthenticationToken.getExpirationTime(), secondUserAuthenticationToken.getExpirationTime());

        userAuthenticationService.logout(userAuthenticationToken);

        AuthenticationToken thirdUserAuthenticationToken = userAuthenticationService.login(companyAuthenticationToken, userPrincipal, userPrincipal);

        LoggerFactory.getLogger(this.getClass()).info("First value: {}", userAuthenticationToken.getUniqueValue());
        LoggerFactory.getLogger(this.getClass()).info("Third value: {}", thirdUserAuthenticationToken.getUniqueValue());
        assertNotEquals(userAuthenticationToken.getUniqueValue(), thirdUserAuthenticationToken.getUniqueValue());
        assertEquals(userAuthenticationToken.getUserPrincipal(), thirdUserAuthenticationToken.getUserPrincipal());
    }

    @Test(singleThreaded = true)
    public void testCompanyAuthenticationTokenExpiration() throws InterruptedException {

        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(5);

        String companyId = RandomStringUtils.randomAlphabetic(10);

        AuthenticationToken firstToken = companyAuthenticationService.login(companyId, companyId);

        TestNGThread.sleep(1000);

        AuthenticationToken secondToken = companyAuthenticationService.login(companyId, companyId);

        assertEquals(firstToken, secondToken);

        TestNGThread.sleep(6000);

        AuthenticationToken thirdToken = companyAuthenticationService.login(companyId, companyId);

        assertNotEquals(firstToken, thirdToken);
    }

    @Test(singleThreaded = true)
    public void testUserAuthenticationTokenExpiration() throws InterruptedException {

        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(60);
        UserAuthenticationService userAuthenticationService = new DummyUserAuthenticationService(5);

        String companyId = RandomStringUtils.randomAlphabetic(10);
        String userPrincipal = RandomStringUtils.randomAlphabetic(10);

        AuthenticationToken companyToken = companyAuthenticationService.login(companyId, companyId);
        AuthenticationToken userToken = userAuthenticationService.login(companyToken, userPrincipal, userPrincipal);

        assertEquals(companyToken.getUniqueValue(), userToken.getUniqueValue());

        TestNGThread.sleep(6000);

        companyToken = companyAuthenticationService.login(companyId, companyId);
        AuthenticationToken secondUserToken = userAuthenticationService.login(companyToken, userPrincipal, userPrincipal);

        assertNotEquals(userToken.getUniqueValue(), secondUserToken.getUniqueValue());
    }

    @Test
    public void testAuthenticationTokenCheck() {

        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(10);
        UserAuthenticationService userAuthenticationService = new DummyUserAuthenticationService(10);

        String companyId = RandomStringUtils.randomAlphabetic(10);
        String userPrincipal = RandomStringUtils.randomAlphabetic(10);

        AuthenticationToken companyAuthenticationToken = companyAuthenticationService.login(companyId, companyId);
        AuthenticationToken userAuthenticationToken = userAuthenticationService.login(companyAuthenticationToken, userPrincipal, userPrincipal);

    }

    @Test
    public void testLatestTokenAdviceExclusion() {

        DummyService dummyService = new DummyServiceImpl();

        dummyService.methodC("123", new AuthenticationToken("companyId", "userPrincipal", null, null, UUID.randomUUID().toString(), null, null));
    }

    @Test(expectedExceptions = SecurityException.class)
    public void testLatestTokenAdviceWithoutAuthc() {

        DummyService dummyService = new DummyServiceImpl();

        dummyService.methodA(new AuthenticationToken("companyId", "userPrincipal", null, null, UUID.randomUUID().toString(), null, null));
    }

    @Test
    public void testLatestTokenPassingForCompanyAuthentication() {

//        String companyId = RandomStringUtils.randomAlphabetic(10);
//
//        CompanyAuthenticationService companyAuthenticationService = new DummyCompanyAuthenticationService(30);
//        AuthenticationToken token = companyAuthenticationService.login(companyId, companyId);
//
//        DummyServiceImpl dummyService = new DummyServiceImpl();
//
//        String passedUniqueValue = UUID.randomUUID().toString();
//        dummyService.methodA(new AuthenticationToken(companyId, "userPrincipal", passedUniqueValue, null, null));
//
//        assertNotNull(dummyService.latestToken);
//        assertNotEquals(dummyService.latestToken.getUniqueValue(), passedUniqueValue);
//
//        assertNotNull(dummyService.latestToken.getAuthenticationTime());
//        assertNotNull(dummyService.latestToken.getExpirationTime());
//        
//        assertEquals(dummyService.latestToken.getUniqueValue(), token.getUniqueValue());
//        assertEquals(dummyService.latestToken.getAuthenticationTime(), token.getAuthenticationTime());
//        assertEquals(dummyService.latestToken.getExpirationTime(), token.getExpirationTime());
    }

    public static class DummyCompanyAuthenticationService implements CompanyAuthenticationService {

        private final int seconds;

        public DummyCompanyAuthenticationService(int seconds) {
            this.seconds = seconds;
        }

        @Override
        public AuthenticationToken login(String companyId, String companySecret) throws SecurityException {

            if (companyId.equals(companySecret)) {

                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.SECOND, this.seconds);

                return new AuthenticationToken(companyId, null, null, null, UUID.randomUUID().toString(), new Date(), calendar.getTime());

            } else {

                throw new SecurityException();
            }
        }

        @Override
        public void logout(AuthenticationToken token) throws SecurityException {
        }
    }

    public static class DummyUserAuthenticationService implements UserAuthenticationService {

        private final int seconds;

        public DummyUserAuthenticationService(int seconds) {
            this.seconds = seconds;
        }

        @Override
        public AuthenticationToken login(AuthenticationToken companyAuthToken, String id, String secret) throws SecurityException {

            if (id.equals(secret)) {

                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.SECOND, this.seconds);

                return new AuthenticationToken(companyAuthToken.getCompanyId(), id, null, "Test", UUID.randomUUID().toString(), new Date(), calendar.getTime());

            } else {

                throw new SecurityException();
            }
        }

        @Override
        public void logout(AuthenticationToken token) throws SecurityException {
        }
    }

    public static interface DummyService {

        public void methodA(AuthenticationToken token);

        public boolean methodB(AuthenticationToken token, int b);

        public void methodC(String c, AuthenticationToken token);
    }

    public static class DummyServiceImpl implements DummyService {

        private AuthenticationToken latestToken;

        @Override
        public void methodA(AuthenticationToken token) {

            latestToken = token;
        }

        @Override
        public boolean methodB(AuthenticationToken token, int b) {

            latestToken = token;

            return true;
        }

        @Override
        public void methodC(String c, AuthenticationToken token) {

            latestToken = token;
        }
    }
}
