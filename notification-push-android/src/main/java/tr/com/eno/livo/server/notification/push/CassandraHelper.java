package tr.com.eno.livo.server.notification.push;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement androidClients;

    private CassandraHelper() {
    }

    static void connect(String host, int port) {

        // Check if we are already connected
        if (cluster != null && !cluster.isClosed()) {

            LOGGER.debug("Already connected to the Cassandra cluster, ignoring...");

            return;
        }

        LOGGER.debug("Connecting to the Cassandra cluster at '{}:{}'...", host, port);

        cluster = Cluster.builder().addContactPoint(host).withPort(port).withoutJMXReporting().build();

        LOGGER.debug("Initiating session...");

        session = cluster.connect();

        try {

            LOGGER.debug("Creating keyspace...");

            session.execute("CREATE KEYSPACE IF NOT EXISTS notification WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS notification.androidclients (companyId text, userPrincipal text,userDomain text,deviceId text, appName text,nspToken text, PRIMARY KEY ((appName,deviceId)));");

            LOGGER.debug("Preparing statements...");

            
            
            androidClients = session.prepare("select * from notification.androidclients");
            
//            selectRoleStatement = session.prepare("SELECT name, permissions FROM security.roles WHERE name = ? LIMIT 1;");
//            insertRoleStatement = session.prepare("INSERT INTO security.roles (name, permissions) VALUES (?, ?);");
//            deleteRoleStatement = session.prepare("DELETE FROM security.roles WHERE name = ?;");
//            selectAssociationStatement = session.prepare("SELECT roles, permissions FROM security.associations WHERE company_id = ? AND user_principal = ? LIMIT 1;");
//            insertAssociationStatement = session.prepare("INSERT INTO security.associations (company_id, user_principal, roles, permissions) VALUES (?, ?, ?, ?);");
//            addAssociationPermissionStatement = session.prepare("UPDATE security.associations SET permissions = permissions + {?} WHERE company_id = ? AND user_principal = ?;");
//            addAssociationRoleStatement = session.prepare("UPDATE security.associations SET roles = roles + {?} WHERE company_id = ? AND user_principal = ?;");
//            removeAssociationPermissionStatement = session.prepare("UPDATE security.associations SET permissions = permissions - {?} WHERE company_id = ? AND user_principal = ?;");
//            removeAssociationRoleStatement = session.prepare("UPDATE security.associations SET roles = roles - {?} WHERE company_id = ? AND user_principal = ?;");
//            selectRolePermissionsStatement = session.prepare("SELECT permissions FROM security.roles WHERE name = ? LIMIT 1;");
        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

            LOGGER.error("Failed to connect and setup the Cassandra server.");

            if (!cluster.isClosed()) {
                cluster.close();
            }

            cluster = null;
        }
    }

    static void disconnect() {

        LOGGER.debug("Closing session...");

        session.close();

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        cluster.close();
    }
    
    static List<Row> getAndroidDevices(String appName){
    
        BoundStatement statement = new BoundStatement(androidClients);
        
        List<Row> selectedRows = new ArrayList<>();
        
        List<Row> rows = session.execute(statement).all();
        
        for(Row row :rows){
            
            if(row.getString("appName").equalsIgnoreCase(appName))
                selectedRows.add(row);
        }
        
        return selectedRows;
    }
}
