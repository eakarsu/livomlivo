package tr.com.eno.livo.server.web;

/**
 *
 * @author Livo
 */
public enum DeveloperPermissions {

    MODIFY_SELF {
                @Override
                public String getPermission() {
                    return MODIFYSELF;
                }
            },
    CREATE_MWUSER {
                @Override
                public String getPermission() {
                    return CREATEMWUSER;
                }
            },
    MODIFY_MWUSER {
                @Override
                public String getPermission() {
                    return MODIFYMWUSER;
                }
            },
    DELETE_MWUSER {
                @Override
                public String getPermission() {
                    return DELETEMWUSER;
                }
            },
    CREATE_APPLICATION {
                @Override
                public String getPermission() {
                    return CREATEAPPLICATION;
                }
            },
    MODIFY_APPLICATION {
                @Override
                public String getPermission() {
                    return MODIFYAPPLICATION;
                }
            },
    DELETE_APPLICATION {
                @Override
                public String getPermission() {
                    return DELETEAPPLICATION;
                }
            };

    public abstract String getPermission();

    private static final String MODIFYSELF = "modify:self";
    private static final String CREATEMWUSER = "create:mwuser";
    private static final String MODIFYMWUSER = "modify:mwuser";
    private static final String DELETEMWUSER = "delete:mwuser";
    private static final String CREATEAPPLICATION = "create:application";
    private static final String MODIFYAPPLICATION = "modify:application";
    private static final String DELETEAPPLICATION = "delete:application";
}
