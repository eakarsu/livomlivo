package tr.com.eno.livo.server.analytics.cassandra;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import com.datastax.driver.core.utils.Bytes;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.analytics.ErrorRecord;
import tr.com.eno.livo.server.analytics.EventRecord;
import tr.com.eno.livo.server.analytics.Report;

public class CassandraHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(CassandraHelper.class);
    private static Cluster cluster;
    private static Session session;
    private static PreparedStatement insertEventStatement;
    private static PreparedStatement insertErrorStatement;
    private static PreparedStatement insertReportStatement;
    private static PreparedStatement insertUserPreferenceStatement;
    private static PreparedStatement selectEventsStatement;
    private static PreparedStatement selectUserPreferenceStatement;
    private static PreparedStatement selectReportStatement;
    private static PreparedStatement selectReportWithDateStatement;
    private static PreparedStatement selectErrorsStatement;

    public static void connect(String host, int port) {

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

            session.execute("CREATE KEYSPACE IF NOT EXISTS analytics WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }");

            LOGGER.debug("Creating tables...");

            session.execute("CREATE TABLE IF NOT EXISTS analytics.events (id text, name text, start_time bigint, end_time bigint, parameters map<text,text>, PRIMARY KEY (id));");
            session.execute("CREATE TABLE IF NOT EXISTS analytics.errors (id text, message text, time bigint, parameters map<text,text>, PRIMARY KEY (id, time));");
            session.execute("CREATE TABLE IF NOT EXISTS analytics.reports (name text, time bigint, period int, data blob, PRIMARY KEY (name, period, time));");
            session.execute("CREATE TABLE IF NOT EXISTS analytics.user_preferences (company_id text, user_principal text, opted_in boolean, PRIMARY KEY (company_id, user_principal));");

            LOGGER.debug("Creating indexes...");

            session.execute("CREATE INDEX IF NOT EXISTS event_name ON analytics.events (name);");
            session.execute("CREATE INDEX IF NOT EXISTS report_time ON analytics.reports (time);");

            LOGGER.debug("Preparing statements...");

            insertEventStatement = session.prepare("INSERT INTO analytics.events (id, name, start_time, end_time, parameters) VALUES (?, ?, ?, ?, ?) IF NOT EXISTS USING TTL 31536000;");
            insertErrorStatement = session.prepare("INSERT INTO analytics.errors (id, message, time, parameters) VALUES (?, ?, ?, ?) IF NOT EXISTS USING TTL 31536000;");
            insertReportStatement = session.prepare("INSERT INTO analytics.reports (name, time, period, data) VALUES (?, ?, ?, ?);");
            insertUserPreferenceStatement = session.prepare("INSERT INTO analytics.user_preferences (company_id, user_principal, opted_in) VALUES (?, ?, ?);");
            selectEventsStatement = session.prepare("SELECT * FROM analytics.events WHERE name = ?;");
            selectErrorsStatement = session.prepare("SELECT * FROM analytics.errors WHERE time >= ? AND time <= ? ALLOW FILTERING;");
            selectReportStatement = session.prepare("SELECT * FROM analytics.reports WHERE name = ? AND period = ? LIMIT 1;");
            selectReportWithDateStatement = session.prepare("SELECT * FROM analytics.reports WHERE name = ? AND period = ? AND time = ? LIMIT 1;");
            selectUserPreferenceStatement = session.prepare("SELECT opted_in FROM analytics.user_preferences WHERE company_id = ? AND user_principal = ? LIMIT 1;");

        } catch (Exception e) {

            LOGGER.error(e.getMessage(), e);

            LOGGER.error("Failed to connect and setup the Cassandra server.");

            if (!cluster.isClosed()) {
                cluster.close();
            }

            cluster = null;
        }
    }

    public static void disconnect() {

        LOGGER.debug("Closing session...");

        session.close();

        LOGGER.debug("Disconnecting from the Cassandra cluster...");

        cluster.close();
    }

    /**
     * This is same as calling {
     *
     * @see #loadReport(String,Report.Period,Date) loadReport(String,
     * Report.Period, Date)} with period {
     * @see tr.com.eno.livo.server.analytics.Report.Period ALL_TIME} and
     * <code>null</code> date.
     * @param reportType
     * @return
     */
    public static Report loadReport(String reportType) {

        return loadReport(reportType, Report.Period.ALL_TIME, null);
    }

    /**
     * This is same as calling {
     *
     * @see #loadReport(String,Report.Period,Date) loadReport(String,
     * Report.Period, Date)} with <code>null</code> date.
     * @param reportType
     * @param period
     * @return
     */
    public static Report loadReport(String reportType, Report.Period period) {

        return loadReport(reportType, period, null);
    }

    public static Report loadReport(String reportType, Report.Period period, Date date) {

        BoundStatement statement;

        if (date == null) {

            LOGGER.debug("Loading report of type '{}' with period '{}'...", reportType, period.toString());

            statement = new BoundStatement(selectReportStatement);

            statement.bind(reportType, period.toInteger());

        } else {

            LOGGER.debug("Loading report of type '{}' with period '{}' of date '{}'...", reportType, period.toString(), date);

            statement = new BoundStatement(selectReportWithDateStatement);

            statement.bind(reportType, period.toInteger(), fromTime(date));
        }

        ResultSet results = session.execute(statement);

        if (results.isExhausted()) {

            if (date == null) {
                LOGGER.warn("Report of type '{}' with period '{}' could not be found.", reportType, period.toString());
            } else {
                LOGGER.warn("Report of type '{}' with period '{}' of date '{}' could not be found.", reportType, period.toString(), date);
            }

            return null;
        }

        Row row = null;

        if (date == null) {

            for (Row currentRow : results) {

                if (currentRow.isNull("time") || currentRow.getLong("time") == 0) {

                    row = currentRow;
                    break;
                }
            }

            if (row == null) {
                return null;
            }

        } else {

            row = results.one();
        }

        Report report = new Report();
        report.setType(row.getString("name"));
        report.setPeriod(Report.Period.fromInteger(row.getInt("period")));
        report.setDate(toTime(row.getLong("time")));

        if (!row.isNull("data")) {

            ByteBuffer rawData = row.getBytes("data");

            HashMap data = toMap(rawData);

            report.setData(data);
        }

        return report;
    }

    public static void saveReport(Report report) {

        if (report == null) {

            LOGGER.error("Passed report is null.");

            return;
        }

        LOGGER.debug("Saving report of type '{}'...", report.getType());

        BoundStatement statement = new BoundStatement(insertReportStatement);

        statement.bind(report.getType(), fromTime(report.getDate()), report.getPeriod().toInteger(), fromMap(report.getData()));

        session.execute(statement);
    }

    public static boolean isUserOptedIn(String companyId, String userPrincipal) {

        LOGGER.debug("Checking opt-int status for the entity represented by the user principal '{}' and the company ID '{}'...", companyId, userPrincipal);

        // Sanity check for token info
        if (!(companyId != null && userPrincipal != null)) {

            LOGGER.warn("Authentication token (companyId={}, userPrincipal={}) is not valid for opt-in operations.", companyId, userPrincipal);

            return false;
        }

        // Create a BoundStatement instance
        BoundStatement statement = new BoundStatement(selectUserPreferenceStatement);

        // Bind values
        statement = statement.bind(companyId, userPrincipal);

        // Execute the statement
        ResultSet resultSet = session.execute(statement);

        // Check if we have any result
        if (resultSet.isExhausted()) {

            LOGGER.debug("Query for the checking of opt-in status of the user represented by company ID '{}' and user principal '{}' returned no results.",
                    companyId, userPrincipal);

            return false;
        }

        // Get the row
        Row row = resultSet.one();

        // Get and return the opt-in value
        return row.getBool("opted_in");
    }

    public static void optInUser(String companyId, String userPrincipal) {

        LOGGER.debug("Opting in the entity represented by the user principal '{}' and the company ID '{}'...", companyId, userPrincipal);

        // Sanity check for token info
        if (!(companyId != null && userPrincipal != null)) {

            LOGGER.warn("Authentication token (companyId={}, userPrincipal={}) is not valid for opt-in operations.", companyId, userPrincipal);

            return;
        }

        BoundStatement statement = new BoundStatement(insertUserPreferenceStatement);

        statement.bind(companyId, userPrincipal, true);

        session.execute(statement);
    }

    public static void optOutUser(String companyId, String userPrincipal) {

        LOGGER.debug("Opting out the entity represented by the user principal '{}' and the company ID '{}'...", companyId, userPrincipal);

        // Sanity check for token info
        if (!(companyId != null && userPrincipal != null)) {

            LOGGER.warn("Authentication token (companyId={}, userPrincipal={}) is not valid for opt-out operations.", companyId, userPrincipal);

            return;
        }

        BoundStatement statement = new BoundStatement(insertUserPreferenceStatement);

        statement.bind(companyId, userPrincipal, false);

        session.execute(statement);
    }

    public static void saveEventRecord(EventRecord record) {

        LOGGER.debug("Saving event with ID '{}' and name '{}'...", record.getId(), record.getName());

        BoundStatement statement = new BoundStatement(insertEventStatement);

        statement.bind(record.getId(), record.getName(), fromTime(record.getStartTime()), fromTime(record.getEndTime()), record.getParameters());

        session.execute(statement);
    }

    public static void saveErrorRecord(ErrorRecord record) {

        LOGGER.debug("Saving error with message '{}'...", record.getMessage());

        BoundStatement statement = new BoundStatement(insertErrorStatement);

        statement = statement.bind(record.getId(), record.getMessage(), record.getTime(), record.getParameters());

        session.execute(statement);
    }

    public static ResultSet queryEvents(String name) {

        if (name == null) {
            return null;
        }

        LOGGER.debug("Querying events with name '{}'...", name);

        BoundStatement statement = new BoundStatement(selectEventsStatement);

        statement.bind(name);

        return session.execute(statement);
    }

    public static Set<EventRecord> listEvents(String eventName) {

        LOGGER.debug("Listing events with name '{}'...", eventName);

        ResultSet results = queryEvents(eventName);

        LOGGER.debug("Creating event record objects...");

        Set<EventRecord> records = new LinkedHashSet<>();

        for (Row row : results) {

            EventRecord record = new EventRecord();

            record.setId(row.getString("id"));
            record.setName(row.getString("name"));
            record.setStartTime(toTime(row.getLong("start_time")));
            record.setEndTime(toTime(row.getLong("end_time")));
            record.setParameters(row.getMap("parameters", String.class, String.class));

            records.add(record);
        }

        return Collections.unmodifiableSet(records);
    }

    public static Set<EventRecord> listEvents(String eventName, Date startTime, Date endTime) {

        LOGGER.debug("Listing events with name '{}' recorded between '{}' and '{}'...", eventName, startTime, endTime);

        ResultSet results = queryEvents(eventName);

        LOGGER.debug("Creating event record objects...");

        Set<EventRecord> records = new LinkedHashSet<>();

        for (Row row : results) {

            if (toTime(row.getLong("start_time")).after(endTime) || toTime(row.getLong("start_time")).before(startTime)) {
                continue;
            }

            EventRecord record = new EventRecord();

            record.setId(row.getString("id"));
            record.setName(row.getString("name"));
            record.setStartTime(toTime(row.getLong("start_time")));
            record.setEndTime(toTime(row.getLong("end_time")));
            record.setParameters(row.getMap("parameters", String.class, String.class));

            records.add(record);
        }

        return Collections.unmodifiableSet(records);
    }

    public static Set<ErrorRecord> listErrors(Date startTime, Date endTime) {

        LOGGER.debug("Listing errors recorded between '{}' and '{}'...", startTime, endTime);

        BoundStatement statement = new BoundStatement(selectErrorsStatement);

        statement.bind(startTime, endTime);

        ResultSet results = session.execute(statement);

        LOGGER.debug("Creating event record objects...");

        Set<ErrorRecord> records = new LinkedHashSet<>();

        for (Row row : results) {

            if (toTime(row.getLong("time")).after(endTime) || toTime(row.getLong("time")).before(startTime)) {
                continue;
            }

            ErrorRecord record = new ErrorRecord();

            record.setId(row.getString("id"));
            record.setMessage(row.getString("message"));
            record.setTime(toTime(row.getLong("time")));
            record.setParameters(row.getMap("parameters", String.class, String.class));

            records.add(record);
        }

        return Collections.unmodifiableSet(records);
    }

    private static Date toTime(long time) {

        if (time == 0) {
            return null;
        } else {
            return new Date(time);
        }
    }

    private static long fromTime(Date time) {

        if (time == null) {
            return 0;
        } else {
            return time.getTime();
        }
    }

    private static ByteBuffer fromMap(HashMap map) {

        if (map == null) {
            return null;
        }

        byte[] dataBytes = null;

        ObjectOutputStream oos = null;
        try {

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            oos = new ObjectOutputStream(baos);

            oos.writeObject(map);

            dataBytes = baos.toByteArray();

        } catch (IOException ex) {

            LOGGER.error(ex.getMessage(), ex);

        } finally {

            try {

                oos.close();

            } catch (IOException ex) {

                LOGGER.error(ex.getMessage(), ex);
            }
        }

        if (dataBytes == null) {
            return null;
        }

        return ByteBuffer.wrap(dataBytes);
    }

    private static HashMap toMap(ByteBuffer buffer) {

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
