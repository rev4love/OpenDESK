/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package dk.opendesk.webscripts.documents;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.search.SearcherException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Template extends AbstractWebScript {

    private FileFolderService fileFolderService;
    private NodeService nodeService;
    private Repository repository;

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setRepository(Repository repository)
    {
        this.repository = repository;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        webScriptResponse.setContentEncoding("UTF-8");
        Content c = webScriptRequest.getContent();
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            JSONObject json = new JSONObject(c.getContent());
            String method = Utils.getJSONObject(json, "PARAM_METHOD");
            String nodeName = Utils.getJSONObject(json, "PARAM_NODE_NAME");
            String templateNodeId = Utils.getJSONObject(json, "PARAM_TEMPLATE_NODE_ID");
            String destinationNodeRefStr = Utils.getJSONObject(json, "PARAM_DESTINATION_NODEREF");

            switch (method) {

                case "getDocumentTemplates":
                    result = getTemplates(OpenDeskModel.NODE_TEMPLATES_PATH);
                    break;

                case "getFolderTemplates":
                    result = getTemplates(OpenDeskModel.SPACE_TEMPLATES_PATH);
                    break;

                case "createContentFromTemplate":
                    result = createContentFromTemplate(nodeName, templateNodeId, destinationNodeRefStr);
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    private NodeRef getTemplateFolderRef(List<String> templateFolderPath) throws SearcherException, JSONException, FileNotFoundException {
        NodeRef companyHome = repository.getCompanyHome();
        return fileFolderService.resolveNamePath(companyHome, templateFolderPath).getNodeRef();
    }

    private JSONArray getTemplates(List<String> path) throws SearcherException, JSONException, FileNotFoundException {

        NodeRef templateFolder = getTemplateFolderRef(path);

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(templateFolder);

        JSONArray children = new JSONArray();
        for (ChildAssociationRef child : childAssociationRefs) {
            JSONObject json = new JSONObject();

            Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());
            String name = (String) props.get(ContentModel.PROP_NAME);

            json.put("nodeRef", child.getChildRef().getId());
            json.put("name", name);

            ContentData contentData = (ContentData) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CONTENT);
            if(contentData != null) {
                String originalMimeType = contentData.getMimetype();
                json.put("mimeType", originalMimeType);
            }

            children.add(json);
        }

        JSONArray response = new JSONArray();
        response.add(children);
        return response;
    }

    private JSONArray createContentFromTemplate(String nodeName, String templateNodeId, String destinationNodeRefStr)
            throws JSONException, FileNotFoundException {

        NodeRef templateNodeRef = new NodeRef(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, templateNodeId);
        NodeRef destinationNodeRef = new NodeRef(destinationNodeRefStr);
        String fileName = Utils.getFileName(nodeService, destinationNodeRef, nodeName);

        FileInfo newFile = fileFolderService.copy(templateNodeRef, destinationNodeRef, fileName);
        // TODO apparently a file is still created on FileExistsException with noderef as name. Should be deleted.

        Map<String, Serializable> response = new HashMap<>();
        response.put("nodeRef", newFile.getNodeRef());
        response.put("fileName", fileName);
        return Utils.getJSONReturnArray(response);
    }
}
