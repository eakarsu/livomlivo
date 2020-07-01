package tr.com.eno.livo.server.file.disk;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.FileSystems;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.file.File;
import tr.com.eno.livo.server.file.FileTransferService;
import tr.com.eno.livo.server.file.FileTransferSession;

public class DiskFileTransferService implements FileTransferService {

	private final static String FILES_PATH = "files";
	private final static Logger LOGGER = LoggerFactory
			.getLogger(DiskFileTransferService.class);
	private Map<String, FileChannel> fileChannels;
	private java.io.File filesDirectory;
	private Map<String, Long> fileSizes;
	private Map<UUID, Long> sessionBucketSizes;

	private Map<UUID, FileTransferSession> sessions;

	@Override
	public void destroySession(FileTransferSession session) {

		LOGGER.debug("Destroying the file transfer session with ID \"{}\"...",
				session.getId());

		// TODO Close the related file channel if this session was the only
		// accessor

		// Remove the session from the sessions map
		synchronized (this.sessions) {

			this.sessions.remove(session.getId());
		}

		// Remove the bucket size from the map
		synchronized (this.sessionBucketSizes) {

			this.sessionBucketSizes.remove(session.getId());
		}
	}

	@Override
	public ByteBuffer fetchBucket(FileTransferSession session) {

		// Sanity check for session
		synchronized (this.sessions) {

			if (!this.sessions.containsKey(session.getId())) {

				LOGGER.debug(
						"Session \"{}\" is not valid, please recreate one.",
						session.getId());
				throw new RuntimeException();
			}
		}

		// Find the corresponding channel
		FileChannel channel;
		synchronized (this.fileChannels) {

			if (!this.fileChannels.containsKey(session.getFile().getHash())) {

				LOGGER.debug(
						"File channel for the file with SHA1 hash of \"{}\" could not be found!",
						session.getFile().getHash());

			}

			channel = this.fileChannels.get(session.getFile().getHash());
		}

		// Create a byte buffer with the correct size for result
		ByteBuffer buffer = null;
		Long size;
		synchronized (this.sessionBucketSizes) {

			size = this.sessionBucketSizes.get(session.getId());

			LOGGER.trace("Bucket size for the session \"{}\" is {}.",
					session.getId(), size);

			if (size > Integer.MAX_VALUE) {

				LOGGER.error(
						"Bucket size of {} bytes for session {} is larger than the maximum size of {}!",
						size, session.getId(), Integer.MAX_VALUE);
			} else {

				buffer = ByteBuffer.allocate(size.intValue());
			}
		}

		// Sanity check for buffer
		if (buffer == null) {

			LOGGER.error("Failed to allocate a buffer of size {} bytes!", size);

			throw new RuntimeException("Failed to allocate a buffer of size "
					+ size.toString() + " bytes!");
		}

		// Read the corresponding part of the file channel into the byte buffer
		try {

			channel.position(session.getCurrentIndex() * size);

			int readResult = channel.read(buffer);

			if (readResult == -1 || readResult == 0)
				LOGGER.trace(
						"Session with the ID \"{}\" has finished fetching the file with the SHA1 hash of \"{}\".",
						session.getId(), session.getFile().getHash());

		} catch (IOException e) {

			LOGGER.warn(
					"Failed to read the channel for file with SHA1 hash of \"{}\" into the buffer of size {}!",
					session.getFile().getHash(), size);

			throw new RuntimeException(e);
		}

		// Return the buffer
		return buffer;
	}

	@Override
	public FileTransferSession initiateSession(File file, long bucketSize) {

		// Check whether this service can provide the requested file
		java.io.File requestedFile = new java.io.File(this.filesDirectory,
				file.getHash());
		if (!requestedFile.exists()) {

			LOGGER.debug(
					"Requested file with SHA1 hash of '{}' cannot be found at '{}' by the disk-backed file transfer service.",
					file.getHash(), requestedFile.getAbsolutePath());
			throw new RuntimeException(new FileNotFoundException());
		}

		// Create a new session
		FileTransferSession session = new FileTransferSession();
		session.setFile(file);

		synchronized (this.sessions) {

			// Assign a unique session UUID to the new session
			UUID id = UUID.randomUUID();
			while (this.sessions.containsKey(id))
				id = UUID.randomUUID();

			// Set the ID field in session
			session.setId(id);
		}

		// Set the bucket size
		synchronized (this.sessionBucketSizes) {

			this.sessionBucketSizes.put(session.getId(), bucketSize);
		}

		// Set the bucket count for the session
		setBucketCount(session, file, bucketSize);

		// Add the session to the sessions map
		synchronized (this.sessions) {

			this.sessions.put(session.getId(), session);
		}

		// Return the session object
		return session;
	}

