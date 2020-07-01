function loadjsfile(filename){
    
   var fileref=document.createElement('script');
   fileref.setAttribute("type","text/javascript");
   fileref.setAttribute("src", filename);
   document.getElementsByTagName("head")[0].appendChild(fileref);
   
}

if(navigator.userAgent.indexOf("Android") > 0) {
 
   loadjsfile("cordova.android.js");

 } else {
  
   loadjsfile("cordova.ios.js");
 }