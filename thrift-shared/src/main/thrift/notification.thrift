namespace java tr.com.eno.livo.thrift.notification

include "shared.thrift"

typedef shared.AuthenticationToken AuthenticationToken

struct DeviceRegistrationInfo{

    1: required bool registered;
    2: optional string nspToken;
    3: optional string senderIdentifier
}

exception DeviceRegistrationFailedError {

    1: required string message;
    2: optional i16 errorCode;
}

service NotificationRegistrationService {

  void registerDevice(1: AuthenticationToken token, 2: string appName, 3: string clientType, 4: string deviceId, 5: string nspToken) throws (1:DeviceRegistrationFailedError drfe);
  DeviceRegistrationInfo checkDeviceRegistration(1: AuthenticationToken token, 2: string appName, 3:string deviceId, 4: string clientType);
  bool unregisterDevice(1: AuthenticationToken token,2:string appName,3:string deviceId, 4: string clientType);
}
