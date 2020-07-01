package tr.com.eno.livo.server.application;

import java.io.Serializable;

public class RawScreen extends Screen implements Serializable {

	private static final long serialVersionUID = -7789079554084927641L;
	private String rawContent;

	public String getRawContent() {
		return rawContent;
	}

	public void setRawContent(String rawHtmlContent) {
		this.rawContent = rawHtmlContent;
	}
}
