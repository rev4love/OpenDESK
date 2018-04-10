package dk.opendesk.webscripts.node;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.webscripts.TestUtils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.BaseWebScriptTest;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TestWebScriptServer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class GetChildrenTest extends BaseWebScriptTest {

    private static Logger log = Logger.getLogger(GetChildrenTest.class);

    private NodeArchiveService nodeArchiveService = (NodeArchiveService) getServer().getApplicationContext().getBean("nodeArchiveService");
    private SiteService siteService = (SiteService) getServer().getApplicationContext().getBean("siteService");
    private TransactionService transactionService = (TransactionService) getServer().getApplicationContext().getBean("transactionService");
    private ContentService contentService = (ContentService) getServer().getApplicationContext().getBean("contentService");
    private FileFolderService fileFolderService = (FileFolderService) getServer().getApplicationContext().getBean("fileFolderService");
    private AuthorityService authorityService = (AuthorityService) getServer().getApplicationContext().getBean("authorityService");

    private Map<String, SiteInfo> sites = new HashMap<>();

    public GetChildrenTest() {
        super();
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();

        // SITES
        sites.put(TestUtils.SITE_ONE, null);

        for (Map.Entry<String, SiteInfo> site : sites.entrySet()) {
            site.setValue(TestUtils.createSite(transactionService, siteService, site.getKey()));
        }
    }

    public void testGet3Children() throws IOException, JSONException {
        log.debug("GetChildrenTest.testGet3Children");

        NodeRef docLibRef = siteService.getContainer(TestUtils.SITE_ONE, OpenDeskModel.DOC_LIBRARY);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE1);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE2);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE3);

        String nodeId = docLibRef.getId();
        assertWebScript(nodeId, 3);
    }

    public void testGet4Children() throws IOException, JSONException {
        log.debug("GetChildrenTest.testGet4Children");

        NodeRef docLibRef = siteService.getContainer(TestUtils.SITE_ONE, OpenDeskModel.DOC_LIBRARY);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE1);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE2);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE3);

        TestUtils.uploadFile(transactionService, contentService, fileFolderService,
                docLibRef, TestUtils.FILE_TEST_TEMPLATE4);

        String nodeId = docLibRef.getId();
        assertWebScript(nodeId, 4);
    }

    private JSONArray assertWebScript(String nodeId, int childrenCount) throws IOException, JSONException {
        JSONArray returnJSON = executeWebScript(nodeId);
        assertEquals(childrenCount, returnJSON.length());
        return returnJSON;
    }

    private JSONArray executeWebScript(String nodeId) throws IOException, JSONException {
        Map<String, String> args = new HashMap<String, String>() {
            {
                put("nodeId", nodeId);
            }
        };
        return executeWebScript(args);
    }

    private JSONArray executeWebScript (Map<String, String> args) throws IOException, JSONException {
        String url = "node/" + args.get("nodeId") + "/children";
        TestWebScriptServer.Request request = new TestWebScriptServer.GetRequest(url);
        TestWebScriptServer.Response response = sendRequest(request, Status.STATUS_OK, TestUtils.ADMIN);
        return new JSONArray(response.getContentAsString());
    }

    @Override
    protected void tearDown() throws Exception
    {
        super.tearDown();

        // Delete and purge and then create sites
        for (String siteShortName : sites.keySet()) {
            TestUtils.deleteSite(transactionService, siteService, authorityService, siteShortName);
        }
        nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
    }
}