package tr.com.eno.livo.server.web.controller;

import org.springframework.stereotype.Controller;

@Controller
public class FileController {
	
//	private static final Logger LOGGER = LoggerFactory.getLogger(FileController.class);
//	private static final Map<String,String> temporaryFileMimes = new HashMap<String, String>();
//
//	@RequestMapping(value = "/files/upload", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
//	@ResponseBody
//	public String upload(@RequestParam("file") MultipartFile file) throws Exception {
//		
//		// If send file is empty, return an error.
//		if (file.isEmpty()) {
//			
//			JsonObject obj = new JsonObject();
//			obj.addProperty("error", true);
//			obj.addProperty("message", "Either no file was chosen or the file has no content.");
//			
//			return obj.toString();
//		}
//		
//		// Create a temporary file with a unique name to hold the upload
//		String name;
//		do {
//			
//			name = UUID.randomUUID().toString();
//			
//		} while (!File.createTempFile(name, null).exists());
//		
//		// Try to create the file
//		File tmpFile = File.createTempFile(name, null);
//		tmpFile.createNewFile();
//		
//		// Create the message digest object for hashing
//		MessageDigest hash = MessageDigest.getInstance("SHA-1");
//		
//		// Open the file for writing
//		FileOutputStream fos = new FileOutputStream(tmpFile);
//		
//		// Read the sent file and write to the temporary file
//		BufferedInputStream bis = new BufferedInputStream(file.getInputStream());
//		int nextByte;
//		while ((nextByte = bis.read()) != -1) {
//			
//			// Update the hash
//			hash.update((byte) nextByte);
//			
//			// Write the byte to the temporary file
//			fos.write(nextByte);
//		}
//		
//		// Close the streams
//		bis.close();
//		fos.close();
//		
//		// Save the content type
//		synchronized (this.temporaryFileMimes) {
//			
//			this.temporaryFileMimes.put(name, file.getContentType());
//		}
//		
//		// Create a JSON object to return as the result
//		JsonObject result = new JsonObject();
//		result.addProperty("error", false);
//		JsonObject fileObj = new JsonObject();
//		fileObj.addProperty("hash", Hex.encodeHexString(hash.digest()));
//		fileObj.addProperty("uuid", name);
//		result.add("file", fileObj);
//		
//		return result.toString();
//	}
//	@RequestMapping(value = "/files/tmp/{uuid}", method = RequestMethod.POST)
//	public void showTempFile(@PathVariable("uuid") String uuid, HttpServletResponse response) throws Exception {
//		
//		File tmpFile = File.createTempFile(uuid, null);
//		
//		if (!tmpFile.exists()) {
//			
//			response.sendError(404);
//			return;
//		}
//		
//		synchronized (this.temporaryFileMimes) {
//			
//			response.setContentType(this.temporaryFileMimes.get(uuid));
//		}
//		
//		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(tmpFile));
//		
//		int nextByte;
//		while () {
//			
//		}
//	}
}
