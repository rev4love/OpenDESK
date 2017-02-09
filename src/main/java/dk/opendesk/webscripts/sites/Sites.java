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
package dk.opendesk.webscripts.sites;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.*;

public class Sites extends AbstractWebScript {


    final Logger logger = LoggerFactory.getLogger(Sites.class);

    public class CustomComparator implements Comparator<SiteInfo> {
        @Override
        public int compare(SiteInfo o1, SiteInfo o2) {
            return o1.getTitle().compareTo(o2.getTitle());
        }
    }


    public void setAuthenticationService(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    AuthenticationService authenticationService;


    private NodeArchiveService nodeArchiveService;
    private SiteService siteService;
    private NodeService nodeService;
    private PersonService personService;

    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private PermissionService permissionService;

    public void setAuthorityService(AuthorityService authorityService) {
        this.authorityService = authorityService;
    }

    private AuthorityService authorityService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    public void setNodeArchiveService(NodeArchiveService nodeArchiveService) {
        this.nodeArchiveService = nodeArchiveService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        NodeRef nodeRef = null;
        String storeType = params.get("STORE_TYPE");
        String storeId = params.get("STORE_ID");
        String nodeId = params.get("NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            nodeRef = new NodeRef(storeType, storeId, nodeId);
        }


        String q = params.get("q");
        String method = params.get("method");

        System.out.println("method");
        System.out.println(method);

        if (method != null && method.equals("getAll")) {


            webScriptResponse.setContentEncoding("UTF-8");

            JSONArray result = this.getAllSites(q);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        } else if (method != null && method.equals("deleteTestSites")) {

            webScriptResponse.setContentEncoding("UTF-8");

            this.removeTestSites();

            JSONObject return_json = new JSONObject();
            JSONArray result = new JSONArray();

            try {

                return_json.put("status", "success");
                result.add(return_json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (method != null && method.equals("getSitesPerUser")) {

            JSONArray result = this.getAllSitesForCurrentUser();
            try {
                webScriptResponse.setContentEncoding("UTF-8");
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
         else if (method != null && method.equals("addUser")) {

            String siteShortName = params.get("siteShortName");
            String user = params.get("user");
            String group = params.get("group");

            this.addUser(siteShortName,user,group);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
         }
        else if (method != null && method.equals("removeUser")) {

            String siteShortName = params.get("siteShortName");
            String user = params.get("user");
            String group = params.get("group");

            this.removeUser(siteShortName,user,group);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
        else if (method != null && method.equals("addPermission")) {

            String siteShortName = params.get("siteShortName");
            String user = params.get("user");
            String role = params.get("role");

            this.addPermission(siteShortName, user, role);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
        else if (method != null && method.equals("removePermission")) {

            String siteShortName = params.get("siteShortName");
            String user = params.get("user");
            String role = params.get("role");

            this.removePermission(siteShortName, user, role);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
        else if (method != null && method.equals("getDBID")) {

            String siteShortName = params.get("siteShortName");

            Long DBID = this.getDBID(siteShortName);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("DBID", DBID);
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
        else if (method != null && method.equals("addLink")) {

            String source = params.get("source");
            String destination = params.get("destination");


            this.addLink(source, destination);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
        else if (method != null && method.equals("deleteLink")) {

            String source = params.get("source");
            String destination = params.get("destination");

            NodeRef source_n = new NodeRef("workspace://SpacesStore/" + source);
            NodeRef destination_n = new NodeRef("workspace://SpacesStore/" + destination);


            this.deleteLink(source_n, destination_n);

            JSONArray result = new JSONArray();
            JSONObject json = new JSONObject();


            try {
                json.put("result", "success");
                result.add(json);

                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }






    }

    private JSONArray getAllSites(String q) {
        JSONArray result = new JSONArray();

        System.out.println("hvad er q" + q);

        //TODO : carefully choose the number of sites to return
        List<SiteInfo> sites = siteService.findSites(q, 2000);

        // need to reverse the order of sites as they appear in wrong sort order
        Collections.sort(sites, new CustomComparator());

        Iterator i = sites.iterator();

        while (i.hasNext()) {
            JSONObject json = new JSONObject();

            SiteInfo s = (SiteInfo)i.next();

            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                json.put("created", sdf.format( s.getCreatedDate() ));
                json.put("title", s.getTitle());
                json.put("shortName", s.getShortName());

                NodeRef n = s.getNodeRef();
                json.put("nodeRef", n.toString());
                JSONObject creator = new JSONObject();

                NodeRef cn = this.personService.getPerson((String)nodeService.getProperty(n, ContentModel.PROP_CREATOR));

                creator.put("userName", (String)nodeService.getProperty(n, ContentModel.PROP_CREATOR));
                creator.put("firstName", (String)nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME));
                creator.put("lastName", (String)nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
                creator.put("fullName", (String)nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME) +" "+(String)nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
                json.put("creator", creator);

                json.put("description", s.getDescription());
            } catch (JSONException e) {
                e.printStackTrace();
            }

            result.add(json);
        }

        return result;
        }

    private JSONArray getAllSitesForCurrentUser() {

        JSONArray result = new JSONArray();

        List<SiteInfo> currentuser_sites = siteService.listSites(authenticationService.getCurrentUserName());

        // need to reverse the order of sites as they appear in wrong sort order
        Collections.sort(currentuser_sites, new CustomComparator());

        Iterator i = currentuser_sites.iterator();

        while (i.hasNext()) {
            JSONObject json = new JSONObject();

            SiteInfo s = (SiteInfo)i.next();

            if (currentuser_sites.contains(s)) {

                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                    json.put("created", sdf.format(s.getCreatedDate()));
                    json.put("title", s.getTitle());
                    json.put("shortName", s.getShortName());




                    NodeRef n = s.getNodeRef();
                    json.put("nodeRef", n.toString());

                    if (nodeService.hasAspect(n, OpenDeskModel.ASPECT_PD)) {
                        json.put("type",OpenDeskModel.pd_project);
                    }
                    else {
                        json.put("type",OpenDeskModel.project);
                    }

                    JSONObject creator = new JSONObject();

                    NodeRef cn = this.personService.getPerson((String) nodeService.getProperty(n, ContentModel.PROP_CREATOR));

                    creator.put("userName", (String) nodeService.getProperty(n, ContentModel.PROP_CREATOR));
                    creator.put("firstName", (String) nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME));
                    creator.put("lastName", (String) nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
                    creator.put("fullName", (String) nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME) + " " + (String) nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));




                    json.put("creator", creator);

                    json.put("description", s.getDescription());

                    result.add(json);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        return result;
    }

    public void removeTestSites() {

        ArrayList l = new ArrayList();
        l.add(OpenDeskModel.testsite_1);
        l.add(OpenDeskModel.testsite_2);
        l.add(OpenDeskModel.testsite_rename);
        l.add(OpenDeskModel.testsite_new_name);

        Iterator i = l.iterator();

        while (i.hasNext()) {
            String siteName = (String)i.next();

            SiteInfo site = siteService.getSite(siteName);

              if (site != null) {
                  siteService.deleteSite(siteName);
              }
        }
    }

    private void addUser(String siteShortName, String user, String group) {

        SiteInfo site = siteService.getSite(siteShortName);

        NodeRef nodeRef = site.getNodeRef();

        Long siteID = (Long)nodeService.getProperty(nodeRef, ContentModel.PROP_NODE_DBID);

        String groupName = "GROUP_" + siteID + "_" + group;

        authorityService.addAuthority(groupName, user);
    }

    private void removeUser(String siteShortName, String user, String group) {

        SiteInfo site = siteService.getSite(siteShortName);

        NodeRef nodeRef = site.getNodeRef();

        Long siteID = (Long)nodeService.getProperty(nodeRef, ContentModel.PROP_NODE_DBID);

        String groupName = "GROUP_" + siteID + "_" + group;

        authorityService.removeAuthority(groupName, user);
    }

    private Long getDBID(String siteShortName) {

        SiteInfo site = siteService.getSite(siteShortName);

        NodeRef nodeRef = site.getNodeRef();

        Long siteID = (Long)nodeService.getProperty(nodeRef, ContentModel.PROP_NODE_DBID);

        return siteID;
    }

    private void addPermission(String siteShortName, String user, String role) {

        System.out.println(siteShortName);
        System.out.println(user);
        System.out.println(role);

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();

        permissionService.setPermission(ref, user, role, true);
    }

    private void removePermission(String siteShortName, String user, String role) {

        System.out.println(siteShortName);
        System.out.println(user);
        System.out.println(role);

        NodeRef ref = siteService.getSite(siteShortName).getNodeRef();

        permissionService.deletePermission(ref, user, role);
    }

    private void addLink(String source_project, String destinaion_project) {

        SiteInfo source = siteService.getSite(source_project);
        SiteInfo destination = siteService.getSite(destinaion_project);

        // Get the documentLibrary of the site.
        NodeRef source_documentLib = siteService.getContainer(source.getShortName(), "documentlibrary");
        System.out.println(source_documentLib); // Get the documentLibrary of the site.

        NodeRef dest_documentLib = siteService.getContainer(destination.getShortName(), "documentlibrary");
        System.out.println(source_documentLib);

        // create link for source
        Map<QName, Serializable> linkProperties = new HashMap<QName, Serializable>();
        linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(destination.getNodeRef(), ContentModel.PROP_NAME));
        linkProperties.put(OpenDeskModel.PROP_LINK, destination.getShortName());



        ChildAssociationRef source_nodeRef = nodeService.createNode(source_documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(OpenDeskModel.OD_PREFIX, "link"), OpenDeskModel.TYPE_LINK, linkProperties);


         // create link for destination
         linkProperties = new HashMap<QName, Serializable>();
         linkProperties.put(ContentModel.PROP_NAME, nodeService.getProperty(source.getNodeRef(), ContentModel.PROP_NAME));
         linkProperties.put(OpenDeskModel.PROP_LINK, source.getShortName());


        ChildAssociationRef destination_nodeRef = nodeService.createNode(dest_documentLib, ContentModel.ASSOC_CONTAINS, QName.createQName(OpenDeskModel.OD_PREFIX, "link"), OpenDeskModel.TYPE_LINK, linkProperties);

        // for easy deletion of the links, we do a save of the nodeRefs on each side
        nodeService.setProperty(source_nodeRef.getChildRef(), OpenDeskModel.PROP_LINK_NODEREF, destination_nodeRef.getChildRef());
        nodeService.setProperty(destination_nodeRef.getChildRef(), OpenDeskModel.PROP_LINK_NODEREF, source_nodeRef.getChildRef());
    }

    private void deleteLink(NodeRef source, NodeRef destination) {
        nodeService.deleteNode(source);
        nodeService.deleteNode(destination);
    }
}