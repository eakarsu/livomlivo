package tr.com.eno.livo.server.users;

import javax.management.MXBean;

@MXBean
public interface UserManagementService {

    public void activateUser(String id, String domain) throws UserNotFoundException;

    public void activateUser(User user) throws UserNotFoundException;

    public void suspendUser(String id, String domain) throws UserNotFoundException;

    public void suspendUser(User user) throws UserNotFoundException;

    public void createUser(User user, String password) throws InvalidUserException, InvalidPasswordException, UserAlreadyExistsException;

    /**
     * Note that while this method can update a user's ID, it cannot update the active status of the user.
     * @param user
     * @throws UserNotFoundException 
     */
    public void updateUser(User user) throws UserNotFoundException;
    
    public void updateUserID(User user, String newId) throws UserNotFoundException, UserAlreadyExistsException;

    public void updateUserPassword(User user, String password) throws UserNotFoundException, InvalidPasswordException;

    public void deleteUser(User user);

    public void createGroup(UserGroup group) throws InvalidUserGroupException, UserGroupAlreadyExistsException;

    public void updateGroup(UserGroup group) throws UserGroupNotFoundException;

    public void updateGroupName(UserGroup group, String newName) throws UserGroupNotFoundException, UserGroupAlreadyExistsException;
    
    public void deleteGroup(UserGroup group);
}
