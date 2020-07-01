namespace java tr.com.eno.livo.thrift.analytics

include "shared.thrift"

typedef shared.AuthenticationToken AuthenticationToken

struct Event {

  1: required string id;
  2: required string name;
  3: optional map<string, string> parameters;
  4: optional i64 startTime;
  5: optional i64 endTime;
}

struct Error {

  1: required string id;
  2: required i64 time;
  3: required string message;
  4: optional map<string, string> parameters;
}

exception EventRecordFailedError {

    1: required string message;
    2: optional Event event;
    3: optional Error error;
}

service AnalyticsService {

  bool isOptedIn(1: AuthenticationToken token);
  void optOut(1: AuthenticationToken token);
  void optIn(1: AuthenticationToken token);

  void logEvent(1: AuthenticationToken token, 2: Event event) throws (1: EventRecordFailedError erfe);
  void logError(1: AuthenticationToken token, 2: Error error) throws (1: EventRecordFailedError erfe);
}
