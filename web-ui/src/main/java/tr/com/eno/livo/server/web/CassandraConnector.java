package tr.com.eno.livo.server.web;

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;


public class CassandraConnector {
    
    private final static String HOST = "localhost";
    private final static int PORT = 9042;
    private  Cluster cluster = null;
    private  Session session = null;
    
    public CassandraConnector(){

            cluster = Cluster.builder().addContactPoint(HOST).withPort(PORT).build();
    }
    
    public Session getSession(){
        
        return this.session=cluster.connect();
    }
    
    public  void disconnect(){
        
       this.session.close();
       this.cluster.close();
    
    }
}
