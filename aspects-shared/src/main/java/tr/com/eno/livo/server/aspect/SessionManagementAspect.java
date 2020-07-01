package tr.com.eno.livo.server.aspect;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
import tr.com.eno.livo.server.authc.UserAuthenticationService;

@Aspect
public class SessionManagementAspect {

    private static final Map<String, AuthenticationToken> COMPANY_AUTHENTICATION_TOKENS = new HashMap<>();
    private static final Map<String, AuthenticationToken> USER_AUTHENTICATION_TOKENS = new HashMap<>();
    private static final Map<AuthenticationToken, ScheduledFuture> EXPIRATION_FUTURES = new HashMap<>();
    private static final ScheduledExecutorService EXECUTOR_SERVICE = Executors.newScheduledThreadPool(3);
    private static final long TOUCH_DELAY = Long.parseLong(System.getProperty("session.touchDelay", "300"));

    @Pointcut("execution(tr.com.eno.livo.server.authc.AuthenticationToken tr.com.eno..CompanyAuthenticationService+.login(..))")
    public void authenticateCompanyMethods() {
    }

    @Pointcut("execution(tr.com.eno.livo.server.authc.AuthenticationToken tr.com.eno..UserAuthenticationService+.login(..))")
    public void authenticateUserMethods() {
    }

    @Pointcut("execution(void tr.com.eno..CompanyAuthenticationService+.logout(..))")
    public void deauthenticateCompanyMethods() {
    }

    @Pointcut("execution(void tr.com.eno..UserAuthenticationService+.logout(..))")
    public void deauthenticateUserMethods() {
    }

    @Pointcut("(execution(* tr.com.eno..*Service+.*(tr.com.eno.livo.server.authc.AuthenticationToken, ..)) || execution(* tr.com.eno..*Service+.*(tr.com.eno.livo.server.authc.AuthenticationToken))) && !authenticateUserMethods() && !authenticateCompanyMethods() && !execution(* tr.com.eno..AuthorizationService+.*(..))")
    public void serviceMethodsThatAcceptToken() {
    }

    @Around("authenticateCompanyMethods()")
    public AuthenticationToken authenticateCompanyAdvice(final ProceedingJoinPoint joinPoint) throws Throwable {

        final Logger logger = LoggerFactory
                .getLogger(joinPoint.getSignature().getDeclaringType());

        final String companyId = (String) joinPoint.getArgs()[0];

        try {

            AuthenticationToken token = (AuthenticationToken) joinPoint.proceed(joinPoint.getArgs());

            checkTokenIntegrity(logger, companyId, null, token);

            synchronized (COMPANY_AUTHENTICATION_TOKENS) {

                if (COMPANY_AUTHENTICATION_TOKENS.containsKey(companyId)) {

                    AuthenticationToken previousToken = COMPANY_AUTHENTICATION_TOKENS.get(companyId);

                    logger.debug("Returning previously created authentication token with updated expiration time for company ID '{}'...",
                            companyId);

                    token = updateToken(logger, previousToken, token);

                    cancelExpirationTask(logger, previousToken);

                } else {

                    logger.debug("Caching the returned authentication token '{}' for company ID '{}'...",
                            token.getUniqueValue(),
                            companyId);
                }

                COMPANY_AUTHENTICATION_TOKENS.put(token.getCompanyId(), token);
            }

            scheduleCompanyAuthenticationTokenExpirationTask(logger, token);

            return token;

        } catch (SecurityException e) {

            AuthenticationToken token = invalidateCompanyAuthenticationToken(logger, companyId, "authentication failure");

            if (token != null) {

                logger.debug("Logging out the entity represented by company ID '{}'...",
                        companyId);

                CompanyAuthenticationService companyAuthenticationService = (CompanyAuthenticationService) joinPoint.getTarget();

                companyAuthenticationService.logout(token);
            }

            throw e;
        }
    }

