package dk.opendesk.webscripts;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.MutableAuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.transaction.TransactionService;
import org.alfresco.util.PropertyMap;

import javax.transaction.UserTransaction;
import java.io.File;

public class TestUtils {

    public static final String STATUS = "status";
    public static final String SUCCESS = "success";
    public static final String ADMIN = "admin";

    public static final String USER_ONE = "user_one";
    public static final String USER_ONE_FIRSTNAME = "user";
    public static final String USER_ONE_LASTNAME = "one";
    public static final String USER_ONE_EMAIL = "user_one@testtest.dk";
    public static final String USER_ONE_GROUP = "Collaborator";
    public static final String SITE_ONE = "user_one_site_one";
    public static final String SITE_TWO = "user_one_site_two";
    public static final String SITE_THREE = "user_one_site_three";

    public static NodeRef createUser(TransactionService transactionService, PersonService personService,
                                  MutableAuthenticationService authenticationService, String userName) {

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            authenticationService.createAuthentication(userName, "PWD".toCharArray());

            PropertyMap ppOne = new PropertyMap(4);
            ppOne.put(ContentModel.PROP_USERNAME, userName);
            ppOne.put(ContentModel.PROP_FIRSTNAME, "firstName");
            ppOne.put(ContentModel.PROP_LASTNAME, "lastName");
            ppOne.put(ContentModel.PROP_EMAIL, "email@email.com");
            ppOne.put(ContentModel.PROP_JOBTITLE, "jobTitle");

            return personService.createPerson(ppOne);
        });
    }

    public static SiteInfo createSite(TransactionService transactionService, SiteService siteService, String siteShortName){

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            return siteService.createSite("site-dashboard", siteShortName, siteShortName, "desc", SiteVisibility.PUBLIC);
        });
    }

    public static NodeRef uploadFile(TransactionService transactionService, ContentService contentService,
                                     FileFolderService fileFolderService, NodeRef parent) {

        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            final String filename = "Test_Upload";
            File file = new File("src/test/resources/Test_Upload.pdf");

            FileInfo fileInfo = fileFolderService.create(parent, filename, ContentModel.PROP_CONTENT);
            NodeRef node = fileInfo.getNodeRef();

            ContentWriter writer = contentService.getWriter(node, ContentModel.PROP_CONTENT, true);
            writer.setMimetype(MimetypeMap.MIMETYPE_TEXT_PLAIN);
            writer.setEncoding("UTF-8");
            writer.putContent(file);
            return node;
        });
    }

    public static Boolean deleteSite(TransactionService transactionService, SiteService siteService, String siteShortName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            siteService.deleteSite(siteShortName);
            return true;
        });
    }

    public static Boolean deletePerson(TransactionService transactionService, PersonService personService, String userName) {
        return transactionService.getRetryingTransactionHelper().doInTransaction(() -> {
            personService.deletePerson(userName);
            return true;
        });
    }
}
