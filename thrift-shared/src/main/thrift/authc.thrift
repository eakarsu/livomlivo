namespace java tr.com.eno.livo.thrift.authc

include "shared.thrift"

typedef shared.AuthenticationToken AuthenticationToken

struct CompanyAuthenticationResult {

    1: required bool success;
    2: optional string message;
    3: optional AuthenticationToken authenticationToken;
    4: required string companyId;
}

struct UserAuthenticationResult {

    1: required bool success;
    2: optional string message;
    3: optional AuthenticationToken authenticationToken;
    4: required string userPrincipal;
}

struct DeviceAuthenticationResult {

    1: required bool success;
    2: optional string message;
    3: optional AuthenticationToken authenticationToken;
    4: required string deviceId;
}

service AuthenticationService {

    CompanyAuthenticationResult authenticateCompany(1:string companyId, 2:string companySecret);

    UserAuthenticationResult authenticateUser(1:AuthenticationToken companyAuthenticationToken, 2:string userPrincipal, 3:string userCredentials);

    DeviceAuthenticationResult authenticateDevice(1:AuthenticationToken UserAuthenticationToken, 2:string deviceId)

    void deauthenticate(1:AuthenticationToken token);
}