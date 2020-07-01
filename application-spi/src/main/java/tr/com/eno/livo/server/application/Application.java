package tr.com.eno.livo.server.application;

import java.beans.ConstructorProperties;
import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserGroup;

public class Application implements Serializable, Comparable<Application> {

    public static final String DEFAULT_DOMAIN = "default";
    private static final long serialVersionUID = -1438948634969823088L;
    private final String name;
    private final String domain;
    private final AuthorizationPolicy authorizationPolicy;
    private final boolean freeform;
    private final Map<String, Asset> assets;
    private final Map<String, Screen> screens;
    private final Theme theme;
    private final Set<User> authorizedUsers;
    private final Set<UserGroup> authorizedGroups;

    @ConstructorProperties({"name", "domain", "authorizationPolicy", "freeform", "assets", "screens", "theme", "authorizedUsers", "authorizedGroups"})
    public Application(String name, String domain, AuthorizationPolicy authorizationPolicy, boolean freeform, Map<String, Asset> assets, Map<String, Screen> screens, Theme theme, Set<User> authorizedUsers, Set<UserGroup> authorizedGroups) {

        this(name, domain, authorizationPolicy, freeform, theme);

        if (assets != null) {
            this.assets.putAll(assets);
        }

        if (screens != null) {
            this.screens.putAll(screens);
        }

        if (authorizedUsers != null) {
            this.authorizedUsers.addAll(authorizedUsers);
        }

        if (authorizedGroups != null) {
            this.authorizedGroups.addAll(authorizedGroups);
        }
    }

    public Application(String name, String domain, boolean freeform, Theme theme) {

        this(name, domain, AuthorizationPolicy.ALLOW_ALL, freeform, theme);
    }

    public Application(String name, String domain, AuthorizationPolicy authorizationPolicy, boolean freeform, Theme theme) {

        this.name = name;
        this.domain = domain;
        this.authorizationPolicy = authorizationPolicy;
        this.freeform = freeform;
        this.theme = theme;

        this.assets = new HashMap<>();
        this.screens = new HashMap<>();
        this.authorizedUsers = new HashSet<>();
        this.authorizedGroups = new HashSet<>();
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @return the domain
     */
    public String getDomain() {
        return domain;
    }

    /**
     * @return the authorizationPolicy
     */
    public AuthorizationPolicy getAuthorizationPolicy() {
        return authorizationPolicy;
    }

    /**
     * @return the freeform
     */
    public boolean isFreeform() {
        return freeform;
    }

    /**
     * @return the assets
     */
    public Map<String, Asset> getAssets() {
        return assets;
    }

    /**
     * @return the screens
     */
    public Map<String, Screen> getScreens() {
        return screens;
    }

    /**
     * @return the theme
     */
    public Theme getTheme() {
        return theme;
    }

    /**
     * @return the authorizedUsers
     */
    public Set<User> getAuthorizedUsers() {
        return authorizedUsers;
    }

    /**
     * @return the authorizedGroups
     */
    public Set<UserGroup> getAuthorizedGroups() {
        return authorizedGroups;
    }

    @Override
    public boolean equals(Object obj) {

        if (obj == null) {
            throw new NullPointerException();
        }

        if (obj instanceof Application) {

            Application otherApplication = (Application) obj;

            return Objects.equals(this.domain, otherApplication.domain) && Objects.equals(this.name, otherApplication.name);

        } else {

            return false;
        }
    }

    @Override
    public int hashCode() {

        return Objects.hash(this.domain, this.name);
    }

    public void addAsset(String name, Asset asset) {

        this.getAssets().put(name, asset);
    }

    public void addScreen(String name, Screen screen) {

        this.getScreens().put(name, screen);
    }

    public void authorizeUser(User user) {

        this.authorizedUsers.add(user);
    }

    public void authorizeGroup(UserGroup group) {

        this.authorizedGroups.add(group);
    }

    public void deauthorizeUser(User user) {

        this.authorizedUsers.remove(user);
    }

    public void deauthorizeGroup(UserGroup group) {

        this.authorizedGroups.remove(group);
    }

    @Override
    public int compareTo(Application o) {

        if (o == null) {
            throw new NullPointerException();
        }

        if (this.domain == null) {
            throw new NullPointerException();
        }

        if (this.getName() == null) {
            throw new NullPointerException();
        }

        int domainComparison = this.domain.compareTo(o.domain);
        int nameComparison = this.name.compareTo(o.name);
        
        return domainComparison == 0 ? nameComparison : domainComparison;
    }
}
