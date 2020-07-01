package tr.com.eno.livo.server.configurationadmin.proxy;

import java.io.IOException;
import java.util.Dictionary;
import java.util.Map;
import java.util.UUID;

/**
 * This interface is combined version of ConfigurationAdmin and
 * Configuration interfaces which makes it really custom. Also no proxy for 
 * listConfigurations method of standart  osgi ConfigurationAdmin service.
 */

public interface ConfigurationAdminProxyServiceMBean {


	/**
	 * Create a new factory <code>Configuration</code> object with a new PID.
	 * 
	 * The properties of the new <code>Configuration</code> object are
	 * <code>null</code> until the first time that its
	 * {@link Configuration#update(Dictionary)} method is called.
	 * 
	 * <p>
	 * It is not required that the <code>factoryPid</code> maps to a
	 * registered Managed Service Factory.
	 * <p>
	 * The <code>Configuration</code> object is bound to the location of the
	 * calling bundle.
	 * 
	 * @param factoryPid PID of factory (not <code>null</code>).
	 * @return A new <code>UUID</code> object which is used for execution of Configuration methods.
	 * @throws IOException if access to persistent storage fails.
	 * @throws SecurityException if caller does not have <code>ConfigurationPermission[*,CONFIGURE]</code> and <code>factoryPid</code> is bound to another bundle.
	 */
	public UUID createFactoryConfiguration(String factoryPid)
			throws IOException;

	/**
	 * Create a new factory <code>Configuration</code> object with a new PID.
	 * 
	 * The properties of the new <code>Configuration</code> object are
	 * <code>null</code> until the first time that its
	 * {@link Configuration#update(Dictionary)} method is called.
	 * 
	 * <p>
	 * It is not required that the <code>factoryPid</code> maps to a
	 * registered Managed Service Factory.
	 * 
	 * <p>
	 * The <code>Configuration</code> is bound to the location specified. If
	 * this location is <code>null</code> it will be bound to the location of
	 * the first bundle that registers a Managed Service Factory with a
	 * corresponding PID.
	 * 
	 * @param factoryPid PID of factory (not <code>null</code>).
	 * @param location A bundle location string, or <code>null</code>.
	 * @return A new <code>UUID</code> object which is used for execution of Configuration methods.
	 * @throws IOException if access to persistent storage fails.
	 * @throws SecurityException if caller does not have <code>ConfigurationPermission[*,CONFIGURE]</code>.
	 */
	public UUID createFactoryConfiguration(String factoryPid, String location)
			throws IOException;

	/**
	 * Get an existing <code>Configuration</code> object from the persistent
	 * store, or create a new <code>Configuration</code> object.
	 * 
	 * <p>
	 * If a <code>Configuration</code> with this PID already exists in
	 * Configuration Admin service return it. The location parameter is ignored
	 * in this case.
	 * 
	 * <p>
	 * Else, return a new <code>Configuration</code> object. This new object
	 * is bound to the location and the properties are set to <code>null</code>.
	 * If the location parameter is <code>null</code>, it will be set when a
	 * Managed Service with the corresponding PID is registered for the first
	 * time.
	 * 
	 * @param pid Persistent identifier.
	 * @param location The bundle location string, or <code>null</code>.
	 * @return A new <code>UUID</code> object which is used for execution of Configuration methods.
	 * @throws IOException if access to persistent storage fails.
	 * @throws SecurityException if the caller does not have <code>ConfigurationPermission[*,CONFIGURE]</code>.
	 */
	public UUID getConfiguration(String pid, String location)
			throws IOException;

