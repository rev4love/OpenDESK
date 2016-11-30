'use strict';

angular.module('openDeskApp.documents')
    .controller('DocumentController', DocumentController);

function DocumentController($scope, documentService, $stateParams, $location, documentPreviewService, alfrescoDownloadService, $mdDialog, notificationsService, authService) {
    
    var vm = this;
    vm.doc = [];
    vm.plugin = [];
    vm.paths = [];


    vm.newFolderDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/reviewComment.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };


    // prepare to handle a preview of a document to review
    var paramValue = $location.search().dtype;

    if (paramValue == "wf") {
        vm.wf_from = $location.search().from;
        vm.wf_doc = $location.search().doc;
        vm.wf = true;
    }

    vm.createWFNotification = function(comment) {

        notificationsService.addWFNotice(authService.getUserInfo().user.userName, vm.wf_from, "review svar", comment, vm.wf_doc, "wf-response").then (function (val) {
            $mdDialog.hide();
        });
    }

    //vm.createReviewNotification = function (documentNodeRef, receiver, subject, comment) {
    //
    //    var s = documentNodeRef.split("/");
    //    var ref = (s[3])
    //
    //    notificationsService.addWFNotice(authService.getUserInfo().user.userName, receiver, subject, comment, ref, "wf-response").then (function (val) {
    //        $mdDialog.hide();
    //    });
    //
    //
    //}


    documentService.getDocument($stateParams.doc).then(function(response) {

        vm.doc = response.item;

        // Compile paths for breadcrumb directive
        vm.paths = buildBreadCrumbPath(response);
        
        function buildBreadCrumbPath(response) {
            var paths = [
                {
                    title: 'Projekter',
                    link: '#/projekter'
                },
                {
                    title: response.item.location.siteTitle,
                    link: '#/projekter/' + response.item.location.site
                }
            ];
            var pathArr = response.item.location.path.split('/');
            var pathLink = '/';
            for (var a in pathArr) {
                if (pathArr[a] !== '') {
                    paths.push({
                        title: pathArr[a],
                        link: '#/projekter/' + response.item.location.site + pathLink + pathArr[a]
                    });
                    pathLink = pathLink + pathArr[a] + '/';
                };
            };
            paths.push({
                title: response.item.location.file,
                link: response.item.location.path
            });
            return paths;
        };
        
    });
    
    
    documentPreviewService.previewDocumentPlugin('workspace://SpacesStore/' + $stateParams.doc).then(function(plugin){
        
        vm.plugin = plugin;
        $scope.config = plugin;
        $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl;
    
        $scope.download = function(){
            alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName);
        };
        
        if(plugin.initScope){
            plugin.initScope($scope);
        }
        
    });
    
};