package tr.com.eno.livo.server.mail.sender;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.MessageFormat;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import tr.com.eno.livo.server.mail.MailService;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.management.MXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.mail.MailProperties;

@MXBean
public class MailHandlerService implements MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailHandlerService.class);

    private boolean isConfigured = false;

    private String from;

    private Session session;

    private static final String DATABASE_CONNECTION_URL;

    private Connection derbyConnection;

    private DatabaseMetaData dbMetaData;

    static {

        // Check the AEON_HOME directory
        if (System.getenv("AEON_HOME") == null) {
            throw new RuntimeException("Please set the AEON_HOME environment variable.");
        }

        // Calculate the data directory
        File dataDirectory = new File(new File(System.getenv("AEON_HOME")), "data");

        // Calculate the Derby data directory
        File derbyDirectory = new File(dataDirectory, "derby");

        // Calculate the JDBC URL
        DATABASE_CONNECTION_URL = MessageFormat.format("jdbc:derby:{0};create=true", derbyDirectory.getAbsoluteFile().getPath().replaceAll("\\\\", "/"));
    }

    @Override
    public void configureMailProperties(final MailProperties properties, String oldHost) {

        if (properties.getFrom() == null || properties.getPort() == null || properties.getHostName() == null || properties.getType() == null) {
            throw new RuntimeException("Required property is null.");
        }
        String type;
        switch (properties.getType()) {
            case SSL:
                type = "SSL";
                break;
            case STARTTLS:
                type = "STARTTLS";
                break;
            default:
                type = "PLAIN";
        }
        String sql;
        if (this.isConfigured) {
            if (oldHost == null || oldHost.isEmpty()) {
                throw new RuntimeException("Old host cannot be empty when updating configuration.");
            }
            sql = "Update Mail_CONFIG set hostName='" + properties.getHostName()
                    + "', port='" + properties.getPort()
                    + "', authentication=" + properties.getAuthentication()
                    + ", userName='" + properties.getUserName() + "', userPass='" + properties.getPassword() + "',type='" + type + "', fromMail='" + properties.getFrom() + "' where hostName='" + oldHost + "'";
            synchronized (this.derbyConnection) {

                try {
                    Statement st = this.derbyConnection.createStatement();
                    st.execute(sql);
                    st.close();
                    this.isConfigured = true;
                } catch (SQLException ex) {
                    LOGGER.error("Couldn't configure MailProperties.", ex);
                }
            }
        } else {

            sql = "Insert into MAIL_CONFIG(hostName,port,authentication, userName,userPass,type,fromMail) values(?,?,?,?,?,?,?)";
            synchronized (this.derbyConnection) {

                try {
                    PreparedStatement ps = this.derbyConnection.prepareStatement(sql);
                    ps.setString(1, properties.getHostName());
                    ps.setString(2, properties.getPort());
                    ps.setBoolean(3, properties.getAuthentication());
                    ps.setString(4, properties.getUserName());
                    ps.setString(5, properties.getPassword());
                    ps.setString(6, type);
                    ps.setString(7, properties.getFrom());
                    ps.executeUpdate();
                    ps.closeOnCompletion();
                    this.isConfigured = true;
                } catch (SQLException ex) {

                    LOGGER.error("SQL error during configuring mail properties.", ex);
                }
            }
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth", properties.getAuthentication());
        props.put("mail.smtp.host", properties.getHostName());
        props.put("mail.smtp.port", properties.getPort());
        //props.put("mail.smtp.from", properties.getFrom());
        
        if (type.equalsIgnoreCase("STARTTLS")) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.ssl.trust", properties.getHostName());
            LOGGER.debug("Mail type is STARTTLS.");
        } else if (type.equalsIgnoreCase("SSL")) {
            props.put("mail.smtp.socketFactory.port", properties.getPort());
            props.put("mail.smtp.socketFactory.class",
                    "javax.net.ssl.SSLSocketFactory");
            LOGGER.debug("Mail type is SSL.");
        } else {
            LOGGER.debug("Mail type is PLAIN.");
        }

        if (properties.getAuthentication()) {
            this.session = Session.getInstance(props,
                    new javax.mail.Authenticator() {
                        @Override
                        protected PasswordAuthentication getPasswordAuthentication() {
                            return new PasswordAuthentication(properties.getUserName(), properties.getPassword());
                        }
                    });
        } else {
            this.session = Session.getDefaultInstance(props);
        }

        this.from = properties.getFrom();
    }

    @Override
    public void sendMail(String target, String senderName, String subject, String content) {

        if (!this.isConfigured) {
            throw new RuntimeException("Not configured yet.");
        }

        try {

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from, senderName));
            message.setReplyTo(new Address[]{new InternetAddress(from)});
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(target)); //Set email recipient
            message.setSubject(subject);
            message.setContent(content, "text/html; charset=utf-8");
            Transport.send(message);

            LOGGER.debug("Successfully send mail to '{}' from '{}'", target, senderName);
        } catch (MessagingException e) {

            LOGGER.error("MessagingException", e);

            throw new RuntimeException("Couldn't send mail because of " + e.getMessage());

        } catch (UnsupportedEncodingException ex) {
            
            LOGGER.error("Encoding problem.");
            
            throw new RuntimeException("Couldn't send mail because of "+ ex.getMessage());
        }
    }

    @Override
    public MailProperties getMailProperties() {

        if (!this.isConfigured) {
            throw new RuntimeException("Not configured yet");
        }
        synchronized (this.derbyConnection) {

            try {
                PreparedStatement ps = this.derbyConnection.prepareStatement("Select * from MAIL_CONFIG");

                ResultSet rs = ps.executeQuery();
                rs.next();

                MailHostType type;

                if (rs.getString("type").equalsIgnoreCase("Starttls")) {
                    type = MailHostType.STARTTLS;
                } else if (rs.getString("type").equalsIgnoreCase("Ssl")) {
                    type = MailHostType.SSL;
                } else {
                    type = MailHostType.PLAIN;
                }

                MailProperties props = new MailProperties(rs.getString("hostName"), rs.getString("port"), rs.getBoolean("authentication"),
                        rs.getString("userName"), rs.getString("userPass"), type,
                        rs.getString("fromMail"));
                rs.close();
                return props;
            } catch (SQLException ex) {

                LOGGER.error("Couldn't read  from livo MAIL_CONFIG");
                throw new RuntimeException("Couldn't read from table MAIL_CONFIG");
            }

        }
    }

    public void start(Map<String, Object> config) throws ClassNotFoundException, SQLException {

        LOGGER.info("Starting Derby-based mail service...");

        try {

            // Loads embedded driver for apache derby.
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver");

            // Detting connection and creating database if doesn't exist.
            this.derbyConnection = DriverManager
                    .getConnection(DATABASE_CONNECTION_URL);

            // Database meta data for checking tables if they exits when running
            // service for the first time.
            this.dbMetaData = this.derbyConnection.getMetaData();

            // Checking MAIL_CONFIG table existence.
            ResultSet appHistoryTable = this.dbMetaData.getTables(null, null,
                    "MAIL_CONFIG", null);

            if (!appHistoryTable.next()) {

                Statement st = this.derbyConnection.createStatement();
                // Creating table APPLICATION_HISTORY
                st.executeUpdate("CREATE TABLE MAIL_CONFIG ("
                        + "hostName VARCHAR(100) NOT NULL PRIMARY KEY, port VARCHAR(100) NOT NULL,authentication BOOLEAN  NOT NULL, userName VARCHAR(50), userPass VARCHAR(50), type VARCHAR(15) NOT NULL, fromMail VARCHAR(100) NOT NULL)");

                st.close();

            } else {
                LOGGER.debug("Users table named 'Mail_Config' already exists");
            }

            appHistoryTable.close();

        } catch (ClassNotFoundException e) {

            LOGGER.error("Derby database driver can not be found.",
                    e.getException());

            throw e;

        } catch (SQLException e) {

            LOGGER.error("SQL statement caused an exception.");

            throw e;
        }

        this.isConfigured();

    }

    public void stop() {

        LOGGER.debug("Stopping derby-based mail service.");
    }

    private void isConfigured() {

        synchronized (this.derbyConnection) {

            try {
                PreparedStatement st = this.derbyConnection.prepareStatement("Select * from MAIL_CONFIG");

                final ResultSet rs = st.executeQuery();

                if (rs.next()) {
                    Properties props = new Properties();
                    props.put("mail.smtp.auth", rs.getBoolean("authentication"));
                    props.put("mail.smtp.host", rs.getString("hostName"));
                    props.put("mail.smtp.port", rs.getString("port"));
                    //props.put("mail.smtp.from", rs.getString("fromMail"));

                    if (rs.getString("type").equalsIgnoreCase("STARTTLS")) {
                        props.put("mail.smtp.starttls.enable", "true");
                        props.put("mail.smtp.ssl.trust", rs.getString("hostName"));
                    } else {
                        props.put("mail.smtp.socketFactory.port", rs.getString("port"));
                        props.put("mail.smtp.socketFactory.class",
                                "javax.net.ssl.SSLSocketFactory");
                    } 
                    final String userName = rs.getString("userName");
                    final String passWord = rs.getString("userPass");

                    boolean authentication = rs.getBoolean("authentication");

                    if (authentication) {
                        this.session = Session.getInstance(props,
                                new javax.mail.Authenticator() {
                                    @Override
                                    protected PasswordAuthentication getPasswordAuthentication() {
                                        return new PasswordAuthentication(userName, passWord);
                                    }
                                });
                    } else {

                        this.session = Session.getDefaultInstance(props);
                    }

                    this.isConfigured = true;

                    this.from = rs.getString("fromMail");

                    rs.close();

                } else {
                    this.isConfigured = false;
                }
            } catch (SQLException ex) {
                LOGGER.error("Couldn't read LIVODB", ex);
            }

        }
    }
}
