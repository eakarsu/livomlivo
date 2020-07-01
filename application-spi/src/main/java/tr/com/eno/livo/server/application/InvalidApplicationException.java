package tr.com.eno.livo.server.application;

/**
 *
 * @author dacay
 */
public class InvalidApplicationException extends Exception {

    private static final long serialVersionUID = 4729787710003034146L;

    public InvalidApplicationException(String message) {
        super(message);
    }
}
