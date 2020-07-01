package tr.com.eno.livo.server.web.controller;

import java.io.IOException;
import java.util.Map;
import javax.management.MalformedObjectNameException;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import tr.com.eno.livo.server.notification.AndroidNotification;
import tr.com.eno.livo.server.notification.NotificationPushService;
import tr.com.eno.livo.server.notification.Notifications;
import tr.com.eno.livo.server.web.AndroidNotificationConfigurationHelper;
import tr.com.eno.livo.server.web.ManagementHelper;

@Controller
public class NotificationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationController.class);

    private String homePath = System.getenv("AEON_HOME");

    @RequestMapping(value = "/notification/configureNotification/android", method = RequestMethod.POST)
    @ResponseBody
    public String configureNotification(@RequestParam("apiKey") String apiKey, @RequestParam("appName") String appName, HttpServletResponse response) throws MalformedObjectNameException, IOException {
        LOGGER.debug("configureNotification() is started with: '{}'" + " apiKey : " + apiKey);

        try {

            AndroidNotificationConfigurationHelper configurationHelper = new AndroidNotificationConfigurationHelper();

            Map data = configurationHelper.getAndroidConfiguration();

            data.put(appName, apiKey);

            configurationHelper.setAndroidConfiguration(data);

        } catch (Exception ex) {

            LOGGER.error("Push notification's configuration cannot be configured. " + ex.getMessage(), ex);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            return "Failed: " + ex.getMessage();
        }
        LOGGER.debug("Push notification's configuration is configured.");

        return "Succesfully created.";

    }

    @RequestMapping(value = "/notification/sendNotification", method = RequestMethod.POST)
    @ResponseBody
    public String sendNotification(@RequestParam("appName") String appName, @RequestParam("pushNotificationTitle") String pushNotificationTitle, @RequestParam("pushNotificationMessage") String pushNotificationMessage, @RequestParam("pushNotificationMessageType") String pushNotificationMessageType, HttpServletResponse response) throws MalformedObjectNameException, IOException {
        LOGGER.debug("sendNotification() is started with: '{}'" + " appName : " + appName);

        try {
            NotificationPushService pushService = ManagementHelper.getNotificationPushService();

            Notifications nots = new Notifications();

            AndroidNotification anot = new AndroidNotification();

            anot.setCollapseKey("message");

            anot.addData("message", pushNotificationMessage);

            nots.setGcmNotification(anot);

            pushService.push(appName, nots);

        } catch (Exception ex) {

            LOGGER.error("Push notification cannot be sent. " + ex.getMessage(), ex);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            return "Failed: " + ex.getMessage();
        }
        LOGGER.debug("Push notification sent with succesfully.");

        return "Push notification sent with succesfully.";

    }
    
    
}
