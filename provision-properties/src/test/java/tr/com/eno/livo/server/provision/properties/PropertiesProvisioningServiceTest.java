package tr.com.eno.livo.server.provision.properties;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertTrue;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.security.NoSuchAlgorithmException;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.UUID;
import org.apache.commons.io.FileUtils;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationService;
import tr.com.eno.livo.server.application.Asset;
import tr.com.eno.livo.server.authc.AuthenticationToken;

/**
 *
 * @author Deniz Acay
 */
public class PropertiesProvisioningServiceTest {

	@org.testng.annotations.BeforeClass
	public static void setUpClass() throws Exception {
	}

	@org.testng.annotations.AfterClass
	public static void tearDownClass() throws Exception {
	}

	@SuppressWarnings("unchecked")
	@org.testng.annotations.BeforeMethod
	public void setUpMethod(Method method) throws Exception {

		if (method.getName().equals("testStartWithoutEnvSet")) {

			Class<?> processEnvironmentClass = Class
					.forName("java.lang.ProcessEnvironment");
			Field theEnvironmentField = processEnvironmentClass
					.getDeclaredField("theEnvironment");
			theEnvironmentField.setAccessible(true);
			Map<String, String> env = (Map<String, String>) theEnvironmentField
					.get(null);
			env.clear();
			Field theCaseInsensitiveEnvironmentField = processEnvironmentClass
					.getDeclaredField("theCaseInsensitiveEnvironment");
			theCaseInsensitiveEnvironmentField.setAccessible(true);
			Map<String, String> cienv = (Map<String, String>) theCaseInsensitiveEnvironmentField
					.get(null);
			cienv.clear();

		} else {

			File tempFile = new File(System.getProperty("user.home"),
					"AEON_HOME.tmp");
			tempFile.mkdirs();

			assertTrue(tempFile.exists());

			Class<?> processEnvironmentClass = Class
					.forName("java.lang.ProcessEnvironment");
			Field theEnvironmentField = processEnvironmentClass
					.getDeclaredField("theEnvironment");
			theEnvironmentField.setAccessible(true);
			Map<String, String> env = (Map<String, String>) theEnvironmentField
					.get(null);
			env.clear();
			env.put("AEON_HOME", tempFile.getAbsolutePath());
			Field theCaseInsensitiveEnvironmentField = processEnvironmentClass
					.getDeclaredField("theCaseInsensitiveEnvironment");
			theCaseInsensitiveEnvironmentField.setAccessible(true);
			Map<String, String> cienv = (Map<String, String>) theCaseInsensitiveEnvironmentField
					.get(null);
			cienv.clear();
			cienv.put("AEON_HOME", tempFile.getAbsolutePath());
		}
	}

	@org.testng.annotations.AfterMethod
	public void tearDownMethod() throws Exception {

		File tempFile = new File(System.getProperty("user.home"),
				"AEON_HOME.tmp");
		FileUtils.deleteDirectory(tempFile);
	}

	@org.testng.annotations.Test
	public void testCreateProvision() throws IOException,
			NoSuchAlgorithmException {

		PropertiesProvisioningService instance = new PropertiesProvisioningService();
		instance.start(null);

		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.MONTH, 1);
		Date expirationDate = calendar.getTime();

		Application application = new Application("test", Application.DEFAULT_DOMAIN, true, null);

		File assetsDirectory = new File(System.getenv("AEON_HOME"), "assets");
		File appAssetsDirectory = new File(assetsDirectory, "test");
		appAssetsDirectory.mkdirs();

		File tempFile = new File(appAssetsDirectory, "test.html");
		tempFile.createNewFile();

		String tempFileContent = Integer.toHexString(new Random().nextInt());

		FileWriter fw = new FileWriter(tempFile);
		fw.write(tempFileContent);
		fw.close();

		String tempFileHash = instance.calculateHashForFile(tempFile);

		Properties profileProperties = new Properties();
		profileProperties.put(tempFileHash, "test.html");
		String profileHash = instance
				.calculateHashForProfile(profileProperties);

		Asset asset = new Asset();
		asset.setFile(new tr.com.eno.livo.server.file.File(tempFileHash,
				"test.html", null));
		application.addAsset("test", asset);

		instance.createProvision(application);

		File provisionDirectory = new File(System.getenv("AEON_HOME"),
				"provision");
		File appProvisionDirectory = new File(provisionDirectory, "test");
		File filesDirectory = new File(System.getenv("AEON_HOME"), "files");

		assertTrue(appProvisionDirectory.exists());

		assertEquals(appProvisionDirectory.listFiles().length, 1);
		assertEquals(filesDirectory.listFiles().length, 1);

		assertEquals(filesDirectory.list()[0], tempFileHash);
		assertEquals(appProvisionDirectory.list()[0], profileHash);

		profileProperties.put("test", "test.html");
		String lastProfileHash = instance
				.calculateHashForProfile(profileProperties);

		assertNotEquals(profileHash, lastProfileHash);
	}

	/**
	 * Test of createProvision method, of class PropertiesProvisioningService.
	 */
	@org.testng.annotations.Test(expectedExceptions = NullPointerException.class, expectedExceptionsMessageRegExp = "Passed application argument is null.")
	public void testCreateProvisionWithNullApplication() {

		PropertiesProvisioningService instance = new PropertiesProvisioningService();
		instance.start(null);

		Application application = null;

		instance.createProvision(application);
	}

	/**
	 * Test of start method, of class PropertiesProvisioningService.
	 */
	@org.testng.annotations.Test
	public void testStart() {

		PropertiesProvisioningService instance = new PropertiesProvisioningService();

		Map<String, Object> config = null;
		instance.start(config);
	}

	/**
	 * Test of start method, of class PropertiesProvisioningService.
	 */
	@org.testng.annotations.Test(expectedExceptions = RuntimeException.class, expectedExceptionsMessageRegExp = "Please set the \"AEON_HOME\" environment variable before launching AEON server.")
	public void testStartWithoutEnvSet() {

		PropertiesProvisioningService instance = new PropertiesProvisioningService();

		Map<String, Object> config = null;
		instance.start(config);
	}

	/**
	 * Test of stop method, of class PropertiesProvisioningService.
	 */
	@org.testng.annotations.Test
	public void testStop() {
		PropertiesProvisioningService instance = new PropertiesProvisioningService();
		instance.stop();
	}
}
