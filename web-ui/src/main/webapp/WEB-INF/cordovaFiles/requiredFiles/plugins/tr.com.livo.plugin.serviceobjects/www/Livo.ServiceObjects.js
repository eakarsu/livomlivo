cordova.define("tr.com.livo.plugin.serviceobjects.Livo.ServiceObjects", function(require, exports, module) { var exec = require('cordova/exec');

/**
 * Create the ServiceObjects subcontext in main Livo context
 */
                                                                                                
if (typeof Livo == "undefined")
    Livo = {};
if (typeof Livo.ServiceObjects == "undefined")
  Livo.ServiceObjects = {};

/**
 * Method for listServiceObjects API call.
 */
Livo.ServiceObjects.listServiceObjects = function(successCallback, errorCallback) {

  var parserFunc = function(data) {

    console.debug("Parsing result data: %s...", data);

    // Sanity check
    if (data == null) {

      console.debug("Data is null, returning an empty array.");

      return successCallback([]);
    }

    var serviceObjs = new Array();

    console.debug("Found %d ServiceObject instances.", data.length);

    for (var i = 0; i < data.length; i++) {

      var rawObj = data[i];

      var serviceObj = {
        name: rawObj.name,
        type: rawObj.type
      };

      console.debug("Constructing ServiceObject with the name '%s' and type '%s'...", serviceObj.name, serviceObj.type);

      console.debug("Found %d operations.", rawObj.operationNames.length);

      for (var j = 0; j < rawObj.operationNames.length; j++) {

        console.debug("Adding operation named '%s' to the '%s' ServiceObject...", rawObj.operationNames[j], serviceObj.name);

        serviceObj[rawObj.operationNames[j]] = function(payload) {

          console.error("ServiceObject is not configured!");
        }
      }


      serviceObjs.push(serviceObj);
    }

    successCallback(serviceObjs);
  };


  exec(parserFunc, errorCallback, "Livo.ServiceObjects", "listServiceObjects");
};

/**
 * Method for getServiceObject API call.
 */
Livo.ServiceObjects.getServiceObject = function(requestedServiceObj, conf, successCallback, errorCallback) {

  var parserFunc = function(rawObj) {

    console.debug("Parsing result data: %s...", rawObj);

    // Sanity check
    if (rawObj == null) {

      console.debug("Service object is null, returning null.");

      return successCallback(null);
    }

    var serviceObj = {
      name: rawObj.name,
      type: rawObj.type
    };

    console.debug("Constructing ServiceObject with the name '%s' and type '%s'...", serviceObj.name, serviceObj.type);

    console.debug("Found %d operations.", rawObj.operationNames.length);

    for (var j = 0; j < rawObj.operationNames.length; j++) {

      console.debug("Adding operation named '%s' to the '%s' ServiceObject...", rawObj.operationNames[j], serviceObj.name);

      var opName = rawObj.operationNames[j];

      serviceObj[opName] = function(op) {

        return function(payload, opSuccessCallback, opErrorCallback) {

          console.debug("Performing operation '%s' on ServiceObject named '%s' with payload '%s'...", opName, serviceObj.name, JSON.stringify(payload));

          exec(opSuccessCallback, opErrorCallback, "Livo.ServiceObjects", "performOperation", [rawObj, op, JSON.stringify(payload)]);
        };

      }(opName);
    }

    successCallback(serviceObj);
  };

  var serviceObjName = typeof(requestedServiceObj) == "string" ? requestedServiceObj : requestedServiceObj.name;

  console.debug("Configuring an instance of the ServiceObject named '%s'...", serviceObjName);

  exec(parserFunc, errorCallback, "Livo.ServiceObjects", "getServiceObject", [serviceObjName, conf]);
};

module.exports = Livo.ServiceObjects;

});
