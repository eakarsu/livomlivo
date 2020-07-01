package tr.com.eno.livo.server.cassandra.server;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;
import org.apache.cassandra.exceptions.ConfigurationException;
import org.apache.cassandra.service.CassandraDaemon;
import org.apache.commons.lang.SystemUtils;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CassandraServer {

    private static final String CASSANDRA_CONFIG_FILENAME = "cassandra.yaml";
    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraServer.class);
    private CassandraDaemon daemon;
    private Thread daemonThread;

    protected void start() throws ConfigurationException, IOException {

        LOGGER.info("Starting Cassandra server...");

        // Check the AEON_HOME directory
        if (System.getenv("AEON_HOME") == null) {
            throw new RuntimeException("Please set the AEON_HOME environment variable.");
        }

        // Calculate the data directory
        File dataDirectory = new File(new File(System.getenv("AEON_HOME")), "data");

        // Calculate the Cassandra data directory
        File cassandraDirectory = new File(dataDirectory, "cassandra");

        // Calculate the configuration directory
        File configurationDirectory = new File(new File(System.getenv("AEON_HOME")), "conf");

        // Create all directories if needed
        cassandraDirectory.mkdirs();
        configurationDirectory.mkdirs();

        // Prepare a properties object for Velocity.
        Properties velocityProperties = new Properties();
        velocityProperties.put("resource.loader", "classpath");
        velocityProperties.put("classpath.resource.loader.class", ClasspathResourceLoader.class.getName());

        // Initialize Velocity
        Velocity.init(velocityProperties);

        // Get the template
        Template template = Velocity.getTemplate(CASSANDRA_CONFIG_FILENAME);

        // Prepare the Velocity context
        VelocityContext velocityCtx = new VelocityContext();
        velocityCtx.put("cassandra_data_directory", cassandraDirectory.getAbsolutePath());

        // Check for the OS type
        if (SystemUtils.IS_OS_WINDOWS)
            velocityCtx.put("cassandra_disk_access_mode", "standard");
        else
            velocityCtx.put("cassandra_disk_access_mode", "auto");

        // Calculate the destination cassandra.yaml path
        File configFile = new File(configurationDirectory, CASSANDRA_CONFIG_FILENAME);

        // Create a writer for the template to output
        FileWriter writer = new FileWriter(configFile);

        // Render the template
        template.merge(velocityCtx, writer);

        // Flush and close the writer
        writer.flush();
        writer.close();

        // Set Cassandra system properties
        if (SystemUtils.IS_OS_WINDOWS)
            System.setProperty("cassandra.config", "file:\\\\\\" + configFile.getAbsolutePath());
        else
            System.setProperty("cassandra.config", "file:///" + configFile.getAbsolutePath());
        System.setProperty("cassandra.boot_without_jna", "true");

        // Initialize the daemon
        daemon = new CassandraDaemon();
        daemon.init(null);

        // Initialize the thread
        this.daemonThread = new Thread(new Runnable() {

            @Override
            public void run() {

                // Start the daemon
                daemon.start();
            }
        });

        // Start the daemon thread
        this.daemonThread.start();
    }

    protected void stop() {

        LOGGER.info("Stopping Cassandra server...");

        // Stop the daemon thread
        this.daemonThread.interrupt();
    }
}
