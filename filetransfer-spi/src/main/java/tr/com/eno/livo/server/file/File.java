package tr.com.eno.livo.server.file;

import java.beans.ConstructorProperties;
import java.io.Serializable;

public class File implements Serializable {

	private static final long serialVersionUID = 3460859829142418625L;

	private String contentType;
	private String hash;
	private String path;
	private long size;

	public File() {
	}

	@ConstructorProperties({ "hash", "path", "contentType" })
	public File(String hash, String path, String contentType) {

		this.hash = hash;
		this.path = path;
		this.contentType = contentType;
	}

	public String getContentType() {
		return contentType;
	}

	public String getHash() {
		return hash;
	}

	public String getPath() {
		return path;
	}

	public long getSize() {
		return size;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public void setHash(String hash) {
		this.hash = hash;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public void setSize(long size) {
		this.size = size;
	}
}
