package tr.com.eno.livo.server.serviceobjects.sapservice;

import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.sap.conn.jco.JCoDestination;

public class SapDestinationTimerTask extends TimerTask {

    private final static Logger LOGGER = LoggerFactory
            .getLogger(SapDestinationTimerTask.class);

    private final JCoDestination destination;

    public SapDestinationTimerTask(JCoDestination start) {

        this.destination = start;

    }

    @Override
    public void run() {

        try {
            LOGGER.debug("Pinging destination with given name '{}'", this.destination.getDestinationName());
            this.destination.ping();
            LOGGER.debug("Ping to destination with given name '{}' is successfull", this.destination.getDestinationName());
        } catch (Exception ex) {

            LOGGER.error(
                    "Couldn't ping jco destination with name : '{}' reason: '{}'",
                    this.destination.getDestinationName(), ex);
        }
    }

}