    @Around("authenticateUserMethods()")
    public AuthenticationToken authenticateUserAdvice(final ProceedingJoinPoint joinPoint) throws Throwable {

        final Logger logger = LoggerFactory
                .getLogger(joinPoint.getSignature().getDeclaringType());

        // Get arguments
        AuthenticationToken companyAuthenticationToken = (AuthenticationToken) joinPoint.getArgs()[0];
        final String userPrincipal = (String) joinPoint.getArgs()[1];

        if (!USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

            checkCompanyAuthenticationToken(logger, companyAuthenticationToken);
        }

        try {

            AuthenticationToken token = (AuthenticationToken) joinPoint.proceed(joinPoint.getArgs());

            checkTokenIntegrity(logger, companyAuthenticationToken.getCompanyId(), userPrincipal, token);

            synchronized (USER_AUTHENTICATION_TOKENS) {

                if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                    AuthenticationToken previousToken = USER_AUTHENTICATION_TOKENS.get(userPrincipal);

                    logger.debug("Returning previously created authentication token with updated expiration time for company ID '{}' and user principal '{}'...",
                            companyAuthenticationToken.getCompanyId(), userPrincipal);

                    token = updateToken(logger, previousToken, token);

                    cancelExpirationTask(logger, previousToken);

                } else {

                    AuthenticationToken previousCompanyAuthenticationToken = invalidateCompanyAuthenticationToken(logger, companyAuthenticationToken.getCompanyId(), "token elevation");

                    logger.debug("Caching the returned authentication token '{}' for user principal '{}'...",
                            token.getUniqueValue(),
                            userPrincipal);

                    //token = new AuthenticationToken(companyAuthenticationToken.getCompanyId(), userPrincipal, previousCompanyAuthenticationToken.getUniqueValue(), token.getAuthenticationTime(), token.getExpirationTime());
                    token = updateToken(logger, previousCompanyAuthenticationToken, token);

                    cancelExpirationTask(logger, companyAuthenticationToken);
                }

                USER_AUTHENTICATION_TOKENS.put(userPrincipal, token);
            }

            scheduleUserAuthenticationTokenExpirationTask(logger, token);

            return token;

        } catch (Exception e) {

            AuthenticationToken token = invalidateUserAuthenticationToken(logger, userPrincipal, "authentication failure");

            if (token != null) {

                LoggerFactory
                        .getLogger(joinPoint.getSignature().getDeclaringType())
                        .debug("Logging out the entity represented by user principal '{}'...",
                                userPrincipal);

                UserAuthenticationService userAuthenticationService = (UserAuthenticationService) joinPoint.getTarget();

                userAuthenticationService.logout(token);
            }

            throw e;
        }
    }

    @Around("deauthenticateCompanyMethods()")
    public void deauthenticateCompanyAdvice(JoinPoint joinPoint) {

        Logger logger = LoggerFactory
                .getLogger(joinPoint.getSignature().getDeclaringType());

        // Get the token
        AuthenticationToken token = (AuthenticationToken) joinPoint.getArgs()[0];

        // Sanity check
        if (token == null) {

            logger.warn("Called log out with a null token.");
            
            return;
        }

        // Get the company ID
        String companyId = token.getCompanyId();

        // Clear the token if it is cached
        invalidateCompanyAuthenticationToken(logger, companyId, "logout");
    }

    @Around("deauthenticateUserMethods()")
    public void deauthenticateUserAdvice(JoinPoint joinPoint) {

        // Get the token
        AuthenticationToken token = (AuthenticationToken) joinPoint.getArgs()[0];

        // Sanity check
        if (token == null) {

            LoggerFactory
                    .getLogger(joinPoint.getSignature().getDeclaringType())
                    .warn("Called log out with a null token.");
            
            return;
        }

        // Get the user principal
        String userPrincipal = token.getUserPrincipal();

        // Clear the token if it is cached
        synchronized (USER_AUTHENTICATION_TOKENS) {

            if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                LoggerFactory
                        .getLogger(joinPoint.getSignature().getDeclaringType())
                        .warn("Removing cached authentication token for the user with principal '{}' due to logout.", userPrincipal);

                USER_AUTHENTICATION_TOKENS.remove(userPrincipal);
            }
        }
    }