	protected void start(Map<String, Object> config) {

		LOGGER.info("Starting disk-backed file transfer service...");

		// Initialize the session map
		this.sessions = new HashMap<UUID, FileTransferSession>();

		// Initialize the session bucket size map
		this.sessionBucketSizes = new HashMap<UUID, Long>();

		// Initialize the session file size map
		this.fileSizes = new HashMap<String, Long>();

		// Initialize the session file channels
		this.fileChannels = new HashMap<String, FileChannel>();

		// Get the AEON home environment variable
		String homePath = System.getenv("AEON_HOME");

		// Sanity check for AEON home path
		if (homePath == null) {

			LOGGER.error("\"AEON_HOME\" environment variable is not set, preventing the DiskFileTransferService from starting.");

			throw new RuntimeException(
					"Please set the \"AEON_HOME\" environment variable before launching AEON server.");
		}

		// Calculate the absolute file path to the files directory
		this.filesDirectory = new java.io.File(homePath, FILES_PATH);

		// Create the directory if needed
		if (!this.filesDirectory.exists()) {

			LOGGER.info("AEON files directory does not exist.");

			if (this.filesDirectory.mkdirs()) {

				LOGGER.info("AEON files directory is successfully created.");

			} else {

				LOGGER.info("AEON files directory could not be created.");

				throw new RuntimeException(
						"AEON files directory could not be created at path \""
								+ this.filesDirectory.getAbsolutePath()
								+ "\", please check the write permissons or create it manually.");
			}
		}
	}

	protected void stop() {

		LOGGER.info("Stopping the disk-backed file transfer service...");

		// Remove the sessions one by one
		synchronized (this.sessions) {

			for (UUID sessionId : this.sessions.keySet()) {

				LOGGER.trace(
						"Removing file transfer session with ID \"{}\"...",
						sessionId);

				this.sessions.remove(sessionId);
			}
		}

		// Clear the bucket size map
		synchronized (this.sessionBucketSizes) {

			this.sessionBucketSizes.clear();
		}

		// Close the file channels one by one
		synchronized (this.fileChannels) {

			for (String hash : this.fileChannels.keySet()) {

				LOGGER.trace(
						"Closing the file channel for the file with SHA1 hash of \"{}\"...",
						hash);

				try {

					this.fileChannels.get(hash).close();

				} catch (IOException e) {

					LOGGER.warn(
							"Failed to close the file channel for the file with SHA1 hash of \"{}\"!",
							hash);
				}
			}
		}

		LOGGER.info("Successfully stopped the disk-backed file transfer service.");
	}

	private void setBucketCount(FileTransferSession session, File file,
			long bucketSize) {

		// Check if we stored the file size before
		synchronized (this.fileSizes) {

			if (this.fileSizes.containsKey(file.getHash())) {

				long fileSize = this.fileSizes.get(file.getHash());

				session.setBucketCount((fileSize - (fileSize % bucketSize))
						/ bucketSize + 1);
				return;
			}
		}

		// Get the absolute file path
		java.io.File requestedFile = new java.io.File(this.filesDirectory,
				file.getHash());

		// Sanity check for file
		if (!requestedFile.exists()) {

			LOGGER.error(
					"Requested a non existing file with hash value \"{}\" and absolute path \"{}\".",
					file.getHash(), requestedFile.getAbsolutePath());

			throw new RuntimeException("Requested file does no exist!");
		}

		// Check whether we have an open file channel for the requested file
		synchronized (this.fileChannels) {

			FileChannel channel = null;

			if (this.fileChannels.containsKey(file.getHash())) {

				channel = this.fileChannels.get(file.getHash());

			} else {

				// Open a channel for the file
				try {
					channel = FileChannel.open(
							FileSystems.getDefault().getPath(
									this.filesDirectory.getAbsolutePath(),
									file.getHash()), StandardOpenOption.READ);

					this.fileChannels.put(file.getHash(), channel);
				} catch (IOException e) {

					/*
					 * if (channel != null && channel.isOpen()) {
					 * 
					 * LOGGER.debug(
					 * "Trying to close an incorrectly opened channel for the file with SHA1 hash of '{}'... I guess!"
					 * ); }
					 */

					LOGGER.error(e.getMessage(), e);
				}
			}

			long size;
			try {

				size = channel.size();

			} catch (Exception e) {

				LOGGER.error(
						"Failed to get the size of the file \"{}\" via it's file channel.",
						requestedFile.getAbsolutePath());

				throw new RuntimeException(e);
			}

			session.setBucketCount((size - (size % bucketSize)) / bucketSize
					+ 1);
		}
	}
}
