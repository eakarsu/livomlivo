package tr.com.eno.livo.server.file;

import java.nio.ByteBuffer;

public interface FileTransferService {

	public void destroySession(FileTransferSession session);

	public ByteBuffer fetchBucket(FileTransferSession session);

	public FileTransferSession initiateSession(File file, long bucketSize);
}
