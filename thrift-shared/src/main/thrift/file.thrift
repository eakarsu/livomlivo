namespace java tr.com.eno.livo.thrift.file

include "shared.thrift"

typedef shared.Profile Profile
typedef shared.File File

struct FileTransferSession {

	1: required string id;
	2: required i64 bucketCount;
	3: required i64 currentIndex = 0;
	4: required File file;
}

service FileTransferService {

	FileTransferSession initiateSession(1:File file, 2:i64 bucketSize);

	void destroySession(1:FileTransferSession session);

	binary fetchBucket(1:FileTransferSession session);
}
