namespace java tr.com.eno.livo.thrift.shared

struct File {

	1: required string path;
	2: required string hash;
	3: required i64 size;
	4: optional string contentType;
}

/*
 * Represents a provisioning profile which represents a specific state of the application in history.
 */
struct Profile {

	/*
	 * Cumulative hash of the profile. Calculated by combining the hashes of the file paths and preference entries.
	 */
	1: required string hash;
	/*
	 * Files contained within the profile.
	 */
	2: required set<File> files;
	/*
	 * Preferences which may be for the application.
	 * Completely replaces a previous profile's preferences if there is any. This should not be confused with user preferences.
	 */
	3: optional map<string,string> preferences;
}

struct AuthenticationToken {

	1: required string uniqueValue;
	2: required string companyId;
	3: required i64 authenticationTime;
	4: optional i64 expirationTime;
	5: optional string userPrincipal;
        6: optional string userDomain;
}
