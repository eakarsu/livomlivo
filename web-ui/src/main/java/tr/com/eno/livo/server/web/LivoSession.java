package tr.com.eno.livo.server.web;

import org.springframework.stereotype.Component;

import tr.com.eno.livo.server.application.Application;

@Component
public class LivoSession {

    public Application currentApplication;
//    public LivoUser user;
    public WebUser webUser;

    public LivoSession() {
    }

    public Application getCurrentApplication() {
        return currentApplication;
    }

    public void setCurrentApplication(Application currentApplication) {
        this.currentApplication = currentApplication;
    }

//    public LivoUser getUser() {
//        return user;
//    }
//
//    public void setUser(LivoUser user) {
//        this.user = user;
//    }
    
    public WebUser getWebUser(){
    
        return this.webUser;
    }
    
    public void setWebUser(WebUser user){
    
        this.webUser = user;
    }
}
