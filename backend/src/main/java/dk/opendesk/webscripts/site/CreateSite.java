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
package dk.opendesk.webscripts.site;

import dk.opendesk.repo.beans.SiteBean;
import dk.opendesk.repo.utils.Utils;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class CreateSite extends OpenDeskWebScript {
    private SiteBean siteBean;

    public void setSiteBean(SiteBean siteBean) {
        this.siteBean = siteBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            String displayName = getContentString("displayName");
            String description = getContentString("description");
            String visibility = getContentString("visibility");
            SiteVisibility siteVisibility = Utils.getVisibility(visibility);
            arrayResult = siteBean.createSite(displayName, description, siteVisibility);
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}