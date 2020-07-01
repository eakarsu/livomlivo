package tr.com.eno.livo.server;

import java.util.HashMap;
import java.util.Map;
import org.apache.thrift.TMultiplexedProcessor;
import org.apache.thrift.TProcessor;
import org.apache.thrift.server.TThreadedSelectorServer;
import org.apache.thrift.transport.TNonblockingServerSocket;
import org.apache.thrift.transport.TTransportException;
import org.osgi.framework.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Server {

	private static final Logger LOGGER = LoggerFactory.getLogger(Server.class);

	private Map<String, Object> config;
	private TMultiplexedProcessor processor;

	private Map<String, TProcessor> processors = new HashMap<String, TProcessor>();
	private TThreadedSelectorServer server;
	private Thread serverThread;
	private TNonblockingServerSocket serverTransport;

	public void reconfigure(Map<String, Object> config)
			throws TTransportException {

		LOGGER.debug("Reconfiguring the Livo server Thrift daemon...");

		if (config.equals(this.config)) {

			LOGGER.debug("Configuration is not changed.");

			return;

		} else {

			if (this.server.isServing()) {

				this.server.stop();
			}

			this.start(config);
		}
	}

	public void registerProcessor(TProcessor processor,
			Map<String, Object> serviceProps) {

		String serviceName = (String) serviceProps
				.get(ServerConstants.AEON_SERVER_THRIFT_SERVICE_NAME);

		LOGGER.debug(
				"Registering the processor for service '{}' and of type '{}'...",
				serviceName, processor.getClass().getName());

		synchronized (this.processors) {

			this.processors.put(serviceName, processor);
		}

		if (this.server != null && this.server.isServing()) {
			LOGGER.debug(
					"Registering the processor for service '{}' while the server is running...",
					serviceName);

			this.processor.registerProcessor((String) serviceProps
					.get(ServerConstants.AEON_SERVER_THRIFT_SERVICE_NAME),
					processor);
		}
	}

	public void start(Map<String, Object> config) throws TTransportException {

		LOGGER.debug("Starting Livo server Thrift daemon...");

		// Store the configuration locally
		this.config = config;

		// Initialize the processor
		this.processor = new TMultiplexedProcessor();

		// Register the processors if available
		synchronized (this.processors) {

			for (String serviceName : this.processors.keySet()) {

				this.processor.registerProcessor(serviceName,
						this.processors.get(serviceName));
			}
		}

		// Get the server port
		int port = config.get(ServerConstants.AEON_SERVER_THRIFT_PORT) == null ? 2366
				: ((Integer) config
						.get(ServerConstants.AEON_SERVER_THRIFT_PORT));

		// Initialize the server transport
		this.serverTransport = new TNonblockingServerSocket(port);

		// Initialize the server
		this.server = new TThreadedSelectorServer(
				new TThreadedSelectorServer.Args(this.serverTransport)
						.processor(this.processor));

		// Initialize the server thread
		this.serverThread = new Thread() {

			@Override
			public void run() {

				// Set up the uncaught error handler
				this.setUncaughtExceptionHandler(new UncaughtExceptionHandler() {

					@Override
					public void uncaughtException(Thread t, Throwable e) {

						LOGGER.debug(
								"Encountered an uncaught exception in thread named '{}' with ID of '{}'...",
								t.getName(), t.getId());

						LOGGER.error(e.getMessage(), e);
					}
				});

				// Start serving
				server.serve();
			}
		};

		// Start the server
		this.serverThread.start();

		LOGGER.info("Server is listening on port '{}'...", port);

		LOGGER.debug("Successfully started Livo server Thrift daemon.");
	}

	public void stop() {

		LOGGER.debug("Stopping Livo server thrift daemon...");

		// Stop the server
		if (this.server.isServing()) {
			this.server.stop();
		}

		this.serverThread.interrupt();

		LOGGER.debug("Successfully stopped Livo server thrift daemon.");
	}

	public void unregisterProcessor(TProcessor processor,
			Map<String, Object> serviceProps) throws TTransportException {

		String unregisteredServiceName = (String) serviceProps
				.get(Constants.SERVICE_PID);

		LOGGER.debug(
				"Unregistering the processor with name '{}' and of type '{}'...",
				unregisteredServiceName, processor.getClass().getName());

		// Re-initialize the processor
		this.processor = new TMultiplexedProcessor();

		synchronized (this.processors) {

			// Remove the unregistered processor
			this.processors.remove(unregisteredServiceName);

			// Register the processors if available
			for (String serviceName : this.processors.keySet()) {

				this.processor.registerProcessor(serviceName,
						this.processors.get(serviceName));
			}

			// Start the server
			this.server.serve();
		}
	}
}
