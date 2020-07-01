package tr.com.eno.livo.server.users;

public class InvalidPasswordException extends Exception {
    
    private static final long serialVersionUID = 6270163817941835032L;

    public InvalidPasswordException(String message) {
        super(message);
    }
}
