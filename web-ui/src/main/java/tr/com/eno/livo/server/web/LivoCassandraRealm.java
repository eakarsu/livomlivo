package tr.com.eno.livo.server.web;

import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SaltedAuthenticationInfo;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authc.credential.HashedCredentialsMatcher;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.SimplePrincipalCollection;
import org.apache.shiro.util.ByteSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Beyhan
 */
public class LivoCassandraRealm extends AuthorizingRealm implements Serializable{

    private final static Logger LOGGER = LoggerFactory.getLogger(LivoCassandraRealm.class);

    private static final String AUTHENTICATIONQUERY = "Select * from web.users where userid= ? allow filtering";

    private static final String ROLESQUERY = "Select * from web.userroles";

    private static final String PERMISSIONSQUERY = "Select * from web.rolepermissions";

    private String authenticationQuery = AUTHENTICATIONQUERY;
    private String userRolesQuery = ROLESQUERY;
    private String permissionsQuery = PERMISSIONSQUERY;
    private boolean enablePermissionLookup = true;

    public LivoCassandraRealm() {

        super(new HashedCredentialsMatcher("SHA-256"));
    }

    /**
     * Sets authentication query for cassandra in case of non-default usage.
     * Should be cql query.
     *
     * @param arg
     */
    public void setAuthenticationQuery(String arg) {

        this.authenticationQuery = arg;
    }

    /**
     * Sets roles query for cassandra in case of non-default usage.Should be cql
     * query.
     *
     * @param arg
     */
    public void setRolesQuery(String arg) {

        this.userRolesQuery = arg;
    }

    /**
     * Sets permissions query for cassandra in case of non-default usage. Should
     * be cql query.
     *
     * @param arg
     */
    public void setPermissionQuery(String arg) {

        this.permissionsQuery = arg;

    }

    /**
     * Default is enabled. Works for request permission control else will not
     * return permissions or will use cache.
     *
     * @param state
     */
    public void setPermissionLookupEnabled(boolean state) {
        this.enablePermissionLookup = state;
    }

    /**
     * Return current state of permission lookup.
     *
     * @return state
     */
    public boolean isPermissionLookupEnabled() {

        return this.enablePermissionLookup;
    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {

        if (principals == null) {
            throw new AuthorizationException("No user principal is found.");
        }

        String userName = "";
        
        //userName = (String) getAvailablePrincipal(principals);
        
        List<Pair> list = (List<Pair>)principals.asList();
        
        for(Pair pair : list){
        
            if(pair.getKey().toString().equalsIgnoreCase("username"))
                userName = pair.getValue().toString();
        }

        Set<String> roleNames = new HashSet<>();

        CassandraConnector conn = new CassandraConnector();

        Session session = conn.getSession();// cassandra session.

        try {

            Iterator<Row> iterator = session.execute(this.userRolesQuery).iterator();

            while (iterator.hasNext()) {
                
                Row row = iterator.next();
                if(row.getString("username").equalsIgnoreCase(userName))
                roleNames.add(row.getString("userrole"));

            }

            Set<String> permissions = new HashSet<>();
            
            iterator = session.execute(this.permissionsQuery).iterator();
                
            while(iterator.hasNext()){
            
                Row row = iterator.next();
                
                for(String roleName: roleNames){
                
                    if(row.getString("rolename").equalsIgnoreCase(roleName))
                        permissions.add(row.getString("permission"));
                }
            } 

//            for (String roleName : roleNames) {
//
//                for (Row row : session.execute(session.prepare(this.permissionsQuery).bind(roleName)).all()) {
//
//                    permissions.add(row.getString(0));
//                }
//            }

            conn.disconnect();

            SimpleAuthorizationInfo in = new SimpleAuthorizationInfo();

            in.addRoles(roleNames);

            in.addStringPermissions(permissions);

            return in;
        } catch (Exception ex) {

            LOGGER.error("Error during generation of autharization info. ERROR:{}", ex);

            conn.disconnect();

            throw new AuthorizationException(ex);
        }
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {

        UsernamePasswordToken tn = (UsernamePasswordToken) token;

        if (tn.getUsername().isEmpty() || tn.getUsername() == null) {
            throw new AuthenticationException("No user name provided.");
        }

        CassandraConnector conn = new CassandraConnector();

        Session session = conn.getSession();

        try {

            Row row = session.execute(session.prepare(this.authenticationQuery).bind(tn.getUsername().hashCode())).one();
            
            if (row == null || row.isNull("userpassword") || row.isNull("passwordsalt")) {
                throw new UnknownAccountException("No such an account.");
            }

//        LOGGER.info("Retrieved password: {}", ByteSource.Util.bytes(row.getBytes("userpassword").array()).toHex());
//        LOGGER.info("Manually hashed password: {}", new SimpleHash("SHA-256", ByteSource.Util.bytes("Livo"), ByteSource.Util.bytes("Livo")).toHex());
            SimplePrincipalCollection collection = new SimplePrincipalCollection();
            
            collection.add(new Pair<>("username",row.getString("username")), getName());
            
            collection.add(new Pair<>("userid",row.getInt("userid")), getName());
            
            collection.add(new Pair<>("usermail",row.getString("usermail")), getName());

            // new SimpleAuthenticationInfo(tn.getUsername(), row.getString(0), getName()).setCredentialsSalt(null);
            SaltedAuthenticationInfo info = new SimpleAuthenticationInfo(collection, ByteSource.Util.bytes(row.getBytes("userpassword").array()), ByteSource.Util.bytes(row.getBytes("passwordsalt").array()));
          
            conn.disconnect();

            return info;

        } catch (Exception ex) {

            LOGGER.error("Error during AuthenticationInfo generation. ERROR:{}", ex);

            conn.disconnect();

            throw new AuthenticationException(ex);
        }

    }

    public class Pair<K, V> implements Serializable{

        private final K key;
        private final V value;

        public Pair(K k, V v) {

            this.key = k;
            this.value = v;

        }

        public K getKey() {
            return this.key;
        }

        public V getValue() {

            return this.value;
        }
    }
}