	/**
	 * Get an existing or new <code>Configuration</code> object from the
	 * persistent store.
	 * 
	 * If the <code>Configuration</code> object for this PID does not exist,
	 * create a new <code>Configuration</code> object for that PID, where
	 * properties are <code>null</code>. Bind its location to the calling
	 * bundle's location.
	 * 
	 * <p>
	 * Otherwise, if the location of the existing <code>Configuration</code> object
	 * is <code>null</code>, set it to the calling bundle's location.
	 * 
	 * @param pid persistent identifier.
	 * @return UUID for an existing or new <code>Configuration</code> matching the PID.
	 * @throws IOException if access to persistent storage fails.
	 * @throws SecurityException if the <code>Configuration</code> object is bound to a location different from that of the calling bundle and it has no <code>ConfigurationPermission[*,CONFIGURE]</code>.
	 */
	public UUID getConfiguration(String pid) throws IOException;
        
    
    	/**
	 * Get the PID for this <code>Configuration</code> object.
	 * 
         * @param  identifier <code>UUID</code> configuration identifier for caller.
	 * @return the PID for this <code>Configuration</code> object.
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public String getPid(UUID identifier);

	/**
	 * Return the properties of this <code>Configuration</code> object.
	 * 
	 * The <code>Dictionary</code> object returned is a private copy for the
	 * caller and may be changed without influencing the stored configuration.
	 * The keys in the returned dictionary are case insensitive and are always
	 * of type <code>String</code>.
	 * 
	 * <p>
	 * If called just after the configuration is created and before update has
	 * been called, this method returns <code>null</code>.
	 * @param identifier <code>UUID</code> configuration identifier for caller.
	 * @return A private copy of the properties for the caller or
	 *         <code>null</code>. These properties must not contain the
	 *         "service.bundleLocation" property. The value of this property may
	 *         be obtained from the <code>getBundleLocation</code> method.
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public Map getProperties(UUID identifier);

	/**
	 * Update the properties of this <code>Configuration</code> object.
	 * 
	 * Stores the properties in persistent storage after adding or overwriting
	 * the following properties:
	 * <ul>
	 * <li>"service.pid" : is set to be the PID of this configuration.</li>
	 * <li>"service.factoryPid" : if this is a factory configuration it is set
	 * to the factory PID else it is not set.</li>
	 * </ul>
	 * These system properties are all of type <code>String</code>.
	 * 
	 * <p>
	 * If the corresponding Managed Service/Managed Service Factory is
	 * registered, its updated method must be called asynchronously. Else, this
	 * callback is delayed until aforementioned registration occurs.
	 * 
	 * <p>
	 * Also initiates an asynchronous call to all
	 * <code>ConfigurationListener</code>s with a
	 * <code>ConfigurationEvent.CM_UPDATED</code> event.
	 * @param identifier <code>UUID</code> configuration identifier for caller. 
	 * @param properties the new set of properties for this configuration
	 * @throws IOException if update cannot be made persistent
	 * @throws IllegalArgumentException if the <code>Dictionary</code> object
	 *         contains invalid configuration types or contains case variants of
	 *         the same key name.
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public void update(UUID  identifier,Map properties) throws IOException;

	/**
	 * Delete this <code>Configuration</code> object.
	 * 
	 * Removes this configuration object from the persistent store. Notify
	 * asynchronously the corresponding Managed Service or Managed Service
	 * Factory. A <code>ManagedService</code> object is notified by a call to
	 * its <code>updated</code> method with a <code>null</code> properties
	 * argument. A <code>ManagedServiceFactory</code> object is notified by a
	 * call to its <code>deleted</code> method.
	 * 
	 * <p>
	 * Also initiates an asynchronous call to all
	 * <code>ConfigurationListener</code>s with a
	 * <code>ConfigurationEvent.CM_DELETED</code> event.
	 * 
         * @param identifier <code>UUID</code> configuration identifier for caller.
	 * @throws IOException If delete fails
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public void delete(UUID identifier) throws IOException;

	/**
	 * For a factory configuration return the PID of the corresponding Managed
	 * Service Factory, else return <code>null</code>.
         * 
	 * @param identifier <code>UUID</code> configuration identifier for caller. 
	 * @return factory PID or <code>null</code>
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public String getFactoryPid(UUID identifier);

	/**
	 * Update the <code>Configuration</code> object with the current
	 * properties.
	 * 
	 * Initiate the <code>updated</code> callback to the Managed Service or
	 * Managed Service Factory with the current properties asynchronously.
	 * 
	 * <p>
	 * This is the only way for a bundle that uses a Configuration Plugin
	 * service to initiate a callback. For example, when that bundle detects a
	 * change that requires an update of the Managed Service or Managed Service
	 * Factory via its <code>ConfigurationPlugin</code> object.
	 * 
         * @param identifier <code>UUID</code> configuration identifier for caller.
	 * @see ConfigurationPlugin
	 * @throws IOException if update cannot access the properties in persistent
	 *         storage
	 * @throws IllegalStateException if this configuration has been deleted
	 */
	public void update(UUID identifier) throws IOException;

	/**
	 * Bind this <code>Configuration</code> object to the specified bundle
	 * location.
	 * 
	 * If the bundleLocation parameter is <code>null</code> then the
	 * <code>Configuration</code> object will not be bound to a location. It
	 * will be set to the bundle's location before the first time a Managed
	 * Service/Managed Service Factory receives this <code>Configuration</code>
	 * object via the updated method and before any plugins are called. The
	 * bundle location will be set persistently.
	 * 
         * @param identifier <code>UUID</code> configuration identifier for caller. 
	 * @param bundleLocation a bundle location or <code>null</code>
	 * @throws IllegalStateException If this configuration has been deleted.
	 * @throws SecurityException If the caller does not have
	 *         <code>ConfigurationPermission[*,CONFIGURE]</code>.
	 */
	public void setBundleLocation(UUID identifier,String bundleLocation);

	/**
	 * Get the bundle location.
	 * 
	 * Returns the bundle location to which this configuration is bound, or
	 * <code>null</code> if it is not yet bound to a bundle location.
	 * 
         * @param identifier <code>UUID</code> configuration identifier for caller.
	 * @return location to which this configuration is bound, or
	 *         <code>null</code>.
	 * @throws IllegalStateException If this <code>Configuration</code> object
	 *         has been deleted.
	 * @throws SecurityException If the caller does not have
	 *         <code>ConfigurationPermission[*,CONFIGURE]</code>.
	 */
	public String getBundleLocation(UUID identifier);


	/**
	 * Hash code is based on PID.
	 * 
	 * The hashcode for two Configuration objects must be the same when the
	 * Configuration PID's are the same.
	 * 
         * @param identifier <code>UUID</code> configuration identifier for caller.
	 * @return hash code for this Configuration object
	 */
	public int hashCode(UUID identifier);
        
        /**
         * Removes configuration that bind to identifier. 
         * Should be called after execution completion in order to prevent memory leaking.
         * @param indetifier 
         */
        public void removeIdentifier(UUID indetifier);
   

}
