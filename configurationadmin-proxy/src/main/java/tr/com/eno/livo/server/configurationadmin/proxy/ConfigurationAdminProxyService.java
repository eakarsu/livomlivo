package tr.com.eno.livo.server.configurationadmin.proxy;

import java.io.IOException;
import java.util.Dictionary;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;import java.util.UUID;
import org.osgi.framework.Bundle;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceEvent;
import org.osgi.framework.ServiceListener;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationPermission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConfigurationAdminProxyService implements ConfigurationAdminProxyServiceMBean {

    private final static Logger LOGGER = LoggerFactory.getLogger(ConfigurationAdminProxyService.class);

    private org.osgi.service.cm.ConfigurationAdmin configurationAdmin;
    
    private final Map<UUID,Configuration> configurations = new HashMap<>();
   
    private Map<String,String> serviceComponentInfo = new HashMap<>();
    

    protected void start(Map<String, Object> props) throws IOException {

      LOGGER.debug("Starting ConfigurationAdmin service impl with name '{}'", props.get("component.name"));
                
    }

    protected void stop(Map<String, Object> props) {

        LOGGER.debug("Stopping ConfigurationAdmin service impl with name '{}'", props.get("component.name"));

        this.configurationAdmin = null;

    }

    protected void registerService(org.osgi.service.cm.ConfigurationAdmin service) {

        LOGGER.debug("Registering ConfigurationAdmin service named '{}' to proxyfier service", service.getClass().getName());
        this.configurationAdmin = service;
    }

    protected void unregisterService(org.osgi.service.cm.ConfigurationAdmin service) {

        LOGGER.debug("Unregistering ConfigurationAdmin service named '{}' from proxfier service", service.getClass().getName());

        this.configurationAdmin = null;
    }

    private void checkSanity(){
        
        if(this.configurationAdmin==null)
            throw new RuntimeException("No ConfigurationAdmin has been found for proxy.");
    }
    
    private UUID uniqueUUID(){
    
        UUID unique = UUID.randomUUID();
        
        while(this.configurations.keySet().contains(unique)){
            
            unique =UUID.randomUUID();
        }
    
        return unique;
    }
    
    @Override
    public UUID createFactoryConfiguration(String factoryPid) throws IOException {
        
        this.checkSanity();
        
        BundleLocator locator = new BundleLocator(FrameworkUtil.getBundle(ConfigurationAdminProxyService.class).getBundleContext());
        
        Configuration conf = this.configurationAdmin.createFactoryConfiguration(factoryPid,locator.locate(factoryPid));
        
        UUID ucUnique = this.uniqueUUID();
        
        this.configurations.put(ucUnique, conf);
        
        return ucUnique;
    }

    @Override
    public UUID createFactoryConfiguration(String factoryPid, String location) throws IOException {
        
        this.checkSanity();
        
        Configuration conf = this.configurationAdmin.createFactoryConfiguration(factoryPid,location);
        
        UUID ucUnique = this.uniqueUUID();
        
        this.configurations.put(ucUnique, conf);
        
        return ucUnique;
    }

    @Override
    public UUID getConfiguration(String pid, String location) throws IOException {
       
        this.checkSanity();
        
        Configuration conf = this.configurationAdmin.getConfiguration(pid, location);
        
        UUID ucUnique = this.uniqueUUID();
        
        this.configurations.put(ucUnique, conf);
        
        return ucUnique;
    }

    @Override
    public UUID getConfiguration(String pid) throws IOException {
        
        this.checkSanity();
        
        BundleLocator locator = new BundleLocator(FrameworkUtil.getBundle(ConfigurationAdminProxyService.class).getBundleContext());
        
        Configuration conf = this.configurationAdmin.getConfiguration(pid,locator.locate(pid));
        
        UUID ucUnique = this.uniqueUUID();
        
        this.configurations.put(ucUnique, conf);
        
        return ucUnique;
    }

    @Override
    public String getPid(UUID identifier) {
        
        this.checkSanity();
        
        return this.configurations.get(identifier).getPid();
    }

    @Override
    public Map getProperties(UUID identifier) {
        
        this.checkSanity();
        
        return this.dictionaryToMap(this.configurations.get(identifier).getProperties(),new HashMap<String,Object>());
    }

    @Override
    public void update(UUID identifier, Map properties) throws IOException {
        
        this.checkSanity();
        
        Dictionary dic = new Hashtable(properties);
        
        this.configurations.get(identifier).update(dic);
    }

    @Override
    public void delete(UUID identifier) throws IOException {
        
        this.checkSanity();
        
        this.configurations.get(identifier).delete();
    }

    @Override
    public String getFactoryPid(UUID identifier) {
        
        this.checkSanity();
        
        return this.configurations.get(identifier).getFactoryPid();
    }

    @Override
    public void update(UUID identifier) throws IOException {
        
        this.checkSanity();
        
        this.configurations.get(identifier).update();
    }

    @Override
    public void setBundleLocation(UUID identifier, String bundleLocation) {
        
        this.checkSanity();
        
        this.configurations.get(identifier).setBundleLocation(bundleLocation);
    }

    @Override
    public String getBundleLocation(UUID identifier) {
        
        this.checkSanity();
        
        return this.configurations.get(identifier).getBundleLocation();
    }


    @Override
    public int hashCode(UUID identifier) {
        this.checkSanity();
        
        return this.configurations.get(identifier).hashCode();
    }

    @Override
    public void removeIdentifier(UUID identifier) {
        
        this.configurations.remove(identifier);
    }
    
    private  Map<String, Object> dictionaryToMap(Dictionary<String, Object> source, Map<String, Object> sink) {
    
        if(source!=null)
        
            for (Enumeration<String> keys = source.keys(); keys.hasMoreElements();) {
        
            
                String key = keys.nextElement();
        
            
                sink.put(key, source.get(key));
            
            }
    
        return sink;
    
    }
    
//    private <K,V> Dictionary<K,V> mapToDictionary(Map<K,V> source, Dictionary<K,V> sink){
//    
//        for (K key : source.keySet()) {
//                
//            sink.put(key, source.get(key));
//        }
//    
//        return sink;
//    }

}
