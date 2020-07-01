namespace java tr.com.eno.livo.thrift.provision

include "shared.thrift"

typedef shared.AuthenticationToken AuthenticationToken
typedef shared.Profile Profile

service ProvisioningService {

	Profile checkProvision(1:AuthenticationToken token, 2:string applicationId, 3:Profile localProfile);
}
