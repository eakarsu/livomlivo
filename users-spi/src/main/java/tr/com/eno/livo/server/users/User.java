package tr.com.eno.livo.server.users;

import java.beans.ConstructorProperties;
import java.io.Serializable;
import java.text.MessageFormat;

public class User implements Serializable {

    private static final long serialVersionUID = -6377231767078734596L;

    private final String id;
    private final String domain;
    private final String mail;
    private final String firstName;
    private final String lastName;
    private final boolean active;

    @ConstructorProperties({"id", "domain", "mail", "firstName", "lastName", "active"})
    public User(String id, String domain, String mail, String firstName, String lastName, boolean active) {

        this.id = id;
        this.domain = domain;
        this.mail = mail;
        this.firstName = firstName;
        this.lastName = lastName;
        this.active = active;
    }

    @ConstructorProperties({"id", "domain", "mail", "firstName", "lastName"})
    public User(String id, String domain, String mail, String firstName, String lastName) {

        this.id = id;
        this.domain = domain;
        this.mail = mail;
        this.firstName = firstName;
        this.lastName = lastName;
        this.active = false;
    }

    /**
     * @return the id
     */
    public String getId() {
        return id;
    }

    /**
     * @return the mail
     */
    public String getMail() {
        return mail;
    }

    /**
     * @return the firstName
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * @return the lastName
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * @return the active
     */
    public boolean isActive() {
        return active;
    }

    /**
     * @return the domain
     */
    public String getDomain() {
        return domain;
    }

    @Override
    public boolean equals(Object o) {

        if (o == null) {
            return false;
        }

        if (!User.class.isInstance(o)) {

            return false;
        }

        User otherUser = (User) o;

        return this.id.equalsIgnoreCase(otherUser.id) && this.domain.equals(otherUser.domain);
    }

    @Override
    public int hashCode() {

        return (this.id + this.domain).hashCode();
    }

    @Override
    public String toString() {
        
        return MessageFormat.format("{0}\\{1}", domain, id);
    }
}
