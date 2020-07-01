set JAVA_OPTS=-Duser.language=en -Duser.country=US -Dcom.sun.management.jmxremote=true -Dcom.sun.management.jmxremote.port=6667 -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Dfelix.fileinstall.dir=%AEON_HOME%\conf\services -Dfelix.cm.dir=%AEON_HOME%\conf\services -Dlivo.home=%AEON_HOME%

java %JAVA_OPTS% -jar bin/felix.jar