package tr.com.eno.livo.server.web;

import java.io.IOException;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.logging.Level;
import javax.management.MalformedObjectNameException;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.GrantedAuthorityImpl;
import org.springframework.security.core.userdetails.UserDetails;

import tr.com.eno.livo.server.authc.AuthenticationToken;
//import tr.com.eno.livo.server.authc.CompanyAuthenticationService;
//import tr.com.eno.livo.server.authc.UserAuthenticationService;
//import tr.com.eno.livo.server.usermgmt.User;
//import tr.com.eno.livo.server.usermgmt.UserManagementService;

@SuppressWarnings("deprecation")
public class LivoUserDetailsAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(LivoUserDetailsAuthenticationProvider.class);

    LivoSession aeonSession;

    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails,
            UsernamePasswordAuthenticationToken authentication)
            throws AuthenticationException {
        // TODO Auto-generated method stub

    }

    @Override
    protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) {
        try{
        Subject subject =SecurityUtils.getSubject();         
        
        subject.login(new UsernamePasswordToken(authentication.getPrincipal().toString(),authentication.getCredentials().toString(),true));
        
        return new WebUser(subject.getPrincipal().toString(),authentication.getCredentials().toString(), Collections.singleton(new GrantedAuthorityImpl("admin")));
        //return new AEONUser(new User(0, "Admin", "Admin", 2, "mail@change.me", true), token, Collections.singleton(new GrantedAuthorityImpl("admin")));
        }catch(Exception ex){
        LOGGER.error("Error:",ex);
        throw new AuthenticationServiceException(ex.getMessage());
        
        }

        
        /*
//        CompanyAuthenticationService companyAuthService;
        UserAuthenticationService userAuthService;

        try {

//            companyAuthService = ManagementHelper.getCompanyAuthenticationService();

            userAuthService = ManagementHelper.getUserAuthenticationService();

        } catch (Exception e) {
            LOGGER.error("AuthService exception. ", e.getMessage(), e);
            throw new AuthenticationServiceException(e.getMessage());
        }

        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, 14);
        Date expTime = calendar.getTime();
        
        AuthenticationToken token = new AuthenticationToken("livo", "admin", "livo2015", new Date(), expTime);
        
        User user = null;
        try {

//            LOGGER.debug("Trying to authenticate the company with the ID '{}'...", "livo");

//            token = companyAuthService.login("livo", "livo");

            LOGGER.debug("Trying to authenticate user with the ID '{}'...", authentication.getPrincipal());

            token = userAuthService.login( token , authentication.getPrincipal().toString(), authentication.getCredentials().toString());

            UserManagementService userManagementService;
            try {

                userManagementService = ManagementHelper.getUserManagementService();
                LOGGER.debug("getUser with the token.getUserPrincipal() from userManagementService '{}'...", token.getUserPrincipal());
                user = userManagementService.getUser(token.getUserPrincipal(), token);
                if (user.getUserRole() == 0) {
                    // UserRole is client user 
                    LOGGER.error("User login failed. Caused: User Role is client, ", user.getUserRole());
                    throw new AuthenticationServiceException("User login failed. Caused: User Role is client.");
                }
            } catch (MalformedObjectNameException ex) {
                java.util.logging.Logger.getLogger(AEONUserDetailsAuthenticationProvider.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IOException ex) {
                java.util.logging.Logger.getLogger(AEONUserDetailsAuthenticationProvider.class.getName()).log(Level.SEVERE, null, ex);
            }

        } catch (SecurityException e) {

            LOGGER.error("Authentication failed for the company with the ID '{}'...", authentication.getPrincipal());

            throw new AuthenticationServiceException(e.getMessage(), e);
        }

        if (token == null) {
            throw new AuthenticationServiceException("No authentication token was returned by the userAuthService.login.");
        }
        if (user == null) {
            throw new AuthenticationServiceException("No authentication user was returned by the userManagementService.getUser.");
        }
        return new AEONUser(user, token, Collections.singleton(new GrantedAuthorityImpl("admin")));
                */
    }
}
