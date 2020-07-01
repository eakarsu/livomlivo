/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package tr.com.eno.livo.server.serviceobjects.sapservice;

import com.sap.conn.jco.ext.DestinationDataEventListener;
import com.sap.conn.jco.ext.DestinationDataProvider;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;


public class SapDestinationDataProvider implements DestinationDataProvider{
    
    private final Map<String,Properties> destProperties = new HashMap<>();
    
    public void addDestination(String destinationName,Properties props){
        
        this.destProperties.put(destinationName, props);
    
    }

    @Override
    public Properties getDestinationProperties(String destinationName) {
        
        if(this.destProperties.containsKey(destinationName))
        
            return this.destProperties.get(destinationName);
        
        else 
        
            throw  new RuntimeException("Destination is not found.");
    }

    @Override
    public boolean supportsEvents() {
        
        return false;
    }

    @Override
    public void setDestinationDataEventListener(DestinationDataEventListener eventListener) {
        //throw new UnsupportedOperationException("Not supported yet."); 
                
    }
    
}
