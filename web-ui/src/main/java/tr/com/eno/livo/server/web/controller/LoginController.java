package tr.com.eno.livo.server.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class LoginController {
	
    @RequestMapping(value="/login", method = RequestMethod.GET)
	public String show(ModelMap modelMap) {
		
		return "login";
	}

    @RequestMapping(value="/login/error", method = RequestMethod.GET)
	public String error(ModelMap modelMap) {
    	
    	modelMap.put("error", true);
		
		return "login";
	}
}
