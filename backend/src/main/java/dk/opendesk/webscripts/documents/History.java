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

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionHistory;
import org.alfresco.service.cmr.version.VersionService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Map;


public class History extends AbstractWebScript {


    private NodeService nodeService;
    private PersonService personService;
    private VersionService versionService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setVersionService(VersionService versionService) {
        this.versionService = versionService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {
        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        webScriptResponse.setContentEncoding("UTF-8");
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            NodeRef nodeRef = null;
            String storeType = params.get("STORE_TYPE");
            String storeId = params.get("STORE_ID");
            String nodeId = params.get("NODE_ID");

            if (storeType != null && storeId != null && nodeId != null) {
                nodeRef = new NodeRef(storeType, storeId, nodeId);
            }


            String version = params.get("versionNode");
            String parentNode = params.get("parentNode");
            String method = params.get("method");
            if (method != null) {
                switch (method) {
                    case "getAll":
                        result = getVersions(nodeRef);
                        break;
                    case "deleteVersion":
                        result = deleteVersion(parentNode, version);
                        break;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    /**
     * Gets all versions of a node.
     * (method = getAll)
     * @param nodeRef of the node.
     * @return a JSONArray containing all versions of the node.
     */
    private JSONArray getVersions(NodeRef nodeRef) throws JSONException {

        System.out.println("nodeRef" + nodeRef);

        JSONArray result = new JSONArray();
        VersionHistory h = versionService.getVersionHistory(nodeRef);

        if (h != null) {
            Collection<Version> versions = h.getAllVersions();

            for (Version v : versions) {

                JSONObject json = new JSONObject();

                json.put("parent_nodeRef", nodeRef.getId());
                json.put("nodeRef", v.getFrozenStateNodeRef().getId());

                NodeRef modifier = this.personService.getPerson(v.getFrozenModifier());

                json.put("modifier", nodeService.getProperty(modifier, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(modifier, ContentModel.PROP_LASTNAME));

                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                json.put("created", sdf.format(v.getFrozenModifiedDate()));

                json.put("version", v.getVersionLabel());

                result.add(json);
            }
        }

        return result;
    }

    private JSONArray deleteVersion(String parentNode, String versionNode) {

        NodeRef parentNodeRef = new NodeRef(parentNode);

        VersionHistory versionHistory = versionService.getVersionHistory(parentNodeRef);

        Version version = versionHistory.getVersion(versionNode);

        versionService.deleteVersion(parentNodeRef, version);

        return Utils.getJSONSuccess();
    }
}