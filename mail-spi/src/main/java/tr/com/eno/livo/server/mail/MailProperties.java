
package tr.com.eno.livo.server.mail;

import java.beans.ConstructorProperties;
import java.io.Serializable;
import tr.com.eno.livo.server.mail.MailService.MailHostType;


public class MailProperties  implements Serializable{
    
        private String hostName;

	private String port;

	private boolean authentication;

	private String userName;

	private String password;
        
        private MailHostType type;
        
        private String from;

	public MailProperties() {
	}

	@ConstructorProperties({ "hostName", "port", "authentication", "userName",
			"password", "type","from"})
	public MailProperties(String hostName, String port, boolean authentication,
                String userName, String password, MailHostType type, String from ) {

		this.hostName = hostName;

		this.port = port;

		this.authentication = authentication;

		this.userName = userName;

		this.password = password;
                
                this.type=type;
                
                this.from = from;
                
	}
        
	public String getHostName() {

		return this.hostName;
	}

	public String getPort() {

		return this.port;
	}

	public boolean getAuthentication() {

		return this.authentication;
	}

	public String getUserName() {

		return this.userName;
	}

	public String getPassword() {

		return this.password;
	}
        
        public MailHostType getType(){
            
            return this.type;
        }
        
        public String getFrom(){
            
            return this.from;
        }

	public void setHostName(String hostName) {

		this.hostName = hostName;
	}
        

	public void setPort(String port) {

		this.port = port;
	}

	public void setAuthentication(boolean authentication) {

		this.authentication = authentication;
	}

	public void setUserName(String userName) {

		this.userName = userName;
	}

	public void setPassword(String password) {

		this.password = password;
	}
        
        public void setType(MailHostType type){
            this.type = type;
        }
        
        public void setFrom(String from){
            
            this.from = from;
        }
    
}
