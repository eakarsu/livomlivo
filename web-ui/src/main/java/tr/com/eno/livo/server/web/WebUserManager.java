package tr.com.eno.livo.server.web;

import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import com.datastax.driver.core.exceptions.NoHostAvailableException;
import com.datastax.driver.core.exceptions.QueryExecutionException;
import com.datastax.driver.core.exceptions.QueryValidationException;
import com.datastax.driver.core.exceptions.UnsupportedFeatureException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.codec.CodecException;
import org.apache.shiro.crypto.UnknownAlgorithmException;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.User;

public class WebUserManager {

    private final static Logger LOGGER = LoggerFactory.getLogger(WebUserManager.class);

    private final WebUser user;

    public WebUserManager(WebUser user) {

        this.user = user;

    }

    public void createNewWebUser(String userName, String userPassword, String userMail) {

        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        try {

            SecurityUtils.getSubject().checkPermissions("create:webuser", "create:developer");

            PreparedStatement statement = session.prepare("INSERT INTO web.users (userid, username, userpassword, passwordsalt, usermail,creationtime,creator) VALUES (?, ?, ?, ?, ?,?,?) IF NOT EXISTS USING TTL 31536000;");

            session.execute(statement.bind(userName.hashCode(), userName, ByteBuffer.wrap(new SimpleHash("SHA-256", userPassword, ("Settar" + userName).getBytes("UTF-8")).getBytes()), ByteBuffer.wrap(("Settar" + userName).getBytes("UTF-8")), userMail, new Date().getTime(), "LivoTeam"));

            statement = session.prepare("INSERT INTO web.userroles(roleid, username,userrole,time) VALUES (?,?,?,?) IF NOT EXISTS USING TTL 31536000;");

            session.execute(statement.bind((userName+userName).hashCode(), userName, "Developer", new Date().getTime()));

            connector.disconnect();

        } catch (UnsupportedEncodingException ex) {
            connector.disconnect();

            LOGGER.error("Encoding exception: {}", ex);

            throw new RuntimeException("Encoding problem.");

        } catch (AuthorizationException ex) {

            connector.disconnect();

            throw new SecurityException("User has no permission!");
        } catch (NoHostAvailableException ex) {

            connector.disconnect();

            throw new RuntimeException("Host is unavailable");
        } catch (QueryExecutionException ex) {

            connector.disconnect();

            LOGGER.error("Query error: {}", ex);

            throw new RuntimeException(ex.getCause());
        } catch (QueryValidationException ex) {

            connector.disconnect();

            LOGGER.error("Validation error:{}", ex);

            throw new RuntimeException("Validation problem.");
        } catch (UnsupportedFeatureException ex) {

            connector.disconnect();

            LOGGER.error(ex.getMessage() + " :{}", ex);

            throw new RuntimeException("Critical problem!");
        }

    }

    public void modifyWebUserName(String oldName, String newName) {

        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        if (oldName.equalsIgnoreCase("Administrator")) {
            throw new SecurityException("Administrator account name can not be changed!");
        }
        try {
            SecurityUtils.getSubject().checkPermission("*");

            session.execute("UPDATE web.users USING TTL 31536000 SET username=" + newName + " where userid=" + oldName.hashCode());

            connector.disconnect();
        } catch (Exception ex) {

            connector.disconnect();

            LOGGER.error("Error during changing username, ERROR: {}", ex);

            throw new RuntimeException("Error during changing user attribute!");

        }

    }

    public void modifyWebUserPassword(String userName, String newPassword) {

        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        Subject subject = SecurityUtils.getSubject();
        try {

            if (userName.equalsIgnoreCase("Administrator")) {
                subject.checkPermission("*");
            } else {
                subject.checkPermissions(DeveloperPermissions.MODIFY_SELF.getPermission());
            }

            PreparedStatement statement = session.prepare("UPDATE web.users USING TTL 31536000 SET userpassword=?,passwordsalt=? where userid=?");
            session.execute(statement.bind(ByteBuffer.wrap(new SimpleHash("SHA-256", newPassword, ("Settar" + userName).getBytes("UTF-8")).getBytes()), ByteBuffer.wrap(("Settar" + userName).getBytes("UTF-8")), userName.hashCode()));

            connector.disconnect();
        } catch (Exception ex) {

            connector.disconnect();

            LOGGER.error("Error during changing password, ERROR: {}", ex);

            throw new RuntimeException("Error during changing user attribute!");

        }
    }

