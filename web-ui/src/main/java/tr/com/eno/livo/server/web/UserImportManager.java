package tr.com.eno.livo.server.web;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import javax.management.MalformedObjectNameException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.users.User;
import tr.com.eno.livo.server.users.UserManagementService;

public class UserImportManager {

    public static final String DOMAIN = "System";

    private final static Logger LOGGER = LoggerFactory.
            getLogger(UserImportManager.class);

    private final File sourceFile;

    private Map<User, String> userMap;

    private final List<User> newUsers;

    private final List<User> failedImports;

    public UserImportManager(File sFile) throws RuntimeException {

        this.sourceFile = sFile;

        this.userMap = new HashMap<User, String>();

        this.newUsers = new LinkedList<>();

        this.failedImports = new LinkedList<>();

        if (this.sourceFile == null || this.sourceFile.isDirectory()) {
            throw new RuntimeException("Source file connot be null or directory!");
        }

    }

    public void importUsers() throws FileNotFoundException, IOException,
            InvalidFormatException, MalformedObjectNameException {

        UserManagementService service = (UserManagementService) ManagementHelper.getUserManagementService();

        FileInputStream stream = new FileInputStream(this.sourceFile);

        Workbook workBook = WorkbookFactory.create(stream);

        int sheets = workBook.getNumberOfSheets();

        for (int i = 0; i < sheets; i++) {

            Sheet sheet = workBook.getSheetAt(i);

            Cell checkCell = sheet.getRow(sheet.getFirstRowNum()).getCell(0);

            if (!checkCell.getStringCellValue().equalsIgnoreCase("Mail")
                    || checkCell.getCellType() != Cell.CELL_TYPE_STRING
                    || checkCell.getStringCellValue().isEmpty()) {
                throw new RuntimeException("First colum name must be Mail, can not be empty.");
            }

            Iterator<Row> rows = sheet.iterator();

            while (rows.hasNext()) {

                Row row = rows.next();

                Cell mail = row.getCell(0);

                if (mail.getStringCellValue().equalsIgnoreCase("Mail")) {
                    LOGGER.debug("First rows cell value Mail.");
                    continue;
                }
                Cell firstName = row.getCell(1);
                Cell lastName = row.getCell(2);
                User user;

                if (mail.getCellType() == Cell.CELL_TYPE_BLANK) {

                    LOGGER.debug("Null mail adress, ignoring user import...");

                    this.failedImports.add(new User(
                            mail.getStringCellValue().split("@")[0],
                            DOMAIN,
                            mail.getStringCellValue(),
                            firstName.getStringCellValue(),
                            lastName.getStringCellValue(),
                            true
                    ));
                } else if (mail.getCellType() == Cell.CELL_TYPE_STRING) {

                    String userName = mail.getStringCellValue().split("@")[0];

                    String password = new BigInteger(40, new SecureRandom()).
                            toString(32);

                    String email = mail.getStringCellValue();

                    user = new User(userName, DOMAIN, email, firstName.getStringCellValue(), lastName.getStringCellValue(), true);

                    try {

                        service.createUser(user, password);
                        //TODO add password  to map.
                        this.newUsers.add(user);
                        this.userMap.put(user, password);

                    } catch (Exception ex) {

                        LOGGER.error("Error during creation of new user, ignored...", ex);

                    }

                }

                //TODO Handle user extra information. Not supported in mw side such
                //  as <Full Name> <Department> <BlaBla>
               /* Iterator<Cell> cells = rows.next().cellIterator();
                
                 while(cells.hasNext()){
                 
                 Cell cell = cells.next();
                 }*/
            }
        }

    }

    public List<User> getImportedUsers() {

        return this.newUsers;
    }

    public List<User> getFails() {

        return this.failedImports;

    }
    
    public String getUserPassword(User user) {

        return this.userMap.get(user);
    }

}
