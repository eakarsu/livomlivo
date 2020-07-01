package tr.com.eno.livo.server.analytics.cassandra.task;

import com.datastax.driver.core.Row;
import com.datastax.driver.core.utils.Bytes;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class CassandraCalculationHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraCalculationHelper.class);

    private CassandraCalculationHelper() {
    }

    public static Date getStartTime(Row row) {

        if (row == null || row.isNull("start_time")) {
            return null;
        }

        long startTimeLong = row.getLong("start_time");

        return startTimeLong == 0 ? null : new Date(startTimeLong);
    }

    public static Date getEndTime(Row row) {

        if (row == null || row.isNull("end_time")) {
            return null;
        }

        long startTimeLong = row.getLong("end_time");

        return startTimeLong == 0 ? null : new Date(startTimeLong);
    }

    public static HashMap getParameters(Row row) {

        if (row == null | row.isNull("parameters")) {
            return null;
        }

        ByteBuffer buffer = row.getBytes("parameters");

        if (buffer == null) {
            return null;
        }

        HashMap map = null;

        ObjectInputStream ois = null;
        try {

            ByteArrayInputStream bais = new ByteArrayInputStream(Bytes.getArray(buffer));
            ois = new ObjectInputStream(bais);

            map = (HashMap) ois.readObject();

        } catch (Exception ex) {

            LOGGER.error(ex.getMessage(), ex);

        } finally {

            try {

                ois.close();

            } catch (IOException ex) {

                LOGGER.error(ex.getMessage(), ex);
            }
        }

        if (map == null) {
            return null;
        }

        return map;
    }
}
