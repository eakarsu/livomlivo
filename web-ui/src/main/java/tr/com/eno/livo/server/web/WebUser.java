package tr.com.eno.livo.server.web;

import java.util.Collection;
import java.util.List;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import tr.com.eno.livo.server.authc.AuthenticationToken;
import tr.com.eno.livo.server.web.LivoCassandraRealm.Pair;

public class WebUser extends User {

    private static final long serialVersionUID = -5103304352023604581L;
    
    private int userId;
    private String userName;
    private String userPassword;
    private String userMail;

    public WebUser(String userName, String password,
            Collection<? extends GrantedAuthority> authorities) {
        
        super(userName, password, authorities);
        
        this.userName = userName;
        
        this.userPassword = password;
        
        List<Pair> principals = (List<Pair>)SecurityUtils.getSubject().getPrincipals().asList();
        
        for(Pair pair : principals){
            if(pair.getKey().toString().equalsIgnoreCase("username"))
                this.userName = pair.getValue().toString();
            if(pair.getKey().toString().equalsIgnoreCase("usermail"))
                this.userMail = pair.getValue().toString();
            if(pair.getKey().toString().equalsIgnoreCase("userid"))
                this.userId = Integer.parseInt(pair.getValue().toString());
        }
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public boolean getUserActivation() {

        return true;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getUserMail() {
        return userMail;
    }

    public void setUserMail(String userMail) {
        this.userMail = userMail;
    }

}