//    @Before("serviceMethodsThatAcceptToken()")
//    public void continueWithLatestTokenAdvice(final JoinPoint joinPoint) {
//
//        LoggerFactory
//                .getLogger(joinPoint.getSignature().getDeclaringType())
//                .debug("Passing authentication token: {}", joinPoint.getArgs()[0]);
//    }
    @Around("serviceMethodsThatAcceptToken()")
    public Object continueWithLatestTokenAdvice(final ProceedingJoinPoint joinPoint) throws Throwable {

        Logger logger = LoggerFactory
                .getLogger(joinPoint.getSignature().getDeclaringType());

        Object[] args = joinPoint.getArgs();

        if (args == null) {

            logger.error("Arguments not available.");

            return joinPoint.proceed(args);
        }

        AuthenticationToken passedToken = null;
        int passedTokenIndex = -1;

        for (int i = 0; i < args.length; i++) {

            Object arg = args[i];

            if (AuthenticationToken.class.isInstance(arg)) {

                passedToken = (AuthenticationToken) arg;
                passedTokenIndex = i;

                logger.debug("Using authentication token argument '{}' with index {}...", passedToken == null ? null : passedToken.getUniqueValue(), i);

                break;
            }
        }

        if (passedToken == null) {

            logger.error("Failed to find a token argument.");

            return joinPoint.proceed(args);
        }

        AuthenticationToken newToken = getLatestToken(logger, passedToken);

        args[passedTokenIndex] = newToken;

        return joinPoint.proceed(args);
    }

    @AfterReturning("serviceMethodsThatAcceptToken()")
    public void touchSession(final JoinPoint joinPoint) {

        final Logger logger = LoggerFactory
                .getLogger(joinPoint.getSignature().getDeclaringType());

        Object[] args = joinPoint.getArgs();

        if (args == null) {

            logger.warn("Arguments not available for touching session, ignoring...");

            return;
        }

        AuthenticationToken passedToken = null;

        for (int i = 0; i < args.length; i++) {

            Object arg = args[i];

            if (AuthenticationToken.class.isInstance(arg)) {

                passedToken = (AuthenticationToken) arg;

                logger.debug("Using authentication token argument '{}' with index {}...", passedToken == null ? null : passedToken.getUniqueValue(), i);

                break;
            }
        }

        if (passedToken == null) {

            logger.error("Failed to find a token argument.");

            return;
        }

        logger.debug("Touching session for the token '{}(companyId: {}, userPrincipal: {})'...", passedToken.getUniqueValue(), passedToken.getCompanyId(), passedToken.getUserPrincipal());

        touchToken(logger, passedToken);
    }

    private AuthenticationToken updateToken(Logger logger, AuthenticationToken previousToken, AuthenticationToken newToken) {

        return new AuthenticationToken(newToken.getCompanyId(), newToken.getUserPrincipal(), newToken.getDeviceId(), newToken.getUserDomain(), previousToken.getUniqueValue(), previousToken.getAuthenticationTime(), newToken.getExpirationTime());
    }

    private void checkTokenIntegrity(Logger logger, String companyId, String userPrincipal, AuthenticationToken token) {

        if (token == null) {

            throw new SecurityException("Null token received.");
        }

        if (!Objects.equals(companyId, token.getCompanyId())) {

            logger.error("Authentication token integrity check failed: expected company ID was '{}' but found '{}'.", companyId, token.getCompanyId());

            throw new SecurityException("Authentication token integrity check failed.");
        }

        if (!Objects.equals(userPrincipal, token.getUserPrincipal())) {

            logger.error("Authentication token integrity check failed: expected user principal was '{}' but found '{}'.", userPrincipal, token.getUserPrincipal());

            throw new SecurityException("Authentication token integrity check failed.");
        }
    }

    private void checkCompanyAuthenticationToken(Logger logger, AuthenticationToken token) {

        if (token == null) {

            throw new SecurityException("Null token received.");
        }

        synchronized (COMPANY_AUTHENTICATION_TOKENS) {

            if (!COMPANY_AUTHENTICATION_TOKENS.containsKey(token.getCompanyId())) {

                throw new SecurityException("Unknown company authentication token.");
            }
        }
    }

    private void cancelExpirationTask(Logger logger, AuthenticationToken token) {

        synchronized (EXPIRATION_FUTURES) {

            if (EXPIRATION_FUTURES.containsKey(token)) {

                logger.debug("Cancelling previously scheduled expiration future for token '{}'...",
                        token.getUniqueValue());

                ScheduledFuture future = EXPIRATION_FUTURES.get(token);

                if (future == null) {

                    logger.debug("Future for the expiration task of token '{}' was not found.", token.getUniqueValue());

                    return;
                }

                boolean cancelled = future.cancel(false);

                if (cancelled) {

                    logger.debug("Cancelled previous expiration task for token '{}'.", token.getUniqueValue());

                } else {

                    logger.warn("Failed to cancel the expiration task for token '{}', token may already be expired.", token.getUniqueValue());
                }
            }
        }
    }

    private void scheduleCompanyAuthenticationTokenExpirationTask(final Logger logger, AuthenticationToken token) {

        long millisToExecution = token.getExpirationTime().getTime() - System.currentTimeMillis();

        logger.debug("Scheduling expiration task for token '{}' to be executed after {} seconds...",
                token.getUniqueValue(), millisToExecution / 1000.0F);

        final String companyId = token.getCompanyId();

        synchronized (EXPIRATION_FUTURES) {

            ScheduledFuture future = EXECUTOR_SERVICE.schedule(new ExpirationTask(logger, null, companyId), millisToExecution, TimeUnit.MILLISECONDS);

            EXPIRATION_FUTURES.put(token, future);
        }

    }

    private AuthenticationToken invalidateCompanyAuthenticationToken(Logger logger, String companyId, String reason) {

        AuthenticationToken token = null;

        synchronized (COMPANY_AUTHENTICATION_TOKENS) {

            if (COMPANY_AUTHENTICATION_TOKENS.containsKey(companyId)) {

                token = COMPANY_AUTHENTICATION_TOKENS.get(companyId);

                logger.debug("Removing previously cached authentication token company ID '{}' due to {}...", companyId, reason);

                COMPANY_AUTHENTICATION_TOKENS.remove(companyId);
            }
        }

        return token;
    }

    private void scheduleUserAuthenticationTokenExpirationTask(final Logger logger, AuthenticationToken token) {

        long millisToExecution = token.getExpirationTime().getTime() - System.currentTimeMillis();

        logger.debug("Scheduling expiration task for token '{}' to be executed after {} seconds...",
                token.getUniqueValue(), millisToExecution / 1000.0F);

        final String userPrincipal = token.getUserPrincipal();

        synchronized (EXPIRATION_FUTURES) {

            ScheduledFuture future = EXECUTOR_SERVICE.schedule(new ExpirationTask(logger, userPrincipal, null), millisToExecution, TimeUnit.MILLISECONDS);

            EXPIRATION_FUTURES.put(token, future);
        }
    }

    private AuthenticationToken invalidateUserAuthenticationToken(Logger logger, String userPrincipal, String reason) {

        AuthenticationToken token = null;

        synchronized (USER_AUTHENTICATION_TOKENS) {

            if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                token = USER_AUTHENTICATION_TOKENS.get(userPrincipal);

                logger.debug("Removing previously cached authentication token for user principal '{}' due to {}...", userPrincipal, reason);

                USER_AUTHENTICATION_TOKENS.remove(userPrincipal);
            }
        }

        return token;
    }

    private AuthenticationToken getLatestToken(Logger logger, AuthenticationToken passedToken) {

        String companyId = passedToken.getCompanyId();
        String userPrincipal = passedToken.getUserPrincipal();

        if (userPrincipal != null) {

            synchronized (USER_AUTHENTICATION_TOKENS) {

                if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                    AuthenticationToken foundToken = USER_AUTHENTICATION_TOKENS.get(userPrincipal);

                    if (!Objects.equals(foundToken.getUniqueValue(), passedToken.getUniqueValue())) {

                        logger.error("While currently available token for user principal '{}' is '{}', passed token was '{}'.", passedToken.getUserPrincipal(), foundToken.getUniqueValue(), passedToken.getUniqueValue());

                        throw new SecurityException("Unknown authentication token.");
                    }

                    return foundToken;
                }
            }
        }

        if (companyId != null) {

            synchronized (COMPANY_AUTHENTICATION_TOKENS) {

                if (COMPANY_AUTHENTICATION_TOKENS.containsKey(companyId)) {

                    AuthenticationToken foundToken = COMPANY_AUTHENTICATION_TOKENS.get(companyId);

                    if (!Objects.equals(foundToken.getUniqueValue(), passedToken.getUniqueValue())) {

                        logger.error("While currently available token for company ID '{}' is '{}', passed token was '{}'.", passedToken.getCompanyId(), foundToken.getUniqueValue(), passedToken.getUniqueValue());

                        throw new SecurityException("Unknown authentication token.");
                    }

                    return foundToken;
                }
            }
        }

        throw new SecurityException("No matching active token found.");
    }

    private void touchToken(Logger logger, AuthenticationToken passedToken) {

        String companyId = passedToken.getCompanyId();
        String userPrincipal = passedToken.getUserPrincipal();
        AuthenticationToken newToken;

        cancelExpirationTask(logger, passedToken);

        if (userPrincipal != null) {

            synchronized (USER_AUTHENTICATION_TOKENS) {

                if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                    AuthenticationToken foundToken = USER_AUTHENTICATION_TOKENS.get(userPrincipal);

                    Calendar calendar = Calendar.getInstance();
                    calendar.setTime(foundToken.getExpirationTime());

                    calendar.add(Calendar.SECOND, (int) TOUCH_DELAY);

                    newToken = new AuthenticationToken(foundToken.getCompanyId(), foundToken.getUserPrincipal(), foundToken.getDeviceId(), foundToken.getUserDomain(), foundToken.getUniqueValue(), foundToken.getAuthenticationTime(), calendar.getTime());

                    USER_AUTHENTICATION_TOKENS.put(userPrincipal, newToken);

                    scheduleUserAuthenticationTokenExpirationTask(logger, newToken);

                } else {

                    logger.error("No authentication token was found for the user principal '{}'.", userPrincipal);
                }
            }

        } else if (companyId != null) {

            synchronized (COMPANY_AUTHENTICATION_TOKENS) {

                if (COMPANY_AUTHENTICATION_TOKENS.containsKey(companyId)) {

                    AuthenticationToken foundToken = COMPANY_AUTHENTICATION_TOKENS.get(companyId);

                    Calendar calendar = Calendar.getInstance();
                    calendar.setTime(foundToken.getExpirationTime());

                    calendar.add(Calendar.SECOND, (int) TOUCH_DELAY);

                    newToken = new AuthenticationToken(foundToken.getCompanyId(), foundToken.getUserPrincipal(), foundToken.getDeviceId(), foundToken.getUserDomain(), foundToken.getUniqueValue(), foundToken.getAuthenticationTime(), calendar.getTime());

                    COMPANY_AUTHENTICATION_TOKENS.put(companyId, newToken);

                    scheduleCompanyAuthenticationTokenExpirationTask(logger, newToken);

                } else {

                    logger.error("No authentication token was found for the company ID '{}'.", companyId);
                }
            }
        }
    }

    private static class ExpirationTask implements Runnable {

        private final Logger logger;
        private final String userPrincipal;
        private final String companyId;

        public ExpirationTask(Logger logger, String userPrincipal, String companyId) {
            this.logger = logger;
            this.userPrincipal = userPrincipal;
            this.companyId = companyId;
        }

        @Override
        public void run() {

            if (userPrincipal != null) {

                this.expireUserAuthenticationToken();

            } else if (companyId != null) {

                this.expireCompanyAuthenticationToken();

            } else {

                logger.error("Could not expire token because there is no identity to find the token.");
            }
        }

        private void expireCompanyAuthenticationToken() {

            logger.debug("Running expiration task for company ID '{}'...",
                    companyId);

            synchronized (COMPANY_AUTHENTICATION_TOKENS) {

                if (COMPANY_AUTHENTICATION_TOKENS.containsKey(companyId)) {

                    logger.debug("Expiring authentication token for company ID '{}'...",
                            companyId);

                    COMPANY_AUTHENTICATION_TOKENS.remove(companyId);
                }
            }

        }

        private void expireUserAuthenticationToken() {

            logger.debug("Running expiration task for user principal '{}'...",
                    userPrincipal);

            synchronized (USER_AUTHENTICATION_TOKENS) {

                if (USER_AUTHENTICATION_TOKENS.containsKey(userPrincipal)) {

                    logger.debug("Expiring authentication token for user principal '{}'...",
                            userPrincipal);

                    USER_AUTHENTICATION_TOKENS.remove(userPrincipal);
                }
            }
        }
    }
}
