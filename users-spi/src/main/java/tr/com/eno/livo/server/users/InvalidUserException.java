package tr.com.eno.livo.server.users;

/**
 *
 * @author Deniz Acay
 */
public class InvalidUserException extends Exception {
    
    private static final long serialVersionUID = -2176055225894541326L;    

    public InvalidUserException(String message) {
        super(message);
    }
}
