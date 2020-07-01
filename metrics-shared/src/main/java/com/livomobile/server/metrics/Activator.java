package com.livomobile.server.metrics;

import com.codahale.metrics.CsvReporter;
import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Slf4jReporter;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.Hashtable;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.framework.ServiceRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Activator implements BundleActivator {

    private static final Logger LOGGER = LoggerFactory.getLogger(Activator.class.getPackage().getName());
    private MetricRegistry metrics;
    private File metricsDataDirectory;
    private Slf4jReporter slf4jReporter;
    private CsvReporter csvReporter;
    private JmxReporter jmxReporter;
    private ServiceRegistration serviceRegistration;

    @Override
    public void start(BundleContext context) throws Exception {

        LOGGER.debug("Initializing metrics registry...");

        this.metrics = new MetricRegistry();

        LOGGER.debug("Configuring metrics reporters...");

        this.configureReporters();

        LOGGER.debug("Starting metrics reporters...");

        this.slf4jReporter.start(1, TimeUnit.MINUTES);
        this.csvReporter.start(1, TimeUnit.MINUTES);
        this.jmxReporter.start();

        LOGGER.debug("Registering MetricsRegistry instance as a service...");

        Hashtable<String, Object> serviceProperties = new Hashtable<>();
        serviceProperties.put(Constants.SERVICE_PID, MetricRegistry.class.getPackage().getName());

        this.serviceRegistration = context.registerService(MetricRegistry.class.getName(), metrics, serviceProperties);
    }

    @Override
    public void stop(BundleContext context) throws Exception {

        LOGGER.debug("Stopping metrics reporters...");

        this.slf4jReporter.stop();
        this.csvReporter.stop();
        this.jmxReporter.stop();

        LOGGER.debug("Unregistering MetricsRegistry instance...");

        this.serviceRegistration.unregister();
    }

    private void configureReporters() {

        LOGGER.debug("Initializing SLF4J reporter...");

        this.slf4jReporter = Slf4jReporter
                .forRegistry(this.metrics)
                .convertRatesTo(TimeUnit.SECONDS)
                .convertDurationsTo(TimeUnit.SECONDS)
                .outputTo(LoggerFactory.getLogger(Activator.class.getPackage().getName()))
                .withLoggingLevel(Slf4jReporter.LoggingLevel.DEBUG)
                .build();

        LOGGER.debug("Initializing CSV reporter...");

        this.prepareMetricsDirectory();

        this.csvReporter = CsvReporter
                .forRegistry(this.metrics)
                .convertRatesTo(TimeUnit.SECONDS)
                .convertDurationsTo(TimeUnit.SECONDS)
                .formatFor(Locale.ENGLISH)
                .build(this.metricsDataDirectory);

        LOGGER.debug("Initializing JMX reporter...");

        this.jmxReporter = JmxReporter
                .forRegistry(this.metrics)
                .convertRatesTo(TimeUnit.SECONDS)
                .convertDurationsTo(TimeUnit.SECONDS)
                .registerWith(ManagementFactory.getPlatformMBeanServer())
                .build();
    }

    private void prepareMetricsDirectory() {

        LOGGER.debug("Creating metrics data directory...");

        if (System.getenv("AEON_HOME") == null) {

            throw new RuntimeException("AEON_HOME environment variable is not set.");
        }

        File homeDirectory = new File(System.getenv("AEON_HOME"));

        File dataDirectory = new File(homeDirectory, "data");

        this.metricsDataDirectory = new File(dataDirectory, "metrics");

        this.metricsDataDirectory.mkdirs();
    }
}
