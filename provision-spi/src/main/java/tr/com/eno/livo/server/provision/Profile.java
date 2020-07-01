package tr.com.eno.livo.server.provision;

import java.beans.ConstructorProperties;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import tr.com.eno.livo.server.file.File;

public class Profile {

	private Set<File> files;
	private String hash;
	private Map<String, String> preferences;

	public Profile() {

		this(null, new HashSet<File>(), new HashMap<String, String>());
	}

	@ConstructorProperties({ "hash", "files", "preferences" })
	public Profile(String hash, Set<File> files, Map<String, String> preferences) {

		this.hash = hash;
		this.files = files;
		this.preferences = preferences;
	}

	@Override
	public boolean equals(Object obj) {

		return this.hash.equals(((Profile) obj).hash);
	}

	public Set<File> getFiles() {
		return files;
	}

	public String getHash() {
		return hash;
	}

	public Map<String, String> getPreferences() {
		return preferences;
	}

	public void setHash(String hash) {
		this.hash = hash;
	}
}
