namespace java tr.com.eno.livo.thrift.serviceobjects

include "shared.thrift"

typedef shared.AuthenticationToken AuthenticationToken

struct ServiceObject {

    1: required string name;
    // A constant for the service type like websrv for web services or 
    2: required string type;
    3: required set<string> operationNames;
}

struct ServiceObjectOperationPayload {

	1: required string content;
	2: required string contentType;
	3: optional string rootElement;
}

exception ServiceObjectNotFoundError {

    1: required string serviceObjectName;
}

exception ServiceObjectConfigurationError {

    1: required string serviceObjectName;
    // CfgKey -> List of error messages for the key
    2: optional map<string, set<string>> errorMessages;
}

exception ServiceObjectOperationMissingArgumentError {

    1: required string serviceObjectName;
    2: required string operationName;
    3: optional set<string> arguments;
}

exception ServiceObjectOperationFailedError {

    1: required string serviceObjectName;
    2: required string operationName;
    3: optional string message;
}

service ServiceObjectProxyService {

    set<ServiceObject> listServiceObjects(1: AuthenticationToken token);
	
    ServiceObject getServiceObject(1: AuthenticationToken token, 2: string name, 3: map<string,string> conf) throws (1: ServiceObjectNotFoundError sonfe, 2: ServiceObjectConfigurationError soce);

    ServiceObjectOperationPayload performOperation(1: AuthenticationToken token, 2: ServiceObject object, 3: string operationName, 4: ServiceObjectOperationPayload payload) throws (1: ServiceObjectOperationFailedError soofe);
}
