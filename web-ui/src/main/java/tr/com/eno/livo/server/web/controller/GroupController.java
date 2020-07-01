package tr.com.eno.livo.server.web.controller;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import javax.management.MalformedObjectNameException;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;
import tr.com.eno.livo.server.users.UserManagementService;
import tr.com.eno.livo.server.users.UserQueryService;
import tr.com.eno.livo.server.web.ManagementHelper;

@Controller
public class GroupController {

    //TODO this user value will be from login information, login service must be prepared. Change 'USER' variable in every method.
    private static final Logger LOGGER = LoggerFactory.getLogger(GroupController.class);

    public static final String DOMAIN = "System";

    @RequestMapping(value = "/groupTable", method = RequestMethod.POST)
    public String showGroups(ModelMap map) throws MalformedObjectNameException, IOException {
        LOGGER.debug("showGroups() is started.");
        try {
            //Get the connection to user query service.
            UserQueryService service = ManagementHelper.getUserQueryService();
            //Get group list from connection.
            Set<UserGroup> groups = service.listGroups();
//            Set<UserGroup> groups = new HashSet<UserGroup>();
//            UserGroup userGroup = new UserGroup("group-1", "System", null);
//            groups.add(userGroup);
//
//            userGroup = new UserGroup("group-2", "System", null);
//            groups.add(userGroup);
//          TODO put current WebUser to WebUserManager object below.
//          users.addAll(new WebUserManager(user).getWebUsers());
            LOGGER.debug("Group count : " + groups.size());
//          Put them into modelmap
            map.put("groups", groups);

            return "groups";

        } catch (Exception e) {
            LOGGER.error("Exception has been occured in showGroups(): " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @RequestMapping(value = "/createNewGroup", method = RequestMethod.POST)
    @ResponseBody
    public String createNewGroup(@RequestParam("groupName") String groupName, @RequestParam("groupDescription") String groupDescription, HttpServletResponse response) {
        LOGGER.debug("createNewGroup() is started with: '{}'" + " groupName : " + groupName + " groupDescription : " + groupDescription);

        //Get the connection to user query service.
        UserManagementService service;
        Set<User> users = new HashSet<User>();
        try {
            service = ManagementHelper.getUserManagementService();
            UserGroup userGroup = new UserGroup(groupName, DOMAIN, groupDescription, users);
            //create group list from connection.
            service.createGroup(userGroup);

        } catch (Exception ex) {
            LOGGER.error("New group cannot be created. " + ex.getMessage(), ex);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            return "Failed: " + ex.getMessage();
        }
        LOGGER.debug("Group succesfully created.", groupName);

        return "Succesfully created.";

    }

    @RequestMapping(value = "/updateGroup", method = RequestMethod.POST)
    @ResponseBody
    public String updateGroup(@RequestParam("groupName") String groupName, @RequestParam("newGroupName") String newGroupName, @RequestParam("newGroupDescription") String newGroupDescription, HttpServletResponse response) {
        LOGGER.debug("updateGroup() is started with: '{}'" + " groupName : " + groupName + " newGroupName : " + newGroupName + " newGroupDescription : " + newGroupDescription);
        boolean groupNameUpdated = false;
        //Get the connection to user query service.
        UserManagementService service;
        UserQueryService qService;
    
        try {
            service = ManagementHelper.getUserManagementService();
            qService = ManagementHelper.getUserQueryService();
            UserGroup userGroup = qService.findGroup(groupName, DOMAIN);

            if (userGroup.getName().equalsIgnoreCase(newGroupName) && userGroup.getDescription().equalsIgnoreCase(newGroupDescription)) {

                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

                return "Failed: At least one modification is required.";
            }

            if (!userGroup.getName().equalsIgnoreCase(newGroupName)) {

                service.updateGroupName(userGroup, newGroupName);
                groupNameUpdated = true;
            }

            if (!userGroup.getDescription().equalsIgnoreCase(newGroupDescription)) {
                if (groupNameUpdated) {
                    UserGroup group = qService.findGroup(newGroupName, DOMAIN);
                    UserGroup newUserGroup = new UserGroup(group.getName(), group.getDomain(), newGroupDescription, group.getUsers());
                    service.updateGroup(newUserGroup);

                } else {
                    UserGroup group = new UserGroup(userGroup.getName(), userGroup.getDomain(), newGroupDescription, userGroup.getUsers());
                    service.updateGroup(group);
                }

            }
 
        } catch (Exception ex) {
            LOGGER.error("User group cannot be updated. " + ex.getMessage(), ex);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            return "Failed: " + ex.getMessage();
        }
        LOGGER.debug("Group succesfully updated.", newGroupName);

        return "Succesfully updated.";

    }
    
    
    @RequestMapping(value = "/deleteGroup", method = RequestMethod.POST)
    @ResponseBody
    public String deleteGroup(@RequestParam("groupName") String groupName , HttpServletResponse response) {
        LOGGER.debug("deleteGroup() is started with: '{}'" + " groupName : " + groupName );
       
        //Get the connection to user query service.
        UserManagementService service;
        UserQueryService qService;
    
        try {
            service = ManagementHelper.getUserManagementService();
            qService = ManagementHelper.getUserQueryService();
           
            UserGroup userGroup = qService.findGroup(groupName, DOMAIN);

            service.deleteGroup(userGroup);
 
        } catch (Exception ex) {
            LOGGER.error("User group cannot be deleted. " + ex.getMessage(), ex);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            return "Failed: " + ex.getMessage();
        }
        LOGGER.debug("Group succesfully deleted.", groupName);

        return "Succesfully deleted.";

    }

}
