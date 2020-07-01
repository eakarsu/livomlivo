package tr.com.eno.livo.server.web;

public class ApplicationStructureException  extends Exception{

	private static final long serialVersionUID = 1L;
	
	public ApplicationStructureException(String arg){
		
		super(arg);
	}
	
	public ApplicationStructureException(String arg0, Throwable arg1){
		
		super(arg0,arg1);
	}

}
