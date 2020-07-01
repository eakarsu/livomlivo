package tr.com.eno.livo.server.web;


import org.eclipse.jetty.server.Server;

public class JettyHelper {

    private Server server;
    private String host;
    private int port;

    public JettyHelper() {

        /*File file = new File(System.getenv("AEON_HOME") + "/config.properties");

        if(file.exists()){
			
         Properties prop = new Properties();
			
         InputStream stream;
         try {
         stream = new FileInputStream(file);
				
         prop.load(stream);
				
         this.host=prop.getProperty("host");
				
         this.port = Integer.parseInt(prop.getProperty("port"));
				
         this.server = new Server(this.port);
				
         } catch (FileNotFoundException e) {
         this.host="localhost";
         this.port=9091;
         this.server= new Server(this.port);
         } catch (IOException e) {
         this.host="localhost";
         this.port=9091;
         this.server= new Server(this.port);
         }
		
         }
         else{*/
        this.host = "localhost";
        this.port = 9091;
        this.server = new Server(this.port);
        //}
    }

    public String getHost() {
        return this.host;
    }

    public int getPort() {
        return this.port;
    }

    public Server getServer() {
        return this.server;
    }
}
