'use strict';

angular.module('openDeskApp.filebrowser')
    .factory('filebrowserService', fileBrowserService);

function fileBrowserService($http, alfrescoNodeUtils) {

    var currentFolderNodeRef;

    var service = {
        genericContentAction: genericContentAction,
        getCompanyHome: getCompanyHome,
        getContentList: getContentList,
        getCurrentFolderNodeRef: getCurrentFolderNodeRef,
        getHome: getHome,
        getSharedNodes: getSharedNodes,
        getTemplates: getTemplates,
        getUserHome: getUserHome,
        loadFromSbsys: loadFromSbsys,
        setCurrentFolder: setCurrentFolder,
        shareNode: shareNode,
        stopSharingNode: stopSharingNode
    };
    
    return service;

    function getCurrentFolderNodeRef() {
        return currentFolderNodeRef;
    }

    function setCurrentFolder(folderNodeRef) {
        currentFolderNodeRef = folderNodeRef;
    }

    function getCompanyHome() {
        return $http.get("/alfresco/service/node/companyHome", {}).then(function (response) {
            return response.data[0].nodeRef;
        });
    }

    function getContentList(nodeId) {
        return $http.get("/alfresco/service/node/" + nodeId + "/children").then(function (response) {
            return response.data;
        });
    }

    function getHome(type) {
        switch(type) {
            case "user":
                return getUserHome().then(function (nodeRef) {
                    return nodeRef;
                });
            case "company":
                return getCompanyHome().then(function (nodeRef) {
                    return nodeRef;
                });
        }
    }

    function getSharedNodes() {
        return $http.get("/alfresco/service/node/shared").then(function (response) {
            return response.data;
        });
    }

    function getTemplates(type) {
        return $http.post("/alfresco/service/template", {
            PARAM_METHOD: "get" + type + "Templates"
        }).then(function (response) {
            return response.data[0];
        });
    }

    function getUserHome() {
        return $http.get("/alfresco/service/node/userHome", {}).then(function (response) {
            return response.data[0].nodeRef;
        });
    }

    function loadFromSbsys(destinationNodeRef) {
        return $http.get("/alfresco/s/slingshot/doclib2/doclist/type/site/sbsysfakedata/documentLibrary", {}).then(function (sbsysfakedataResponse) {
            var nodeRefs = [];
            for (var i in sbsysfakedataResponse.data.items)
                nodeRefs.push(sbsysfakedataResponse.data.items[i].node.nodeRef);

            return $http.post("/alfresco/service/sbsys/fakedownload", {
                destinationNodeRef: destinationNodeRef,
                nodeRefs: nodeRefs
            }).then(function (response) {
                return response.data;
            });
        });
    }

    function genericContentAction(action, sourceNodeRefs, destinationNodeRef, parentNodeRef) {
        if(action === 'move') {
            return preProcessMove(sourceNodeRefs, destinationNodeRef).then(function () {
                return executeAction(action, sourceNodeRefs, destinationNodeRef, parentNodeRef).then(function (response) {
                    return response;
                });
            });
        }
        return executeAction(action, sourceNodeRefs, destinationNodeRef, parentNodeRef).then(function (response) {
            return response;
        });
    }

    function executeAction(action, sourceNodeRefs, destinationNodeRef, parentNodeRef) {
        return $http.post('/slingshot/doclib/action/' + action + '-to/node/' +
            alfrescoNodeUtils.processNodeRef(destinationNodeRef).uri, {
            nodeRefs: sourceNodeRefs,
            parentId: parentNodeRef
        }).then(function (response) {
            return response;
        });
    }

    function preProcessMove(sourceNodeRefs, destinationNodeRef) {
        return $http.put("/alfresco/service/node/preprocess",
            {
                destinationRef: destinationNodeRef,
                nodeRefs: sourceNodeRefs
            }).then(
            function (response) {
                return response.data[0];
            });
    }

    function shareNode(nodeRef, userName, permission) {
        var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        return $http.post("/alfresco/service/node/" + nodeId + "/share/" + userName + "/" + permission, {}).then(
            function (response) {
                return response.data[0];
            });
    }

    function stopSharingNode(nodeRef, userName, permission) {
        var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        return $http.delete("/alfresco/service/node/" + nodeId + "/share/" + userName + "/" + permission, {}).then(
            function (response) {
                return response.data[0];
            });
    }

}