/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var b=arguments,g=null,e,c,f;for(e=0;e<b.length;e=e+1){f=(""+b[e]).split(".");g=YAHOO;for(c=(f[0]=="YAHOO")?1:0;c<f.length;c=c+1){g[f[c]]=g[f[c]]||{};g=g[f[c]];}}return g;};YAHOO.log=function(d,a,c){var b=YAHOO.widget.Logger;if(b&&b.log){return b.log(d,a,c);}else{return false;}};YAHOO.register=function(a,f,e){var k=YAHOO.env.modules,c,j,h,g,d;if(!k[a]){k[a]={versions:[],builds:[]};}c=k[a];j=e.version;h=e.build;g=YAHOO.env.listeners;c.name=a;c.version=j;c.build=h;c.versions.push(j);c.builds.push(h);c.mainClass=f;for(d=0;d<g.length;d=d+1){g[d](c);}if(f){f.VERSION=j;f.BUILD=h;}else{YAHOO.log("mainClass is undefined for module "+a,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(a){return YAHOO.env.modules[a]||null;};YAHOO.env.parseUA=function(d){var e=function(i){var j=0;return parseFloat(i.replace(/\./g,function(){return(j++==1)?"":".";}));},h=navigator,g={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:h&&h.cajaVersion,secure:false,os:null},c=d||(navigator&&navigator.userAgent),f=window&&window.location,b=f&&f.href,a;g.secure=b&&(b.toLowerCase().indexOf("https")===0);if(c){if((/windows|win32/i).test(c)){g.os="windows";}else{if((/macintosh/i).test(c)){g.os="macintosh";}else{if((/rhino/i).test(c)){g.os="rhino";}}}if((/KHTML/).test(c)){g.webkit=1;}a=c.match(/AppleWebKit\/([^\s]*)/);if(a&&a[1]){g.webkit=e(a[1]);if(/ Mobile\//.test(c)){g.mobile="Apple";a=c.match(/OS ([^\s]*)/);if(a&&a[1]){a=e(a[1].replace("_","."));}g.ios=a;g.ipad=g.ipod=g.iphone=0;a=c.match(/iPad|iPod|iPhone/);if(a&&a[0]){g[a[0].toLowerCase()]=g.ios;}}else{a=c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);if(a){g.mobile=a[0];}if(/webOS/.test(c)){g.mobile="WebOS";a=c.match(/webOS\/([^\s]*);/);if(a&&a[1]){g.webos=e(a[1]);}}if(/ Android/.test(c)){g.mobile="Android";a=c.match(/Android ([^\s]*);/);if(a&&a[1]){g.android=e(a[1]);}}}a=c.match(/Chrome\/([^\s]*)/);if(a&&a[1]){g.chrome=e(a[1]);}else{a=c.match(/AdobeAIR\/([^\s]*)/);if(a){g.air=a[0];}}}if(!g.webkit){a=c.match(/Opera[\s\/]([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);a=c.match(/Version\/([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);}a=c.match(/Opera Mini[^;]*/);if(a){g.mobile=a[0];}}else{a=c.match(/MSIE\s([^;]*)/);if(a&&a[1]){g.ie=e(a[1]);}else{a=c.match(/Gecko\/([^\s]*)/);if(a){g.gecko=1;a=c.match(/rv:([^\s\)]*)/);if(a&&a[1]){g.gecko=e(a[1]);}}}}}}return g;};YAHOO.env.ua=YAHOO.env.parseUA();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var b=YAHOO_config.listener,a=YAHOO.env.listeners,d=true,c;if(b){for(c=0;c<a.length;c++){if(a[c]==b){d=false;break;}}if(d){a.push(b);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var f=YAHOO.lang,a=Object.prototype,c="[object Array]",h="[object Function]",i="[object Object]",b=[],g={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;","`":"&#x60;"},d=["toString","valueOf"],e={isArray:function(j){return a.toString.apply(j)===c;},isBoolean:function(j){return typeof j==="boolean";},isFunction:function(j){return(typeof j==="function")||a.toString.apply(j)===h;},isNull:function(j){return j===null;},isNumber:function(j){return typeof j==="number"&&isFinite(j);},isObject:function(j){return(j&&(typeof j==="object"||f.isFunction(j)))||false;},isString:function(j){return typeof j==="string";},isUndefined:function(j){return typeof j==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(l,k){var j,n,m;for(j=0;j<d.length;j=j+1){n=d[j];m=k[n];if(f.isFunction(m)&&m!=a[n]){l[n]=m;}}}:function(){},escapeHTML:function(j){return j.replace(/[&<>"'\/`]/g,function(k){return g[k];});},extend:function(m,n,l){if(!n||!m){throw new Error("extend failed, please check that "+"all dependencies are included.");}var k=function(){},j;k.prototype=n.prototype;m.prototype=new k();m.prototype.constructor=m;m.superclass=n.prototype;if(n.prototype.constructor==a.constructor){n.prototype.constructor=n;}if(l){for(j in l){if(f.hasOwnProperty(l,j)){m.prototype[j]=l[j];}}f._IEEnumFix(m.prototype,l);}},augmentObject:function(n,m){if(!m||!n){throw new Error("Absorb failed, verify dependencies.");}var j=arguments,l,o,k=j[2];if(k&&k!==true){for(l=2;l<j.length;l=l+1){n[j[l]]=m[j[l]];}}else{for(o in m){if(k||!(o in n)){n[o]=m[o];}}f._IEEnumFix(n,m);}return n;},augmentProto:function(m,l){if(!l||!m){throw new Error("Augment failed, verify dependencies.");}var j=[m.prototype,l.prototype],k;for(k=2;k<arguments.length;k=k+1){j.push(arguments[k]);}f.augmentObject.apply(this,j);return m;},dump:function(j,p){var l,n,r=[],t="{...}",k="f(){...}",q=", ",m=" => ";if(!f.isObject(j)){return j+"";}else{if(j instanceof Date||("nodeType" in j&&"tagName" in j)){return j;}else{if(f.isFunction(j)){return k;}}}p=(f.isNumber(p))?p:3;if(f.isArray(j)){r.push("[");for(l=0,n=j.length;l<n;l=l+1){if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}if(r.length>1){r.pop();}r.push("]");}else{r.push("{");for(l in j){if(f.hasOwnProperty(j,l)){r.push(l+m);if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}}if(r.length>1){r.pop();}r.push("}");}return r.join("");},substitute:function(x,y,E,l){var D,C,B,G,t,u,F=[],p,z=x.length,A="dump",r=" ",q="{",m="}",n,w;for(;;){D=x.lastIndexOf(q,z);if(D<0){break;}C=x.indexOf(m,D);if(D+1>C){break;}p=x.substring(D+1,C);G=p;u=null;B=G.indexOf(r);if(B>-1){u=G.substring(B+1);G=G.substring(0,B);}t=y[G];if(E){t=E(G,t,u);}if(f.isObject(t)){if(f.isArray(t)){t=f.dump(t,parseInt(u,10));}else{u=u||"";n=u.indexOf(A);if(n>-1){u=u.substring(4);}w=t.toString();if(w===i||n>-1){t=f.dump(t,parseInt(u,10));}else{t=w;}}}else{if(!f.isString(t)&&!f.isNumber(t)){t="~-"+F.length+"-~";F[F.length]=p;}}x=x.substring(0,D)+t+x.substring(C+1);if(l===false){z=D-1;}}for(D=F.length-1;D>=0;D=D-1){x=x.replace(new RegExp("~-"+D+"-~"),"{"+F[D]+"}","g");}return x;},trim:function(j){try{return j.replace(/^\s+|\s+$/g,"");}catch(k){return j;
}},merge:function(){var n={},k=arguments,j=k.length,m;for(m=0;m<j;m=m+1){f.augmentObject(n,k[m],true);}return n;},later:function(t,k,u,n,p){t=t||0;k=k||{};var l=u,s=n,q,j;if(f.isString(u)){l=k[u];}if(!l){throw new TypeError("method undefined");}if(!f.isUndefined(n)&&!f.isArray(s)){s=[n];}q=function(){l.apply(k,s||b);};j=(p)?setInterval(q,t):setTimeout(q,t);return{interval:p,cancel:function(){if(this.interval){clearInterval(j);}else{clearTimeout(j);}}};},isValue:function(j){return(f.isObject(j)||f.isString(j)||f.isNumber(j)||f.isBoolean(j));}};f.hasOwnProperty=(a.hasOwnProperty)?function(j,k){return j&&j.hasOwnProperty&&j.hasOwnProperty(k);}:function(j,k){return !f.isUndefined(j[k])&&j.constructor.prototype[k]!==j[k];};e.augmentObject(f,e,true);YAHOO.util.Lang=f;f.augment=f.augmentProto;YAHOO.augment=f.augmentProto;YAHOO.extend=f.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
(function(){YAHOO.env._id_counter=YAHOO.env._id_counter||0;var e=YAHOO.util,k=YAHOO.lang,L=YAHOO.env.ua,a=YAHOO.lang.trim,B={},F={},m=/^t(?:able|d|h)$/i,w=/color$/i,j=window.document,v=j.documentElement,C="ownerDocument",M="defaultView",U="documentElement",S="compatMode",z="offsetLeft",o="offsetTop",T="offsetParent",x="parentNode",K="nodeType",c="tagName",n="scrollLeft",H="scrollTop",p="getBoundingClientRect",V="getComputedStyle",y="currentStyle",l="CSS1Compat",A="BackCompat",E="class",f="className",i="",b=" ",R="(?:^|\\s)",J="(?= |$)",t="g",O="position",D="fixed",u="relative",I="left",N="top",Q="medium",P="borderLeftWidth",q="borderTopWidth",d=L.opera,h=L.webkit,g=L.gecko,s=L.ie;e.Dom={CUSTOM_ATTRIBUTES:(!v.hasAttribute)?{"for":"htmlFor","class":f}:{"htmlFor":"for","className":E},DOT_ATTRIBUTES:{checked:true},get:function(aa){var ac,X,ab,Z,W,G,Y=null;if(aa){if(typeof aa=="string"||typeof aa=="number"){ac=aa+"";aa=j.getElementById(aa);G=(aa)?aa.attributes:null;if(aa&&G&&G.id&&G.id.value===ac){return aa;}else{if(aa&&j.all){aa=null;X=j.all[ac];if(X&&X.length){for(Z=0,W=X.length;Z<W;++Z){if(X[Z].id===ac){return X[Z];}}}}}}else{if(e.Element&&aa instanceof e.Element){aa=aa.get("element");}else{if(!aa.nodeType&&"length" in aa){ab=[];for(Z=0,W=aa.length;Z<W;++Z){ab[ab.length]=e.Dom.get(aa[Z]);}aa=ab;}}}Y=aa;}return Y;},getComputedStyle:function(G,W){if(window[V]){return G[C][M][V](G,null)[W];}else{if(G[y]){return e.Dom.IE_ComputedStyle.get(G,W);}}},getStyle:function(G,W){return e.Dom.batch(G,e.Dom._getStyle,W);},_getStyle:function(){if(window[V]){return function(G,Y){Y=(Y==="float")?Y="cssFloat":e.Dom._toCamel(Y);var X=G.style[Y],W;if(!X){W=G[C][M][V](G,null);if(W){X=W[Y];}}return X;};}else{if(v[y]){return function(G,Y){var X;switch(Y){case"opacity":X=100;try{X=G.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(Z){try{X=G.filters("alpha").opacity;}catch(W){}}return X/100;case"float":Y="styleFloat";default:Y=e.Dom._toCamel(Y);X=G[y]?G[y][Y]:null;return(G.style[Y]||X);}};}}}(),setStyle:function(G,W,X){e.Dom.batch(G,e.Dom._setStyle,{prop:W,val:X});},_setStyle:function(){if(!window.getComputedStyle&&j.documentElement.currentStyle){return function(W,G){var X=e.Dom._toCamel(G.prop),Y=G.val;if(W){switch(X){case"opacity":if(Y===""||Y===null||Y===1){W.style.removeAttribute("filter");}else{if(k.isString(W.style.filter)){W.style.filter="alpha(opacity="+Y*100+")";if(!W[y]||!W[y].hasLayout){W.style.zoom=1;}}}break;case"float":X="styleFloat";default:W.style[X]=Y;}}else{}};}else{return function(W,G){var X=e.Dom._toCamel(G.prop),Y=G.val;if(W){if(X=="float"){X="cssFloat";}W.style[X]=Y;}else{}};}}(),getXY:function(G){return e.Dom.batch(G,e.Dom._getXY);},_canPosition:function(G){return(e.Dom._getStyle(G,"display")!=="none"&&e.Dom._inDoc(G));},_getXY:function(W){var X,G,Z,ab,Y,aa,ac=Math.round,ad=false;if(e.Dom._canPosition(W)){Z=W[p]();ab=W[C];X=e.Dom.getDocumentScrollLeft(ab);G=e.Dom.getDocumentScrollTop(ab);ad=[Z[I],Z[N]];if(Y||aa){ad[0]-=aa;ad[1]-=Y;}if((G||X)){ad[0]+=X;ad[1]+=G;}ad[0]=ac(ad[0]);ad[1]=ac(ad[1]);}else{}return ad;},getX:function(G){var W=function(X){return e.Dom.getXY(X)[0];};return e.Dom.batch(G,W,e.Dom,true);},getY:function(G){var W=function(X){return e.Dom.getXY(X)[1];};return e.Dom.batch(G,W,e.Dom,true);},setXY:function(G,X,W){e.Dom.batch(G,e.Dom._setXY,{pos:X,noRetry:W});},_setXY:function(G,Z){var aa=e.Dom._getStyle(G,O),Y=e.Dom.setStyle,ad=Z.pos,W=Z.noRetry,ab=[parseInt(e.Dom.getComputedStyle(G,I),10),parseInt(e.Dom.getComputedStyle(G,N),10)],ac,X;ac=e.Dom._getXY(G);if(!ad||ac===false){return false;}if(aa=="static"){aa=u;Y(G,O,aa);}if(isNaN(ab[0])){ab[0]=(aa==u)?0:G[z];}if(isNaN(ab[1])){ab[1]=(aa==u)?0:G[o];}if(ad[0]!==null){Y(G,I,ad[0]-ac[0]+ab[0]+"px");}if(ad[1]!==null){Y(G,N,ad[1]-ac[1]+ab[1]+"px");}if(!W){X=e.Dom._getXY(G);if((ad[0]!==null&&X[0]!=ad[0])||(ad[1]!==null&&X[1]!=ad[1])){e.Dom._setXY(G,{pos:ad,noRetry:true});}}},setX:function(W,G){e.Dom.setXY(W,[G,null]);},setY:function(G,W){e.Dom.setXY(G,[null,W]);},getRegion:function(G){var W=function(X){var Y=false;if(e.Dom._canPosition(X)){Y=e.Region.getRegion(X);}else{}return Y;};return e.Dom.batch(G,W,e.Dom,true);},getClientWidth:function(){return e.Dom.getViewportWidth();},getClientHeight:function(){return e.Dom.getViewportHeight();},getElementsByClassName:function(ab,af,ac,ae,X,ad){af=af||"*";ac=(ac)?e.Dom.get(ac):null||j;if(!ac){return[];}var W=[],G=ac.getElementsByTagName(af),Z=e.Dom.hasClass;for(var Y=0,aa=G.length;Y<aa;++Y){if(Z(G[Y],ab)){W[W.length]=G[Y];}}if(ae){e.Dom.batch(W,ae,X,ad);}return W;},hasClass:function(W,G){return e.Dom.batch(W,e.Dom._hasClass,G);},_hasClass:function(X,W){var G=false,Y;if(X&&W){Y=e.Dom._getAttribute(X,f)||i;if(Y){Y=Y.replace(/\s+/g,b);}if(W.exec){G=W.test(Y);}else{G=W&&(b+Y+b).indexOf(b+W+b)>-1;}}else{}return G;},addClass:function(W,G){return e.Dom.batch(W,e.Dom._addClass,G);},_addClass:function(X,W){var G=false,Y;if(X&&W){Y=e.Dom._getAttribute(X,f)||i;if(!e.Dom._hasClass(X,W)){e.Dom.setAttribute(X,f,a(Y+b+W));G=true;}}else{}return G;},removeClass:function(W,G){return e.Dom.batch(W,e.Dom._removeClass,G);},_removeClass:function(Y,X){var W=false,aa,Z,G;if(Y&&X){aa=e.Dom._getAttribute(Y,f)||i;e.Dom.setAttribute(Y,f,aa.replace(e.Dom._getClassRegex(X),i));Z=e.Dom._getAttribute(Y,f);if(aa!==Z){e.Dom.setAttribute(Y,f,a(Z));W=true;if(e.Dom._getAttribute(Y,f)===""){G=(Y.hasAttribute&&Y.hasAttribute(E))?E:f;Y.removeAttribute(G);}}}else{}return W;},replaceClass:function(X,W,G){return e.Dom.batch(X,e.Dom._replaceClass,{from:W,to:G});},_replaceClass:function(Y,X){var W,ab,aa,G=false,Z;if(Y&&X){ab=X.from;aa=X.to;if(!aa){G=false;}else{if(!ab){G=e.Dom._addClass(Y,X.to);}else{if(ab!==aa){Z=e.Dom._getAttribute(Y,f)||i;W=(b+Z.replace(e.Dom._getClassRegex(ab),b+aa).replace(/\s+/g,b)).split(e.Dom._getClassRegex(aa));W.splice(1,0,b+aa);e.Dom.setAttribute(Y,f,a(W.join(i)));G=true;}}}}else{}return G;},generateId:function(G,X){X=X||"yui-gen";var W=function(Y){if(Y&&Y.id){return Y.id;}var Z=X+YAHOO.env._id_counter++;
if(Y){if(Y[C]&&Y[C].getElementById(Z)){return e.Dom.generateId(Y,Z+X);}Y.id=Z;}return Z;};return e.Dom.batch(G,W,e.Dom,true)||W.apply(e.Dom,arguments);},isAncestor:function(W,X){W=e.Dom.get(W);X=e.Dom.get(X);var G=false;if((W&&X)&&(W[K]&&X[K])){if(W.contains&&W!==X){G=W.contains(X);}else{if(W.compareDocumentPosition){G=!!(W.compareDocumentPosition(X)&16);}}}else{}return G;},inDocument:function(G,W){return e.Dom._inDoc(e.Dom.get(G),W);},_inDoc:function(W,X){var G=false;if(W&&W[c]){X=X||W[C];G=e.Dom.isAncestor(X[U],W);}else{}return G;},getElementsBy:function(W,af,ab,ad,X,ac,ae){af=af||"*";ab=(ab)?e.Dom.get(ab):null||j;var aa=(ae)?null:[],G;if(ab){G=ab.getElementsByTagName(af);for(var Y=0,Z=G.length;Y<Z;++Y){if(W(G[Y])){if(ae){aa=G[Y];break;}else{aa[aa.length]=G[Y];}}}if(ad){e.Dom.batch(aa,ad,X,ac);}}return aa;},getElementBy:function(X,G,W){return e.Dom.getElementsBy(X,G,W,null,null,null,true);},batch:function(X,ab,aa,Z){var Y=[],W=(Z)?aa:null;X=(X&&(X[c]||X.item))?X:e.Dom.get(X);if(X&&ab){if(X[c]||X.length===undefined){return ab.call(W,X,aa);}for(var G=0;G<X.length;++G){Y[Y.length]=ab.call(W||X[G],X[G],aa);}}else{return false;}return Y;},getDocumentHeight:function(){var W=(j[S]!=l||h)?j.body.scrollHeight:v.scrollHeight,G=Math.max(W,e.Dom.getViewportHeight());return G;},getDocumentWidth:function(){var W=(j[S]!=l||h)?j.body.scrollWidth:v.scrollWidth,G=Math.max(W,e.Dom.getViewportWidth());return G;},getViewportHeight:function(){var G=self.innerHeight,W=j[S];if((W||s)&&!d){G=(W==l)?v.clientHeight:j.body.clientHeight;}return G;},getViewportWidth:function(){var G=self.innerWidth,W=j[S];if(W||s){G=(W==l)?v.clientWidth:j.body.clientWidth;}return G;},getAncestorBy:function(G,W){while((G=G[x])){if(e.Dom._testElement(G,W)){return G;}}return null;},getAncestorByClassName:function(W,G){W=e.Dom.get(W);if(!W){return null;}var X=function(Y){return e.Dom.hasClass(Y,G);};return e.Dom.getAncestorBy(W,X);},getAncestorByTagName:function(W,G){W=e.Dom.get(W);if(!W){return null;}var X=function(Y){return Y[c]&&Y[c].toUpperCase()==G.toUpperCase();};return e.Dom.getAncestorBy(W,X);},getPreviousSiblingBy:function(G,W){while(G){G=G.previousSibling;if(e.Dom._testElement(G,W)){return G;}}return null;},getPreviousSibling:function(G){G=e.Dom.get(G);if(!G){return null;}return e.Dom.getPreviousSiblingBy(G);},getNextSiblingBy:function(G,W){while(G){G=G.nextSibling;if(e.Dom._testElement(G,W)){return G;}}return null;},getNextSibling:function(G){G=e.Dom.get(G);if(!G){return null;}return e.Dom.getNextSiblingBy(G);},getFirstChildBy:function(G,X){var W=(e.Dom._testElement(G.firstChild,X))?G.firstChild:null;return W||e.Dom.getNextSiblingBy(G.firstChild,X);},getFirstChild:function(G,W){G=e.Dom.get(G);if(!G){return null;}return e.Dom.getFirstChildBy(G);},getLastChildBy:function(G,X){if(!G){return null;}var W=(e.Dom._testElement(G.lastChild,X))?G.lastChild:null;return W||e.Dom.getPreviousSiblingBy(G.lastChild,X);},getLastChild:function(G){G=e.Dom.get(G);return e.Dom.getLastChildBy(G);},getChildrenBy:function(W,Y){var X=e.Dom.getFirstChildBy(W,Y),G=X?[X]:[];e.Dom.getNextSiblingBy(X,function(Z){if(!Y||Y(Z)){G[G.length]=Z;}return false;});return G;},getChildren:function(G){G=e.Dom.get(G);if(!G){}return e.Dom.getChildrenBy(G);},getDocumentScrollLeft:function(G){G=G||j;return Math.max(G[U].scrollLeft,G.body.scrollLeft);},getDocumentScrollTop:function(G){G=G||j;return Math.max(G[U].scrollTop,G.body.scrollTop);},insertBefore:function(W,G){W=e.Dom.get(W);G=e.Dom.get(G);if(!W||!G||!G[x]){return null;}return G[x].insertBefore(W,G);},insertAfter:function(W,G){W=e.Dom.get(W);G=e.Dom.get(G);if(!W||!G||!G[x]){return null;}if(G.nextSibling){return G[x].insertBefore(W,G.nextSibling);}else{return G[x].appendChild(W);}},getClientRegion:function(){var X=e.Dom.getDocumentScrollTop(),W=e.Dom.getDocumentScrollLeft(),Y=e.Dom.getViewportWidth()+W,G=e.Dom.getViewportHeight()+X;return new e.Region(X,Y,G,W);},setAttribute:function(W,G,X){e.Dom.batch(W,e.Dom._setAttribute,{attr:G,val:X});},_setAttribute:function(X,W){var G=e.Dom._toCamel(W.attr),Y=W.val;if(X&&X.setAttribute){if(e.Dom.DOT_ATTRIBUTES[G]&&X.tagName&&X.tagName!="BUTTON"){X[G]=Y;}else{G=e.Dom.CUSTOM_ATTRIBUTES[G]||G;X.setAttribute(G,Y);}}else{}},getAttribute:function(W,G){return e.Dom.batch(W,e.Dom._getAttribute,G);},_getAttribute:function(W,G){var X;G=e.Dom.CUSTOM_ATTRIBUTES[G]||G;if(e.Dom.DOT_ATTRIBUTES[G]){X=W[G];}else{if(W&&"getAttribute" in W){if(/^(?:href|src)$/.test(G)){X=W.getAttribute(G,2);}else{X=W.getAttribute(G);}}else{}}return X;},_toCamel:function(W){var X=B;function G(Y,Z){return Z.toUpperCase();}return X[W]||(X[W]=W.indexOf("-")===-1?W:W.replace(/-([a-z])/gi,G));},_getClassRegex:function(W){var G;if(W!==undefined){if(W.exec){G=W;}else{G=F[W];if(!G){W=W.replace(e.Dom._patterns.CLASS_RE_TOKENS,"\\$1");W=W.replace(/\s+/g,b);G=F[W]=new RegExp(R+W+J,t);}}}return G;},_patterns:{ROOT_TAG:/^body|html$/i,CLASS_RE_TOKENS:/([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g},_testElement:function(G,W){return G&&G[K]==1&&(!W||W(G));},_calcBorders:function(X,Y){var W=parseInt(e.Dom[V](X,q),10)||0,G=parseInt(e.Dom[V](X,P),10)||0;if(g){if(m.test(X[c])){W=0;G=0;}}Y[0]+=G;Y[1]+=W;return Y;}};var r=e.Dom[V];if(L.opera){e.Dom[V]=function(W,G){var X=r(W,G);if(w.test(G)){X=e.Dom.Color.toRGB(X);}return X;};}if(L.webkit){e.Dom[V]=function(W,G){var X=r(W,G);if(X==="rgba(0, 0, 0, 0)"){X="transparent";}return X;};}if(L.ie&&L.ie>=8){e.Dom.DOT_ATTRIBUTES.type=true;}})();YAHOO.util.Region=function(d,e,a,c){this.top=d;this.y=d;this[1]=d;this.right=e;this.bottom=a;this.left=c;this.x=c;this[0]=c;this.width=this.right-this.left;this.height=this.bottom-this.top;};YAHOO.util.Region.prototype.contains=function(a){return(a.left>=this.left&&a.right<=this.right&&a.top>=this.top&&a.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(f){var d=Math.max(this.top,f.top),e=Math.min(this.right,f.right),a=Math.min(this.bottom,f.bottom),c=Math.max(this.left,f.left);
if(a>=d&&e>=c){return new YAHOO.util.Region(d,e,a,c);}else{return null;}};YAHOO.util.Region.prototype.union=function(f){var d=Math.min(this.top,f.top),e=Math.max(this.right,f.right),a=Math.max(this.bottom,f.bottom),c=Math.min(this.left,f.left);return new YAHOO.util.Region(d,e,a,c);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+", height: "+this.height+", width: "+this.width+"}");};YAHOO.util.Region.getRegion=function(e){var g=YAHOO.util.Dom.getXY(e),d=g[1],f=g[0]+e.offsetWidth,a=g[1]+e.offsetHeight,c=g[0];return new YAHOO.util.Region(d,f,a,c);};YAHOO.util.Point=function(a,b){if(YAHOO.lang.isArray(a)){b=a[1];a=a[0];}YAHOO.util.Point.superclass.constructor.call(this,b,a,b,a);};YAHOO.extend(YAHOO.util.Point,YAHOO.util.Region);(function(){var b=YAHOO.util,a="clientTop",f="clientLeft",j="parentNode",k="right",w="hasLayout",i="px",u="opacity",l="auto",d="borderLeftWidth",g="borderTopWidth",p="borderRightWidth",v="borderBottomWidth",s="visible",q="transparent",n="height",e="width",h="style",t="currentStyle",r=/^width|height$/,o=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,m={get:function(x,z){var y="",A=x[t][z];if(z===u){y=b.Dom.getStyle(x,u);}else{if(!A||(A.indexOf&&A.indexOf(i)>-1)){y=A;}else{if(b.Dom.IE_COMPUTED[z]){y=b.Dom.IE_COMPUTED[z](x,z);}else{if(o.test(A)){y=b.Dom.IE.ComputedStyle.getPixel(x,z);}else{y=A;}}}}return y;},getOffset:function(z,E){var B=z[t][E],x=E.charAt(0).toUpperCase()+E.substr(1),C="offset"+x,y="pixel"+x,A="",D;if(B==l){D=z[C];if(D===undefined){A=0;}A=D;if(r.test(E)){z[h][E]=D;if(z[C]>D){A=D-(z[C]-D);}z[h][E]=l;}}else{if(!z[h][y]&&!z[h][E]){z[h][E]=B;}A=z[h][y];}return A+i;},getBorderWidth:function(x,z){var y=null;if(!x[t][w]){x[h].zoom=1;}switch(z){case g:y=x[a];break;case v:y=x.offsetHeight-x.clientHeight-x[a];break;case d:y=x[f];break;case p:y=x.offsetWidth-x.clientWidth-x[f];break;}return y+i;},getPixel:function(y,x){var A=null,B=y[t][k],z=y[t][x];y[h][k]=z;A=y[h].pixelRight;y[h][k]=B;return A+i;},getMargin:function(y,x){var z;if(y[t][x]==l){z=0+i;}else{z=b.Dom.IE.ComputedStyle.getPixel(y,x);}return z;},getVisibility:function(y,x){var z;while((z=y[t])&&z[x]=="inherit"){y=y[j];}return(z)?z[x]:s;},getColor:function(y,x){return b.Dom.Color.toRGB(y[t][x])||q;},getBorderColor:function(y,x){var z=y[t],A=z[x]||z.color;return b.Dom.Color.toRGB(b.Dom.Color.toHex(A));}},c={};c.top=c.right=c.bottom=c.left=c[e]=c[n]=m.getOffset;c.color=m.getColor;c[g]=c[p]=c[v]=c[d]=m.getBorderWidth;c.marginTop=c.marginRight=c.marginBottom=c.marginLeft=m.getMargin;c.visibility=m.getVisibility;c.borderColor=c.borderTopColor=c.borderRightColor=c.borderBottomColor=c.borderLeftColor=m.getBorderColor;b.Dom.IE_COMPUTED=c;b.Dom.IE_ComputedStyle=m;})();(function(){var c="toString",a=parseInt,b=RegExp,d=YAHOO.util;d.Dom.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(e){if(!d.Dom.Color.re_RGB.test(e)){e=d.Dom.Color.toHex(e);}if(d.Dom.Color.re_hex.exec(e)){e="rgb("+[a(b.$1,16),a(b.$2,16),a(b.$3,16)].join(", ")+")";}return e;},toHex:function(f){f=d.Dom.Color.KEYWORDS[f]||f;if(d.Dom.Color.re_RGB.exec(f)){f=[Number(b.$1).toString(16),Number(b.$2).toString(16),Number(b.$3).toString(16)];for(var e=0;e<f.length;e++){if(f[e].length<2){f[e]="0"+f[e];}}f=f.join("");}if(f.length<6){f=f.replace(d.Dom.Color.re_hex3,"$1$1");}if(f!=="transparent"&&f.indexOf("#")<0){f="#"+f;}return f.toUpperCase();}};}());YAHOO.register("dom",YAHOO.util.Dom,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
YAHOO.util.CustomEvent=function(d,c,b,a,e){this.type=d;this.scope=c||window;this.silent=b;this.fireOnce=e;this.fired=false;this.firedWith=null;this.signature=a||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var f="_YUICEOnSubscribe";if(d!==f){this.subscribeEvent=new YAHOO.util.CustomEvent(f,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(b,c,d){if(!b){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(b,c,d);}var a=new YAHOO.util.Subscriber(b,c,d);if(this.fireOnce&&this.fired){this.notify(a,this.firedWith);}else{this.subscribers.push(a);}},unsubscribe:function(d,f){if(!d){return this.unsubscribeAll();}var e=false;for(var b=0,a=this.subscribers.length;b<a;++b){var c=this.subscribers[b];if(c&&c.contains(d,f)){this._delete(b);e=true;}}return e;},fire:function(){this.lastError=null;var h=[],a=this.subscribers.length;var d=[].slice.call(arguments,0),c=true,f,b=false;if(this.fireOnce){if(this.fired){return true;}else{this.firedWith=d;}}this.fired=true;if(!a&&this.silent){return true;}if(!this.silent){}var e=this.subscribers.slice();for(f=0;f<a;++f){var g=e[f];if(!g||!g.fn){b=true;}else{c=this.notify(g,d);if(false===c){if(!this.silent){}break;}}}return(c!==false);},notify:function(g,c){var b,i=null,f=g.getScope(this.scope),a=YAHOO.util.Event.throwErrors;if(!this.silent){}if(this.signature==YAHOO.util.CustomEvent.FLAT){if(c.length>0){i=c[0];}try{b=g.fn.call(f,i,g.obj);}catch(h){this.lastError=h;if(a){throw h;}}}else{try{b=g.fn.call(f,this.type,c,g.obj);}catch(d){this.lastError=d;if(a){throw d;}}}return b;},unsubscribeAll:function(){var a=this.subscribers.length,b;for(b=a-1;b>-1;b--){this._delete(b);}this.subscribers=[];return a;},_delete:function(a){var b=this.subscribers[a];if(b){delete b.fn;delete b.obj;}this.subscribers.splice(a,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"context: "+this.scope;}};YAHOO.util.Subscriber=function(a,b,c){this.fn=a;this.obj=YAHOO.lang.isUndefined(b)?null:b;this.overrideContext=c;};YAHOO.util.Subscriber.prototype.getScope=function(a){if(this.overrideContext){if(this.overrideContext===true){return this.obj;}else{return this.overrideContext;}}return a;};YAHOO.util.Subscriber.prototype.contains=function(a,b){if(b){return(this.fn==a&&this.obj==b);}else{return(this.fn==a);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", overrideContext: "+(this.overrideContext||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var g=false,h=[],j=[],a=0,e=[],b=0,c={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9},d=YAHOO.env.ua.ie,f="focusin",i="focusout";return{POLL_RETRYS:500,POLL_INTERVAL:40,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,CAPTURE:7,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:d,_interval:null,_dri:null,_specialTypes:{focusin:(d?"focusin":"focus"),focusout:(d?"focusout":"blur")},DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){this._interval=YAHOO.lang.later(this.POLL_INTERVAL,this,this._tryPreloadAttach,null,true);}},onAvailable:function(q,m,o,p,n){var k=(YAHOO.lang.isString(q))?[q]:q;for(var l=0;l<k.length;l=l+1){e.push({id:k[l],fn:m,obj:o,overrideContext:p,checkReady:n});}a=this.POLL_RETRYS;this.startInterval();},onContentReady:function(n,k,l,m){this.onAvailable(n,k,l,m,true);},onDOMReady:function(){this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent,arguments);},_addListener:function(m,k,v,p,t,y){if(!v||!v.call){return false;}if(this._isValidCollection(m)){var w=true;for(var q=0,s=m.length;q<s;++q){w=this.on(m[q],k,v,p,t)&&w;}return w;}else{if(YAHOO.lang.isString(m)){var o=this.getEl(m);if(o){m=o;}else{this.onAvailable(m,function(){YAHOO.util.Event._addListener(m,k,v,p,t,y);});return true;}}}if(!m){return false;}if("unload"==k&&p!==this){j[j.length]=[m,k,v,p,t];return true;}var l=m;if(t){if(t===true){l=p;}else{l=t;}}var n=function(z){return v.call(l,YAHOO.util.Event.getEvent(z,m),p);};var x=[m,k,v,n,l,p,t,y];var r=h.length;h[r]=x;try{this._simpleAdd(m,k,n,y);}catch(u){this.lastError=u;this.removeListener(m,k,v);return false;}return true;},_getType:function(k){return this._specialTypes[k]||k;},addListener:function(m,p,l,n,o){var k=((p==f||p==i)&&!YAHOO.env.ua.ie)?true:false;return this._addListener(m,this._getType(p),l,n,o,k);},addFocusListener:function(l,k,m,n){return this.on(l,f,k,m,n);},removeFocusListener:function(l,k){return this.removeListener(l,f,k);},addBlurListener:function(l,k,m,n){return this.on(l,i,k,m,n);},removeBlurListener:function(l,k){return this.removeListener(l,i,k);},removeListener:function(l,k,r){var m,p,u;k=this._getType(k);if(typeof l=="string"){l=this.getEl(l);}else{if(this._isValidCollection(l)){var s=true;for(m=l.length-1;m>-1;m--){s=(this.removeListener(l[m],k,r)&&s);}return s;}}if(!r||!r.call){return this.purgeElement(l,false,k);}if("unload"==k){for(m=j.length-1;m>-1;m--){u=j[m];if(u&&u[0]==l&&u[1]==k&&u[2]==r){j.splice(m,1);return true;}}return false;}var n=null;var o=arguments[3];if("undefined"===typeof o){o=this._getCacheIndex(h,l,k,r);}if(o>=0){n=h[o];}if(!l||!n){return false;}var t=n[this.CAPTURE]===true?true:false;try{this._simpleRemove(l,k,n[this.WFN],t);}catch(q){this.lastError=q;return false;}delete h[o][this.WFN];delete h[o][this.FN];h.splice(o,1);return true;},getTarget:function(m,l){var k=m.target||m.srcElement;return this.resolveTextNode(k);},resolveTextNode:function(l){try{if(l&&3==l.nodeType){return l.parentNode;}}catch(k){return null;}return l;},getPageX:function(l){var k=l.pageX;if(!k&&0!==k){k=l.clientX||0;if(this.isIE){k+=this._getScrollLeft();}}return k;},getPageY:function(k){var l=k.pageY;if(!l&&0!==l){l=k.clientY||0;if(this.isIE){l+=this._getScrollTop();}}return l;},getXY:function(k){return[this.getPageX(k),this.getPageY(k)];},getRelatedTarget:function(l){var k=l.relatedTarget;
if(!k){if(l.type=="mouseout"){k=l.toElement;}else{if(l.type=="mouseover"){k=l.fromElement;}}}return this.resolveTextNode(k);},getTime:function(m){if(!m.time){var l=new Date().getTime();try{m.time=l;}catch(k){this.lastError=k;return l;}}return m.time;},stopEvent:function(k){this.stopPropagation(k);this.preventDefault(k);},stopPropagation:function(k){if(k.stopPropagation){k.stopPropagation();}else{k.cancelBubble=true;}},preventDefault:function(k){if(k.preventDefault){k.preventDefault();}else{k.returnValue=false;}},getEvent:function(m,k){var l=m||window.event;if(!l){var n=this.getEvent.caller;while(n){l=n.arguments[0];if(l&&Event==l.constructor){break;}n=n.caller;}}return l;},getCharCode:function(l){var k=l.keyCode||l.charCode||0;if(YAHOO.env.ua.webkit&&(k in c)){k=c[k];}return k;},_getCacheIndex:function(n,q,r,p){for(var o=0,m=n.length;o<m;o=o+1){var k=n[o];if(k&&k[this.FN]==p&&k[this.EL]==q&&k[this.TYPE]==r){return o;}}return -1;},generateId:function(k){var l=k.id;if(!l){l="yuievtautoid-"+b;++b;k.id=l;}return l;},_isValidCollection:function(l){try{return(l&&typeof l!=="string"&&l.length&&!l.tagName&&!l.alert&&typeof l[0]!=="undefined");}catch(k){return false;}},elCache:{},getEl:function(k){return(typeof k==="string")?document.getElementById(k):k;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",YAHOO,0,0,1),_load:function(l){if(!g){g=true;var k=YAHOO.util.Event;k._ready();k._tryPreloadAttach();}},_ready:function(l){var k=YAHOO.util.Event;if(!k.DOMReady){k.DOMReady=true;k.DOMReadyEvent.fire();k._simpleRemove(document,"DOMContentLoaded",k._ready);}},_tryPreloadAttach:function(){if(e.length===0){a=0;if(this._interval){this._interval.cancel();this._interval=null;}return;}if(this.locked){return;}if(this.isIE){if(!this.DOMReady){this.startInterval();return;}}this.locked=true;var q=!g;if(!q){q=(a>0&&e.length>0);}var p=[];var r=function(t,u){var s=t;if(u.overrideContext){if(u.overrideContext===true){s=u.obj;}else{s=u.overrideContext;}}u.fn.call(s,u.obj);};var l,k,o,n,m=[];for(l=0,k=e.length;l<k;l=l+1){o=e[l];if(o){n=this.getEl(o.id);if(n){if(o.checkReady){if(g||n.nextSibling||!q){m.push(o);e[l]=null;}}else{r(n,o);e[l]=null;}}else{p.push(o);}}}for(l=0,k=m.length;l<k;l=l+1){o=m[l];r(this.getEl(o.id),o);}a--;if(q){for(l=e.length-1;l>-1;l--){o=e[l];if(!o||!o.id){e.splice(l,1);}}this.startInterval();}else{if(this._interval){this._interval.cancel();this._interval=null;}}this.locked=false;},purgeElement:function(p,q,s){var n=(YAHOO.lang.isString(p))?this.getEl(p):p;var r=this.getListeners(n,s),o,k;if(r){for(o=r.length-1;o>-1;o--){var m=r[o];this.removeListener(n,m.type,m.fn);}}if(q&&n&&n.childNodes){for(o=0,k=n.childNodes.length;o<k;++o){this.purgeElement(n.childNodes[o],q,s);}}},getListeners:function(n,k){var q=[],m;if(!k){m=[h,j];}else{if(k==="unload"){m=[j];}else{k=this._getType(k);m=[h];}}var s=(YAHOO.lang.isString(n))?this.getEl(n):n;for(var p=0;p<m.length;p=p+1){var u=m[p];if(u){for(var r=0,t=u.length;r<t;++r){var o=u[r];if(o&&o[this.EL]===s&&(!k||k===o[this.TYPE])){q.push({type:o[this.TYPE],fn:o[this.FN],obj:o[this.OBJ],adjust:o[this.OVERRIDE],scope:o[this.ADJ_SCOPE],index:r});}}}}return(q.length)?q:null;},_unload:function(s){var m=YAHOO.util.Event,p,o,n,r,q,t=j.slice(),k;for(p=0,r=j.length;p<r;++p){n=t[p];if(n){try{k=window;if(n[m.ADJ_SCOPE]){if(n[m.ADJ_SCOPE]===true){k=n[m.UNLOAD_OBJ];}else{k=n[m.ADJ_SCOPE];}}n[m.FN].call(k,m.getEvent(s,n[m.EL]),n[m.UNLOAD_OBJ]);}catch(w){}t[p]=null;}}n=null;k=null;j=null;if(h){for(o=h.length-1;o>-1;o--){n=h[o];if(n){try{m.removeListener(n[m.EL],n[m.TYPE],n[m.FN],o);}catch(v){}}}n=null;}try{m._simpleRemove(window,"unload",m._unload);m._simpleRemove(window,"load",m._load);}catch(u){}},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var k=document.documentElement,l=document.body;if(k&&(k.scrollTop||k.scrollLeft)){return[k.scrollTop,k.scrollLeft];}else{if(l){return[l.scrollTop,l.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(m,n,l,k){m.addEventListener(n,l,(k));};}else{if(window.attachEvent){return function(m,n,l,k){m.attachEvent("on"+n,l);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(m,n,l,k){m.removeEventListener(n,l,(k));};}else{if(window.detachEvent){return function(l,m,k){l.detachEvent("on"+m,k);};}else{return function(){};}}}()};}();(function(){var a=YAHOO.util.Event;a.on=a.addListener;a.onFocus=a.addFocusListener;a.onBlur=a.addBlurListener;
/*! DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */
if(a.isIE){if(self!==self.top){document.onreadystatechange=function(){if(document.readyState=="complete"){document.onreadystatechange=null;a._ready();}};}else{YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var b=document.createElement("p");a._dri=setInterval(function(){try{b.doScroll("left");clearInterval(a._dri);a._dri=null;a._ready();b=null;}catch(c){}},a.POLL_INTERVAL);}}else{if(a.webkit&&a.webkit<525){a._dri=setInterval(function(){var c=document.readyState;if("loaded"==c||"complete"==c){clearInterval(a._dri);a._dri=null;a._ready();}},a.POLL_INTERVAL);}else{a._simpleAdd(document,"DOMContentLoaded",a._ready);}}a._simpleAdd(window,"load",a._load);a._simpleAdd(window,"unload",a._unload);a._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(a,c,f,e){this.__yui_events=this.__yui_events||{};var d=this.__yui_events[a];if(d){d.subscribe(c,f,e);}else{this.__yui_subscribers=this.__yui_subscribers||{};var b=this.__yui_subscribers;if(!b[a]){b[a]=[];}b[a].push({fn:c,obj:f,overrideContext:e});}},unsubscribe:function(c,e,g){this.__yui_events=this.__yui_events||{};var a=this.__yui_events;if(c){var f=a[c];if(f){return f.unsubscribe(e,g);}}else{var b=true;for(var d in a){if(YAHOO.lang.hasOwnProperty(a,d)){b=b&&a[d].unsubscribe(e,g);
}}return b;}return false;},unsubscribeAll:function(a){return this.unsubscribe(a);},createEvent:function(b,g){this.__yui_events=this.__yui_events||{};var e=g||{},d=this.__yui_events,f;if(d[b]){}else{f=new YAHOO.util.CustomEvent(b,e.scope||this,e.silent,YAHOO.util.CustomEvent.FLAT,e.fireOnce);d[b]=f;if(e.onSubscribeCallback){f.subscribeEvent.subscribe(e.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var a=this.__yui_subscribers[b];if(a){for(var c=0;c<a.length;++c){f.subscribe(a[c].fn,a[c].obj,a[c].overrideContext);}}}return d[b];},fireEvent:function(b){this.__yui_events=this.__yui_events||{};var d=this.__yui_events[b];if(!d){return null;}var a=[];for(var c=1;c<arguments.length;++c){a.push(arguments[c]);}return d.fire.apply(d,a);},hasEvent:function(a){if(this.__yui_events){if(this.__yui_events[a]){return true;}}return false;}};(function(){var a=YAHOO.util.Event,c=YAHOO.lang;YAHOO.util.KeyListener=function(d,i,e,f){if(!d){}else{if(!i){}else{if(!e){}}}if(!f){f=YAHOO.util.KeyListener.KEYDOWN;}var g=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(c.isString(d)){d=document.getElementById(d);}if(c.isFunction(e)){g.subscribe(e);}else{g.subscribe(e.fn,e.scope,e.correctScope);}function h(o,n){if(!i.shift){i.shift=false;}if(!i.alt){i.alt=false;}if(!i.ctrl){i.ctrl=false;}if(o.shiftKey==i.shift&&o.altKey==i.alt&&o.ctrlKey==i.ctrl){var j,m=i.keys,l;if(YAHOO.lang.isArray(m)){for(var k=0;k<m.length;k++){j=m[k];l=a.getCharCode(o);if(j==l){g.fire(l,o);break;}}}else{l=a.getCharCode(o);if(m==l){g.fire(l,o);}}}}this.enable=function(){if(!this.enabled){a.on(d,f,h);this.enabledEvent.fire(i);}this.enabled=true;};this.disable=function(){if(this.enabled){a.removeListener(d,f,h);this.disabledEvent.fire(i);}this.enabled=false;};this.toString=function(){return"KeyListener ["+i.keys+"] "+d.tagName+(d.id?"["+d.id+"]":"");};};var b=YAHOO.util.KeyListener;b.KEYDOWN="keydown";b.KEYUP="keyup";b.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};})();YAHOO.register("event",YAHOO.util.Event,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
(function(){var b=YAHOO.util.Event,g=YAHOO.lang,e=b.addListener,f=b.removeListener,c=b.getListeners,d=[],h={mouseenter:"mouseover",mouseleave:"mouseout"},a=function(n,m,l){var j=b._getCacheIndex(d,n,m,l),i,k;if(j>=0){i=d[j];}if(n&&i){k=f.call(b,i[0],m,i[3]);if(k){delete d[j][2];delete d[j][3];d.splice(j,1);}}return k;};g.augmentObject(b._specialTypes,h);g.augmentObject(b,{_createMouseDelegate:function(i,j,k){return function(q,m){var p=this,l=b.getRelatedTarget(q),o,n;if(p!=l&&!YAHOO.util.Dom.isAncestor(p,l)){o=p;if(k){if(k===true){o=j;}else{o=k;}}n=[q,j];if(m){n.splice(1,0,p,m);}return i.apply(o,n);}};},addListener:function(m,l,k,n,o){var i,j;if(h[l]){i=b._createMouseDelegate(k,n,o);i.mouseDelegate=true;d.push([m,l,k,i]);j=e.call(b,m,l,i);}else{j=e.apply(b,arguments);}return j;},removeListener:function(l,k,j){var i;if(h[k]){i=a.apply(b,arguments);}else{i=f.apply(b,arguments);}return i;},getListeners:function(p,o){var n=[],r,m=(o==="mouseover"||o==="mouseout"),q,k,j;if(o&&(m||h[o])){r=c.call(b,p,this._getType(o));if(r){for(k=r.length-1;k>-1;k--){j=r[k];q=j.fn.mouseDelegate;if((h[o]&&q)||(m&&!q)){n.push(j);}}}}else{n=c.apply(b,arguments);}return(n&&n.length)?n:null;}},true);b.on=b.addListener;}());YAHOO.register("event-mouseenter",YAHOO.util.Event,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
(function(){var A=YAHOO.util.Event,C=YAHOO.lang,B=[],D=function(H,E,F){var G;if(!H||H===F){G=false;}else{G=YAHOO.util.Selector.test(H,E)?H:D(H.parentNode,E,F);}return G;};C.augmentObject(A,{_createDelegate:function(F,E,G,H){return function(I){var J=this,N=A.getTarget(I),L=E,P=(J.nodeType===9),Q,K,O,M;if(C.isFunction(E)){Q=E(N);}else{if(C.isString(E)){if(!P){O=J.id;if(!O){O=A.generateId(J);}M=("#"+O+" ");L=(M+E).replace(/,/gi,(","+M));}if(YAHOO.util.Selector.test(N,L)){Q=N;}else{if(YAHOO.util.Selector.test(N,((L.replace(/,/gi," *,"))+" *"))){Q=D(N,L,J);}}}}if(Q){K=Q;if(H){if(H===true){K=G;}else{K=H;}}return F.call(K,I,Q,J,G);}};},delegate:function(F,J,L,G,H,I){var E=J,K,M;if(C.isString(G)&&!YAHOO.util.Selector){return false;}if(J=="mouseenter"||J=="mouseleave"){if(!A._createMouseDelegate){return false;}E=A._getType(J);K=A._createMouseDelegate(L,H,I);M=A._createDelegate(function(P,O,N){return K.call(O,P,N);},G,H,I);}else{M=A._createDelegate(L,G,H,I);}B.push([F,E,L,M]);return A.on(F,E,M);},removeDelegate:function(F,J,I){var K=J,H=false,G,E;if(J=="mouseenter"||J=="mouseleave"){K=A._getType(J);}G=A._getCacheIndex(B,F,K,I);if(G>=0){E=B[G];}if(F&&E){H=A.removeListener(E[0],E[1],E[3]);if(H){delete B[G][2];delete B[G][3];B.splice(G,1);}}return H;}});}());YAHOO.register("event-delegate",YAHOO.util.Event,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
var Y=YAHOO,Y_DOM=YAHOO.util.Dom,EMPTY_ARRAY=[],Y_UA=Y.env.ua,Y_Lang=Y.lang,Y_DOC=document,Y_DOCUMENT_ELEMENT=Y_DOC.documentElement,Y_DOM_inDoc=Y_DOM.inDocument,Y_mix=Y_Lang.augmentObject,Y_guid=Y_DOM.generateId,Y_getDoc=function(a){var b=Y_DOC;if(a){b=(a.nodeType===9)?a:a.ownerDocument||a.document||Y_DOC;}return b;},Y_Array=function(g,d){var c,b,h=d||0;try{return Array.prototype.slice.call(g,h);}catch(f){b=[];c=g.length;for(;h<c;h++){b.push(g[h]);}return b;}},Y_DOM_allById=function(f,a){a=a||Y_DOC;var b=[],c=[],d,e;if(a.querySelectorAll){c=a.querySelectorAll('[id="'+f+'"]');}else{if(a.all){b=a.all(f);if(b){if(b.nodeName){if(b.id===f){c.push(b);b=EMPTY_ARRAY;}else{b=[b];}}if(b.length){for(d=0;e=b[d++];){if(e.id===f||(e.attributes&&e.attributes.id&&e.attributes.id.value===f)){c.push(e);}}}}}else{c=[Y_getDoc(a).getElementById(f)];}}return c;};var COMPARE_DOCUMENT_POSITION="compareDocumentPosition",OWNER_DOCUMENT="ownerDocument",Selector={_foundCache:[],useNative:true,_compare:("sourceIndex" in Y_DOCUMENT_ELEMENT)?function(f,e){var d=f.sourceIndex,c=e.sourceIndex;if(d===c){return 0;}else{if(d>c){return 1;}}return -1;}:(Y_DOCUMENT_ELEMENT[COMPARE_DOCUMENT_POSITION]?function(b,a){if(b[COMPARE_DOCUMENT_POSITION](a)&4){return -1;}else{return 1;}}:function(e,d){var c,a,b;if(e&&d){c=e[OWNER_DOCUMENT].createRange();c.setStart(e,0);a=d[OWNER_DOCUMENT].createRange();a.setStart(d,0);b=c.compareBoundaryPoints(1,a);}return b;}),_sort:function(a){if(a){a=Y_Array(a,0,true);if(a.sort){a.sort(Selector._compare);}}return a;},_deDupe:function(a){var b=[],c,d;for(c=0;(d=a[c++]);){if(!d._found){b[b.length]=d;d._found=true;}}for(c=0;(d=b[c++]);){d._found=null;d.removeAttribute("_found");}return b;},query:function(b,j,k,a){if(j&&typeof j=="string"){j=Y_DOM.get(j);if(!j){return(k)?null:[];}}else{j=j||Y_DOC;}var f=[],c=(Selector.useNative&&Y_DOC.querySelector&&!a),e=[[b,j]],g,l,d,h=(c)?Selector._nativeQuery:Selector._bruteQuery;if(b&&h){if(!a&&(!c||j.tagName)){e=Selector._splitQueries(b,j);}for(d=0;(g=e[d++]);){l=h(g[0],g[1],k);if(!k){l=Y_Array(l,0,true);}if(l){f=f.concat(l);}}if(e.length>1){f=Selector._sort(Selector._deDupe(f));}}return(k)?(f[0]||null):f;},_splitQueries:function(c,f){var b=c.split(","),d=[],g="",e,a;if(f){if(f.tagName){f.id=f.id||Y_guid();g='[id="'+f.id+'"] ';}for(e=0,a=b.length;e<a;++e){c=g+b[e];d.push([c,f]);}}return d;},_nativeQuery:function(a,b,c){if(Y_UA.webkit&&a.indexOf(":checked")>-1&&(Selector.pseudos&&Selector.pseudos.checked)){return Selector.query(a,b,c,true);}try{return b["querySelector"+(c?"":"All")](a);}catch(d){return Selector.query(a,b,c,true);}},filter:function(b,a){var c=[],d,e;if(b&&a){for(d=0;(e=b[d++]);){if(Selector.test(e,a)){c[c.length]=e;}}}else{}return c;},test:function(c,d,k){var g=false,b=d.split(","),a=false,l,o,h,n,f,e,m;if(c&&c.tagName){if(!k&&!Y_DOM_inDoc(c)){l=c.parentNode;if(l){k=l;}else{n=c[OWNER_DOCUMENT].createDocumentFragment();n.appendChild(c);k=n;a=true;}}k=k||c[OWNER_DOCUMENT];if(!c.id){c.id=Y_guid();}for(f=0;(m=b[f++]);){m+='[id="'+c.id+'"]';h=Selector.query(m,k);for(e=0;o=h[e++];){if(o===c){g=true;break;}}if(g){break;}}if(a){n.removeChild(c);}}return g;}};YAHOO.util.Selector=Selector;var PARENT_NODE="parentNode",TAG_NAME="tagName",ATTRIBUTES="attributes",COMBINATOR="combinator",PSEUDOS="pseudos",SelectorCSS2={_reRegExpTokens:/([\^\$\?\[\]\*\+\-\.\(\)\|\\])/,SORT_RESULTS:true,_children:function(e,a){var b=e.children,d,c=[],f,g;if(e.children&&a&&e.children.tags){c=e.children.tags(a);}else{if((!b&&e[TAG_NAME])||(b&&a)){f=b||e.childNodes;b=[];for(d=0;(g=f[d++]);){if(g.tagName){if(!a||a===g.tagName){b.push(g);}}}}}return b||[];},_re:{attr:/(\[[^\]]*\])/g,esc:/\\[:\[\]\(\)#\.\'\>+~"]/gi,pseudos:/(\([^\)]*\))/g},shorthand:{"\\#(-?[_a-z]+[-\\w\\uE000]*)":"[id=$1]","\\.(-?[_a-z]+[-\\w\\uE000]*)":"[className~=$1]"},operators:{"":function(b,a){return !!b.getAttribute(a);},"~=":"(?:^|\\s+){val}(?:\\s+|$)","|=":"^{val}(?:-|$)"},pseudos:{"first-child":function(a){return Selector._children(a[PARENT_NODE])[0]===a;}},_bruteQuery:function(f,j,l){var g=[],a=[],i=Selector._tokenize(f),e=i[i.length-1],k=Y_getDoc(j),c,b,h,d;if(e){b=e.id;h=e.className;d=e.tagName||"*";if(j.getElementsByTagName){if(b&&(j.all||(j.nodeType===9||Y_DOM_inDoc(j)))){a=Y_DOM_allById(b,j);}else{if(h){a=j.getElementsByClassName(h);}else{a=j.getElementsByTagName(d);}}}else{c=j.firstChild;while(c){if(c.tagName){a.push(c);}c=c.nextSilbing||c.firstChild;}}if(a.length){g=Selector._filterNodes(a,i,l);}}return g;},_filterNodes:function(l,f,h){var r=0,q,s=f.length,k=s-1,e=[],o=l[0],v=o,t=Selector.getters,d,p,c,g,a,m,b,u;for(r=0;(v=o=l[r++]);){k=s-1;g=null;testLoop:while(v&&v.tagName){c=f[k];b=c.tests;q=b.length;if(q&&!a){while((u=b[--q])){d=u[1];if(t[u[0]]){m=t[u[0]](v,u[0]);}else{m=v[u[0]];if(m===undefined&&v.getAttribute){m=v.getAttribute(u[0]);}}if((d==="="&&m!==u[2])||(typeof d!=="string"&&d.test&&!d.test(m))||(!d.test&&typeof d==="function"&&!d(v,u[0],u[2]))){if((v=v[g])){while(v&&(!v.tagName||(c.tagName&&c.tagName!==v.tagName))){v=v[g];}}continue testLoop;}}}k--;if(!a&&(p=c.combinator)){g=p.axis;v=v[g];while(v&&!v.tagName){v=v[g];}if(p.direct){g=null;}}else{e.push(o);if(h){return e;}break;}}}o=v=null;return e;},combinators:{" ":{axis:"parentNode"},">":{axis:"parentNode",direct:true},"+":{axis:"previousSibling",direct:true}},_parsers:[{name:ATTRIBUTES,re:/^\uE003(-?[a-z]+[\w\-]*)+([~\|\^\$\*!=]=?)?['"]?([^\uE004'"]*)['"]?\uE004/i,fn:function(d,e){var c=d[2]||"",a=Selector.operators,b=(d[3])?d[3].replace(/\\/g,""):"",f;if((d[1]==="id"&&c==="=")||(d[1]==="className"&&Y_DOCUMENT_ELEMENT.getElementsByClassName&&(c==="~="||c==="="))){e.prefilter=d[1];d[3]=b;e[d[1]]=(d[1]==="id")?d[3]:b;}if(c in a){f=a[c];if(typeof f==="string"){d[3]=b.replace(Selector._reRegExpTokens,"\\$1");f=new RegExp(f.replace("{val}",d[3]));}d[2]=f;}if(!e.last||e.prefilter!==d[1]){return d.slice(1);}}},{name:TAG_NAME,re:/^((?:-?[_a-z]+[\w-]*)|\*)/i,fn:function(b,c){var a=b[1].toUpperCase();c.tagName=a;if(a!=="*"&&(!c.last||c.prefilter)){return[TAG_NAME,"=",a];
}if(!c.prefilter){c.prefilter="tagName";}}},{name:COMBINATOR,re:/^\s*([>+~]|\s)\s*/,fn:function(a,b){}},{name:PSEUDOS,re:/^:([\-\w]+)(?:\uE005['"]?([^\uE005]*)['"]?\uE006)*/i,fn:function(a,b){var c=Selector[PSEUDOS][a[1]];if(c){if(a[2]){a[2]=a[2].replace(/\\/g,"");}return[a[2],c];}else{return false;}}}],_getToken:function(a){return{tagName:null,id:null,className:null,attributes:{},combinator:null,tests:[]};},_tokenize:function(c){c=c||"";c=Selector._replaceShorthand(Y_Lang.trim(c));var b=Selector._getToken(),h=c,g=[],j=false,e,f,d,a;outer:do{j=false;for(d=0;(a=Selector._parsers[d++]);){if((e=a.re.exec(c))){if(a.name!==COMBINATOR){b.selector=c;}c=c.replace(e[0],"");if(!c.length){b.last=true;}if(Selector._attrFilters[e[1]]){e[1]=Selector._attrFilters[e[1]];}f=a.fn(e,b);if(f===false){j=false;break outer;}else{if(f){b.tests.push(f);}}if(!c.length||a.name===COMBINATOR){g.push(b);b=Selector._getToken(b);if(a.name===COMBINATOR){b.combinator=Selector.combinators[e[1]];}}j=true;}}}while(j&&c.length);if(!j||c.length){g=[];}return g;},_replaceShorthand:function(b){var d=Selector.shorthand,c=b.match(Selector._re.esc),e,h,g,f,a;if(c){b=b.replace(Selector._re.esc,"\uE000");}e=b.match(Selector._re.attr);h=b.match(Selector._re.pseudos);if(e){b=b.replace(Selector._re.attr,"\uE001");}if(h){b=b.replace(Selector._re.pseudos,"\uE002");}for(g in d){if(d.hasOwnProperty(g)){b=b.replace(new RegExp(g,"gi"),d[g]);}}if(e){for(f=0,a=e.length;f<a;++f){b=b.replace(/\uE001/,e[f]);}}if(h){for(f=0,a=h.length;f<a;++f){b=b.replace(/\uE002/,h[f]);}}b=b.replace(/\[/g,"\uE003");b=b.replace(/\]/g,"\uE004");b=b.replace(/\(/g,"\uE005");b=b.replace(/\)/g,"\uE006");if(c){for(f=0,a=c.length;f<a;++f){b=b.replace("\uE000",c[f]);}}return b;},_attrFilters:{"class":"className","for":"htmlFor"},getters:{href:function(b,a){return Y_DOM.getAttribute(b,a);}}};Y_mix(Selector,SelectorCSS2,true);Selector.getters.src=Selector.getters.rel=Selector.getters.href;if(Selector.useNative&&Y_DOC.querySelector){Selector.shorthand["\\.([^\\s\\\\(\\[:]*)"]="[class~=$1]";}Selector._reNth=/^(?:([\-]?\d*)(n){1}|(odd|even)$)*([\-+]?\d*)$/;Selector._getNth=function(d,o,q,h){Selector._reNth.test(o);var m=parseInt(RegExp.$1,10),c=RegExp.$2,j=RegExp.$3,k=parseInt(RegExp.$4,10)||0,p=[],l=Selector._children(d.parentNode,q),f;if(j){m=2;f="+";c="n";k=(j==="odd")?1:0;}else{if(isNaN(m)){m=(c)?1:0;}}if(m===0){if(h){k=l.length-k+1;}if(l[k-1]===d){return true;}else{return false;}}else{if(m<0){h=!!h;m=Math.abs(m);}}if(!h){for(var e=k-1,g=l.length;e<g;e+=m){if(e>=0&&l[e]===d){return true;}}}else{for(var e=l.length-k,g=l.length;e>=0;e-=m){if(e<g&&l[e]===d){return true;}}}return false;};Y_mix(Selector.pseudos,{"root":function(a){return a===a.ownerDocument.documentElement;},"nth-child":function(a,b){return Selector._getNth(a,b);},"nth-last-child":function(a,b){return Selector._getNth(a,b,null,true);},"nth-of-type":function(a,b){return Selector._getNth(a,b,a.tagName);},"nth-last-of-type":function(a,b){return Selector._getNth(a,b,a.tagName,true);},"last-child":function(b){var a=Selector._children(b.parentNode);return a[a.length-1]===b;},"first-of-type":function(a){return Selector._children(a.parentNode,a.tagName)[0]===a;},"last-of-type":function(b){var a=Selector._children(b.parentNode,b.tagName);return a[a.length-1]===b;},"only-child":function(b){var a=Selector._children(b.parentNode);return a.length===1&&a[0]===b;},"only-of-type":function(b){var a=Selector._children(b.parentNode,b.tagName);return a.length===1&&a[0]===b;},"empty":function(a){return a.childNodes.length===0;},"not":function(a,b){return !Selector.test(a,b);},"contains":function(a,b){var c=a.innerText||a.textContent||"";return c.indexOf(b)>-1;},"checked":function(a){return(a.checked===true||a.selected===true);},enabled:function(a){return(a.disabled!==undefined&&!a.disabled);},disabled:function(a){return(a.disabled);}});Y_mix(Selector.operators,{"^=":"^{val}","!=":function(b,a,c){return b[a]!==c;},"$=":"{val}$","*=":"{val}"});Selector.combinators["~"]={axis:"previousSibling"};YAHOO.register("selector",YAHOO.util.Selector,{version:"2.9.0",build:"2800"});
/*
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
if(!YAHOO.util.DragDropMgr){YAHOO.util.DragDropMgr=function(){var A=YAHOO.util.Event,B=YAHOO.util.Dom;return{useShim:false,_shimActive:false,_shimState:false,_debugShim:false,_createShim:function(){var C=document.createElement("div");C.id="yui-ddm-shim";if(document.body.firstChild){document.body.insertBefore(C,document.body.firstChild);}else{document.body.appendChild(C);}C.style.display="none";C.style.backgroundColor="red";C.style.position="absolute";C.style.zIndex="99999";B.setStyle(C,"opacity","0");this._shim=C;A.on(C,"mouseup",this.handleMouseUp,this,true);A.on(C,"mousemove",this.handleMouseMove,this,true);A.on(window,"scroll",this._sizeShim,this,true);},_sizeShim:function(){if(this._shimActive){var C=this._shim;C.style.height=B.getDocumentHeight()+"px";C.style.width=B.getDocumentWidth()+"px";C.style.top="0";C.style.left="0";}},_activateShim:function(){if(this.useShim){if(!this._shim){this._createShim();}this._shimActive=true;var C=this._shim,D="0";if(this._debugShim){D=".5";}B.setStyle(C,"opacity",D);this._sizeShim();C.style.display="block";}},_deactivateShim:function(){this._shim.style.display="none";this._shimActive=false;},_shim:null,ids:{},handleIds:{},dragCurrent:null,dragOvers:{},deltaX:0,deltaY:0,preventDefault:true,stopPropagation:true,initialized:false,locked:false,interactionInfo:null,init:function(){this.initialized=true;},POINT:0,INTERSECT:1,STRICT_INTERSECT:2,mode:0,_execOnAll:function(E,D){for(var F in this.ids){for(var C in this.ids[F]){var G=this.ids[F][C];if(!this.isTypeOfDD(G)){continue;}G[E].apply(G,D);}}},_onLoad:function(){this.init();A.on(document,"mouseup",this.handleMouseUp,this,true);A.on(document,"mousemove",this.handleMouseMove,this,true);A.on(window,"unload",this._onUnload,this,true);A.on(window,"resize",this._onResize,this,true);},_onResize:function(C){this._execOnAll("resetConstraints",[]);},lock:function(){this.locked=true;},unlock:function(){this.locked=false;},isLocked:function(){return this.locked;},locationCache:{},useCache:true,clickPixelThresh:3,clickTimeThresh:1000,dragThreshMet:false,clickTimeout:null,startX:0,startY:0,fromTimeout:false,regDragDrop:function(D,C){if(!this.initialized){this.init();}if(!this.ids[C]){this.ids[C]={};}this.ids[C][D.id]=D;},removeDDFromGroup:function(E,C){if(!this.ids[C]){this.ids[C]={};}var D=this.ids[C];if(D&&D[E.id]){delete D[E.id];}},_remove:function(E){for(var D in E.groups){if(D){var C=this.ids[D];if(C&&C[E.id]){delete C[E.id];}}}delete this.handleIds[E.id];},regHandle:function(D,C){if(!this.handleIds[D]){this.handleIds[D]={};}this.handleIds[D][C]=C;},isDragDrop:function(C){return(this.getDDById(C))?true:false;},getRelated:function(H,D){var G=[];for(var F in H.groups){for(var E in this.ids[F]){var C=this.ids[F][E];if(!this.isTypeOfDD(C)){continue;}if(!D||C.isTarget){G[G.length]=C;}}}return G;},isLegalTarget:function(G,F){var D=this.getRelated(G,true);for(var E=0,C=D.length;E<C;++E){if(D[E].id==F.id){return true;}}return false;},isTypeOfDD:function(C){return(C&&C.__ygDragDrop);},isHandle:function(D,C){return(this.handleIds[D]&&this.handleIds[D][C]);},getDDById:function(D){for(var C in this.ids){if(this.ids[C][D]){return this.ids[C][D];}}return null;},handleMouseDown:function(E,D){this.currentTarget=YAHOO.util.Event.getTarget(E);this.dragCurrent=D;var C=D.getEl();this.startX=YAHOO.util.Event.getPageX(E);this.startY=YAHOO.util.Event.getPageY(E);this.deltaX=this.startX-C.offsetLeft;this.deltaY=this.startY-C.offsetTop;this.dragThreshMet=false;this.clickTimeout=setTimeout(function(){var F=YAHOO.util.DDM;F.startDrag(F.startX,F.startY);F.fromTimeout=true;},this.clickTimeThresh);},startDrag:function(C,E){if(this.dragCurrent&&this.dragCurrent.useShim){this._shimState=this.useShim;this.useShim=true;}this._activateShim();clearTimeout(this.clickTimeout);var D=this.dragCurrent;if(D&&D.events.b4StartDrag){D.b4StartDrag(C,E);D.fireEvent("b4StartDragEvent",{x:C,y:E});}if(D&&D.events.startDrag){D.startDrag(C,E);D.fireEvent("startDragEvent",{x:C,y:E});}this.dragThreshMet=true;},handleMouseUp:function(C){if(this.dragCurrent){clearTimeout(this.clickTimeout);if(this.dragThreshMet){if(this.fromTimeout){this.fromTimeout=false;this.handleMouseMove(C);}this.fromTimeout=false;this.fireEvents(C,true);}else{}this.stopDrag(C);this.stopEvent(C);}},stopEvent:function(C){if(this.stopPropagation){YAHOO.util.Event.stopPropagation(C);}if(this.preventDefault){YAHOO.util.Event.preventDefault(C);}},stopDrag:function(E,D){var C=this.dragCurrent;if(C&&!D){if(this.dragThreshMet){if(C.events.b4EndDrag){C.b4EndDrag(E);C.fireEvent("b4EndDragEvent",{e:E});}if(C.events.endDrag){C.endDrag(E);C.fireEvent("endDragEvent",{e:E});}}if(C.events.mouseUp){C.onMouseUp(E);C.fireEvent("mouseUpEvent",{e:E});}}if(this._shimActive){this._deactivateShim();if(this.dragCurrent&&this.dragCurrent.useShim){this.useShim=this._shimState;this._shimState=false;}}this.dragCurrent=null;this.dragOvers={};},handleMouseMove:function(F){var C=this.dragCurrent;if(C){if(YAHOO.env.ua.ie&&(YAHOO.env.ua.ie<9)&&!F.button){this.stopEvent(F);return this.handleMouseUp(F);}else{if(F.clientX<0||F.clientY<0){}}if(!this.dragThreshMet){var E=Math.abs(this.startX-YAHOO.util.Event.getPageX(F));var D=Math.abs(this.startY-YAHOO.util.Event.getPageY(F));if(E>this.clickPixelThresh||D>this.clickPixelThresh){this.startDrag(this.startX,this.startY);}}if(this.dragThreshMet){if(C&&C.events.b4Drag){C.b4Drag(F);C.fireEvent("b4DragEvent",{e:F});}if(C&&C.events.drag){C.onDrag(F);C.fireEvent("dragEvent",{e:F});}if(C){this.fireEvents(F,false);}}this.stopEvent(F);}},fireEvents:function(W,M){var c=this.dragCurrent;if(!c||c.isLocked()||c.dragOnly){return;}var O=YAHOO.util.Event.getPageX(W),N=YAHOO.util.Event.getPageY(W),Q=new YAHOO.util.Point(O,N),K=c.getTargetCoord(Q.x,Q.y),F=c.getDragEl(),E=["out","over","drop","enter"],V=new YAHOO.util.Region(K.y,K.x+F.offsetWidth,K.y+F.offsetHeight,K.x),I=[],D={},L={},R=[],d={outEvts:[],overEvts:[],dropEvts:[],enterEvts:[]};for(var T in this.dragOvers){var f=this.dragOvers[T];if(!this.isTypeOfDD(f)){continue;
}if(!this.isOverTarget(Q,f,this.mode,V)){d.outEvts.push(f);}I[T]=true;delete this.dragOvers[T];}for(var S in c.groups){if("string"!=typeof S){continue;}for(T in this.ids[S]){var G=this.ids[S][T];if(!this.isTypeOfDD(G)){continue;}if(G.isTarget&&!G.isLocked()&&G!=c){if(this.isOverTarget(Q,G,this.mode,V)){D[S]=true;if(M){d.dropEvts.push(G);}else{if(!I[G.id]){d.enterEvts.push(G);}else{d.overEvts.push(G);}this.dragOvers[G.id]=G;}}}}}this.interactionInfo={out:d.outEvts,enter:d.enterEvts,over:d.overEvts,drop:d.dropEvts,point:Q,draggedRegion:V,sourceRegion:this.locationCache[c.id],validDrop:M};for(var C in D){R.push(C);}if(M&&!d.dropEvts.length){this.interactionInfo.validDrop=false;if(c.events.invalidDrop){c.onInvalidDrop(W);c.fireEvent("invalidDropEvent",{e:W});}}for(T=0;T<E.length;T++){var Z=null;if(d[E[T]+"Evts"]){Z=d[E[T]+"Evts"];}if(Z&&Z.length){var H=E[T].charAt(0).toUpperCase()+E[T].substr(1),Y="onDrag"+H,J="b4Drag"+H,P="drag"+H+"Event",X="drag"+H;if(this.mode){if(c.events[J]){c[J](W,Z,R);L[Y]=c.fireEvent(J+"Event",{event:W,info:Z,group:R});}if(c.events[X]&&(L[Y]!==false)){c[Y](W,Z,R);c.fireEvent(P,{event:W,info:Z,group:R});}}else{for(var a=0,U=Z.length;a<U;++a){if(c.events[J]){c[J](W,Z[a].id,R[0]);L[Y]=c.fireEvent(J+"Event",{event:W,info:Z[a].id,group:R[0]});}if(c.events[X]&&(L[Y]!==false)){c[Y](W,Z[a].id,R[0]);c.fireEvent(P,{event:W,info:Z[a].id,group:R[0]});}}}}}},getBestMatch:function(E){var G=null;var D=E.length;if(D==1){G=E[0];}else{for(var F=0;F<D;++F){var C=E[F];if(this.mode==this.INTERSECT&&C.cursorIsOver){G=C;break;}else{if(!G||!G.overlap||(C.overlap&&G.overlap.getArea()<C.overlap.getArea())){G=C;}}}}return G;},refreshCache:function(D){var F=D||this.ids;for(var C in F){if("string"!=typeof C){continue;}for(var E in this.ids[C]){var G=this.ids[C][E];if(this.isTypeOfDD(G)){var H=this.getLocation(G);if(H){this.locationCache[G.id]=H;}else{delete this.locationCache[G.id];}}}}},verifyEl:function(D){try{if(D){var C=D.offsetParent;if(C){return true;}}}catch(E){}return false;},getLocation:function(H){if(!this.isTypeOfDD(H)){return null;}var F=H.getEl(),K,E,D,M,L,N,C,J,G;try{K=YAHOO.util.Dom.getXY(F);}catch(I){}if(!K){return null;}E=K[0];D=E+F.offsetWidth;M=K[1];L=M+F.offsetHeight;N=M-H.padding[0];C=D+H.padding[1];J=L+H.padding[2];G=E-H.padding[3];return new YAHOO.util.Region(N,C,J,G);},isOverTarget:function(K,C,E,F){var G=this.locationCache[C.id];if(!G||!this.useCache){G=this.getLocation(C);this.locationCache[C.id]=G;}if(!G){return false;}C.cursorIsOver=G.contains(K);var J=this.dragCurrent;if(!J||(!E&&!J.constrainX&&!J.constrainY)){return C.cursorIsOver;}C.overlap=null;if(!F){var H=J.getTargetCoord(K.x,K.y);var D=J.getDragEl();F=new YAHOO.util.Region(H.y,H.x+D.offsetWidth,H.y+D.offsetHeight,H.x);}var I=F.intersect(G);if(I){C.overlap=I;return(E)?true:C.cursorIsOver;}else{return false;}},_onUnload:function(D,C){this.unregAll();},unregAll:function(){if(this.dragCurrent){this.stopDrag();this.dragCurrent=null;}this._execOnAll("unreg",[]);this.ids={};},elementCache:{},getElWrapper:function(D){var C=this.elementCache[D];if(!C||!C.el){C=this.elementCache[D]=new this.ElementWrapper(YAHOO.util.Dom.get(D));}return C;},getElement:function(C){return YAHOO.util.Dom.get(C);},getCss:function(D){var C=YAHOO.util.Dom.get(D);return(C)?C.style:null;},ElementWrapper:function(C){this.el=C||null;this.id=this.el&&C.id;this.css=this.el&&C.style;},getPosX:function(C){return YAHOO.util.Dom.getX(C);},getPosY:function(C){return YAHOO.util.Dom.getY(C);},swapNode:function(E,C){if(E.swapNode){E.swapNode(C);}else{var F=C.parentNode;var D=C.nextSibling;if(D==E){F.insertBefore(E,C);}else{if(C==E.nextSibling){F.insertBefore(C,E);}else{E.parentNode.replaceChild(C,E);F.insertBefore(E,D);}}}},getScroll:function(){var E,C,F=document.documentElement,D=document.body;if(F&&(F.scrollTop||F.scrollLeft)){E=F.scrollTop;C=F.scrollLeft;}else{if(D){E=D.scrollTop;C=D.scrollLeft;}else{}}return{top:E,left:C};},getStyle:function(D,C){return YAHOO.util.Dom.getStyle(D,C);},getScrollTop:function(){return this.getScroll().top;},getScrollLeft:function(){return this.getScroll().left;},moveToEl:function(C,E){var D=YAHOO.util.Dom.getXY(E);YAHOO.util.Dom.setXY(C,D);},getClientHeight:function(){return YAHOO.util.Dom.getViewportHeight();},getClientWidth:function(){return YAHOO.util.Dom.getViewportWidth();},numericSort:function(D,C){return(D-C);},_timeoutCount:0,_addListeners:function(){var C=YAHOO.util.DDM;if(YAHOO.util.Event&&document){C._onLoad();}else{if(C._timeoutCount>2000){}else{setTimeout(C._addListeners,10);if(document&&document.body){C._timeoutCount+=1;}}}},handleWasClicked:function(C,E){if(this.isHandle(E,C.id)){return true;}else{var D=C.parentNode;while(D){if(this.isHandle(E,D.id)){return true;}else{D=D.parentNode;}}}return false;}};}();YAHOO.util.DDM=YAHOO.util.DragDropMgr;YAHOO.util.DDM._addListeners();}(function(){var A=YAHOO.util.Event;var B=YAHOO.util.Dom;YAHOO.util.DragDrop=function(E,C,D){if(E){this.init(E,C,D);}};YAHOO.util.DragDrop.prototype={events:null,on:function(){this.subscribe.apply(this,arguments);},id:null,config:null,dragElId:null,handleElId:null,invalidHandleTypes:null,invalidHandleIds:null,invalidHandleClasses:null,startPageX:0,startPageY:0,groups:null,locked:false,lock:function(){this.locked=true;},unlock:function(){this.locked=false;},isTarget:true,padding:null,dragOnly:false,useShim:false,_domRef:null,__ygDragDrop:true,constrainX:false,constrainY:false,minX:0,maxX:0,minY:0,maxY:0,deltaX:0,deltaY:0,maintainOffset:false,xTicks:null,yTicks:null,primaryButtonOnly:true,available:false,hasOuterHandles:false,cursorIsOver:false,overlap:null,b4StartDrag:function(C,D){},startDrag:function(C,D){},b4Drag:function(C){},onDrag:function(C){},onDragEnter:function(C,D){},b4DragOver:function(C){},onDragOver:function(C,D){},b4DragOut:function(C){},onDragOut:function(C,D){},b4DragDrop:function(C){},onDragDrop:function(C,D){},onInvalidDrop:function(C){},b4EndDrag:function(C){},endDrag:function(C){},b4MouseDown:function(C){},onMouseDown:function(C){},onMouseUp:function(C){},onAvailable:function(){},getEl:function(){if(!this._domRef){this._domRef=B.get(this.id);
}return this._domRef;},getDragEl:function(){return B.get(this.dragElId);},init:function(F,C,D){this.initTarget(F,C,D);A.on(this._domRef||this.id,"mousedown",this.handleMouseDown,this,true);for(var E in this.events){this.createEvent(E+"Event");}},initTarget:function(E,C,D){this.config=D||{};this.events={};this.DDM=YAHOO.util.DDM;this.groups={};if(typeof E!=="string"){this._domRef=E;E=B.generateId(E);}this.id=E;this.addToGroup((C)?C:"default");this.handleElId=E;A.onAvailable(E,this.handleOnAvailable,this,true);this.setDragElId(E);this.invalidHandleTypes={A:"A"};this.invalidHandleIds={};this.invalidHandleClasses=[];this.applyConfig();},applyConfig:function(){this.events={mouseDown:true,b4MouseDown:true,mouseUp:true,b4StartDrag:true,startDrag:true,b4EndDrag:true,endDrag:true,drag:true,b4Drag:true,invalidDrop:true,b4DragOut:true,dragOut:true,dragEnter:true,b4DragOver:true,dragOver:true,b4DragDrop:true,dragDrop:true};if(this.config.events){for(var C in this.config.events){if(this.config.events[C]===false){this.events[C]=false;}}}this.padding=this.config.padding||[0,0,0,0];this.isTarget=(this.config.isTarget!==false);this.maintainOffset=(this.config.maintainOffset);this.primaryButtonOnly=(this.config.primaryButtonOnly!==false);this.dragOnly=((this.config.dragOnly===true)?true:false);this.useShim=((this.config.useShim===true)?true:false);},handleOnAvailable:function(){this.available=true;this.resetConstraints();this.onAvailable();},setPadding:function(E,C,F,D){if(!C&&0!==C){this.padding=[E,E,E,E];}else{if(!F&&0!==F){this.padding=[E,C,E,C];}else{this.padding=[E,C,F,D];}}},setInitPosition:function(F,E){var G=this.getEl();if(!this.DDM.verifyEl(G)){if(G&&G.style&&(G.style.display=="none")){}else{}return;}var D=F||0;var C=E||0;var H=B.getXY(G);this.initPageX=H[0]-D;this.initPageY=H[1]-C;this.lastPageX=H[0];this.lastPageY=H[1];this.setStartPosition(H);},setStartPosition:function(D){var C=D||B.getXY(this.getEl());this.deltaSetXY=null;this.startPageX=C[0];this.startPageY=C[1];},addToGroup:function(C){this.groups[C]=true;this.DDM.regDragDrop(this,C);},removeFromGroup:function(C){if(this.groups[C]){delete this.groups[C];}this.DDM.removeDDFromGroup(this,C);},setDragElId:function(C){this.dragElId=C;},setHandleElId:function(C){if(typeof C!=="string"){C=B.generateId(C);}this.handleElId=C;this.DDM.regHandle(this.id,C);},setOuterHandleElId:function(C){if(typeof C!=="string"){C=B.generateId(C);}A.on(C,"mousedown",this.handleMouseDown,this,true);this.setHandleElId(C);this.hasOuterHandles=true;},unreg:function(){A.removeListener(this.id,"mousedown",this.handleMouseDown);this._domRef=null;this.DDM._remove(this);},isLocked:function(){return(this.DDM.isLocked()||this.locked);},handleMouseDown:function(J,I){var D=J.which||J.button;if(this.primaryButtonOnly&&D>1){return;}if(this.isLocked()){return;}var C=this.b4MouseDown(J),F=true;if(this.events.b4MouseDown){F=this.fireEvent("b4MouseDownEvent",J);}var E=this.onMouseDown(J),H=true;if(this.events.mouseDown){if(E===false){H=false;}else{H=this.fireEvent("mouseDownEvent",J);}}if((C===false)||(E===false)||(F===false)||(H===false)){return;}this.DDM.refreshCache(this.groups);var G=new YAHOO.util.Point(A.getPageX(J),A.getPageY(J));if(!this.hasOuterHandles&&!this.DDM.isOverTarget(G,this)){}else{if(this.clickValidator(J)){this.setStartPosition();this.DDM.handleMouseDown(J,this);this.DDM.stopEvent(J);}else{}}},clickValidator:function(D){var C=YAHOO.util.Event.getTarget(D);return(this.isValidHandleChild(C)&&(this.id==this.handleElId||this.DDM.handleWasClicked(C,this.id)));},getTargetCoord:function(E,D){var C=E-this.deltaX;var F=D-this.deltaY;if(this.constrainX){if(C<this.minX){C=this.minX;}if(C>this.maxX){C=this.maxX;}}if(this.constrainY){if(F<this.minY){F=this.minY;}if(F>this.maxY){F=this.maxY;}}C=this.getTick(C,this.xTicks);F=this.getTick(F,this.yTicks);return{x:C,y:F};},addInvalidHandleType:function(C){var D=C.toUpperCase();this.invalidHandleTypes[D]=D;},addInvalidHandleId:function(C){if(typeof C!=="string"){C=B.generateId(C);}this.invalidHandleIds[C]=C;},addInvalidHandleClass:function(C){this.invalidHandleClasses.push(C);},removeInvalidHandleType:function(C){var D=C.toUpperCase();delete this.invalidHandleTypes[D];},removeInvalidHandleId:function(C){if(typeof C!=="string"){C=B.generateId(C);}delete this.invalidHandleIds[C];},removeInvalidHandleClass:function(D){for(var E=0,C=this.invalidHandleClasses.length;E<C;++E){if(this.invalidHandleClasses[E]==D){delete this.invalidHandleClasses[E];}}},isValidHandleChild:function(F){var E=true;var H;try{H=F.nodeName.toUpperCase();}catch(G){H=F.nodeName;}E=E&&!this.invalidHandleTypes[H];E=E&&!this.invalidHandleIds[F.id];for(var D=0,C=this.invalidHandleClasses.length;E&&D<C;++D){E=!B.hasClass(F,this.invalidHandleClasses[D]);}return E;},setXTicks:function(F,C){this.xTicks=[];this.xTickSize=C;var E={};for(var D=this.initPageX;D>=this.minX;D=D-C){if(!E[D]){this.xTicks[this.xTicks.length]=D;E[D]=true;}}for(D=this.initPageX;D<=this.maxX;D=D+C){if(!E[D]){this.xTicks[this.xTicks.length]=D;E[D]=true;}}this.xTicks.sort(this.DDM.numericSort);},setYTicks:function(F,C){this.yTicks=[];this.yTickSize=C;var E={};for(var D=this.initPageY;D>=this.minY;D=D-C){if(!E[D]){this.yTicks[this.yTicks.length]=D;E[D]=true;}}for(D=this.initPageY;D<=this.maxY;D=D+C){if(!E[D]){this.yTicks[this.yTicks.length]=D;E[D]=true;}}this.yTicks.sort(this.DDM.numericSort);},setXConstraint:function(E,D,C){this.leftConstraint=parseInt(E,10);this.rightConstraint=parseInt(D,10);this.minX=this.initPageX-this.leftConstraint;this.maxX=this.initPageX+this.rightConstraint;if(C){this.setXTicks(this.initPageX,C);}this.constrainX=true;},clearConstraints:function(){this.constrainX=false;this.constrainY=false;this.clearTicks();},clearTicks:function(){this.xTicks=null;this.yTicks=null;this.xTickSize=0;this.yTickSize=0;},setYConstraint:function(C,E,D){this.topConstraint=parseInt(C,10);this.bottomConstraint=parseInt(E,10);this.minY=this.initPageY-this.topConstraint;this.maxY=this.initPageY+this.bottomConstraint;
if(D){this.setYTicks(this.initPageY,D);}this.constrainY=true;},resetConstraints:function(){if(this.initPageX||this.initPageX===0){var D=(this.maintainOffset)?this.lastPageX-this.initPageX:0;var C=(this.maintainOffset)?this.lastPageY-this.initPageY:0;this.setInitPosition(D,C);}else{this.setInitPosition();}if(this.constrainX){this.setXConstraint(this.leftConstraint,this.rightConstraint,this.xTickSize);}if(this.constrainY){this.setYConstraint(this.topConstraint,this.bottomConstraint,this.yTickSize);}},getTick:function(I,F){if(!F){return I;}else{if(F[0]>=I){return F[0];}else{for(var D=0,C=F.length;D<C;++D){var E=D+1;if(F[E]&&F[E]>=I){var H=I-F[D];var G=F[E]-I;return(G>H)?F[D]:F[E];}}return F[F.length-1];}}},toString:function(){return("DragDrop "+this.id);}};YAHOO.augment(YAHOO.util.DragDrop,YAHOO.util.EventProvider);})();YAHOO.util.DD=function(C,A,B){if(C){this.init(C,A,B);}};YAHOO.extend(YAHOO.util.DD,YAHOO.util.DragDrop,{scroll:true,autoOffset:function(C,B){var A=C-this.startPageX;var D=B-this.startPageY;this.setDelta(A,D);},setDelta:function(B,A){this.deltaX=B;this.deltaY=A;},setDragElPos:function(C,B){var A=this.getDragEl();this.alignElWithMouse(A,C,B);},alignElWithMouse:function(C,G,F){var E=this.getTargetCoord(G,F);if(!this.deltaSetXY){var H=[E.x,E.y];YAHOO.util.Dom.setXY(C,H);var D=parseInt(YAHOO.util.Dom.getStyle(C,"left"),10);var B=parseInt(YAHOO.util.Dom.getStyle(C,"top"),10);this.deltaSetXY=[D-E.x,B-E.y];}else{YAHOO.util.Dom.setStyle(C,"left",(E.x+this.deltaSetXY[0])+"px");YAHOO.util.Dom.setStyle(C,"top",(E.y+this.deltaSetXY[1])+"px");}this.cachePosition(E.x,E.y);var A=this;setTimeout(function(){A.autoScroll.call(A,E.x,E.y,C.offsetHeight,C.offsetWidth);},0);},cachePosition:function(B,A){if(B){this.lastPageX=B;this.lastPageY=A;}else{var C=YAHOO.util.Dom.getXY(this.getEl());this.lastPageX=C[0];this.lastPageY=C[1];}},autoScroll:function(J,I,E,K){if(this.scroll){var L=this.DDM.getClientHeight();var B=this.DDM.getClientWidth();var N=this.DDM.getScrollTop();var D=this.DDM.getScrollLeft();var H=E+I;var M=K+J;var G=(L+N-I-this.deltaY);var F=(B+D-J-this.deltaX);var C=40;var A=(document.all)?80:30;if(H>L&&G<C){window.scrollTo(D,N+A);}if(I<N&&N>0&&I-N<C){window.scrollTo(D,N-A);}if(M>B&&F<C){window.scrollTo(D+A,N);}if(J<D&&D>0&&J-D<C){window.scrollTo(D-A,N);}}},applyConfig:function(){YAHOO.util.DD.superclass.applyConfig.call(this);this.scroll=(this.config.scroll!==false);},b4MouseDown:function(A){this.setStartPosition();this.autoOffset(YAHOO.util.Event.getPageX(A),YAHOO.util.Event.getPageY(A));},b4Drag:function(A){this.setDragElPos(YAHOO.util.Event.getPageX(A),YAHOO.util.Event.getPageY(A));},toString:function(){return("DD "+this.id);}});YAHOO.util.DDProxy=function(C,A,B){if(C){this.init(C,A,B);this.initFrame();}};YAHOO.util.DDProxy.dragElId="ygddfdiv";YAHOO.extend(YAHOO.util.DDProxy,YAHOO.util.DD,{resizeFrame:true,centerFrame:false,createFrame:function(){var B=this,A=document.body;if(!A||!A.firstChild){setTimeout(function(){B.createFrame();},50);return;}var F=this.getDragEl(),E=YAHOO.util.Dom;if(!F){F=document.createElement("div");F.id=this.dragElId;var D=F.style;D.position="absolute";D.visibility="hidden";D.cursor="move";D.border="2px solid #aaa";D.zIndex=999;D.height="25px";D.width="25px";var C=document.createElement("div");E.setStyle(C,"height","100%");E.setStyle(C,"width","100%");E.setStyle(C,"background-color","#ccc");E.setStyle(C,"opacity","0");F.appendChild(C);A.insertBefore(F,A.firstChild);}},initFrame:function(){this.createFrame();},applyConfig:function(){YAHOO.util.DDProxy.superclass.applyConfig.call(this);this.resizeFrame=(this.config.resizeFrame!==false);this.centerFrame=(this.config.centerFrame);this.setDragElId(this.config.dragElId||YAHOO.util.DDProxy.dragElId);},showFrame:function(E,D){var C=this.getEl();var A=this.getDragEl();var B=A.style;this._resizeProxy();if(this.centerFrame){this.setDelta(Math.round(parseInt(B.width,10)/2),Math.round(parseInt(B.height,10)/2));}this.setDragElPos(E,D);YAHOO.util.Dom.setStyle(A,"visibility","visible");},_resizeProxy:function(){if(this.resizeFrame){var H=YAHOO.util.Dom;var B=this.getEl();var C=this.getDragEl();var G=parseInt(H.getStyle(C,"borderTopWidth"),10);var I=parseInt(H.getStyle(C,"borderRightWidth"),10);var F=parseInt(H.getStyle(C,"borderBottomWidth"),10);var D=parseInt(H.getStyle(C,"borderLeftWidth"),10);if(isNaN(G)){G=0;}if(isNaN(I)){I=0;}if(isNaN(F)){F=0;}if(isNaN(D)){D=0;}var E=Math.max(0,B.offsetWidth-I-D);var A=Math.max(0,B.offsetHeight-G-F);H.setStyle(C,"width",E+"px");H.setStyle(C,"height",A+"px");}},b4MouseDown:function(B){this.setStartPosition();var A=YAHOO.util.Event.getPageX(B);var C=YAHOO.util.Event.getPageY(B);this.autoOffset(A,C);},b4StartDrag:function(A,B){this.showFrame(A,B);},b4EndDrag:function(A){YAHOO.util.Dom.setStyle(this.getDragEl(),"visibility","hidden");},endDrag:function(D){var C=YAHOO.util.Dom;var B=this.getEl();var A=this.getDragEl();C.setStyle(A,"visibility","");C.setStyle(B,"visibility","hidden");YAHOO.util.DDM.moveToEl(B,A);C.setStyle(A,"visibility","hidden");C.setStyle(B,"visibility","");},toString:function(){return("DDProxy "+this.id);}});YAHOO.util.DDTarget=function(C,A,B){if(C){this.initTarget(C,A,B);}};YAHOO.extend(YAHOO.util.DDTarget,YAHOO.util.DragDrop,{toString:function(){return("DDTarget "+this.id);}});YAHOO.register("dragdrop",YAHOO.util.DragDropMgr,{version:"2.9.0",build:"2800"});
/*
    json2.js
    2013-05-26
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
    This file creates a global JSON object containing two methods: stringify
    and parse.
        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.
            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.
            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.
            This method produces a JSON text from a JavaScript value.
            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value
            For example, this would serialize Dates as ISO strings.
                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };
            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.
            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.
            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.
            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.
            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.
            Example:
            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'
            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'
        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.
            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.
            Example:
            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.
            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });
            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/
/*jslint evil: true, regexp: true */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
    'use strict';
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };
        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
// Produce a string from holder[key].
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
// If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
// What happens next depends on the value's type.
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
// JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.
            return String(value);
// If the type is 'object', we might be dealing with an object or an array or
// null.
        case 'object':
// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.
            if (!value) {
                return 'null';
            }
// Make an array to hold the partial results of stringifying this object value.
            gap += indent;
            partial = [];
// Is the value an array?
            if (Object.prototype.toString.apply(value) === '[object Array]') {
// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
// Join all of the elements together, separated with commas, and wrap them in
// brackets.
                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
// If the replacer is an array, use it to select the members to be stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
// Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
// Join all of the member texts together, separated with commas,
// and wrap them in braces.
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
// If the JSON object does not yet have a stringify method, give it one.
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.
            var i;
            gap = '';
            indent = '';
// If the space parameter is a number, make an indent string containing that
// many spaces.
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
// If the space parameter is a string, it will be used as the indent string.
            } else if (typeof space === 'string') {
                indent = space;
            }
// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.
            return str('', {'': value});
        };
    }
// If the JSON object does not yet have a parse method, give it one.
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.
            var j;
            function walk(holder, key) {
// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.
// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.
                j = eval('(' + text + ')');
// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
// If the text is not JSON parseable, then a SyntaxError is thrown.
            throw new SyntaxError('JSON.parse');
        };
    }
}());
/* Copyright (c) 2010-2013 Marcus Westin */
(function(e){function s(){try{return r in e&&e[r]}catch(t){return!1}}var t={},n=e.document,r="localStorage",i;t.disabled=!1,t.set=function(e,t){},t.get=function(e){},t.remove=function(e){},t.clear=function(){},t.transact=function(e,n,r){var i=t.get(e);r==null&&(r=n,n=null),typeof i=="undefined"&&(i=n||{}),r(i),t.set(e,i)},t.getAll=function(){},t.forEach=function(){},t.serialize=function(e){return JSON.stringify(e)},t.deserialize=function(e){if(typeof e!="string")return undefined;try{return JSON.parse(e)}catch(t){return e||undefined}};if(s())i=e[r],t.set=function(e,n){return n===undefined?t.remove(e):(i.setItem(e,t.serialize(n)),n)},t.get=function(e){return t.deserialize(i.getItem(e))},t.remove=function(e){i.removeItem(e)},t.clear=function(){i.clear()},t.getAll=function(){var e={};return t.forEach(function(t,n){e[t]=n}),e},t.forEach=function(e){for(var n=0;n<i.length;n++){var r=i.key(n);e(r,t.get(r))}};else if(n.documentElement.addBehavior){var o,u;try{u=new ActiveXObject("htmlfile"),u.open(),u.write('<script>document.w=window</script><iframe src="/favicon.ico"></iframe>'),u.close(),o=u.w.frames[0].document,i=o.createElement("div")}catch(a){i=n.createElement("div"),o=n.body}function f(e){return function(){var n=Array.prototype.slice.call(arguments,0);n.unshift(i),o.appendChild(i),i.addBehavior("#default#userData"),i.load(r);var s=e.apply(t,n);return o.removeChild(i),s}}var l=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");function c(e){return e.replace(l,"___")}t.set=f(function(e,n,i){return n=c(n),i===undefined?t.remove(n):(e.setAttribute(n,t.serialize(i)),e.save(r),i)}),t.get=f(function(e,n){return n=c(n),t.deserialize(e.getAttribute(n))}),t.remove=f(function(e,t){t=c(t),e.removeAttribute(t),e.save(r)}),t.clear=f(function(e){var t=e.XMLDocument.documentElement.attributes;e.load(r);for(var n=0,i;i=t[n];n++)e.removeAttribute(i.name);e.save(r)}),t.getAll=function(e){var n={};return t.forEach(function(e,t){n[e]=t}),n},t.forEach=f(function(e,n){var r=e.XMLDocument.documentElement.attributes;for(var i=0,s;s=r[i];++i)n(s.name,t.deserialize(e.getAttribute(s.name)))})}try{var h="__storejs__";t.set(h,h),t.get(h)!=h&&(t.disabled=!0),t.remove(h)}catch(a){t.disabled=!0}t.enabled=!t.disabled,typeof module!="undefined"&&module.exports?module.exports=t:typeof define=="function"&&define.amd?define(t):e.store=t})(this.window||global)
/* global profilesStorage: false */
var reportsConfigNavbar = function() {
	var YE = YAHOO.util.Event;
	var isActiveProfilesMenu = false;
	var isReports = false;
	var pageToken = '';
	var activePage = '';
	var baseHref = '';
	var container = null;
	var profilesDb = [];
	var activeProfileName = '';
	function init(isReportsPage) {
		isReports = isReportsPage;
		var navInfo = {
			containerId: 'reports_config_navbar',
			btnActiveClassName: 'active',
			menuBaseIds: [
			'rc_nav_profiles',
			'rc_nav_config',
			'rc_nav_tools',
			'rc_nav_view_reports',
			'rc_nav_admin'],
			events: {
				rc_nav_profiles: reportsConfigNavbar.initProfilesMenu
			}
		};
		new util.NavGroup(navInfo);
	}
	function initProfilesMenu() {
		if (!isActiveProfilesMenu) {
			isActiveProfilesMenu = true;
			// Init the scrollControl
//			scrollControl = new scrollUtil.Scroller('rc_nav_profiles:container', 'rc_nav_profiles:profiles_container', reportsConfigNavbar.scrollingList);
			// Init scroll animation to reset scroll position to 0
			// scrollResetAnim = new YAHOO.util.Scroll('matching_files:box', attributes, 0.1);
			if (isReports) {
				pageToken = reportInfo.pageToken;
				activePage = 'statistics';
				activeProfileName = reportInfo.profileName;
				baseHref = '?dp=reports&p=';
			}
			else {
				pageToken = pageInfo.pageToken;
				activePage = pageInfo.page;
				activeProfileName = pageInfo.profileName;
				baseHref = '?dp=config&page=' + pageInfo.page + '&p=';
			}
			container = util.getE('rc_nav_profiles:profiles_container');
//			console.log('profilesStorage.getIsUpToDate(): ' + profilesStorage.getIsUpToDate());
			// Don't show profile list if it is not up to date
			if (profilesStorage.getIsUpToDate()) {
				// Get the profilesDb
				profilesDb = profilesStorage.get('profilesDb');
				if (typeof profilesDb !== 'undefined') {
					// Create the menu
					createProfilesList(profilesDb);
					// Set profileList to fixed width so that it doesn't
					// change upon search.
					var profilesMenuEl = util.getE('rc_nav_profiles:menu');
					var region = YAHOO.util.Dom.getRegion(profilesMenuEl);
					profilesMenuEl.style.width = region.width + 'px';
				}
				else {
					// Load fresh data
					getProfileData();
				}
			}
			else {
				// Load fresh data
				getProfileData();
			}
			// Init profilesFilter
			profilesFilter.init({
				profilesDb: profilesDb,
				searchElementId: 'rc_nav_profiles:search',
				clearSearchBtnId: '',
				onSearchCallback: reportsConfigNavbar.createProfilesList
			});
		}
	}
	function getProfileData() {
		var url = '?dp=util.profiles.get_profile_data';
		url += '&p=' + activeProfileName;
        var dat = 'v.fp.page_token=' + pageToken;
		dat += '&v.fp.active_page=' + activePage;
		dat += '&v.fp.response_function=reportsConfigNavbar.getProfileDataResponse';
		dat += '&v.fp.get_new_checksum=true';
        dat += '&v.fp.index_from=0';
        dat += '&v.fp.index_to=-1';
        util.serverPost(url, dat);
	}
	function getProfileDataResponse(dat) {
//		console.log('checkProfilesDataResponse()');
//		util.showObject(dat);
		var profilesDb = dat.profilesDb;
		profilesStorage.addNewProfilesDb(
			dat.profilesListChecksum,
			dat.numAllProfiles,
			dat.numPermittedProfiles,
			profilesDb);
		createProfilesList(profilesDb);
	}
	function createProfilesList(theProfiles) {
//		util.showObject(theProfiles);
		// Check whether the list is filtered.
		var isAllProfiles = theProfiles.length === profilesDb.length;
//		console.log('isAllProfiles: ' + isAllProfiles);
//		util.removeChildElements(container);
		var ul = util.createE('ul', {className:'drop-down-10 drop-down-10-inline'});
		var list = '<ul class="drop-down-10 drop-down-10-inline">';
		// Show Admin/Profiles link in profiles list when list is not filtered
		if (isAllProfiles) {
			list += '<li>';
			list += '<a href="?dp=index&page=profiles">' + langVar('lang_stats.btn.admin_profiles') + '</a>';
			list += '</li>';
		}
		for (var i = 0, len = theProfiles.length; i < len; i++) {
			var item =  profilesStorage.profileArrayItemToObject(theProfiles[i]);
			var profileName = item.name;
			var profileLabel = item.label;
			var defaultDateFilter = item.df;
			var href = baseHref + profileName;
			// Add default data filter in reports if defined
			if (isReports && defaultDateFilter !== '') {
				href += '&df=' + defaultDateFilter;
			}
//			var li = util.createE('li');
//			var a = util.createE('a', {href: href});
//			var txt = util.createT(profileLabel);
//			util.chainE(ul, li, a, txt);
			list += '<li>';
			list += '<a href="' + href + '">' + profileLabel + '</a>';
			list += '</li>';
		}
		list += '</ul>';
//		util.chainE(container, ul);
		container.innerHTML = list;
	}
	//
	//
	// Return global properties and methods
	//
	//
	return {
		init: init,
		initProfilesMenu: initProfilesMenu,
		getProfileDataResponse: getProfileDataResponse,
		createProfilesList: createProfilesList
	}
}();
/* global ActiveXObject: false */
var util = (function() {
	var YE = YAHOO.util.Event;
	var YD = YAHOO.util.Dom;
	return {
		// validHtmlElementAttributes & validImgElementAttributes are uses in createE() to distinguish
		// between html element and html style attributes
		validHtmlElementAttributes: {
			cellSpacing:true,
			colSpan:true,
			cols:true,
			className:true,
			href:true,
			htmlFor:true,
			id:true,
			rows:true,
			target:true,
			title:true,
			type:true,
			value:true
		},
		validImgElementAttributes: {
			id:true,
			className:true,
			src:true,
			width:true,
			height:true,
			title:true,
			alt:true
		},
		// used by langVar()
		checkedForIsLanguageModule: false,
		isLanguageModule: false,
		// lang contains langauage variables when in developer mode
		lang: {},
		// List of XMLHttpRequest-creation factory functions to try
		HTTP_factories: [
			function() { return new XMLHttpRequest(); },
			function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
			function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
		],
		// When we find a factory that works store it here
		HTTP_factory: null,
		uniqueElementIdCount: 0, // used with getUniqueElementId
		getUniqueElementId: function() {
			var i = util.uniqueElementIdCount + 1;
			while (document.getElementById('ueid_' + i)) {
				i++;
			}
			// set global ueid count to new i
			util.uniqueElementIdCount = i;
			return 'ueid_' + i;
		},
		userAgent: {
			isIE: false,
			isIE6: false,
			name: '',
			init: function() {
				// returns the user agent brand
				var userAgentString = navigator.userAgent.toLowerCase();
				var userAgentAppName = navigator.appName.toLowerCase();
				var brand;
				// Note, Interent Explorer may contain multiple versions (8.0 and 6.0!) as this one:
				// -mozilla/4.0 (compatible; msie 8.0; windows nt 5.2; wow64; trident/4.0; mozilla/4.0 (compatible; msie 6.0; windows nt 5.1; sv1) ; .net clr 2.0.50727; .net clr 3.0.04506.30; .net clr 3.0.4506.2152; .net clr3.5.30729)
				// Consider this when checking for isIE6!
				if (userAgentString.indexOf('safari') !== -1) {
					util.userAgent.name = 'safari';
				}
				else if (userAgentString.indexOf('opera') !== -1) {
					util.userAgent.name = 'opera';
				}
				else if (userAgentAppName === 'netscape') {
					util.userAgent.name = 'netscape';
				}
				else if (userAgentAppName === 'microsoft internet explorer') {
					util.userAgent.name = 'msie';
					util.userAgent.isIE = true;
					// Check if this is Internet Explorer Version 6
					// (Regular Expression as defined in MSDN - Detecting Internet Explorer More Effectively)
					var re = new RegExp('msie ([0-9]{1,}[\u002e0-9]{0,})');
					var ieVersion = -1;
					if (re.exec(userAgentString) !== null) {
						ieVersion = parseFloat(RegExp.$1);
					}
					// alert('ieVersion: ' + ieVersion);
					if (ieVersion >= 6.0 && ieVersion < 7.0) {
						util.userAgent.isIE6 = true;
					}
				}
				else {
					util.userAgent.name = 'unknown';
				}
				// alert('util.userAgent.isIE: ' + util.userAgent.isIE + '\nutil.userAgent.isIE6: ' + util.userAgent.isIE6 + '\nutil.userAgent.name: ' + util.userAgent.name);
			}
		},
		/*
		user interaction / session handler
		This pings the server upon user interaction in defined intervals
		so that a session timeout is reported early and not too late when
		the user is going to save any changes.
		*/
		userInteractionTimer: 120000, // time in ms, set to 2 minutes
		initSession: function() {
			// A new session starts, a page just loaded.
			// console.log('initSession()');
			// Start listening for user interaction events later
			setTimeout('util.startUserInteractionListener()', util.userInteractionTimer);
		},
		startUserInteractionListener: function() {
			// console.log('startUserInteractionListener() - just started');
			YE.addListener(document, 'click', util.setSessionActive);
			YE.addListener(document, 'keydown', util.setSessionActive);
		},
		setSessionActive: function() {
			// console.log('setSessionActive()');
			// Some user interaction is active, ping the server
			// and start listening to user interaction again later
			// Remove the listener, we check for events again later
			YE.removeListener(document, 'click', util.setSessionActive);
			YE.removeListener(document, 'keydown', util.setSessionActive);
			// Ping the server so that the server knows that the user is active
			var url = '?dp=util.ping_session_active';
			util.serverPost(url);
			// Start listening to user interactions again later
			setTimeout('util.startUserInteractionListener()', util.userInteractionTimer);
		},
		pingSessionActiveResponse: function() {
			// Set lastServerCommTime
			// console.log('pingSessionActiveResponse()');
		},
		/*
		general utilities
		*/
		trim: function(theString) {
			// removes leading and trailing white space
			theString = theString.replace(/^\s+/, '');
			theString = theString.replace(/\s+$/, '');
			return theString;
		},
		isBoolean: function(a) {
			return typeof a === 'boolean';
		},
		isObject: function(a) {
			return (a && typeof a === 'object') || util.isFunction(a);
		},
		isFunction: function(a) {
			return typeof a === 'function';
		},
		isArray: function(a) {
			return util.isObject(a) && a.constructor === Array;
		},
		isUndefined: function(a) {
			return typeof a === 'undefined';
		},
		isInteger: function(a, /* optional */ min, /* optional */ max) {
			var pattern = /^[-]?\d+$/;
			if (a !== '' && pattern.test(a)) {
				var minIsValid = true;
				var maxIsValid = true;
				if (!util.isUndefined(min)) {
					if (parseInt(a, 10) < parseInt(min, 10)) {
						minIsValid = false;
					}
				}
				if (!util.isUndefined(max)) {
					if (parseInt(a, 10) > parseInt(max, 10)) {
						maxIsValid = false;
					}
				}
				if (minIsValid && maxIsValid) {
					return true;
				}
			}
			return false;
		},
		isFloat: function(a, min, max) {
			var pattern = /^[-]?\d*\.?\d*$/;
			if (a !== '' && pattern.test(a)) {
				var minIsValid = true;
				var maxIsValid = true;
				if (!util.isUndefined(min)) {
					if (parseFloat(a) < parseFloat(min)) {
						minIsValid = false;
					}
				}
				if (!util.isUndefined(max)) {
					if (parseFloat(a) > parseFloat(max)) {
						maxIsValid = false;
					}
				}
				if (minIsValid && maxIsValid) {
					return true;
				}
			}
			return false;
		},
		isRegularExpression: function(s) {
			if (s !== '') {
				try {
					var obj = new RegExp(s);
					return true;
				}
				catch(e) {
					return false;
				}
			}
			return false;
		},
		isEmailAddress: function(s) {
			// Returns true if s is a valid email address in the format:
			// 'username@hostname' || '<username@hostname>' || 'display name <username@hostname>'
			// pattern1 matches: 'display name <username@hostname>' || '<username@hostname>'
			// pattern2 matches: 'username@hostname'
			var pattern1 = /^.*<\w[-.&\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]{2,}>$/;
			var pattern2 = /^\w[-.&\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]{2,}$/;
			// alert('s: ' + s + '\nmatched pattern1: ' + s.match(pattern1) + '\nmatched pattern2: ' + s.match(pattern2));
			var isValid = (pattern1.test(s) || pattern2.test(s));
			return isValid;
		},
		getE: function(elementId) {
			// get element reference
			return document.getElementById(elementId);
		},
		focusE: function(elementId) {
			var element = util.getE(elementId);
			if (element) {
				// IE Hack, IE may show an error that it can't focus even if the
				// element is displayed, use setTimeout()
				setTimeout(function() {element.focus()}, 0);
				// element.focus();
			}
			else {
				alert('focusE(), element with id "' + elementId + '" \ndoes not exist.');
			}
		},
		enableE: function(elementList, /* optional */ enableElement) {
			if (typeof enableElement === 'undefined') {
				enableElement = true;
			}
			util.enableDisableElement(elementList, !enableElement);
		},
		disableE: function(elementList, /* optional */ disableElement) {
			if (typeof disableElement === 'undefined') {
				disableElement = true;
			}
			util.enableDisableElement(elementList, disableElement);
		},
		enableDisableElement: function(elementList, isDisabled) {
			var a = [];
			if (!util.isArray(elementList)) {
				a[0] = elementList;
			}
			else {
				a = elementList;
			}
			for (var i = 0; i < a.length; i++) {
				var element = util.getE(a[i]);
				if (element) {
					element.disabled = isDisabled;
				}
				else {
					alert('enableDisableElement(), element with id "' + a[i] + '" \ndoes not exist.');
				}
			}
		},
		showEV: function(elementList, /* optional */ showElement) {
			// show Elements visibility
			if (typeof showElement === 'undefined') {
				showElement = true;
			}
			util.showHideElementVisibility(elementList, showElement);
		},
		hideEV: function(elementList, /* optional */ hideElement) {
			// hide Elements visibility
			if (typeof hideElement === 'undefined') {
				hideElement = true;
			}
			util.showHideElementVisibility(elementList, !hideElement);
		},
		showHideElementVisibility: function(elementList, displayElement) {
			var a = [];
			if (!util.isArray(elementList)) {
				a[0] = elementList;
			}
			else {
				a = elementList;
			}
			// alert('showHideElementVisibility displayElement: ' + displayElement);
			for (var i = 0; i < a.length; i++) {
				var element = util.getE(a[i]);
				if (element) {
					var visibility = displayElement ? 'visible' : 'hidden';
					element.style.visibility = visibility;
				}
				else {
					alert('showHideElementVisibility(), element with id "' + a[i] + '" \ndoes not exist.');
				}
			}
		},
		showE: function(elementList, /* optional */ showElement) {
			// Use only for display, not for visibility
			if (typeof showElement === 'undefined') {
				showElement = true;
			}
			util.showHideElement(elementList, showElement);
		},
		hideE: function(elementList, /* optional */ hideElement) {
			// Use only for display, not for visibility
			if (typeof hideElement === 'undefined') {
				hideElement = true;
			}
			util.showHideElement(elementList, !hideElement);
		},
		showHideElement: function(elementList, displayElement) {
			var a = [];
			if (!util.isArray(elementList)) {
				a[0] = elementList;
			}
			else {
				a = elementList;
			}
			// alert('elementList 2: ' + elementList);
			for (var i = 0; i < a.length; i++) {
				var element = util.getE(a[i]);
				if (element) {
					var elementType = element.nodeName;
					var displayType;
					if (displayElement) {
						if (elementType === 'TD' ||
							elementType === 'TR' ||
							elementType === 'TBODY' ||
							elementType === 'LI' ||
							elementType === 'A') {
							displayType = '';
						}
						else {
							displayType = 'block';
						}
					}
					else {
						displayType = 'none';
					}
					if (element.style.display !== displayType) {
						element.style.display = displayType;
					}
				}
				else {
					alert('showHideElement(), element with id "' + a[i] + '" \ndoes not exist.');
				}
			}
		},
		setF: function(elementOrElementId, theValue) {
			// set Form Value
			var element = (util.isObject(elementOrElementId)) ? elementOrElementId : util.getE(elementOrElementId);
			if (element) {
				var elementType = element.nodeName;
				// alert(elementType);
				switch (elementType) {
				case 'INPUT' :
					var typeAttr = element.type;
					if (typeAttr === 'text' || typeAttr === 'hidden') {
						element.value = theValue;
					}
					else if (typeAttr === 'checkbox' || typeAttr === 'radio') {
						element.checked = theValue;
					}
					else if (typeAttr === 'password') {
						// A password field can only be set when dynamically created
						// and by setting its value before appending it to the document.
						// Hence we create a new password field, set its value and replace
						// it with the existing one.
						var elementWidth = element.style.width;
						var containerElement = element.parentNode;
						var elementId = element.id;
						// delete existing password element
						containerElement.removeChild(element);
						// create new password element
						var newPasswordElement = document.createElement('input');
							newPasswordElement.type = 'password';
							newPasswordElement.id = elementId;
							newPasswordElement.value = theValue;
							newPasswordElement.style.width = elementWidth;
							containerElement.appendChild(newPasswordElement);
					}
					break;
				case 'SELECT' :
					var options = element.options;
					for (var i = 0, len = options.length; i < len; i++) {
						// alert(options[i].value);
						if (options[i].value === theValue) {
							options[i].selected = true;
							break;
						}
					}
					break;
				case 'TEXTAREA' :
					element.value = theValue;
					break;
				}
			}
			else {
				alert('setFormValue(), element with id "' + elementId + '" \ndoes not exist.');
			}
		},
		getF: function(elementId, /* optional */ trimFormValue) {
			// get Form Value
			var element = document.getElementById(elementId);
			var theValue;
			if (element) {
				var elementType = element.nodeName;
				// Set default trimFormValue if undefined
				if (typeof trimFormValue === 'undefined') {
					trimFormValue = true;
				}
				switch (elementType) {
					case 'INPUT' :
						var typeAttr = element.type;
						if (typeAttr === "text" || typeAttr === 'hidden' || typeAttr === 'password') {
							theValue = trimFormValue ? util.trim(element.value) : element.value;
						}
						else {
							theValue = element.checked;
						}
						break;
					case 'SELECT' :
						var i = element.selectedIndex;
						theValue = (i !== -1) ? element.options[i].value : '';
						break;
					case 'TEXTAREA' :
						theValue = trimFormValue ? util.trim(element.value) : element.value;
						// Clean multi line values from carriage return \r characters
						// which are added in IE so that we only have the line feed \n
						// instead of \r\n. Otherwise the value is interpreted as isModified
						// although nothing has been modified.
						var pattern = /\u000D/g; // Carriage return \r
						if (pattern.test(theValue)) {
							// Reomve all carriage returns
							theValue = theValue.replace(pattern, '');
						}
						break;
				}
				return theValue;
			}
			else {
				alert('getF(), element with id "' + elementId + '" \ndoes not exist.');
			}
		},
		resetF: function(elementList) {
			// Resets a form element, argument is a single form element Id or an array with form element Id's
			var a = [];
			if (!util.isArray(elementList)) {
				a[0] = elementList;
			}
			else {
				a = elementList;
			}
			for (var i = 0; i < a.length; i++) {
				var element = util.getE(a[i]);
				if (element) {
					element.reset();
				}
				else {
					alert('resetF(), element with id "' + a[i] + '" \ndoes not exist.');
				}
			}
		},
		populateSelect: function(elementOrElementId, theList, valueKey, textKey, defaultSelectedValueArg /*optional*/) {
			// Populates a select element. theList is an array with objects
			var element = (util.isObject(elementOrElementId)) ? elementOrElementId : util.getE(elementOrElementId);
			var defaultSelectedValue = (defaultSelectedValueArg !== null) ? defaultSelectedValueArg : '';
			if (element !== null) {
				// util.showObject(theList);
				element.options.length = 0;
				for (var i = 0, l = theList.length; i < l; i++) {
					var theValue = theList[i][valueKey];
					var makeSelected = (theValue === defaultSelectedValue);
					// util.showObject({theValue:theValue, defaultSelectedValue:defaultSelectedValue});
					element.options[i] = new Option(theList[i][textKey], theValue, makeSelected, makeSelected);
				}
			}
			else {
				alert('populateSelect(), element with id "' + elementId + '" \ndoes not exist.');
			}
		},
		extendSelect: function(elementOrElementId, theList, valueKey, textKey, defaultSelectedValueArg /*optional*/) {
			// This adds aditional options to a select element which is already populated
			var element = (util.isObject(elementOrElementId)) ? elementOrElementId : util.getE(elementOrElementId);
			var defaultSelectedValue = (defaultSelectedValueArg !== null) ? defaultSelectedValueArg : '';
			if (element) {
				var j = element.options.length;
				for (var i = 0, l = theList.length; i < l; i++, j++) {
					// util.showObject({f:'extendSelect', i:i, j:j});
					var theValue = theList[i][valueKey];
					var makeSelected = (theValue === defaultSelectedValue);
					element.options[j] = new Option(theList[i][textKey],theValue, makeSelected, makeSelected);
				}
			}
			else {
				alert('extendPopulatedSelect(), element with id "' + elementId + '" \ndoes not exist.');
			}
		},
		getSelectOptionText: function(elementId) {
			// returns the text of the selected option in a select element
			var text = '';
			var element = util.getE(elementId);
			if (element && (element.selectedIndex >= 0)) {
				text = element.options[element.selectedIndex].text;
			}
			return text;
		},
		getEncodedURIComponent: function(theValue) {
			// returns an encoded URI component value if theValue contains special characters
			var pattern = /\W/; // The pattern /\W/ is equal [^a-zA-Z0-9_]
			if (pattern.test(theValue)) {
				theValue = encodeURIComponent(theValue);
			}
			return theValue;
		},
		getRepetitionSequenceLetter: function(theSequence, theIndex) {
			// theSequence is an array, i.e. the latin alphabet ['A', 'B', 'C', ...]
			// theIndex is an integer which refers a letter in theSequence.
			// We return theSequence value.
			// If theIndex is equal or greater the length of theSequence then we extend theSequence
			// by adding duplicates of the initial sequence, so the sequence becomes:
			// ['A', 'B', 'C', ..., 'Z', 'AA', 'BB', 'CC', ..., 'ZZ', 'AAA', 'BBB', 'CCC', ... 'ZZZ', 'AAAA', ...]
			var numberOfSequenceItems = theSequence.length;
			if (theIndex < numberOfSequenceItems) {
				return theSequence[theIndex];
			}
			else {
				// Return a repetition of a single letter
				var repetitionFactor = Math.floor(theIndex / numberOfSequenceItems) + 1;
				var theIndexWhichFits = theIndex % numberOfSequenceItems;
				var theLetter = theSequence[theIndexWhichFits];
				var theLetterRepetition = '';
				for (var i = 0; i < repetitionFactor; i++) {
					theLetterRepetition += theLetter;
				}
				return theLetterRepetition
			}
		},
		createHash: function(theArray, theKey) {
			var hasKey = (typeof theKey !== 'undefined');
			var s = '';
			for (var i = 0, len = theArray.length; i < len; i++) {
				if (hasKey) {
					s = '__h__' + theArray[i][theKey];
					theArray[s] = theArray[i];
				}
				else {
					s = '__h__' + theArray[i];
					theArray[s] = theArray[i];
				}
			}
		},
		h: function(name) {
			// converts a hash name to the above hash format
			return '__h__' + name;
		},
		/*
		createNewKeyValue: function(the_array, the_key) {
			// creates and returns a unique node name
			// create lookup
			var a = [];
			for (var i = 0; i < the_array.length; i++) {
				var theValue = the_array[i][the_key];
				a[theValue] = true;
			}
			// create new unique key value
			var isUnique = false;
			var count = 0;
			while (!isUnique) {
				count++;
				var newKeyValue = "new" + count;
				if (!a[newKeyValue]) {
					isUnique = true;
				}
			}
			return newKeyValue;
		},
		*/
		getArrayObject: function(theArray, theKey, theValue) {
			// returns an object reference from theArray where theKey has the value theValue
			var obj = {};
			for (var i = 0; i < theArray.length; i++) {
				if (theArray[i][theKey] === theValue) {
					obj = theArray[i];
					break;
				}
			}
			return obj;
		},
		getArrayObjectIndex: function(theArray, theKey, theValue) {
			// returns the index of the specified object
			for (var i = 0; i < theArray.length; i++) {
				if (theArray[i][theKey] === theValue) {
					return i;
				}
			}
		},
		getNextArrayObject: function(theArray, theKey, theValue) {
			// returns the next object of the given object in the array. If there is no next
			// object it will return the previous object. If there is no next or
			// previous object it will return null.
			var nextObject = null;
			var numberOfObjects = theArray.length;
			if (numberOfObjects > 1) {
				// get position of given object
				for (var i = 0; i < numberOfObjects; i++) {
					if (theArray[i][theKey] === theValue) {
						break;
					}
				}
				var nextIndex;
				if (i < (numberOfObjects - 1)) {
					nextIndex = i + 1;
				}
				else {
					nextIndex = i - 1;
				}
				nextObject = theArray[nextIndex];
			}
			return nextObject;
		},
		deleteArrayObject: function(theArray, theKey, theValue) {
			// Delete the object from theArray where theKey has the value theValue.
			// Ignore deletion if the object does not exist
			// get index of object to delete
			var objExists = false;
			for (var i = 0; i < theArray.length; i++) {
				if (theArray[i][theKey] === theValue) {
					objExists = true;
					break;
				}
			}
			// alert('index to delete: ' + i);
			if (objExists) {
				theArray.splice(i, 1);
			}
		},
		cloneObject: function(oriValue) {
			// returns a true copy of an array or object
			if (util.isArray(oriValue)) {
				// alert('isArray');
				var newValue = [];
				for (var i = 0; i < oriValue.length; i++) {
					newValue[i] = util.cloneObject(oriValue[i]);
				}
			}
			else if (util.isObject(oriValue)) {
				// alert('isObject');
				var newValue = {};
				for (var prop in oriValue) {
					newValue[prop] = util.cloneObject(oriValue[prop]);
				}
			}
			else {
				// no oject or array, return oriValue
				// alert('return oriValue');
				var newValue = oriValue;
			}
			// util.showObject(newValue);
			return newValue;
		},
		removeChildElements: function(s /* s is an elementID or an element*/) {
			var element = util.isObject(s) ? s : util.getE(s);
			while (element.lastChild) {
				var childElement = element.lastChild;
				element.removeChild(childElement);
			}
		},
		createE: function(elementType, attributes) {
			// Creates an element. attributes and labelText are optional arguments.
			// Note, attributes may contain html attributes and style attributes,
			// we check for differences here
			// I.e.:
			// util.createE('div');
			// util.createE('input', {id:id, type:'checkbox'});
			// util.createE('input', {id:id, type:'checkbox'}, {paddingLeft:'14px', margin:'5px'});
			var element = document.createElement(elementType);
			if (attributes !== null) {
				var validAttributes = (elementType !== 'img') ? util.validHtmlElementAttributes : util.validImgElementAttributes;
				for (var prop in attributes) {
					if (validAttributes[prop]) {
						// Apply element attribute
						element[prop] = attributes[prop];
					}
					else {
						// Apply element style attribute
						element.style[prop] = attributes[prop];
					}
				}
			}
			return element;
		},
		createT: function(s) {
			// Creates a new text node
			if (s === '&nbsp;') {
				s = '\u00a0';
			}
			return document.createTextNode(s);
		},
		updateT: function(elementId, text) {
			// Replaces any existing text of the element or creates a new text node if it does not yet exist
			var element = document.getElementById(elementId);
			if (element) {
				// alert('updateT() - element with text: ' + text);
				if (text === 0) {
					// alert('the text: ' + text + '\nis interpreted as the number 0');
					text = '0';
				}
				else if (text === '&nbsp;') {
					// alert('the text: ' + text + '\nis interpreted as space');
					text = '\u00a0'; // &nbsp;
				}
				var newText = document.createTextNode(text);
				if (element.firstChild) {
					// replace existing text
					var oldText = element.firstChild;
					element.replaceChild(newText, oldText);
				}
				else {
					// append new text
					element.appendChild(newText);
				}
			}
			else {
				alert('updateT() - element with elementId "' + elementId + '" does not exist.');
			}
		},
		chainE: function(/* html elements */) { // accepts any number of arguments
			// Chain elements appends the given html elements in two different ways
			// a.) Cascading (html elements are not given in an array)
			// Each previous element is the parent element, i.e.:
			// util.chainE(div, p, span, text);
			// span is the parent of text, p is the parent of span, div is the parent of p
			// b.) Tree (html elements are given in an array)
			// The first element of the array is the parent element, all following
			// elements in the array are appended to the 1st array element, i.e.:
			// util.chainE([div, p1, p2, p3, p4]);
			// All p elements (1-4) are appended to the 1st div element
			// Cascading and Tree can be combined, i.e.:
			// util.chainE(table, [tbody, [tr1, td1, text1], [tr2, td2, text2]]);
			// Arbitrary nesting of tree like arrays is allowed.
			var numberOfArguments = arguments.length;
			if (numberOfArguments > 1) {
				for (var i = numberOfArguments - 1; i > 0; i--) {
					var parentElement = arguments[i - 1];
					var childElement = arguments[i];
					if (util.isArray(parentElement)) {
						parentElement = util._chainElementsTreeLike(parentElement);
					}
					if (util.isArray(childElement)) {
						childElement =  util._chainElementsTreeLike(childElement);
					}
					// alert('chainE()' + '\nparentElement: ' + parentElement + '\nchildElement: ' + childElement);
					parentElement.appendChild(childElement);
				}
			}
			else {
				// There is only one argument, this must be an array to which we apply _chainElementsTreeLike()
				var element = util._chainElementsTreeLike(arguments[0]);
				// The var element is not required in this case, its just a placeholder for the returned element
			}
			// alert('chainE() completed' );
		},
		_chainElementsTreeLike: function(elements) {
			// See chainE() for details
			// alert('_chainElementsTreeLike(): ' + elements);
			var parentElement = elements[0];
			if (util.isArray(parentElement)) {
				parentElement = util._chainElementsTreeLike(parentElement);
			}
			for (var i = 1; i < elements.length; i++) {
				var childElement = elements[i];
				if (util.isArray(childElement)) {
					childElement = util._chainElementsTreeLike(childElement);
				}
				parentElement.appendChild(childElement);
			}
			// alert('We return parentElement: ' + parentElement);
			return parentElement;
		},
		setConfigItemListHeight: function() {
			var config_item_list_body = document.getElementById('config_item_list_body');
			// alert('setConfigItemListHeight(): ' + config_item_list_body);
			var pos = YD.getXY('config_item_list_body');
			var configItemListY = pos[1];
			var pageY = YD.getClientHeight();
			var configItemListHeight = pageY - (configItemListY + 40);
			config_item_list_body.style.height = configItemListHeight + 'px';
		},
		//
		// Encoding
		//
		/* Disabled - It looks like that the backslashes escaping problem only exists
		for File Manager, respectively the problem only exists when using GET, so
		when a pathname, i.e. C:\_logs\2007\, is part of the URL
		encodeDat: function(s) {
			// Encodes a string send from the client to the server via GET or POST
			// Note that we escape backslashes because Salang thinks we are escaping
			// something.
			s = s.replace(/\\/g, '\\');
			s = encodeURIComponent(s);
			return s;
		},
		*/
		//
		//
		//
		// XMLHttpRequest - server background calls
		//
		//
		//
		newXMLHttpRequest: function() {
			// Create new XMLHttpRequest object
			// If HTTP_factory is already known then use that one
			if (util.HTTP_factory !== null) return util.HTTP_factory();
			for (var i = 0; i < util.HTTP_factories.length; i++) {
				try {
					var factory = util.HTTP_factories[i];
					var request = factory();
					if (request !== null) {
						util.HTTP_factory = factory;
						return request;
					}
				}
				catch(e) {
					continue;
				}
			}
			// If we get here then no factory candidate succeeded,
			// throw an exception now and for all future calls.
			util.HTTP_factory = function() {
				throw new Error("XMLHttpRequest not supported");
			}
			util.HTTP_factory(); // Throw an error
		},
		serverPost: function(url, dat) {
			// dat is optional
			// add volatile node for error handling
			if (dat) {
				dat += '&volatile.is_server_background_call=true';
			}
			else {
				var dat = 'volatile.is_server_background_call=true';
			}
			var request = util.newXMLHttpRequest();
			// alert('request: ' + request);
			request.onreadystatechange = function() {
				if (request.readyState === 4) { // If the request is finished
					if (request.status === 200) { // If it was successful
//						alert(request.responseText.length);
						// If there is a response text
						if (request.responseText.length > 3) {
							eval('(' + request.responseText + ')');
						}
						/* DISABLED try and catch because it does not allow detailed debugging with Firebug
						try {
							eval('(' + request.responseText + ')');
						}
						catch (ex) {
							alertMsg = 'Inavlid response from server.\n\nServer response text:\n\n';
							alertMsg += request.responseText;
							alertMsg += '\n\n JavaScript error message:\n\n' + ex;
							alert(alertMsg);
						}
						*/
					}
				}
			}
			request.open('POST', url, true);
			request.send(dat);
		},
		authenticationFailureInServerBackgroundCall: function(dat) {
	//		if (dat.isSessionTimedOut) {
	//
	//			// Add volatile.session_timed_out=true to URL
	//			// before authentication.cfv is called the second time
	//			location.href = location.href + '&volatile.session_timed_out=true';
	//		}
	//		else {
	//
	//			// Unknown authentication failure
	//			// alert('authenticationFailureInServerBackgroundCall');
	//			alert(dat.errorMessage);
	//			// reload the current page so that we get the login form
	//			location.reload();
	//		}
			// KHP 08/Dec/2012 - ToDo - revise session time out handling
			// We suppose this is always a session time out, even if
			// dat.isSessionTimedOut is false
			location.href = location.href + '&volatile.session_timed_out=true';
		},
		labelToNodeName: function(theLabel) {
			// returns a valid node name of label or empty '' if the label contains no single alphanumerical character
			var label = theLabel.toLowerCase();
			var nodeName = '';
			var pattern = /[a-z0-9]/;
			if (pattern.test(label)) {
				// alert(label + ' Matched!');
				pattern = /[_a-z0-9]/;
				for (var i = 0; i < label.length; i++) {
					var s = label.charAt(i);
					var sUnicode = s.charCodeAt(0);
					// alert(s);\
					if (!pattern.test(s)) {
						if (sUnicode < 128) {
							s = '_';
						}
						else {
							// covert to hex
							s = sUnicode.toString(16);
						}
					}
					nodeName += s;
				}
			}
			return nodeName;
		},
		labelToUniqueNodeName: function(label, existingNodeNames, nodeNamePrefix) {
			// Returns a valid and unique node name.
			// The nodeNamePrefix is used as name in case that the label does not contain any alphanumerical English characters.
			var i = 0;
			var len = existingNodeNames.length;
			var s = '';
			var nodeNameLookup = {};
			// Create nodeNameLookup
			// nodeNameLookup is an object in the format
			// o._name1 = true
			// o._name2 = true
			// the starting underscore "_" is not part of the node name but added to avoid any name conflicts
			for (i = 0; i < len; i++) {
				nodeNameLookup['_' + existingNodeNames[i]] = true;
			}
			var newNodeName = util.labelToNodeName(label);
			if (newNodeName !== '') {
				i = 1;
				s = '';
			}
			else {
				// The label does not contain any alphanumerical characters.
				// Give it the node name prefix
				newNodeName = nodeNamePrefix;
				i = 1;
				s = '_' + i;
			}
			while (nodeNameLookup['_' + newNodeName + s]) {
				i++;
				s = '_' + i;
			}
			newNodeName = newNodeName + s;
			return newNodeName;
		},
		arrayToString: function(a) {
			var s = "";
			for (var i = 0; i <a.length; i++) {
				var obj = a[i];
				for (var prop in obj) {
					s += "{" + prop + ":" + obj[prop] + "}";
				}
			}
			return s;
		},
		setTabBarSpace: function(parentElementId, spacerCellId) {
			// Sets the space of a tab-bar if the tab-bar consists of GUI controls on the right side
			// so that the tab-bar table expands to the length of the parent panel.
			// The spacer cell is a td element between the left tabs and right GUI controls.
			var region = YD.getRegion(parentElementId);
			var parentElementWidth = region.width;
			var cellElement = util.getE(spacerCellId);
			var table = cellElement.parentNode;
			var tableRegion = YD.getRegion(table);
			var tableWidth = tableRegion.width;
			// alert('parentElementWidth: ' + parentElementWidth + '\ntableWidth: ' + tableWidth);
			var deltaWidth = parentElementWidth - tableWidth;
			if (deltaWidth > 0) {
				// We apply a padding so that the table width can flow upon text sizing!
				cellElement.style.paddingLeft = deltaWidth + 'px';
			}
		},
		//
		// Date
		//
		salangDateToSimpleDateObject: function(salangDate) {
			// converts a salang date, i.e. 18/Jan/2006 to a javascript object in the format
			// o.year = 2006
			// o.month = 0
			// o.day = 18
			var salangJsMonths = {jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9 ,nov:10, dec:11};
			var dat = salangDate.split('/');
			// util.showObject({"salangDateToSimpleDateObject() - salangDate argument": salangDate});
			// util.showObject({"salangDateToSimpleDateObject() - dat": dat});
			var obj = {};
			obj.year = parseInt(dat[2], 10);
			obj.month = salangJsMonths[dat[1].toLowerCase()];
			obj.day = parseInt(dat[0], 10); // make sure the radix of base 10 is defined so that i.e. "08" isn't converted to "0" which could occur in ECMAScript v3
			// util.showObject({"salangDateToSimpleDateObject() - obj": obj});
			return obj;
		},
		//
		//
		// Round box (i.e. panel-50)
		//
		//
//		getRoundBox: function(elementId, classNumber, contentElement) {
			// Creates a div with round corners (multiple div approach)
			// panelNumber is the number of the CSS class name, i.e. "50" for panel-50.
			// contentElement is the element which is inserted into the round box body section.
//			var div = util.createE('div', {id:elementId, className:'panel-' + classNumber, display:'none'});
//			var headerDiv = util.createE('div', {className:'panel-' + classNumber + '-header'});
//			var headerDivTop = util.createE('div', {className:'panel-' + classNumber + '-header-top'});
//			var headerDivTopText = util.createT('&nbsp;');
//			var headerDivBottom = util.createE('div', {className:'panel-' + classNumber + '-header-bottom'});
//			var headerDivBottomText = util.createT('&nbsp;');
//			var bodyDiv = util.createE('div', {className:'panel-' + classNumber + '-body'});
//			var footerDiv = util.createE('div', {className:'panel-' + classNumber + '-footer'});
//			var footerOffsetDiv = util.createE('div', {className:'panel-' + classNumber + '-footer-offset'});
//			var footerOffsetText = util.createT('&nbsp;');
//
//			util.chainE(div, [headerDiv, [headerDivTop, headerDivTopText], [headerDivBottom, headerDivBottomText]]);
//			util.chainE(div, bodyDiv, contentElement);
//			util.chainE(div, footerDiv, footerOffsetDiv, footerOffsetText);
//			return div;
//		},
		//
		//
		// File manager window
		//
		//
		fileManagerWindow: {
			theWindow: null,
			open: function(pathnameElementId) {
				// alert('util.fileManagerWindow.open()');
				var url = '?dp=file_manager.file_manager_page';
				url += '&peid=' + encodeURIComponent(pathnameElementId);
				var windowName = 'file_manager';
				var width = 700;
				var height = 480;
				// check if a path is defined in the pathname field
				// if a path exists then start the file manager with the defined path
				var pathname = util.getF(pathnameElementId);
				// alert('pathname not encoded: ' + pathname);
				if (pathname !== '') {
					pathname = pathname.replace(/\\/g, '__HexEsc__5C');
					url += '&pathname=' + encodeURIComponent(pathname);
				}
				var left = parseInt((screen.availWidth/2) - (width/2), 10);
				var top = parseInt((screen.availHeight/2) - (height/2), 10);
				util.fileManagerWindow.theWindow = window.open(url,windowName,'location=no,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',status=yes,scrollbars=yes,resizable=yes');
				util.fileManagerWindow.theWindow.focus();
			},
			setPathnameValue: function(pathnameElementId, pathname) {
				// This function is initiated from file manager,
				// it sets the pathname element to the given pathname
				util.setF(pathnameElementId, pathname);
			}
		},
//		initAdminDropDownMenu: function() {
//
//			// Init Reports Config navigation bar
//
//			// Profiles menu
//			if (util.getE('rc_nav:profiles_btn') !== null) {
//				util.dropDownMenu.add('rc_nav:profiles_btn', 'rc_nav:profiles_drop_down');
//			}
//
//			// Config menu
//			if (util.getE('rc_nav:config_btn') !== null) {
//				util.dropDownMenu.add('rc_nav:config_btn', 'rc_nav:config_drop_down');
//			}
//
//			// Tools menu
//			if (util.getE('rc_nav:tools_btn') !== null) {
//				util.dropDownMenu.add('rc_nav:tools_btn', 'rc_nav:tools_drop_down');
//			}
//
//			// Admin menu
//			if (util.getE('rc_nav:admin_btn') !== null) {
//				util.dropDownMenu.add('rc_nav:admin_btn', 'rc_nav:admin_drop_down');
//			}
//		},
		//
		//
		// Help window
		//
		//
		helpWindow: {
			theWindow: null,
			centralUrl: '?dp+docs.technical_manual.toc',
			contextUrl: '', // Set upon init, the link refers to a specific topic group, i.e. Log Filters or Reports
			init: function(contextUrl) {
				// alert('helpWindow.init()');
				YE.addListener('central_help_btn', 'click', util.helpWindow.openCentralHelp);
				if (contextUrl && contextUrl !== '') {
					util.helpWindow.contextUrl = contextUrl;
					YE.addListener('context_help_btn', 'click', util.helpWindow.openContextHelp);
				}
			},
			openCentralHelp: function(evt) {
				// Opens the help window via central help button
				YE.preventDefault(evt);
				util.helpWindow.open(util.helpWindow.centralUrl);
			},
			openContextHelp: function(evt) {
				// Opens the help window via toolbar context help button
				YE.preventDefault(evt);
				util.helpWindow.open(util.helpWindow.contextUrl);
			},
			openGeneralHelp: function(evt) {
				// Opens the help window from any link in the GUI. The URL must be specified
				// as regular anchor because we get the URL from this anchor.
				YE.preventDefault(evt);
				var element = evt.target || evt.srcElement;
				var url = element.href;
				util.helpWindow.open(url);
			},
			open: function(url) {
//				var width = YD.getViewportWidth() - 120;
//				var height = YD.getViewportHeight() - 60;
				var width = 1024;
				var height = 700;
				var features = 'width=' + width + ',height=' + height + ',location=yes,menubar=yes,toolbar=yes,status=yes,scrollbars=yes,resizable=yes';
				util.helpWindow.theWindow = window.open(url, 'help', features);
				util.helpWindow.theWindow.focus();
			}
		},
		//
		//
		// About
		//
		//
		about: {
			isDisplayed: false,
			toggleAboutSection: function() {
				var showAboutSection = !util.about.isDisplayed;
				util.showE('product_bar:about_section', showAboutSection);
				util.about.isDisplayed = showAboutSection;
			}
		},
		//
		//
		// Error / Alert handling
		//
		//
		errorInServerBackgroundCall: {
			panel: null,
			init: function() {
				//
				// Create the error panel
				//
				var panelId = 'error_in_server_background_call:panel';
				var bodyElements = document.getElementsByTagName('body');
				var body = bodyElements[0];
				var mainDiv = util.createE('div', {id:panelId, className:'panel-50'});
				util.chainE(body, mainDiv);
				// We create the alert panel via innerHTML because it doesn't correctly render
				// when creating it via DOM elements in Firefox
				var htmlString = '<div class="panel-50-body">';
				htmlString += '<div class="panel-50-form" style="width:340px;background-color:White">';
				htmlString += '<p style="font-weight:bold;color:Red">' + langVar('lang_stats.error_handling.error_while_processing_last_request') + '</p>';
				htmlString += '<a id="error_in_server_background_call:view_alert_msg_btn" href="?dp=alert" target="_blank">';
				htmlString += langVar('lang_stats.error_handling.click_here_to_view_alert_msg');
				htmlString +=  '</a>';
				htmlString += '</div>'; // panel-50-form
				htmlString += '<div style="text-align:center;padding:12px"><a id="error_in_server_background_call:close_alert_btn" href="javascript:;">';
				htmlString += langVar('lang_stats.btn.close');
				htmlString +=  '</a></div>';
				htmlString += '</div>'; // panel-50-body
				mainDiv.innerHTML = htmlString;
				//
				// Init the error panel object
				//
				var panelObj = {
					panelId: panelId,
					panelClassName: 'panel-50',
					panelHeaderLabel: langVar('lang_stats.error_handling.product_alert_info'),
					left: 60,
					top: 60,
					zIndex: 5000,
					isCover: true,
					isCloseButton: false
				};
				util.errorInServerBackgroundCall.panel = new util.Panel3(panelObj);
				YE.addListener('error_in_server_background_call:close_alert_btn', 'click', util.errorInServerBackgroundCall.close);
			},
			open: function(errorId) {
				if (!util.errorInServerBackgroundCall.panel) {
					util.errorInServerBackgroundCall.init();
				}
				var viewAlertBtn = util.getE('error_in_server_background_call:view_alert_msg_btn');
				viewAlertBtn.href = '?dp=alert&ei=' + errorId;
				util.errorInServerBackgroundCall.panel.open();
			},
			close: function() {
				util.errorInServerBackgroundCall.panel.close();
				// If this is the New Profile Wizard window
				// then restore the new profile wizard page
				try {
					restoreNewProfileWizardPageAfterError();
				}
				catch(msg) {}
			}
		},
		//
		//
		// Trial mode utilities
		//
		//
		trialLicensingTier: {
			reminderPanel: null,
			init: function(showTrialReminder, days_left) {
				// Init the change trial licensing tier button
				var a = [
					'prompt_for_trial_tier:lite',
					'prompt_for_trial_tier:pro',
					'prompt_for_trial_tier:enterprise'
				];
				YE.addListener(a, 'click', util.trialLicensingTier.change);
				// util.trialLicensingTier.btn.enable();
				// YE.addListener(document, 'unload', util.trialLicensingTier.exit);
				// Enable dropDownMenu
				util.dropDownMenu.add('change_licensing_tier:btn', 'prompt_for_trial_tier:drop_down');
				if (showTrialReminder) {
					// This checks and sets a flag in "system" so that the reminder
					// isn't shown twice.
					var url = '?dp=util.check_show_trial_reminder';
					var dat = 'v.fp.page_token=' + pageInfo.changeTrialLicensingTierToken;
					dat += '&v.fp.days_left=' + days_left;
					util.serverPost(url, dat);
				}
			},
			change: function() {
				var elementId = this.id;
				// Check if we have any unsaved changes on the current page
				if (adminConfig.getIsExitPagePermission()) {
					var bodyElements = document.getElementsByTagName('body');
					var bodyElement = bodyElements[0];
					bodyElement.style.display = 'none';
					// User clicked on a link to change the trial mode
					var elementDat = elementId.split(':');
					var trialLicensingTier = elementDat[1];
					// alert('change trial mode to: ' + trialLicensingTier);
					var url = '?dp=util.change_trial_licensing_tier';
					var dat = 'v.fp.page_token=' + pageInfo.changeTrialLicensingTierToken;
					dat += '&v.fp.trial_licensing_tier=' + trialLicensingTier;
					util.serverPost(url, dat);
				}
			},
			changeResponse: function() {
				location.reload(true);
			},
			showTrialReminderResponse: function(showTrialReminder) {
				if (showTrialReminder) {
					var panelObj = {
						panelId: 'trial_reminder:panel',
						panelClassName: 'panel-30',
						panelHeaderLabel: langVar('lang_admin.trial.reminder'),
						zIndex: 20,
						closeEvent: util.trialLicensingTier.closeTrialReminder
					};
					util.trialLicensingTier.reminderPanel = new util.Panel3(panelObj);
					YE.addListener('trial_reminder:close_btn', 'click', util.trialLicensingTier.closeTrialReminder);
					util.trialLicensingTier.reminderPanel.prePositionAtCenter();
					util.trialLicensingTier.reminderPanel.open();
				}
			},
			closeTrialReminder: function() {
				util.trialLicensingTier.reminderPanel.close();
			}
		},
		resolveLangVar: function(langVarPath, jsLangVarPath) {
			var langVarValue = '';
			if (util.lang[jsLangVarPath]) {
				langVarValue = util.lang[jsLangVarPath];
			}
			else {
				var url = '?dp=util.resolve_lang_var';
				url += '&pathname=' + encodeURIComponent(langVarPath);
				var request = util.newXMLHttpRequest();
				// Note, this is a synchronous server call
				request.open('GET', url, false);
				request.send(null);
				if (request.status === 200) {
					// alert(request.responseText);
					langVarValue = request.responseText;
					// Set language variable in util.lang for reuse
					util.lang[jsLangVarPath] = langVarValue;
					// util.showObject(xmlhttp.responseText);
				}
			}
			return langVarValue;
		},
		positionAndShowDropDownElement: function(btnElement, menuElement) {
			// This sets the position of a drop-down element relative
			// to the button and available space.
			var clientRegion = YD.getClientRegion();
			var clientWidth = clientRegion.width;
			var clientHeight = clientRegion.height;
//			util.showObject(clientRegion);
			var btnRegion = YD.getRegion(btnElement);
			var btnTop = btnRegion.top
			var btnBottom = btnRegion.bottom;
			var btnLeft =  btnRegion.left;
			var btnRight =  btnRegion.right;
//			util.showObject(btnRegion);
			// Get region of drop down menu
			menuElement.style.visibility = 'hidden';
			menuElement.style.top = 0;
			menuElement.style.left = 0;
			menuElement.style.display = 'block';
			var menuRegion = YD.getRegion(menuElement);
//			util.showObject(menuRegion);
			var menuWidth = menuRegion.width;
			var menuHeight = menuRegion.height;
			// Get menu top and menu left
			var alignLeft = false;
			var alignBottom = false;
			// Check if we align menu left or right of button
			if ((btnLeft + menuWidth) <= clientWidth) {
				// Align left of button
				alignLeft = true;
			}
			else if (btnRight - menuWidth >= 0) {
				// Align right of button
				alignLeft = false;
			}
			else {
				// Align on the side where more space is left
				var spaceOnRight = clientWidth - btnLeft;
				var spaceOnLeft = btnRight;
				if (spaceOnRight >= spaceOnLeft) {
					// Align left of button
					alignLeft = true;
				}
				else {
					// Align right of button
					alignLeft = false;
				}
			}
			// Check if we align menu bottom or top of button
			var menuLeft = alignLeft ? btnLeft : btnRight - menuWidth;
			var menuTop = btnBottom;
//			console.log('menuTop: ' + menuTop);
//			console.log('menuLeft: ' + menuLeft);
			// Set final position
			menuElement.style.top = menuTop + 'px';
			menuElement.style.left = menuLeft + 'px';
			// Show the menu
			menuElement.style.visibility = 'visible';
		},
		//
		//
		//
		// MISCELLANEOUS
		//
		//
		//
		//
		//
		// showObject handling
		//
		//
		showObjectWindowId: '', // Used with showObject, keeps the showObjectWindowId
		createShowObjectWindow: function() {
			var bodyElements = document.getElementsByTagName('body');
			var body = bodyElements[0];
			var showObjectWindowId = util.getUniqueElementId();
			var mainDivProperties = {
				id:showObjectWindowId,
				position:'absolute',
				top:0,
				right:0,
				borderStyle: 'solid',
				borderWidth: '1px',
				borderColor: 'Silver',
				backgroundColor: 'White',
				zIndex: 5000
			};
			var objectDivProperties = {
				id:showObjectWindowId + ':body',
				width:'800px',
				height:'700px',
				overflow: 'scroll'
			}
			var mainDiv = util.createE('div', mainDivProperties);
			var headerDiv = util.createE('div', {padding:'4px', backgroundColor:'#f5f5f5'});
			var a = util.createE('a', {id:showObjectWindowId + ':close_btn', href:'javascript:;'});
			var aText = util.createT('Close Object Window');
			var objectDiv = util.createE('div', objectDivProperties);
			util.chainE(headerDiv, a, aText);
			util.chainE(body, [mainDiv, headerDiv, objectDiv]);
			YE.addListener(showObjectWindowId + ':close_btn', 'click', util.closeShowObjectWindow);
			util.showObjectWindowId = showObjectWindowId;
		},
		closeShowObjectWindow: function() {
			var showObjectWindowId = util.showObjectWindowId;
			// Clean object viewer
			util.removeChildElements(showObjectWindowId + ':body');
			util.hideE(showObjectWindowId);
		},
		showObject: function(obj, comment) {
			// showObject outputs objects to a debug window
			// The comment argument is optional
			if (util.showObjectWindowId === '') {
				util.createShowObjectWindow();
			}
			var showObjectWindowId = util.showObjectWindowId;
			// Create a new div which we append to the already existing object viewer
			var container = util.getE(showObjectWindowId + ':body');
			var div = util.createE('div', {padding:'0 14px', borderBottom:'1px solid Silver', zIndex: 5000});
			util.chainE(container, div);
			var text = '';
			if (comment) {
				text += '<strong>' + comment + '</strong><br />';
			}
			var objAsString = JSON.stringify(obj, null, '&nbsp;');
			text += '<pre>' + objAsString.replace(/\u000A/g, '<br />') + '</pre>';
			div.innerHTML = text;
			util.showE(showObjectWindowId);
		}
	}
}());
/*
	CommandLink (used for anchor buttons)
*/
// util.CommandLink = function(elementId, buttonEvent, isDisabled) {
util.CommandLink = function(elementId, buttonEvent, defaultEnabled, options, contextObj /* optional */) {
	// This initializes a command link
	// options are
	// options.classNameEnabled
	// options.classNameDisabled
	var element = util.getE(elementId);
	this.element = element;
	this.buttonEvent = buttonEvent;
	this.isEnabled = defaultEnabled;
	this.classNameEnabled = options.classNameEnabled;
	this.classNameDisabled = options.classNameDisabled;
	this.contextObj = contextObj;
	// Set default state if the command link actually exists
	if (element !== null) {
		if (defaultEnabled) {
			element.className = this.classNameEnabled;
			if (contextObj == null) {
				YAHOO.util.Event.addListener(element, 'click', buttonEvent);
			}
			else {
				YAHOO.util.Event.addListener(element, 'click', buttonEvent, contextObj);
			}
		}
		else {
			element.className = this.classNameDisabled;
		}
	}
}
util.CommandLink.prototype.enable = function(enableElement) {
	// If command link exists
	if (this.element !== null) {
		// The makeEnabled argument is optional
		var enableElement = enableElement !== null ? enableElement : true;
		var makeEnabled = typeof enableElement !== 'undefined' ? enableElement : true;
		// Only enable the button if it is not yet enabled
		if (makeEnabled) {
			if (!this.isEnabled) {
				var element = this.element;
				if (this.contextObj == null) {
					YAHOO.util.Event.addListener(element, 'click', this.buttonEvent);
				}
				else {
					YAHOO.util.Event.addListener(element, 'click', this.buttonEvent, this.contextObj);
				}
//				YAHOO.util.Event.addListener(element, 'click', this.buttonEvent);
				element.className = this.classNameEnabled;
				this.isEnabled = true;
			}
		}
		else {
			this.disable();
		}
	}
}
util.CommandLink.prototype.disable = function() {
	// Don't disable the button if it is already disabled
	if (this.element !== null && this.isEnabled) {
		var element = this.element;
		YAHOO.util.Event.removeListener(element, 'click', this.buttonEvent);
		element.className = this.classNameDisabled;
		this.isEnabled = false;
	}
}
/**
*
*
*
* ToolbarButton class (could eventually replace the CommandLink class, so that we only use one class!)
*
* Creates an object for a toolbar button composed of an anchor with an image.
* The ToolbarButton object considers rbac state by defining a "ignore" method.
* I.e.:, saveBtn.ignore() will hide the button and ignore it any other method
* which is applied so that hoverOn(), disable() or enable() does not have any effect.
* This allows us to code buttons as in non-rbac mode and simply ignore them in case
* that there is no permission to use the saveBtn or any other RBAC feature.
*
* Arguments:
* 	buttonItemName: This is not the element ID but a simple button item name which acts as a referece in buttonsDb and from which we compose the elementId
* 	buttonEvent: The event which is fired upon onclick
* 	buttonsDb: Includes general button properties and all toolbar buttons, it has following format:
*	 buttonsDb = {
*		classNameEnabled: 'btn-10',
*		classNameDisabled: 'btn-10-disabled',
*		classNameHover: 'btn-10-hover',
*   	enabled: {"_save_changes:"new Image(), "_new_role":new Image()},
*   	disabled: {"_save_changes:"new Image(), "_new_role":new Image()},
*	}
*	buttonsDb.enabled._save_changes.src = "/picts/toolbars/save_changes.gif",
*	buttonsDb.enabled._new_role.src = "/picts/toolbars/new_role.gif",
*	buttonsDb.disabled._save_changes.src = "/picts/toolbars/save_changes_dis.gif",
*	buttonsDb.disabled._new_role.src = "/picts/toolbars/new_role_dis.gif"
*
*
*	// Note, all button item Id's start internally with an underbar to avoid any name conflicts
*	// The elementId is a composistion of "toolbar:buttonItemID"
*
*
*
*
*/
util.ToolbarButton = function(buttonName, buttonEvent, buttonsDb) {
	// By default we set all buttons to the disabled state, that's how
	// the html code is specified.
	// ignore=true will ignore this button upon all applied methods.
	// We also set buttonName to true if the button does not exist due
	// RBAC or licensing features. So we must always check for button
	// existence!
	var buttonId = '_' + buttonName;
	var elementId = 'toolbar:' + buttonName;
	var btn = util.getE(elementId);
	this.elementId = elementId;
	this.buttonEvent = buttonEvent;
	this.isDisabled = true;
	this.ignore = (btn !== null) ? false : true;
	this.classNameEnabled = buttonsDb.classNameEnabled;
	this.classNameDisabled = buttonsDb.classNameDisabled;
	this.classNameHover = buttonsDb.classNameHover;
	// Images are optional
	this.srcEnabled = buttonsDb.enabled[buttonId]['src'];
	this.srcDisabled = buttonsDb.disabled[buttonId]['src'];
}
util.ToolbarButton.prototype.enable = function(/* optional */makeEnabled) {
	if (!this.ignore) {
		if (typeof makeEnabled === 'undefined') {
			makeEnabled = true;
		}
		// Only enable the button if it is not yet enabled
		if (makeEnabled) {
			if (this.isDisabled) {
				var btn = util.getE(this.elementId);
				YAHOO.util.Event.addListener(btn, 'click', this.buttonEvent);
				btn.className = this.classNameEnabled;
				var img = btn.firstChild;
				img.src = this.srcEnabled;
				this.isDisabled = false;
			}
		}
		else {
			this.disable();
		}
	}
}
util.ToolbarButton.prototype.disable = function() {
	// Don't disable the button if it is already disabled
	if (!this.ignore && !this.isDisabled) {
		// alert('disable button');
		var btn = util.getE(this.elementId);
		YAHOO.util.Event.removeListener(btn, 'click', this.buttonEvent);
		btn.className = this.classNameDisabled;
		var img = btn.firstChild;
		img.src = this.srcDisabled;
		this.isDisabled = true;
	}
}
util.ToolbarButton.prototype.disableAndIgnore = function() {
	// This sets a button to disabled and ignored state
	if (!this.ignore) {
		// if not yet disavled
		if (!this.isDisabled) {
			this.disable();
		}
		this.ignore = true;
	}
}
util.ToolbarButton.prototype.hoverOn = function() {
	if (!this.ignore) {
		// TODO
	}
}
util.ToolbarButton.prototype.hoverOff = function() {
	if (!this.ignore) {
		// TODO
	}
}
/*
	Tabs2 class
*/
util.Tabs2 = function(tabElementIds, tabEvent) {
	this.tabElementIds = tabElementIds;
	this.tabEvent = tabEvent;
	this.selectedTabElementId = null;
	// init the tabs
	for (var i = 0; i < tabElementIds.length; i++) {
		// alert('init the tabs: ' + tabElementIds[i]);
		YAHOO.util.Event.addListener(tabElementIds[i], 'click', tabEvent);
		YAHOO.util.Event.addListener(tabElementIds[i], 'mouseover', this.hoverOn);
		YAHOO.util.Event.addListener(tabElementIds[i], 'mouseout', this.hoverOff);
	}
}
util.Tabs2.prototype.setActiveTab = function(tabElementId) {
	// alert('util.Tabs2.prototype.setActiveTab: ' + tabElementId);
	var li;
	var a;
	var selectedTabElementId = this.selectedTabElementId;
	// If the tab isn't already selected
	if (selectedTabElementId !== tabElementId) {
		// Reset selected tab
		if (selectedTabElementId !== null) {
			// alert('Tabs2 class - Reset selected tab');
			li = util.getE(selectedTabElementId);
			a = li.firstChild;
			li.className = '';
			a.className = '';
			YAHOO.util.Event.addListener(selectedTabElementId, 'click', this.tabEvent);
			YAHOO.util.Event.addListener(selectedTabElementId, 'mouseover', this.hoverOn);
			YAHOO.util.Event.addListener(selectedTabElementId, 'mouseout', this.hoverOff);
		}
		// Select tab of given tabElementId
		// alert('Tabs2 class - Select tab of given tabElementId: ' + tabElementId);
		li = util.getE(tabElementId);
		a = li.firstChild;
		li.className = 'active';
		a.className = 'active';
		YAHOO.util.Event.removeListener(tabElementId, 'click', this.tabEvent);
		YAHOO.util.Event.removeListener(tabElementId, 'mouseover', this.hoverOn);
		YAHOO.util.Event.removeListener(tabElementId, 'mouseout', this.hoverOff);
		// remove focus
		a.blur();
		this.selectedTabElementId = tabElementId;
	}
	// util.showObject(this);
	// alert('util.Tabs2.prototype.setActiveTab - this.selectedTabElementId: ' + this.selectedTabElementId);
}
util.Tabs2.prototype.hide = function(tabElementId) {
	// hide the tab or tabs
	util.hideE(tabElementId);
}
util.Tabs2.prototype.show = function(tabElementId) {
	// show the tab or tabs
	util.showE(tabElementId);
}
util.Tabs2.prototype.hoverOn = function() {
	var li = this;
	var a = li.firstChild;
	li.className = 'hover';
	a.className = 'hover';
}
util.Tabs2.prototype.hoverOff = function() {
	var li = this;
	var a = li.firstChild;
	li.className = '';
	a.className = '';
}
/*
	Tab3 class (should replace Tab and Tab2 classs)
	This class fixes a IE bug where hiding a li element which
	is not the last li element messes up the tab display.
	Tab3 hides li elements in sequence, beginning from
	the last li element and re-creates the tab labels.
*/
util.Tabs3 = function(ulContainer, allTabIds, tabEvent) {
	// 'ulContainer' is the elementId of the tab element
	// 'allTabIds' is a simple array with all tab Id's (not element Id's!), i.e.:
	// ['graphs', 'graph_options', 'table']
	// The element Id's for the list elements are created here. We also read the labels and
	// save them within a new tabs object, because we need the labels if we change the tab sequence.
	// tabs must contain all possible tabs, respectively as they exist in the ul element, in the right order.
	// The tabs can later be set by setSequence to any number or order of the given tabs.
	// We create a tab object to handle the tabs, which looks as follows:
	// The tabsDb contains all tabs identified by ID ...
	/*
	 tabsDb = {
		graphs: {
			label: 'Graphs'
			currentTabIndex: 0
		},
		graph_options: {
			label: 'Graph Options'
			currentTabIndex: 0
		}
		...
	}
	*/
	// The tab li elements become an ID with tabIndex (0,1,2,...) in combination with an idPrefix, i.e.:
	// ue_id:0
	// ue_id:1
	var idPrefix = util.getUniqueElementId();
	var tabsDb = {};
	this.idPrefix = idPrefix;
	this.allTabIds = allTabIds;
	this.tabEvent = tabEvent;
	this.selectedTabIndex = -1; // 0, 1, 2, ... refers to the tab array position
	this.tabSequence = []; // initialized upon setSequence() , i.e. ['graphs', 'table'] will only show the graphs and table tab
	var ul = util.getE(ulContainer);
	var liElements = ul.getElementsByTagName('li');
	// init the tabs
	for (var i = 0; i < allTabIds.length; i++) {
		var tabId = allTabIds[i];
		var elementId = idPrefix + ':' + i;
		var li = liElements[i];
		li.id = elementId;
		var a = li.firstChild;
		var aText = a.firstChild;
		var label = aText.nodeValue;
		// alert('tab label: ' + label);
		tabsDb[tabId] = {label: label};
		// tabsDb[tabId]['currentTabIndex'] = -0;
		YAHOO.util.Event.addListener(li, 'click', this.tabActivated, this);
		YAHOO.util.Event.addListener(li, 'mouseover', this.hoverOn);
		YAHOO.util.Event.addListener(li, 'mouseout', this.hoverOff);
	}
	this.tabsDb = tabsDb;
	// util.Tabs3SelfReferences[idPrefix] = this;
}
util.Tabs3.prototype.tabActivated = function(evt, self) {
	// Activates the tab function defined in this.tabEvent, which
	// is a function in the module of the tabs object.
	// We return the tabId as argument
	// alert('util.Tabs3.prototype.tabActivated() - this.id: ' + this.id);
	var elementId = this.id;
	var dat = elementId.split(':');
	var idPrefix = dat[0];
	var tabIndex = parseInt(dat[1], 10);
	// alert('tabIndex: ' + tabIndex);
	// var self = util.Tabs3SelfReferences[idPrefix];
	var tabSequence = self.tabSequence;
	var tabId = tabSequence[tabIndex];
	// alert('util.Tabs3.prototype.tabActivated() - tabId: ' + tabId);
	self.tabEvent(tabId);
}
util.Tabs3.prototype.setSequence = function(tabSequence, setToTabId) {
	// alert('setSequence()');
	var idPrefix = this.idPrefix;
	var allTabIds = this.allTabIds;
	var tabsDb = this.tabsDb;
	var i;
	var newSelectedTabIndex = -1;
	for (i = 0; i < tabSequence.length; i++) {
		var tabId = tabSequence[i];
		var tabElementId = idPrefix + ':' + i;
		var tabLi = util.getE(tabElementId);
		var tabAnchor = tabLi.firstChild;
		var existingTextNode = tabAnchor.firstChild;
		var newTextNode = document.createTextNode(tabsDb[tabId].label);
		tabAnchor.replaceChild(newTextNode, existingTextNode);
		// display the tab
		if (tabLi.style.display === 'none') {
			// alert('Set style.display of tab index: ' + i);
			tabLi.style.display = '';
		}
		// get the index of the activeTabId
		if (tabId === setToTabId) {
			newSelectedTabIndex = i;
		}
	}
	if (tabSequence.length < allTabIds.length) {
		// hide all further tab elements
		for (i = tabSequence.length; i < allTabIds.length; i++) {
			util.hideE(idPrefix + ':' + i);
		}
	}
	if (newSelectedTabIndex > -1) {
		// make the tab active
		this.setActiveTabByIndex(newSelectedTabIndex);
	}
	/*
	else {
		// There is some mismatch with setToTabId
		alert('Tabs3.setSquence - invalid setToTabId: ' + setToTabId);
	}
	*/
	this.tabSequence = tabSequence;
}
util.Tabs3.prototype.setActiveTab = function(tabId) {
	// Get the index of the tabId and then set the tab by setActiveTabByIndex()
	// alert('util.Tabs3.prototype.setActiveTab - tabId: ' + tabId);
	var tabSequence = this.tabSequence;
	for (var i = 0; i < tabSequence.length; i++) {
		if (tabId === tabSequence[i]) {
			this.setActiveTabByIndex(i);
			break;
		}
	}
}
util.Tabs3.prototype.setActiveTabByIndex = function(newTabIndex) {
	// Only set the tab if it is not already active
	var selectedTabIndex = this.selectedTabIndex;
	if (selectedTabIndex !== newTabIndex) {
		// If the tab isn't already selected
		var idPrefix = this.idPrefix;
		// var tabElementIds = this.tabElementIds;
		var li;
		var a;
		if (selectedTabIndex !== -1) {
			// Reset selected tab
			// alert('Tabs3 class - Reset selected tab');
			li = util.getE(idPrefix + ':' + selectedTabIndex);
			a = li.firstChild;
			li.className = '';
			a.className = '';
			YAHOO.util.Event.addListener(li, 'click', this.tabEvent);
			YAHOO.util.Event.addListener(li, 'mouseover', this.hoverOn);
			YAHOO.util.Event.addListener(li, 'mouseout', this.hoverOff);
		}
		// Select tab of newTabIndex
		// alert('Tabs2 class - Select tab of given tabElementId: ' + tabElementId);
		li = util.getE(idPrefix + ':' + newTabIndex);
		a = li.firstChild;
		li.className = 'active';
		a.className = 'active';
		YAHOO.util.Event.removeListener(li, 'click', this.tabEvent);
		YAHOO.util.Event.removeListener(li, 'mouseover', this.hoverOn);
		YAHOO.util.Event.removeListener(li, 'mouseout', this.hoverOff);
		// remove focus
		a.blur();
		this.selectedTabIndex = newTabIndex;
	}
}
util.Tabs3.prototype.hoverOn = function() {
	var li = this;
	var a = li.firstChild;
	li.className = 'hover';
	a.className = 'hover';
}
util.Tabs3.prototype.hoverOff = function() {
	var li = this;
	var a = li.firstChild;
	li.className = '';
	a.className = '';
}
/*
	dropDownMenu control
*/
util.dropDownMenu = {
	menuItems: {}, // contains obj as defined below, accessible by btnElementId
	activeMenuItemId: '',
	// Drop down region
	region: {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0
	},
	// Active mouse position tracked by mousemove
	pageX: 0,
	pageY: 0,
	add: function(btnElementId, dropDownElementId) {
		// alert('dropDownMenu.add()');
		// register menuItem by btnElementId
		var obj = {};
		obj.btnElementId = btnElementId;
		obj.dropDownElement = util.getE(dropDownElementId);
		util.dropDownMenu.menuItems[btnElementId] = obj;
		// add event
		YAHOO.util.Event.addListener(btnElementId, 'click', util.dropDownMenu.toggle);
	},
	toggle: function(evt) {
		// invoked upon click on btnElementId
		// open or close drop down
		var btnElement = evt.target || evt.srcElement;
		if (btnElement.nodeName !== 'A') {
			btnElement = btnElement.parentNode;
		}
		if (util.dropDownMenu.activeMenuItemId === '') {
			// Drop down menu is closed, open it.
			var obj = util.dropDownMenu.menuItems[btnElement.id];
			// get Region of reference element
			var btnRegion = YAHOO.util.Dom.getRegion(btnElement);
			var ul = obj.dropDownElement;
			ul.style.top = btnRegion.bottom + 'px';
			ul.style.left = btnRegion.left + 'px';
			ul.style.display = 'block';
			// Write ul region to obj which we check for move out coordinates
			var dropDownRegion = YAHOO.util.Dom.getRegion(ul);
			// Override the top region with the btn region so that we can move out of the ul,
			// We also add some padding around so that the ul does not immediately disappear.
			var region = util.dropDownMenu.region;
			region.top = btnRegion.top;
			region.left = dropDownRegion.left - 18;
			region.right = dropDownRegion.right + 18;
			region.bottom = dropDownRegion.bottom + 18;
			util.dropDownMenu.activeMenuItemId = btnElement.id;
			YAHOO.util.Event.addListener(document, 'mousemove', function(evt) {
				// Track mouse position
				util.dropDownMenu.pageX = evt.pageX;
				util.dropDownMenu.pageY = evt.pageY;
				setTimeout(function() {
					util.dropDownMenu.closeByMoveOut();
				}, 200);
			});
			YAHOO.util.Event.addListener(ul, 'mouseup', util.dropDownMenu.closeByMouseClick);
		}
		else {
			// drop down is open, close it
			util.dropDownMenu.close();
		}
	},
	close: function() {
		// Make sure the menu hasn't been closed yet.
		if (util.dropDownMenu.activeMenuItemId !== '') {
			var obj = util.dropDownMenu.menuItems[util.dropDownMenu.activeMenuItemId];
			var ul = obj.dropDownElement;
			YAHOO.util.Event.removeListener(document, 'mousemove');
			YAHOO.util.Event.removeListener(ul, 'mouseup');
			ul.style.display = 'none';
			util.dropDownMenu.activeMenuItemId = '';
		}
	},
	closeByMouseClick: function(evt) {
		// Close the drop down upon left mousedown
		var i = (!util.userAgent.isIE) ? evt.button : evt.button - 1;
		if (i === 0) {
			util.dropDownMenu.close();
		}
		// alert('closeByMouseClick: ' + evt.button);
	},
	closeByMoveOut: function() {
		// closes the drop down when moving out of it
		var region = util.dropDownMenu.region;
		var x = util.dropDownMenu.pageX;
		var y = util.dropDownMenu.pageY;
		if (x < region.left || x > region.right || y < region.top || y > region.bottom) {
			util.dropDownMenu.close();
		}
	}
}
/*
	navGroup replaces util.dropDownMenu. It can be used for single menu items with a drop down
	or multiple menu items with and without drop down.
*/
util.NavGroup = function(o) {
	// o.containerId => the container element of one or more buttons
	// o.menuBaseIds => an array with one or more relevant menu baseId's, i.e.:
	// rc_nav_config => This is the baseId
	// rc_nav_config:btn => This is the button of the given baseId
	// rc_nav_config:menu => This is the ul menu of the given baseId
	//
	// o.events => optional events per baseId which are fired when
	// opening the corresponding menu.
	var YE = YAHOO.util.Event;
	var containerId = o.containerId;
	var menuBaseIds = o.menuBaseIds;
	var events = o.hasOwnProperty('events') ? o.events : {};
	this.btnClassName = o.hasOwnProperty('btnClassName') ? o.btnClassName : '';
	this.btnActiveClassName = o.hasOwnProperty('btnActiveClassName') ? o.btnActiveClassName : '';
	this.menuBaseIds = {};
	this.openedMenuBaseId = ''; // Any opened menu
	this.onNavbar = false; // True if the mouse cursor is above navigation bar
	this.onMenu = false; // True if the mouse cursor is above the opened menu
	this.eventCount = 0;
	var baseId;
	var btnElement;
	var menuElement;
	var numberOfDropDowns = 0;
	// Track the drop down menus which actually exist in the GUI.
	for (var i = 0, l = menuBaseIds.length; i < l; i++) {
		baseId = menuBaseIds[i];
		btnElement = util.getE(baseId + ':btn');
		menuElement = util.getE(baseId + ':menu');
		if (typeof btnElement !== 'undefined') {
			// Keep a reference to the button and menu element.
			this.menuBaseIds[baseId] = {};
			this.menuBaseIds[baseId].btn = btnElement;
			this.menuBaseIds[baseId].menu = menuElement;
			// Note, we also need to handle buttons without a menu for
			// the _hoverOnButton event because hovering over a simple button
			// must yet close any open menu of another button.
			YE.addListener(btnElement, 'mouseover', this._hoverOnButton, this);
			if (typeof menuElement !== 'undefined') {
				// Assign individual click events because the single delegate event
				// has a problem with the context object "self"
				YE.addListener(btnElement, 'click', this._toggleMenu, this);
				if (events.hasOwnProperty(baseId)) {
					this.menuBaseIds[baseId].event = events[baseId];
				}
				numberOfDropDowns = numberOfDropDowns + 1;
			}
		}
	}
//	util.showObject(this.menuBaseIds);
	if (numberOfDropDowns > 0) {
		// Assign event to container element
		// YE.delegate(containerId, 'mouseover', this.moveInGroup, 'a', this);
		// Toggle menu - disabled because context object "self" does not work!
		// YE.delegate(containerId, 'click', this._toggleMenu, 'a', this);
		// This handles hovering over a button
		// This handles exiting the navbar
		YE.addListener(containerId, 'mouseenter', this._handleMouseenter, this);
		YE.addListener(containerId, 'mouseleave', this._handleMouseleave, this);
	}
}
util.NavGroup.prototype = {
	_getBaseId: function(elementId) {
		// This returns the baseId by removing the id suffix
		// :btn or :menu from the element id. Note,
		// baseId may contain colons as well, i.e.: re01:rows:btn,
		// where the baseId is 're01:rows'.
		var substringIndex = elementId.lastIndexOf(':');
		var baseId = elementId.substring(0, substringIndex);
		return baseId;
	},
	_toggleMenu: function(evt, self) {
		var id = this.id;
//		console.log('toggleMenu fired: ' + id);
		if (id.indexOf(':') !== -1) {
			// Get the baseId
			var baseId = self._getBaseId(id);
			var openedMenuBaseId = self.openedMenuBaseId;
			// Handle already opened menu
			if (openedMenuBaseId === '') {
				// No menu is open yet, open it
				self._openMenu(baseId);
			}
			else if (openedMenuBaseId === baseId) {
				// Menu is open, close it
				self._closeMenu();
			}
			// Remove focus
			this.blur();
		}
	},
	_openMenu: function(baseId) {
//		console.log('_openMenu of baseId: ' + baseId);
		// Position the menu
		var baseObj = this.menuBaseIds[baseId];
		var btnElement = baseObj.btn;
		var menuElement = baseObj.menu;
		// Note, there may be buttons without a menu, so we need to check if a menu exists
		if (menuElement) {
			util.positionAndShowDropDownElement(btnElement, menuElement);
			YAHOO.util.Event.addListener(menuElement, 'mouseenter', this._handleMouseenter, this);
			YAHOO.util.Event.addListener(menuElement, 'mouseleave', this._handleMouseleave, this);
			YAHOO.util.Event.addListener(menuElement, 'mouseup', this._closeMenuByClick, this);
			this._setButtonStyle(baseId, true);
			if (baseObj.hasOwnProperty('event')) {
				// Call defined event
				baseObj.event();
			}
		}
		// We also set openedMenuBaseId in case that the button
		// has no drop down to keep track that we are in open menu mode.
		this.openedMenuBaseId = baseId;
	},
	_closeMenu: function() {
//		console.log('_closeMenu() fired');
		// This closes the current open menu
		var openedMenuBaseId = this.openedMenuBaseId;
		if (openedMenuBaseId !== '') {
			var menuElement = this.menuBaseIds[openedMenuBaseId].menu;
			if (menuElement) {
				YAHOO.util.Event.removeListener(menuElement, 'mouseenter', this._handleMouseenter);
				YAHOO.util.Event.removeListener(menuElement, 'mouseleave', this._handleMouseleave);
				YAHOO.util.Event.removeListener(menuElement, 'mouseup', this._closeMenuByClick);
				menuElement.style.display = 'none';
				this._setButtonStyle(openedMenuBaseId, false);
			}
			// openedMenuBaseId may also exist when the button
			// has no drop down to keep track that we are in open menu mode.
			this.openedMenuBaseId = '';
		}
	},
	_closeMenuByClick: function(evt, self) {
		// Clicked on menu item, close the menu upon left mouse click
		// when not clicking in input field such as in profiles drop down.
		var clickId = (!util.userAgent.isIE) ? evt.button : evt.button - 1;
		var element = evt.target || evt.srcElement;
//		console.log('_closeMenuByClick: ' + evt.target.nodeName);
		var pattern = /^A|SPAN|LI$/;
		if (clickId === 0 && pattern.test(element.nodeName)) {
			self.onMenu = false;
			self._closeMenu();
		}
	},
	_setButtonStyle: function(baseId, isActive) {
		var btnElement = this.menuBaseIds[baseId].btn;
		btnElement.className = isActive ? this.btnActiveClassName : this.btnClassName;
	},
	_hoverOnButton: function(evt, self) {
//		console.log('_hoverOnButton fired: ' + this.id);
		var openedMenuBaseId = self.openedMenuBaseId;
		// Hovered over a nav button. Take action only
		// if a menu is already open.
		if (openedMenuBaseId !== '') {
			var id = this.id;
			var baseId = self._getBaseId(id);
			if (baseId !== openedMenuBaseId) {
				// Close the open menu
				self._closeMenu();
				// Open menu of given baseId
				self._openMenu(baseId);
			}
		}
	},
	// Close menu when moving out of navigation area
	_handleMouseenter: function(evt, self) {
//		console.log('_handleMouseenter fired: ' + this.id);
		self._handleMouseenterMouseleave(this.id, true);
	},
	_handleMouseleave:function(evt, self) {
//		console.log('_handleMouseleave fired: ' + this.id);
		self._handleMouseenterMouseleave(this.id, false);
	},
	_handleMouseenterMouseleave: function(elementId, isMouseEnter) {
//		console.log('_handleMouseenterMouseleave()');
//		console.log('_handleMouseenterMouseleave() - elementId: ' + elementId);
//		console.log('_handleMouseenterMouseleave() - isMouseEnter: ' + isMouseEnter);
		// Set mouse position state
		if (elementId === this.containerId) {
			this.onNavbar = isMouseEnter;
		}
		else {
			// Must have moved out of menu
			this.onMenu = isMouseEnter;
		}
		// Set eventCount
		var newEventCount = this.eventCount + 1;
		this.eventCount = newEventCount;
//		console.log('_handleMouseenter newEventCount: ' + newEventCount);
		var self = this;
		setTimeout(function() {
			self._checkMousePositionState.call(self, newEventCount);
		}, 800);
	},
	_checkMousePositionState: function(eventCount) {
//		console.log('_checkMousePositionState fired: ' + eventCount + ' ' + this.eventCount + ' ' + this.onNavbar + ' ' + this.onMenu);
		// Handle last event only
		if (this.openedMenuBaseId !== '' &&
			eventCount === this.eventCount &&
			!this.onNavbar && !this.onMenu) {
			// Moved mouse cursor out of navbar and out of open menu.
			// Close open menu.
//			console.log('_checkMousePositionState CLOSE MENU');
			this._closeMenu();
		}
	}
}
/*
	Validator class
*/
// note, we must always return the form value, even if the item is already logged, so that
// the callee object alwyas gets a value, or simply don't return something?
util.Validator = function() {
	this.errorLog = [];
}
util.Validator.prototype.reset = function() {
	// remove all error messages and clear the error log
	var errorLog = this.errorLog;
	for (var i = 0; i < errorLog.length; i++) {
		var elementId = errorLog[i].elementId + ':error';
		var element = document.getElementById(elementId);
		if (element) {
			util.hideE(elementId);
		}
	}
	this.errorLog = [];
}
// util.Validator.prototype.resetElement = function(elementId) {
util.Validator.prototype.resetElement = function(e, validatorObj) {
	// alert('reset element of elementId: ' + this.id + '\nerrorLog: ' + validatorObj);
	var elementId = this.id;
	var formElement = document.getElementById(elementId);
	var errorElement = document.getElementById(elementId + ':error');
	// remove the event listener from form element
	if (formElement) {
		YAHOO.util.Event.removeListener(formElement,'click', validatorObj.resetElement);
	}
	// hide error message
	if (errorElement) {
		util.hideE(elementId + ':error');
	}
	// remove elementId in error log
	// util.deleteArrayObject(this.errorLog, 'elementId', elementId);
	util.deleteArrayObject(validatorObj.errorLog, 'elementId', elementId);
}
util.Validator.prototype.allValid = function() {
	// checks the errorLog for errors and if there is
	// any error it displays them
	var errorLog = this.errorLog;
	if (errorLog.length > 0) {
		for (var i = 0; i < errorLog.length; i++) {
			// util.showObject(errorLog[i]);
			// var formElement = document.getElementById(errorLog[i].elementId);
			var errorElement = document.getElementById(errorLog[i].elementId + ':error');
			// alert(formElement + '\n' + errorElement);
			// if (formElement && errorElement) {
			if (errorElement) {
				// alert('write and show error');
				// write error message to ':error' element container
				util.updateT(errorLog[i].elementId + ':error', errorLog[i].msg);
				util.showE(errorLog[i].elementId + ':error');
			}
			else {
				// alert('formElement or errorElement does not exist');
			}
		}
		return false;
	}
	return true;
}
util.Validator.prototype.getIsLogged = function(elementId) {
	// This returns true if the elementId is already logged in this.errorLog
	var isLogged = false;
	var errorLog = this.errorLog;
	for (var i = 0; i < errorLog.length; i++) {
		if (errorLog[i].elementId === elementId) {
			isLogged = true;
			break;
		}
	}
	return isLogged;
}
util.Validator.prototype.logInvalidElementValue = function(elementId, msg) {
	// add element and type to error log
	var errorLog = this.errorLog;
	errorLog[errorLog.length] = {elementId:elementId, msg: msg};
	// Add event which will hide the error message upon element click
	// Note, 'isCustom' might not have an element, hence check for the element
	var element = util.getE(elementId);
	// alert(' Set error element: ' + element);
	if (element) {
		// alert('add eventListener to: ' + elementId);
		// We need to add the Validator object in the Listener so that we
		// get an object reference in resetElement()
		YAHOO.util.Event.addListener(element,'click', this.resetElement, this);
	}
	// alert('added item to error log, new length: ' + this.errorLog.length);
}
util.Validator.prototype.isValue = function(elementId, /* optional */ trimFormValue) {
	// Checks the form element to be not empty.
	// Set default trimFormValue if undefined
	if (typeof trimFormValue === 'undefined') {
		trimFormValue = true;
	}
	var theValue = util.getF(elementId, trimFormValue);
	// If this element hasn't been validated yet
	if (!this.getIsLogged(elementId) && (theValue === '')) {
		var msg = langVar('lang_stats.form_validation.no_value');
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isUnique = function(elementId, lookupItems, /* optional */ convertToLowercase, /* optional */ trimFormValue) {
	// We check if the value of elementId exists in the lookupItems array
	// Set default convertToLowercase if undefined
	if (typeof convertToLowercase === 'undefined') {
		convertToLowercase = false;
	}
	// Set default trimFormValue if undefined
	if (typeof trimFormValue === 'undefined') {
		trimFormValue = true;
	}
	var theValue = util.getF(elementId, trimFormValue);
	// If this element hasn't been validated yet
	if (!this.getIsLogged(elementId)) {
		var isDuplicateItemValue = false;
		var s = !convertToLowercase ? theValue : theValue.toLowerCase();
		for (var i = 0; i < lookupItems.length; i++) {
			var lookupItemValue = lookupItems[i];
			if (convertToLowercase) {
				lookupItemValue = lookupItemValue.toLowerCase();
			}
			if (s === lookupItemValue) {
				isDuplicateItemValue = true;
				break;
			}
		}
		if (isDuplicateItemValue) {
			var msg = langVar('lang_stats.form_validation.duplicat_name');
			this.logInvalidElementValue(elementId, msg);
		}
	}
	return theValue;
}
util.Validator.prototype.isInteger = function(elementId, /* optional */ min, /* optional */ max) {
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId) && !util.isInteger(theValue, min, max)) {
		var minDefined = !util.isUndefined(min);
		var maxDefined = !util.isUndefined(max);
		var msg = '';
		if (minDefined && maxDefined) {
			msg = langVar('lang_stats.form_validation.invalid_integer_min_max');
			msg = msg.replace(/__PARAM__1/, min);
			msg = msg.replace(/__PARAM__2/, max);
		}
		else if (minDefined) {
			msg = langVar('lang_stats.form_validation.invalid_integer_min');
			msg = msg.replace(/__PARAM__1/, min);
		}
		else if (maxDefined) {
			msg = langVar('lang_stats.form_validation.invalid_integer_max');
			msg = msg.replace(/__PARAM__1/, max);
		}
		else {
			msg = langVar('lang_stats.form_validation.invalid_integer');
		}
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isFloat = function(elementId, /* optional */ min, /* optional */ max) {
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId) && !util.isFloat(theValue, min, max)) {
		var msg = '';
		var minDefined = !util.isUndefined(min);
		var maxDefined = !util.isUndefined(max);
		if (minDefined && maxDefined) {
			msg = langVar('lang_stats.form_validation.invalid_float_min_max');
			msg = msg.replace(/__PARAM__1/, min);
			msg = msg.replace(/__PARAM__2/, max);
		}
		else if (minDefined) {
			msg = langVar('lang_stats.form_validation.invalid_float_min');
			msg = msg.replace(/__PARAM__1/, min);
		}
		else if (maxDefined) {
			msg = langVar('lang_stats.form_validation.invalid_float_max');
			msg = msg.replace(/__PARAM__1/, max);
		}
		else {
			msg = langVar('lang_stats.form_validation.invalid_float');
		}
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isNumber = function(elementId, /* optional */ min, /* optional */ max) {
	// This checks for any number (int or float)
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId) && !util.isInteger(theValue, min, max) && !util.isFloat(theValue, min, max)) {
		var msg = langVar('lang_stats.form_validation.invalid_number');
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isRegularExpression = function(elementId) {
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId) && !util.isRegularExpression(theValue)) {
		var msg = langVar('lang_stats.form_validation.invalid_regular_expression');
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isEmailAddress = function(elementId) {
	// This validates a single email address
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId) && !util.isEmailAddress(theValue)) {
		var msg = langVar('lang_stats.form_validation.invalid_email_address');
		this.logInvalidElementValue(elementId, msg);
	}
	return theValue;
}
util.Validator.prototype.isEmailAddresses = function(elementId) {
	// This validates a single email address or multiple email addresses separated by a comma.
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId)) {
		var isValidEmailAddress = true;
		if (theValue.indexOf(',') === -1) {
			// single email address
			isValidEmailAddress = util.isEmailAddress(theValue);
		}
		else {
			// multiple email addresses
			var emailAddressesDat = theValue.split(',');
			for (var i = 0; i < emailAddressesDat.length; i++) {
				var emailAddress = util.trim(emailAddressesDat[i]);
				if (!util.isEmailAddress(emailAddress)) {
					isValidEmailAddress = false;
					break;
				}
			}
		}
		if (!isValidEmailAddress) {
			var msg = langVar('lang_stats.form_validation.invalid_email_addresses');
			this.logInvalidElementValue(elementId, msg);
		}
	}
	return theValue;
}
util.Validator.prototype.isNodeName = function(elementId) {
	// checks to be a valid node name
	var theValue = util.getF(elementId);
	if (!this.getIsLogged(elementId)) {
		var pattern = /[^_a-z0-9]/;
		if (pattern.test(theValue)) {
			var msg = langVar('lang_stats.form_validation.invalid_identifier');
			this.logInvalidElementValue(elementId, msg);
		}
	}
	return theValue;
}
util.Validator.prototype.isCustom = function(elementId, msg) {
	// This does not require validation, it simply throws a custom error message
	// and does not return a form value.
	if (!this.getIsLogged(elementId)) {
		this.logInvalidElementValue(elementId, msg);
	}
}
/*
	Panel3 class
*/
util.Panel3 = function(obj) {
	// util.showObject(obj);
	// Default values become overwritten by obj
	this.panelId = null;
	this.panelClassName = ''; // i.e. panel-50
	this.width = -1;
	this.height = -1;
	this.top = -1;
	this.left = -1;
	this.right = -1;
	this.bottom = -1;
	this.zIndex = 20; // The zIndex of the panel, we require the zIndex for the form, the cover and iframe!
	this.isCover = false; // Creates a background cover if true
	this.isCloseButton = true;
	this.closeEvent = null;
	// this.isIframe = util.userAgent.isIE;
	this.isIframe = false; // KHP 31/JAN/2011 - the iframe becomes a problem with drag drop, check for solution
	// alert('this.isIframe: ' + this.isIframe);
	// If isSticky is given and is true then we don't re-position the panel upon "scroll",
	// it sticks at the position where the panel is initially positioned.
	// This is useful for panels which don't fit in Admin or Config
	this.isSticky = false;
	this.panelHeaderLabel = '';
	// this.isScroll = false;
	// Override default values
	for (var prop in obj) {
		this[prop] = obj[prop];
	}
	this.headerTitleId = '';
	this.coverId = '';
	this.iframeId = '';
	var panel = util.getE(this.panelId);
	panel.style.zIndex = this.zIndex;
	if (this.width > 0) {
		panel.style.width = this.width + 'px';
	}
	if (this.height > 0) {
		panel.style.height = this.height + 'px';
	}
	if (this.panelHeaderLabel !== '') {
		//
		// Create the panel header and insert it into the panel
		//
		var titleId =  util.getUniqueElementId();
		var imageContainerId = util.getUniqueElementId();
		var firstElement = panel.firstChild;
		var headerDiv = document.createElement('div');
		var headerElementId = this.panelId + ':header';
		headerDiv.id = headerElementId;
		headerDiv.className = this.panelClassName + '-header';
		var headerFrameDiv = document.createElement('div');
		headerFrameDiv.id = imageContainerId;
		headerFrameDiv.className = this.panelClassName + '-header-frame';
		var headerTitleDiv = document.createElement('div');
		headerTitleDiv.id = titleId;
		headerTitleDiv.className = this.panelClassName + '-header-title';
		var headerTitleTxt;
		if (this.panelHeaderLabel !== '-') {
			headerTitleTxt = document.createTextNode(this.panelHeaderLabel);
		}
		else {
			headerTitleTxt = document.createTextNode('\u00a0');
		}
		var headerBottomDiv = document.createElement('div');
		headerBottomDiv.className = this.panelClassName + '-header-bottom';
		// var spaceTxt = document.createTextNode('\u00a0'); // inserts &nbsp;
		var spaceTxtA = document.createTextNode('\u00a0');
		var spaceTxtB = document.createTextNode('\u00a0');
		if (this.isCloseButton) {
			var img = document.createElement('img');
			img.src = imgDb.panelClose.src;
			img.alt = langVar('lang_stats.btn.close');
			img.width = imgDb.panelClose.width;
			img.height = imgDb.panelClose.height;
			if (this.closeEvent) {
				// Use external close event to close the panel
				YAHOO.util.Event.addListener(img, 'click', this.closeEvent, this);
			}
			else {
				// Use internal close event to close the panel
				YAHOO.util.Event.addListener(img, 'click', this.__close, this);
			}
		}
		headerTitleDiv.appendChild(headerTitleTxt);
		headerFrameDiv.appendChild(headerTitleDiv);
		headerFrameDiv.appendChild(spaceTxtA);
		headerBottomDiv.appendChild(spaceTxtB);
		if (this.isCloseButton) {
			headerFrameDiv.appendChild(img);
		}
		headerDiv.appendChild(headerFrameDiv);
		headerDiv.appendChild(headerBottomDiv);
		panel.insertBefore(headerDiv, firstElement);
		this.headerTitleId = titleId;
		// Handle drag drop
		var dd = new YAHOO.util.DD(this.panelId);
		dd.setHandleElId(headerElementId);
	}
	//
	// Create the footer
	//
	var footerDiv = document.createElement('div');
	footerDiv.className = this.panelClassName + '-footer';
	var footerOffsetDiv = document.createElement('div');
	footerOffsetDiv.className = this.panelClassName + '-footer-offset';
	var footerSpaceTxt = util.createT('&nbsp;');
	footerOffsetDiv.appendChild(footerSpaceTxt);
	footerDiv.appendChild(footerOffsetDiv);
	panel.appendChild(footerDiv);
	//
	// Create background cover which hides underlying elements
	//
	if (this.isCover) {
		this.coverId = util.getUniqueElementId();
		var coverZIndex = this.zIndex - 5;
		var coverDiv = util.createE('div', {id:this.coverId, className:'form-cover', zIndex:coverZIndex});
		var coverText = util.createT('&nbsp;');
		util.chainE(coverDiv, coverText);
		panel.parentNode.appendChild(coverDiv);
	}
	// Create iframe element as form backround.
	// This fixes IE so that no elements shine through the form.
	if (this.isIframe) {
		this.iframeId = util.getUniqueElementId();
		var iframe = document.createElement('iframe');
		iframe.id = this.iframeId;
		iframe.tabIndex = '-1';
		iframe.src = 'javascript:false;';
		iframe.className = 'form-cover';
		iframe.style.zIndex = this.zIndex - 2;
		panel.parentNode.appendChild(iframe);
	}
}
util.Panel3.prototype.open = function(obj) {
	// obj is optional and has the properties left, top, right, bottom and label
	// If a position argument is given it overrides any existing absolute position
	// If a label argument is given it sets the panel header label
	if (typeof obj !== 'undefined') {
		// Note, if i.e. the "left" position is given then we set
		// the "right" position to default value!
		if (obj.hasOwnProperty('left')) {
			this.left = obj.left;
			this.right = -1;
		}
		if (obj.hasOwnProperty('right')) {
			this.right = obj.right;
			this.left = -1;
		}
		if (obj.hasOwnProperty('top')) {
			this.top = obj.top;
			this.bottom = -1;
		}
		if (obj.hasOwnProperty('bottom')) {
			this.bottom = obj.bottom;
			this.top = -1;
		}
		if (obj.hasOwnProperty('label')) {
			util.updateT(this.headerTitleId, obj.label);
		}
	}
	// alert('this.top after open(): ' + this.top);
	if (this.isCover) {
		this.setCoverSize();
		YAHOO.util.Event.addListener(window, 'resize', this.setCoverSizeUponResize, this);
		util.showE(this.coverId);
	}
	if (!this.isSticky) {
		YAHOO.util.Event.addListener(window, 'scroll', this.__setPositionByWindow, this);
	}
	// set initial position
	this.__setPosition(true/* true because this is the initial positioning */);
	util.showE(this.panelId);
	if (this.isIframe) {
		this.setIframePositionAndSize();
		util.showE(this.iframeId);
	}
}
util.Panel3.prototype.__close = function(evt, self) {
	// __close() is only used if no external closeEvent is given!
	self.close();
}
util.Panel3.prototype.close = function() {
	if (!this.isSticky) {
		YAHOO.util.Event.removeListener(window, 'scroll', this.__setPositionByWindow);
	}
	util.hideE(this.panelId);
	if (this.isIframe) {
		util.hideE(this.iframeId);
	}
	if (this.isCover) {
		YAHOO.util.Event.removeListener(window, 'resize', this.setCoverSizeUponResize, this);
		util.hideE(this.coverId);
	}
}
util.Panel3.prototype.__setPositionByWindow = function(evt, self) {
	var isInitialPositioning = false;
	self.__setPosition(isInitialPositioning);
}
util.Panel3.prototype.__setPosition = function(isInitialPositioning) {
	// If isInitialPositioning is true then we don't position the iframe
	// because the panel is not yet open, in all other cases we
	// position the iframe if it exists.
	// alert('update position of panelId: ' + this.panelId);
	var element = util.getE(this.panelId);
	var scrollY = YAHOO.util.Dom.getDocumentScrollTop();
	var scrollX = YAHOO.util.Dom.getDocumentScrollLeft();
	// util.showObject(this);
	if (this.top >= 0) {
		// alert('this.top: ' + this.top + '\nthis.left: ' + this.left);
		// alert('this.top: ' + this.top + '\nscrollY: ' + scrollY);
		element.style.top = (this.top + scrollY) + 'px';
	}
	if (this.left >= 0) {
		// alert('set left position to: ' + (left + scrollX) + 'px');
		element.style.left = (this.left + scrollX) + 'px';
	}
	if (this.right >= 0) {
		// alert('set right position to: ' + (right + scrollX) + 'px');
		element.style.right = (this.right + scrollX) + 'px';
	}
	if (!isInitialPositioning && this.isIframe) {
		this.setIframePositionAndSize();
	}
	// util.showObject(element.style.top);
}
util.Panel3.prototype.setIframePositionAndSize = function() {
	var region = YAHOO.util.Dom.getRegion(this.panelId);
	var element = util.getE(this.iframeId);
	element.style.top = region.top;
	element.style.left = region.left;
	element.style.width = region.width;
	element.style.height = region.height;
}
util.Panel3.prototype.prePositionAtCenter = function() {
	// Display the panel temporary so that we get the region
	var panel = util.getE(this.panelId);
	panel.style.top = '0px';
	panel.style.left = '0px';
	panel.style.display = 'block';
	panel.style.visibility = 'hidden';
	// util.showE(this.panelId);
	// util.hideEV(this.panelId);
	var panelRegion = YAHOO.util.Dom.getRegion(panel);
	// util.showObject(region);
	panel.style.display = 'none';
	panel.style.visibility = '';
	panelWidth = panelRegion.width;
	panelHeight = panelRegion.height;
	var viewportWidth = YAHOO.util.Dom.getViewportWidth();
	var viewportHeight = YAHOO.util.Dom.getViewportHeight();
	// var topDistance = ((viewportHeight - panelHeight) / 2) - 30;
	var topDistance = ((viewportHeight - panelHeight) / 3);
	var leftDistance = (viewportWidth - panelWidth) / 2;
	this.top = (topDistance > -1) ? topDistance : 0;
	this.left = (leftDistance > -1) ? leftDistance : 0;
}
util.Panel3.prototype.setCoverSizeUponResize = function(evt, self) {
	self.setCoverSize();
}
util.Panel3.prototype.setCoverSize = function() {
	var coverElement = util.getE(this.coverId);
	coverElement.style.width = YAHOO.util.Dom.getDocumentWidth() + 'px';
	coverElement.style.height = YAHOO.util.Dom.getDocumentHeight() + 'px';
}
/*
	BusyPanel class
*/
util.BusyPanel = function() {
	this.isBuild = false;
	this.isActive = false;
	this.mainElement = '';
	this.contentElementId = '';
}
util.BusyPanel.prototype.showLoading = function() {
	this._show(langVar('lang_stats.btn.loading'));
}
util.BusyPanel.prototype.showSaving = function() {
	this._show(langVar('lang_stats.btn.saving'));
}
util.BusyPanel.prototype.showCustom = function(label) {
	this._show(label);
}
util.BusyPanel.prototype._show = function(label) {
	// label is allowed to be in HTML, so we use innerHTML
	var element;
	if (!this.isBuild) {
		this._build();
	}
	var contentElement = util.getE(this.contentElementId);
	contentElement.innerHTML = label;
	if (!this.isActive) {
		// Set the position before we display it
		element = this.mainElement;
		element.style.visibility = 'hidden';
		element.style.display = 'block';
		this._setPosition();
		element.style.visibility = 'visible';
		YAHOO.util.Event.addListener(window, 'resize', this._setPositionUponResize, this);
		this.isActive = true;
	}
	else {
		// progress panel is already displayed, just re-position
		this._setPosition();
	}
}
util.BusyPanel.prototype._setPositionUponResize = function(evt, self) {
	self._setPosition();
}
util.BusyPanel.prototype._setPosition = function() {
	var YD = YAHOO.util.Dom;
	var element = this.mainElement;
	var region = YD.getRegion(element);
	var elementWidth = region.width;
	var viewportWidth = YD.getViewportWidth();
	var viewportHeight = YD.getViewportHeight();
	element.style.left = Math.round(viewportWidth / 2 - elementWidth / 2) + 'px';
	element.style.top = Math.round(viewportHeight / 3) + 'px';
}
util.BusyPanel.prototype.stop = function() {
	if (this.isActive) {
		YAHOO.util.Event.removeListener(window, 'resize', this._setPositionUponResize);
		this.mainElement.style.display = 'none';
		this.isActive = false;
	}
}
util.BusyPanel.prototype._build = function() {
	var mainElementId = util.getUniqueElementId();
	var contentElementId = mainElementId + ':content';
	var mainContentDiv = util.createE('div', {padding:'0'});
	var contentDiv = util.createE('div', {id:contentElementId, padding:'10px 16px'});
	var imgDat = imgDb.simpleProgress;
	var imgDiv = util.createE('div', {textAlign:'center', padding:'0px 16px 8px 16px'});
	var img = util.createE('img', {src:imgDat.src, width:imgDat.width, height:imgDat.height, title:'', alt:''});
	util.chainE([mainContentDiv, contentDiv, [imgDiv, img]]);
//	var mainDiv = util.getRoundBox(mainElementId, 20, mainContentDiv);
	var mainDiv = util.createE('div', {id:mainElementId, className:'panel-20', display:'none'});
	util.chainE(mainDiv, mainContentDiv);
	mainDiv.style.zIndex = 1000;
	var bodyElements = document.getElementsByTagName('body');
	var bodyElement = bodyElements[0];
	bodyElement.appendChild(mainDiv);
	this.isBuild = true;
	this.mainElement = mainDiv;
	this.contentElementId = contentElementId;
}
//
//
// MoveControl class
//
//
util.MoveControl = function(baseId, moveEvent) {
	// Move control baseId is the element ID of the move control container div
	// Each image element ID in this container is a combination
	// of the baseID and move direction as follwos:
	// id="baseId:top"
	// id="baseId:up"
	// id="baseId:down"
	// id="baseId:bottom"
	// Note, the baseId may contain other colons ':'
	this.baseId = baseId;
	this.moveEvent = moveEvent;
	this.buttonsState = {
		top: {id:baseId + ':top', isDisabled:true, src:imgDb.moveTop.src, srcDis:imgDb.moveTopDis.src},
		up: {id:baseId + ':up', isDisabled:true, src:imgDb.moveUp.src, srcDis:imgDb.moveUpDis.src},
		down: {id:baseId + ':down', isDisabled:true, src:imgDb.moveDown.src, srcDis:imgDb.moveDownDis.src},
		bottom: {id:baseId + ':bottom', isDisabled:true, src:imgDb.moveBottom.src, srcDis:imgDb.moveBottomDis.src}
	}
}
util.MoveControl.prototype = {
	setState: function(selectedItemIndex, numberOfItems) {
		// Sets the move control button state (enabled/disabled) depending
		// of selectedItemIndex and numberOfItems.
		//
		// Set default state
		//
		var moveDisabled = {
			top: true,
			up: true,
			down: true,
			bottom: true
		};
		//
		// Set active state
		//
		if (selectedItemIndex >= 0 && numberOfItems > 1) {
			if (selectedItemIndex > 0) {
				moveDisabled.top = false;
				moveDisabled.up = false;
			}
			if (selectedItemIndex < (numberOfItems - 1)) {
				moveDisabled.down = false;
				moveDisabled.bottom = false;
			}
		}
		//
		// Set the buttons
		//
		var buttonsState = this.buttonsState;
		for (var prop in moveDisabled) {
			var isDisabled = moveDisabled[prop];
			var theButton = buttonsState[prop];
			if (isDisabled !== theButton.isDisabled) {
				// Change the button state
				var img = util.getE(theButton.id);
				img.src = isDisabled ? theButton.srcDis : theButton.src;
				theButton.isDisabled = isDisabled;
				if (isDisabled) {
					YAHOO.util.Event.removeListener(img, 'click', this.moveItem);
				}
				else {
					YAHOO.util.Event.addListener(img, 'click', this.moveItem, this);
				}
			}
		}
	},
	moveItem: function(evt, self) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		var direction = self.getMoveDirection(elementId);
		self.moveEvent(direction);
	},
	getMoveDirection: function(buttonElementId) {
		var dat = buttonElementId.split(':');
		var lastItemIndex = dat.length - 1;
		return dat[lastItemIndex];
	},
	setPosition: function(listElementId) {
		// Sets the absolute position of the move control
		// alert('setPosition');
		var moveElement = util.getE(this.baseId);
		var region = YAHOO.util.Dom.getRegion(listElementId);
		// util.showObject(region);
		moveElement.style.top = region.top + 'px';
		moveElement.style.left = (region.left - 46) + 'px';
		moveElement.style.display = 'block';
	}
}
//
//
// Language variable util function
//
//
function langVar(langVarPath) {
	// Return language variable if it exists, else return the langVarPath
	// Check if language variables exists by language module
	// name such as lang_stats, lang_config, etc.
	// If no language variable exists then we are in developer mode.
	if (!util.checkedForIsLanguageModule) {
		var i = langVarPath.indexOf('.');
		var langModule = langVarPath.slice(0, i);
		util.isLanguageModule  = (window[langModule] !== null);
		// We only check the first langVarPath
		util.checkedForIsLanguageModule = true;
		// alert('util.isLanguageModule: ' + util.isLanguageModule);
	}
	// Replace each dot "." in the langVarPath with dot underscore "._"
	// because the language variables use an underscore in the js object to
	// prevent name conflicts for words such as "delete", "length", etc.
	var jsLangVarPath = langVarPath.replace(/\./g,'._');
	// alert('jsLangVarPath: ' + jsLangVarPath);
	var langVarValue;
	if (util.isLanguageModule) {
		// alert('jsLangVarPath 1:' + jsLangVarPath);
		/*
		if (window[jsLangVarPath] !== null) {
			alert('jsLangVarPath 2:' + jsLangVarPath);
			langVarValue = window[jsLangVarPath];
			alert('langVarValue:' + langVarValue);
		}
		else {
			langVarValue = jsLangVarPath;
		}
		*/
		try {
			langVarValue = eval(jsLangVarPath);
			// alert('langVarPath: ' + langVarPath + '\nlangVarValue: ' + langVarValue);
		}
		catch(ex) {
			// alert('Missing language variable in js file: "' + langVarPath + '"');
			langVarValue = jsLangVarPath;
		}
	}
	else {
		// Resolve language variables from server
		langVarValue = util.resolveLangVar(langVarPath, jsLangVarPath);
	}
	return langVarValue;
}
// Invoke upon load
util.userAgent.init();
//
// scrollUtil.js
//
var scrollUtil = {};
scrollUtil.Scroller = (function() {
	'use strict';
	// dependencies
	var YE = YAHOO.util.Event,
		YD = YAHOO.util.Dom,
		Constr;
	// constructor
	Constr = function(frameElementId, scrolledElementId, scrollHandler) {
		// If frameElementId and scrolledElementId is empty then
		// calculate regions from viewport and body element.
		this.hasFrameElement = (frameElementId !== '');
        this.frameElementId = frameElementId;
		this.frameElement = null;
        this.frameElemementTop = 0;
        this.frameElementBottom = 0;
        this.frameElementHeight = 0;
        this.scrolledElementId = scrolledElementId;
        this.scrolledElement = null;
		this.scrolledElementHeight = 0;
		this.scrollHandler = scrollHandler;
        // If isStandby is true we record scroll event properties
        // but don't fire the scrollHandler.
        // The system goes automatically in isStandby when the
        // scrollHandler is fired. The callee must invoke
        // restartListening() to reset isStandby to false.
        this.isStandby = false;
        // Up to date scroll properties
        this.verticalScrollLevel = 0.0; // float in range 0-100, 0 = scrolled to top, 100 = scrolled to bottom
        this.isScrollingDown = false;
        YE.addListener(window, 'resize', this._sizeChanged, this);
	};
	Constr.prototype = {
        _setBasicProperties: function() {
//          alert('_setBasicProperties()');
			// Note, frame may be a dedicated element container or the viewport.
			var frameBottom = 0;
			var frameHeight = 0;
			if (this.hasFrameElement) {
				if (this.frameElement === null) {
					this.frameElement = util.getE(this.frameElementId);
					this.scrolledElement = util.getE(this.scrolledElementId);
				}
				var region = YD.getRegion(this.frameElement);
				frameBottom = region.bottom;
				frameHeight = region.height;
			}
			else {
				if (this.scrolledElement === null) {
					// The scrolled element is the body element
					var bodyElements = document.getElementsByTagName('body');
					this.scrolledElement = bodyElements[0];
				}
				frameHeight = YD.getViewportHeight();
				frameBottom = frameHeight;
			}
            this.frameElementBottom = frameBottom;
            this.frameElementHeight = frameHeight;
//            console.log('_setBasicProperties - frameElementBottom: ' + this.frameElementBottom);
//            console.log('_setBasicProperties - frameElementHeight: ' + this.frameElementHeight);
        },
		activate: function() {
			var element = this.hasFrameElement ? this.frameElement : window;
			YE.addListener(element, 'scroll', this._scrollActivated, this);
            // Reset scroll properties
            this.verticalScrollLevel = 0;
            this.isScrollingDown = false;
            this.isStandby = false;
		},
		deactivate: function() {
             YE.removeListener(this.frameElementId, 'scroll', this._scrollActivated);
		},
        restartListening: function() {
            this.isStandby = false;
        },
        _getVerticalScrollLevel: function() {
//			console.log('_getVerticalScrollLevel - this.frameElementHeight: ' + this.frameElementHeight);
//			console.log('_getVerticalScrollLevel - this.frameElementBottom: ' + this.frameElementBottom);
			var region = YD.getRegion(this.scrolledElement),
                // scrolledTop = region.top,
                scrolledElementBottom = region.bottom,
                scrolledElementHeight = region.height,
                scrolledElementHiddenHeight = scrolledElementHeight - this.frameElementHeight, // hidden parts on top and bottom
                scrollBottom = 0,
                scrollTop = 0,
				verticalScrollLevel = 0;
			if (this.hasFrameElement) {
                scrollBottom = scrolledElementBottom - this.frameElementBottom;
                scrollTop = scrolledElementHiddenHeight - scrollBottom;
			}
			else {
				// Viewport with body element
				scrollTop = YD.getDocumentScrollTop();
			}
			verticalScrollLevel = 100 * (scrollTop / scrolledElementHiddenHeight);
//			util.showObject(region);
//			console.log('_getVerticalScrollLevel - YD.getDocumentScrollTop: ' + YD.getDocumentScrollTop());
//			console.log('_getVerticalScrollLevel - scrolledElementBottom: ' + region.bottom);
//			console.log('_getVerticalScrollLevel - scrolledElementHeight: ' + region.height);
//			console.log('_getVerticalScrollLevel - verticalScrollLevel: ' + verticalScrollLevel);
            return  {scrolledElementHeight: scrolledElementHeight, verticalScrollLevel: verticalScrollLevel};
        },
		_scrollActivated: function(evt, self) {
            // Starts scrolling
            // Set basic properties if not yet set
            if (self.frameElementHeight === 0) {
                self._setBasicProperties();
            }
			var obj = self._getVerticalScrollLevel();
            var verticalScrollLevel = obj.verticalScrollLevel;
//			console.log('_scrollActivated - self.verticalScrollLevel: ' + self.verticalScrollLevel);
//            console.log('_scrollActivated - verticalScrollLevel: ' + verticalScrollLevel);
            // Set up to date scroll properties
            self.isScrollingDown = (verticalScrollLevel > self.verticalScrollLevel);
            self.verticalScrollLevel = verticalScrollLevel;
//            console.log('_scrollActivated - self.isStandby: ' + self.isStandby);
//            console.log('_scrollActivated - isScrollingDown: ' + self.isScrollingDown);
            // Fire scroll handler if not in isStandby
            // and if verticalScrollLevel is greater than 20
            // and if scrolling down
            if (!self.isStandby &&
                verticalScrollLevel > 20 &&
                self.isScrollingDown) {
                // Set to standby
                self.isStandby = true;
                // Fire scrollHandler
                self.scrollHandler(verticalScrollLevel);
            }
		},
        _sizeChanged: function(evt, self) {
            // Element size changed, reset basic properties
            self._setBasicProperties();
        },
		getScrollInfo: function() {
            // Get a fresh verticalScrollLevel because it
            // could have changed due adding data by the
            // scrollHandler.
            // The isScrollingDown value is up to date
            // and should not be changed here.
			 // Set basic properties if not yet set
            if (this.frameElementHeight === 0) {
                this._setBasicProperties();
            }
			var obj = this._getVerticalScrollLevel();
			this.verticalScrollLevel = obj.verticalScrollLevel;
			var scrollInfo = {
                isScrollingDown: this.isScrollingDown,
				frameElementHeight: this.frameElementHeight,
				scrolledElementHeight: obj.scrolledElementHeight,
                verticalScrollLevel: obj.verticalScrollLevel
            };
            return scrollInfo;
		}
	};
	// return Constr
	return Constr;
}());
/* global convertProfile: false */
var profilesFilter = (function() {
	'use strict';
	var YE = YAHOO.util.Event,
	 	profilesDb = [], // Reference to profiles.profilesDb
	 	searchElement = null,
	 	clearSearchBtnId = '',
	 	count = 0,
	 	onSearchCallback = null,
	 	searchResults = [],
	 	isVisiblePlaceholder = false,
		activeFilterResultId = '';
	function init(obj) {
		profilesDb = obj.profilesDb;
		searchElement = util.getE(obj.searchElementId);
		if (obj.hasOwnProperty('clearSearchBtnId')) {
			clearSearchBtnId = obj.clearSearchBtnId;
			YE.addListener(clearSearchBtnId, 'click', _clearSearch);
		}
		// Clear input field
		util.setF(searchElement, '');
		onSearchCallback = obj.onSearchCallback;
		YE.addListener(searchElement, 'focus', _handlePlaceholderFocus);
		YE.addListener(searchElement, 'blur', _handlePlaceholderBlur);
		YE.addListener(searchElement, 'keyup', _searchActivated);
		_setPlaceholder();
	}
	function _searchActivated(evt) {
		// Increment count
		var newCount = count + 1;
		count = newCount;
//		util.showObject({searchActivatedFun: count});
		setTimeout(function() {_search(newCount);}, 200);
	}
	function _search(newCount) {
		// Only update when typing is paused
		if (count === newCount) {
			var searchText = searchElement.value;
			searchText = searchText.toLowerCase();
			if (searchText.length > 0 && clearSearchBtnId !== '') {
				util.showE(clearSearchBtnId);
			}
			var searchResultId = '_' + searchText + '_';
			activeFilterResultId = searchResultId;
			var searchResult = searchResults[searchResultId];
			// Create new search result if it doesn't yet exist
			if (typeof searchResult === 'undefined') {
//				console.log(searchResultId + ': CREATE NEW SEARCH RESULT');
//				util.showObject({b: '_search() - count: ' + count + ' - searchText: ' + searchText + ' CREATE NEW SEARCH RESULT'});
				// Check from which list we start the search, i.e. a list with less items in it if the current searchText matches an existing searchText
				// Set temp sourceSearchResultId
				var sourceSearchResultId =_getSourceSearchId(searchText);
				searchResult = _getNewSearchResult(sourceSearchResultId, searchText);
				searchResults[searchResultId] = searchResult;
			}
//			else {
//
//				console.log(searchResultId + ': USE EXISTING SEARCH RESULT');
//			}
			onSearchCallback(searchResult);
		}
	}
	function _getSourceSearchId(searchText) {
		/* This checks if there is already a search result with less letters
		of the current searchText. I.e., if the searchText is "apache"
		then we check if there is already a search result as follows:
		check for "apach", if search result exists then use this as source for the next search
		else check for "apac", if search result exists then use this as source for the next search
		else check for "apa", if search result exists then use this as source for the next search
		else check for "ap", if search result exists then use this as source for the next search
		else check for "a", if search result exists then use this as source for the next search
		else use the initial search result in "__", which contains all formats.
		*/
		// util.showObject({__getSourceSearchId: 'searchText: ' + searchText});
		var sourceSearchResultId = "__"; // initial search result
		for (var i = searchText.length - 1; i > 0; i--) {
			var id = '_' + searchText.substring(0, i) + '_';
			// util.showObject({__id: 'checking search result for id: ' + id});
			if (searchResults[id] != null) {
				// Got an existing search result which we can use
				sourceSearchResultId = id;
				break;
			}
		}
		// util.showObject({__id: 'final sourceSearchResultId: ' + sourceSearchResultId});
		return sourceSearchResultId;
	}
	function _getNewSearchResult(sourceSearchResultId, searchText) {
		// sourceSearchResult is the search result from which we start the search.
		// It may contain all log formats or only a few onces if there exists
		// a search result which matches the current searchText.
		// alert('sourceSearchResultId: ' + sourceSearchResultId);
		var sourceItems;
		if (sourceSearchResultId === '__') {
			sourceItems = profilesDb;
		}
		else {
			sourceItems = searchResults[sourceSearchResultId];
		}
		// util.showObject(sourceSearchResult, 'IT FOLLOWS THE sourceSearchResult OBJECT'
		var searchResult = [];
		var numFoundItems = 0;
		for (var i = 0, len = sourceItems.length; i < len; i++) {
			var item = sourceItems[i];
			var label = item[1];
			var labelLowercase = label.toLowerCase();
			if (labelLowercase.indexOf(searchText) !== -1) {
				searchResult[numFoundItems] = item;
				numFoundItems++;
			}
//			var theLabel = sourceSearchResultLables[i];
//			var posOfSearchText = theLabel.indexOf(searchText);
//
//			if (posOfSearchText != -1) {
//
//				if (posOfSearchText === 0) {
//					// This log format starts with searchText
//					labelsA[numOfA] = theLabel;
//					indexesA[numOfA] = sourceSearchResultIndexes[i];
//					numOfA++;
//				}
//				else {
//					// This log format contains the searchText somewhere after the 1st character
//
//					labelsB[numOfB] = theLabel;
//					indexesB[numOfB] = sourceSearchResultIndexes[i];
//					numOfB++;
//				}
//			}
		}
//		var labels = labelsA.concat(labelsB);
//		var indexes = indexesA.concat(indexesB);
//		var numOfItems = numOfA + numOfB;
//		var searchResult = {labels: labels, indexes: indexes, numOfItems: numOfItems};
//		util.showObject(searchResult, 'searchResult');
		return searchResult;
	}
	function _clearSearch(evt) {
		activeFilterResultId = '';
		searchElement.value = '';
		searchElement.focus();
		onSearchCallback(profilesDb);
	}
	function _handlePlaceholderFocus(evt) {
		if (isVisiblePlaceholder) {
			// Clear placeholder
			this.value = '';
			this.className = '';
			isVisiblePlaceholder = false;
		}
	}
	function _handlePlaceholderBlur(evt) {
		if (this.value === '') {
			_setPlaceholder();
		}
	}
	function _setPlaceholder() {
		searchElement.className = 'placeholder';
		searchElement.value = langVar('lang_stats.general.filter_profiles_by');
		if (clearSearchBtnId !== '') {
			util.hideE(clearSearchBtnId);
		}
		isVisiblePlaceholder = true;
	}
	function getActiveFilterText() {
		return activeFilterText;
	}
	function getFilteredProfilesDb() {
		var isFilterd = (activeFilterResultId !== ''),
			filteredProfilesDb = isFilterd ? searchResults[activeFilterResultId] : [];
		return {
			isFiltered: isFilterd,
			filteredProfilesDb: filteredProfilesDb
		}
	}
	// Return global properties and methods
	return {
		init: init,
		getFilteredProfilesDb: getFilteredProfilesDb
	};
}());
/* global store: false */
var profilesStorage = (function() {
	'use strict';
	function getIsUpToDate() {
		// Returns true if the profilesDb is up to date.
		var profilesListChecksum = pageInfo.profilesListChecksum;
		var storedProfilesListChecksum = store.get('profilesListChecksum');
		// ToDo, add time check. If profilesListChecksum in Storage is newer
		// than the one in pageInfo than we can also assume that we are
		// up to date! Add epoc timestamp to pageInfo and profileChanges!
		return (profilesListChecksum === storedProfilesListChecksum);
	}
	function get(property) {
		return store.get(property);
	}
	function addNewProfilesDb(profilesListChecksum, numAllProfiles, numPermittedProfiles, profilesDb) {
		// A new profilesDb has been loaded, update all storage data.
		store.set('profilesListChecksum', profilesListChecksum);
		store.set('numAllProfiles', numAllProfiles);
		store.set('numPermittedProfiles', numPermittedProfiles);
		store.set('profilesDb', profilesDb);
		// Set pageInfo.profilesListChecksum for the case that it is not up to date
		pageInfo.profilesListChecksum = profilesListChecksum;
	}
	function update(profileChanges) {
		// This updates local storage after a profile has been saved.
		// This is necessary because the file modification date causes
		// a new checksum. However, in most cases we only need to update
		// the checksum and the single profile item, so we don't need to
		// reload all profiles.
		var profilesListChecksum = profileChanges.profilesListChecksum;
//		console.log('profilesStorage.update() - new profilesListChecksum: ' + profilesListChecksum);
//		console.log('profilesStorage.update() - profileChanges.isNewProfilesList: ' + profileChanges.isNewProfilesList);
		if (!profileChanges.isNewProfilesList) {
			// This causes a minimal update in local storage.
			var profileItem = profileChanges.profileItem;
			var profileName = profileItem[0];
			var profilesDb = store.get('profilesDb');
			for (var i = 0, len = profilesDb.length; i < len; i++) {
				if (profilesDb[i][0] === profileName) {
					profilesDb.splice(i, 1, profileItem);
				}
			}
			// Save up to date profilesListChecksum
			// and modified profilesDb in storage.
			store.set('profilesListChecksum', profilesListChecksum);
			store.set('profilesDb', profilesDb);
			// Set pageInfo.profilesListChecksum so that it is in sync
			// with storage profilesListChecksum.
			pageInfo.profilesListChecksum = profilesListChecksum;
		}
		else {
			// We loaded a new profilesDb. Most likely profile
			// files have been modified manually or by other users.
			addNewProfilesDb(
				profilesListChecksum,
				profileChanges.numAllProfiles,
				profileChanges.numPermittedProfiles,
				profileChanges.profilesDb
			);
		}
	}
	function reset() {
		// This clears local storage profile data
		var profilesListChecksum = '';
		var numAllProfiles = 0;
		var numPermittedProfiles = 0;
		var profilesDb = [];
		addNewProfilesDb(
			profilesListChecksum,
			numAllProfiles,
			numPermittedProfiles,
			profilesDb
		);
	}
	//
	// General profileArrayItem utilities.
	// This utilities are also used when profilesDb is
	// is not yet saved to local storage.
	//
	function profileArrayItemToObject(a) {
		// Returns a profile item object derived from
		// profile item array a.
		// "a" is an profile item in the format ["profile_1", "profile_2", 0, "", ...]
		// which becomes converted to an object so that all properties can be accessed
		// by name.
		// Database type numbers to database type strings
		// 0 = internal_sql,
		// 1 = mysql,
		// 2 = odbc_mssql
		// 3 = odbc_oracle
		var dbTypes = ['internal_sql', 'mysql', 'odbc_mssql', 'odbc_oracle'];
		return {
			name: a[0],
			label: a[1],
			databaseType: dbTypes[(a[2])],
			databaseName: a[3],
			username: a[4],
			df: a[5],
//			isViewReports: a[6],
//			isViewConfig: a[7],
//			isRename: a[8],
//			isDelete: a[9],
			version: a[6],
			isValidProfile: (a[6] === '')
		};
	}
	function setProfileArrayItemValues(profileArrayItem, obj) {
		// This sets the profileArrayItem with object values at the correct
		// array position.
		// Currently only the 'version' property is supported.
		for (var prop in obj) {
			if (prop === 'version') {
				profileArrayItem[6] = obj[prop];
			}
		}
	}
	// Return global properties and methods
	return {
		getIsUpToDate: getIsUpToDate,
		get: get,
		addNewProfilesDb: addNewProfilesDb,
		update: update,
		reset: reset,
		profileArrayItemToObject: profileArrayItemToObject,
		setProfileArrayItemValues: setProfileArrayItemValues
	};
}());
