package tr.com.eno.livo.server.web.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.Set;

import javax.management.InstanceNotFoundException;
import javax.management.MalformedObjectNameException;
import org.apache.shiro.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.UserQueryService;
//import tr.com.eno.livo.server.notification.AndroidNotification;
//import tr.com.eno.livo.server.notification.NotificationPushService;
//import tr.com.eno.livo.server.notification.Notifications;
import tr.com.eno.livo.server.web.ManagementHelper;
import tr.com.eno.livo.server.web.WebUser;

@Controller
public class HomeController {

    private static final Logger LOGGER = LoggerFactory.getLogger(HomeController.class);
    private final String USER_ICONS_PROP_FILE = "userIcons.properties";

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String show(ModelMap modelMap) throws InstanceNotFoundException, MalformedObjectNameException, IOException {
        // Get the AEON home environment variable       
        String homePath = System.getenv("AEON_HOME");
        
        ApplicationService service = ManagementHelper.getApplicationService();

         UserQueryService userQueryService = ManagementHelper.getUserQueryService();

        Set<UserGroup> groups = userQueryService.listGroups();
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        WebUser user = (WebUser) authentication.getPrincipal();

//      Set<Application> applications = service.listApplications("", SecurityUtils.getSubject().getPrincipal().toString());
        
        Set<Application> applications = service.listApplications(Application.DEFAULT_DOMAIN);

        File userIconsPropertiesFile = new File(homePath + File.separator + USER_ICONS_PROP_FILE);

        String userIconSrc = getProperties(userIconsPropertiesFile, user.getUserName());

        boolean checkAdmin = true;
        
        try {
            //user role Checking..
            SecurityUtils.getSubject().checkRole("Developer");
            //User role is developer 
            checkAdmin = false;
        } catch (Exception ex) {
            LOGGER.error("User role is not Developer.", ex.getMessage());
            //User Role is administrator
            checkAdmin = true;
        }
        
        
        modelMap.put("user", user);
        modelMap.put("checkAdmin", checkAdmin);
        modelMap.put("groups", groups);
        modelMap.put("applications", applications);
        modelMap.put("authentication", authentication);
        modelMap.put("userIconSrc", userIconSrc);
        
//        NotificationPushService pushService = ManagementHelper.getNotificationPushService();
//        
//        Notifications nots = new Notifications();
//        
//        AndroidNotification anot = new AndroidNotification();
//        
//        anot.setCollapseKey("message");
//        
//        anot.addData("message", "Livo the Hope.");
//        
//        nots.setGcmNotification(anot);
//        
//        pushService.push("test", nots);

        return "home";
    }

    @RequestMapping(value = "/welcome", method = RequestMethod.POST)
    public String welcome(ModelMap modelMap) {

        return "body.welcome";
    }

    private String getProperties(File propertiesFile, String key) throws IOException {

        Properties prop = new Properties();
        prop.load(new FileInputStream(propertiesFile));

        if (prop.get(key) != null) {
            return String.valueOf(prop.get(key));
        } else {
            return String.valueOf(prop.get("default"));
        }
    }
}
