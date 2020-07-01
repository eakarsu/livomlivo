package tr.com.eno.livo.server.serviceobjects;

import javax.activation.MimeType;

public class ServiceObjectOperationPayload {

	private String content;
	private MimeType contentType;;
	private String rootElement;

	public String getContent() {
		return content;
	}

	public MimeType getContentType() {
		return contentType;
	}

	public String getRootElement() {
		return rootElement;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public void setContentType(MimeType contentType) {
		this.contentType = contentType;
	}

	public void setRootElement(String rootElement) {
		this.rootElement = rootElement;
	}
}
