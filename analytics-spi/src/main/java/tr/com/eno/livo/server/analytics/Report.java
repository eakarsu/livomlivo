package tr.com.eno.livo.server.analytics;

import java.beans.ConstructorProperties;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Date;
import java.util.HashMap;

public class Report {

    private String type;
    private Date date;
    private Period period;
    private HashMap data;

    private static byte[] serializeData(HashMap map) {

        ObjectOutputStream oos = null;
        ByteArrayOutputStream baos = null;
        try {

            baos = new ByteArrayOutputStream();

            oos = new ObjectOutputStream(baos);

            oos.writeObject(map);

        } catch (IOException ex) {

            throw new RuntimeException(ex);

        } finally {

            try {

                oos.close();

            } catch (IOException ex) {

                throw new RuntimeException(ex);
            }
        }

        if (baos == null) {
            return null;
        } else {
            return baos.toByteArray();
        }
    }

    private static HashMap deserializeData(byte[] data) {

        ObjectInputStream ois = null;
        ByteArrayInputStream bais = null;

        HashMap result;

        try {

            bais = new ByteArrayInputStream(data);

            ois = new ObjectInputStream(bais);

            result = (HashMap) ois.readObject();

        } catch (Exception ex) {

            throw new RuntimeException(ex);

        } finally {

            try {

                ois.close();

            } catch (IOException ex) {

                throw new RuntimeException(ex);
            }
        }

        return result;
    }

    public Report() {
    }

    public Report(String type, Date date, Period period, HashMap data) {

        this.type = type;
        this.date = date;
        this.period = period;
        this.data = data;
    }

    @ConstructorProperties({"type", "date", "period", "rawData"})
    public Report(String type, Date date, Period period, byte[] data) {

        this(type, date, period, deserializeData(data));
    }

    public Report(Type type, Date date, Period period, HashMap data) {

        this.type = type.toString();
        this.date = date;
        this.period = period;
        this.data = data;
    }

    public Report copyReport() {

        Report report = new Report();
        report.setType(this.getType());
        report.setDate(this.date);
        report.setPeriod(this.period);
        report.setData(new HashMap(this.data));

        return report;
    }

    /**
     * @return the date
     */
    public Date getDate() {
        return date;
    }

    /**
     * @return the period
     */
    public Period getPeriod() {
        return period;
    }

    /**
     * @param date the date to set
     */
    public void setDate(Date date) {
        this.date = date;
    }

    /**
     * @param period the period to set
     */
    public void setPeriod(Period period) {
        this.period = period;
    }

    /**
     * @return the data
     */
    public HashMap getData() {
        return data;
    }

    /**
     * @param data the data to set
     */
    public void setData(HashMap data) {
        this.data = data;
    }

    public byte[] getRawData() {

        return serializeData(this.data);
    }

    /**
     * @return the type
     */
    public String getType() {
        return type;
    }

    /**
     * @param type the type to set
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * @param type the type to set as enumeration
     */
    public void setType(Type type) {
        this.type = type.toString();
    }

    public enum Type {

        ACTIVE_USER_COUNT("ActiveUserCount"),
        PLATFORM_DISTRIBUTION("PlatformDistribution"),
        SERVICEOBJECT_REQUEST_COUNT("ServiceObjectRequestCount"),
        SERVICEOBJECT_TOTAL_OPERATION_PAYLOAD_SIZE("ServiceObjectTotalOperationPayloadSize"),
        USER_ACTIVITY_DURATION("UserActivityDuration");

        private final String name;

        private Type(String name) {
            this.name = name;
        }

        @Override
        public String toString() {

            return this.name;
        }
    }

    public enum Period {

        DAILY(0, "Daily"), MONTHLY(1, "Monthly"), WEEKLY(2, "Weekly"), ALL_TIME(3, "All-Time");

        private final String friendlyValue;
        private final int integerValue;

        public static Period fromInteger(int integerValue) {

            switch (integerValue) {
                case 0:
                    return DAILY;
                case 1:
                    return MONTHLY;
                case 2:
                    return WEEKLY;
                default:
                    return ALL_TIME;
            }
        }

        private Period(int integerValue, String friendlyValue) {

            this.integerValue = integerValue;
            this.friendlyValue = friendlyValue;
        }

        public int toInteger() {

            return this.integerValue;
        }

        @Override
        public String toString() {

            return this.friendlyValue;
        }
    }
}
