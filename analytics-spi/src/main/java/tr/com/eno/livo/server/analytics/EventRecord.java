package tr.com.eno.livo.server.analytics;

import java.util.Date;

public class EventRecord extends Record {

	private Date endTime;
	private String name;
	private Date startTime;

	/**
	 * @return the endTime
	 */
	public Date getEndTime() {
		return endTime;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @return the startTime
	 */
	public Date getStartTime() {
		return startTime;
	}

	/**
	 * @param endTime
	 *            the endTime to set
	 */
	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @param startTime
	 *            the startTime to set
	 */
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	
	@Override
	public boolean equals(Object obj) {
	    
	    if (obj instanceof EventRecord) {
	        
	        EventRecord otherRecord = (EventRecord) obj;
	        
	        return this.getId().equals(otherRecord.getId());
	        
	    } else {
	        
	        return false;
	    }
	}
}
