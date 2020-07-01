package tr.com.eno.livo.server.web.formgenerator.ws;

    public  enum InputType{
 
        TEXT("text"),PASSWORD("password"),TIME("time"),DATE("date"),
        DOUBLE("double"),DURATION("datetime"),
        SHORT("short"),BYTE("byte"),INT("int"),LONG("long"),
        USHORT("ushort"),UBYTE("ubyte"),UINT("uint"),ULONG("ulong"),
        UDOUBLE("udouble"),BOOLEAN("boolean"),NUMBER("number"),SERVICETYPE("servicetype");
        private final String value;
        
        private InputType(String s){
        
            this.value = s;
        }
        
        public String getValue(){return this.value;}
    
    }