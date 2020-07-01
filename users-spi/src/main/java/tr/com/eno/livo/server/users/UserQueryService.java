package tr.com.eno.livo.server.users;

import java.util.Set;
import javax.management.MXBean;

@MXBean
public interface UserQueryService {

    public Set<User> listUsers();

    public Set<User> listUsers(String domain);

    public Set<User> listUsers(UserGroup group) throws UserGroupNotFoundException;

    public Set<UserGroup> listGroups();

    public Set<UserGroup> listGroups(String domain);

    public User findUser(String id, String domain) throws UserNotFoundException;

    public UserGroup findGroup(String name, String domain) throws UserGroupNotFoundException;
}
