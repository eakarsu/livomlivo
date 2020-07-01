package tr.com.eno.livo.server.application;

/**
 *
 * @author dacay
 */
public enum AuthorizationPolicy {

    DENY_ALL(0, "Deny All"),
    ALLOW_ALL(2, "Allow All"),
    FINE_GRAINED(1, "Fine Grained");

    private int code;
    private String name;

    private AuthorizationPolicy(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public int getCode() {
        return code;
    }

    public static AuthorizationPolicy getAuthorizationPolicy(int code) {

        switch (code) {

            case 0:
                return DENY_ALL;
            case 1:
                return FINE_GRAINED;
            default:
                return ALLOW_ALL;
        }
    }

    @Override
    public String toString() {
        
        return this.name;
    }
}
