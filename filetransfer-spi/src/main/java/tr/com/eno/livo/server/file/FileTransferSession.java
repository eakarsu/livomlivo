package tr.com.eno.livo.server.file;

import java.util.UUID;

public class FileTransferSession {

	private long bucketCount;
	private long currentIndex = 0;
	private File file;
	private UUID id;

	public long getBucketCount() {

		return bucketCount;
	}

	public long getCurrentIndex() {

		return currentIndex;
	}

	public File getFile() {
		return file;
	}

	public UUID getId() {

		return id;
	}

	public void incrementCurrentIndex() {

		this.currentIndex++;
	}

	public void setBucketCount(long bucketCount) {

		if (bucketCount <= 0)
			throw new IllegalArgumentException(
					"Number of buckets in a session cannot be less than equals to 0.");

		this.bucketCount = bucketCount;
	}

	public void setCurrentIndex(long currentIndex) {

		this.currentIndex = currentIndex;
	}

	public void setFile(File file) {
		this.file = file;
	}

	public void setId(UUID id) {

		this.id = id;
	}
}
