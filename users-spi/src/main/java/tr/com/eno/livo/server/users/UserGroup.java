package tr.com.eno.livo.server.users;

import java.beans.ConstructorProperties;
import java.io.Serializable;
import java.text.MessageFormat;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 *
 * @author Deniz Acay
 */
public class UserGroup implements Iterable<User>, Serializable {

    private static final long serialVersionUID = -5870709655833041123L;

    private final String name;
    private final String domain;
    private final String description;
    private final Set<User> users;

    @ConstructorProperties({"name", "domain", "description", "users"})
    public UserGroup(String name, String domain, String description, Set<User> users) {
        
        this.name = name;
        this.domain = domain;
        this.description = description;

        if (users == null) {
            users = new HashSet<>();
        }

        this.users = users;
    }

    @Override
    public Iterator<User> iterator() {

        // Get a unmodifiable copy of the user set
        Set<User> unmodifiableUsers = Collections.unmodifiableSet(getUsers());

        // Return the unmodifiable set's iterator
        return unmodifiableUsers.iterator();
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @return the users
     */
    public Set<User> getUsers() {
        return Collections.unmodifiableSet(users);
    }

    /**
     * @return the domain
     */
    public String getDomain() {
        return domain;
    }

    public void addUser(User user) {

        if (user == null) {
            return;
        }

        if (!this.domain.equals(user.getDomain())) {

            throw new SecurityException("Domain mismatch when adding user to group.");
        }

        synchronized (this.users) {

            this.users.add(user);
        }
    }

    public void removeUser(User user) {

        if (user == null) {
            return;
        }

        if (!this.domain.equals(user.getDomain())) {

            throw new SecurityException("Domain mismatch when removing user from group.");
        }

        synchronized (this.users) {

            this.users.remove(user);
        }
    }

    @Override
    public boolean equals(Object o) {

        if (o == null) {
            return false;
        }

        if (!UserGroup.class.isInstance(o)) {

            return false;
        }

        UserGroup otherGroup = (UserGroup) o;

        return this.name.equals(otherGroup.name) && this.domain.equals(otherGroup.domain);
    }

    @Override
    public String toString() {
        
        return MessageFormat.format("{0}\\Group({1})", this.domain, this.name);
    }
}