    public void modifyWebUserMail(String userName, String newMailAdress) {

        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        try {

            if (userName.equalsIgnoreCase("Administrator")) {
                SecurityUtils.getSubject().checkPermission("*");
            } else {
                SecurityUtils.getSubject().checkPermissions(DeveloperPermissions.MODIFY_SELF.getPermission());
            }

            PreparedStatement statement = session.prepare("UPDATE web.users SET usermail=? where userid=?");

            session.execute(statement.bind(newMailAdress, userName.hashCode()));

            connector.disconnect();
        } catch (Exception ex) {

            connector.disconnect();

            LOGGER.error("Error during changing username, ERROR: {}", ex);

            throw new RuntimeException("Error during changing user attribute!");

        }
    }

    public List<User> getWebUsers() {

        CassandraConnector connector = new CassandraConnector();
        
        Session session = connector.getSession();
        

        // "Select userpassword, passwordsalt from web.users where username = ? allow filtering"
        try {

            List<User> users = new LinkedList<>();

            ResultSet rs = session.execute("Select username, usermail from web.users allow filtering;");

            for (Row row : rs.all()) {

                users.add(new User(row.getString("username"), "", row.getString("usermail"), "", ""));
            }

            connector.disconnect();
            return users;
        } catch (Exception ex) {
            LOGGER.error("Cannot run the query, ERROR: {}", ex);
            connector.disconnect();
            return null;
        } finally {
            LOGGER.error("Finally");
        }

    }

    public void deleteWebUser(String userName) {

        if (userName.equalsIgnoreCase("administrator")) {

            throw new SecurityException("Administrator account cannot be deleted.");
        }

        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        try {
            SecurityUtils.getSubject().checkPermissions("*");

            PreparedStatement statement = session.prepare("DELETE FROM web.users  WHERE userid=?");

            session.execute(statement.bind(userName.hashCode()));

            connector.disconnect();

        } catch (AuthorizationException ex) {

            connector.disconnect();

            throw new SecurityException("User has no permission!");
        } catch (NoHostAvailableException ex) {

            connector.disconnect();

            throw new RuntimeException("Host is unavailable");
        } catch (QueryExecutionException ex) {

            connector.disconnect();

            LOGGER.error("Query error: {}", ex);

            throw new RuntimeException(ex.getCause());
        } catch (QueryValidationException ex) {

            connector.disconnect();

            LOGGER.error("Validation error:{}", ex);

            throw new RuntimeException("Validation problem.");
        } catch (UnsupportedFeatureException ex) {

            connector.disconnect();

            LOGGER.error(ex.getMessage() + " :{}", ex);

            throw new RuntimeException("Critical problem!");
        }

    }

    public void modifyDeveloper(String userName, String password, String userMail) {
        CassandraConnector connector = new CassandraConnector();

        Session session = connector.getSession();

        try {

            if (userName.equalsIgnoreCase("Administrator")) {
                SecurityUtils.getSubject().checkPermission("*");
            } else {
                SecurityUtils.getSubject().checkPermissions(DeveloperPermissions.MODIFY_SELF.getPermission());
            }

            if (!"".equals(userMail) && !"".equals(password)) {

                PreparedStatement statement = session.prepare("UPDATE web.users  USING TTL 31536000 SET userpassword=?,passwordsalt=?, usermail=? where userid=?");

                session.execute(statement.bind(ByteBuffer.wrap(new SimpleHash("SHA-256", password, ("Settar" + userName).getBytes("UTF-8")).getBytes()), ByteBuffer.wrap(("Settar" + userName).getBytes("UTF-8")), userMail, userName.hashCode()));

            } else if (!"".equals(userMail)) {

                PreparedStatement statement = session.prepare("UPDATE web.users  USING TTL 31536000 SET  usermail=? where userid=?");

                session.execute(statement.bind(userMail, userName.hashCode()));

            } else if (!"".equals(password)) {

                PreparedStatement statement = session.prepare("UPDATE web.users  USING TTL 31536000 SET userpassword=?,passwordsalt=? where userid=?");

                session.execute(statement.bind(ByteBuffer.wrap(new SimpleHash("SHA-256", password, ("Settar" + userName).getBytes("UTF-8")).getBytes()), ByteBuffer.wrap(("Settar" + userName).getBytes("UTF-8")), userName.hashCode()));

            }

            connector.disconnect();
        } catch (AuthorizationException | UnsupportedEncodingException | CodecException | UnknownAlgorithmException ex) {

            connector.disconnect();

            LOGGER.error("Error during changing username, ERROR: {}", ex);

            throw new RuntimeException("Error during changing user attribute!");

        }
    }
}
