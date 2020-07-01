package tr.com.eno.livo.server.configurationadmin.proxy;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class BundleLocator {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(BundleLocator.class);
    
    private final BundleContext context;
    
    protected BundleLocator(BundleContext context){
    
        this.context = context;
        
    }
    
    private boolean checkServicePidProperty(ServiceReference reference){
    
        for(String s :reference.getPropertyKeys()){
        
            if(s.equalsIgnoreCase("component.name"))
                return true;
        }
    
        return false;
    }
    
    private Map<String,String> livoServicesLocationInfo() throws InvalidSyntaxException{
    
        Map<String,String> map =  new HashMap<>();
        
        ServiceReference[] refs = this.context.getAllServiceReferences(null, "(objectclass=tr.com.eno.livo.*)");
        
        for(ServiceReference ref : refs){
        
            if(!this.checkServicePidProperty(ref))
                continue;
            
            map.put((String)ref.getProperty("component.name"),ref.getBundle().getLocation());
        
        }
    
        String s="";
        
        for(String ss :map.keySet()){
        
            s+="["+ss+"]";
        }
    
        LOGGER.debug("Currently alive LIVO services' component names: {}",s);
        
        return map;
    }
    
    public String locate(String pid){
        
        try {
            return this.livoServicesLocationInfo().get(pid);
        } catch (InvalidSyntaxException ex) {
            
            LOGGER.debug("Invalid filter",ex);
            return null;
        }
    
    
    }
}
