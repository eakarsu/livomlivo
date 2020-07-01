package tr.com.eno.livo.server.mail;

import javax.management.MXBean;

@MXBean
public interface MailService {
    
    public enum MailHostType{
        STARTTLS,SSL,PLAIN;
    }
    /**
     * Configures and persists mail properties.
     * @param props {@link  MailProperties}
     * @param oldHost
     */
    public void configureMailProperties(MailProperties props,String oldHost);
    
    /**
     * Sends mail to target with configured properties. If no properties found return error.
     * @param target mail target
     * @param senderName sender name
     * @param subject  mail subject
     * @param content mail content
     */
    public void sendMail(String target, String senderName, String subject, String content);
    
    /**
     * Returns current Configuration if exists.
     * @return {@link MailProperties}
     */
    public MailProperties getMailProperties();
    
   
}
