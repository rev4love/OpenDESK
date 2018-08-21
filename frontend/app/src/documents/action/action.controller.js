'use strict'

import '../../shared/services/editOnlineMSOffice.service'
import confirmEditVersionDialogTemplate from '../view/confirmEditVersionDialog.html'
import uploadNewVersionTemplate from '../../filebrowser/view/content/document/uploadNewVersion.tmpl.html'

angular.module('openDeskApp.documents')
  .controller('DocumentActionController', ['$mdDialog', '$location', '$scope', '$state', '$stateParams', '$window',
    'alfrescoDownloadService', 'ContentService', 'documentService', 'editOnlineMSOfficeService', 'publicShareService',
    DocumentActionController])

function DocumentActionController ($mdDialog, $location, $scope, $state, $stateParams, $window, alfrescoDownloadService,
  ContentService, documentService, editOnlineMSOfficeService, publicShareService) {
  var vm = this
  vm.canEdit = false
  vm.uploading = false
  vm.acceptEditVersionDialog = acceptEditVersionDialog
  vm.cancelDialog = cancelDialog
  vm.downloadDocument = downloadDocument
  vm.editInLibreOffice = editInLibreOffice
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.onPublicSharedUrlClick = onPublicSharedUrlClick
  vm.reviewDocumentsDialog = reviewDocumentsDialog
  vm.sharePublic = sharePublic
  vm.stopSharingPublic = stopSharingPublic
  vm.updatePreview = updatePreview
  vm.uploadNewVersionDialog = uploadNewVersionDialog
  vm.uploadNewVersion = uploadNewVersion

  vm.$onInit = function () {
    activate()
  }

  function activate () {
    documentService.getEditPermission(vm.doc.parentNodeId)
      .then(function (val) {
        vm.canEdit = val
      })

    vm.isLocked = vm.doc.node.isLocked
    if (vm.isLocked)
      vm.lockType = vm.doc.node.properties['cm:lockType']
    var mimeType = vm.doc.node.mimetype

    vm.loolEditable = ContentService.isLibreOfficeEditable(mimeType, vm.isLocked)
    vm.msOfficeEditable = ContentService.isMsOfficeEditable(mimeType, vm.isLocked)
    vm.onlyOfficeEditable = ContentService.isOnlyOfficeEditable(mimeType, vm.isLocked, vm.lockType)

    vm.isPublicShared = vm.doc.node.properties['qshare:sharedId']
    if (vm.isPublicShared) {
      vm.sharedId = vm.doc.node.properties['qshare:sharedId']
      setPublicSharedUrl()
    }
  }

  function acceptEditVersionDialog (editor) {
    if (editor === 'only-office')
      var newPage = $window.open()

    var selectedVersion = $location.search().version
    ContentService.revertToVersion('no comments', true, vm.doc.node.nodeRef, selectedVersion).then(
      function (response) {
        if (editor === 'libre-office')
          $state.go('lool', {
            'nodeRef': vm.doc.node.nodeRef,
            'versionLabel': vm.doc.version,
            'parent': response.config.data.nodeRef
          })

        else if (editor === 'ms-office')
          editOnlineMSOfficeService.editOnline(vm.doc)

        else if (editor === 'only-office')
          newPage.location.href = $state.href('onlyOfficeEdit', {'nodeRef': vm.doc.parentNodeId})

        cancelDialog()
      })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function downloadDocument () {
    var versionRef = vm.doc.store + vm.doc.nodeId
    alfrescoDownloadService.downloadFile(versionRef, vm.doc.location.file)
  }

  function editInOnlyOffice () {
    if (isVersion())
      showEditVersionDialog('only-office')
    else
      $window.open($state.href('onlyOfficeEdit', { 'nodeRef': vm.doc.node.nodeRef.split('/')[3] }))
  }

  // Goes to the libreOffice online edit page
  function editInLibreOffice () {
    if (isVersion())
      showEditVersionDialog('libre-office')
    else
      $state.go('lool', {
        'nodeRef': vm.doc.node.nodeRef
      })
  }

  function editInMSOffice () {
    if (isVersion())
      showEditVersionDialog('ms-office')
    else
      editOnlineMSOfficeService.editOnline(vm.doc)
  }

  function isVersion () {
    var ref = vm.doc.nodeId
    var isFirstInHistory = ref === vm.doc.firstDocumentNode
    return vm.doc.hasParent && !isFirstInHistory
  }

  function reviewDocumentsDialog () {
    $mdDialog.show({
      template: '<md-dialog od-create-review node-id="DAC.doc.parentNodeId"></md-dialog>',
      scope: $scope,
      preserveScope: true
    })
  }

  function sharePublic () {
    publicShareService.share(vm.doc.node.nodeRef)
      .then(function (response) {
        vm.sharedId = response.sharedId
        setPublicSharedUrl()
      })
  }

  function stopSharingPublic () {
    publicShareService.stopSharing(vm.sharedId)
      .then(function () {
        vm.sharedId = undefined
      })
  }

  function showEditVersionDialog (editor) {
    $scope.editor = editor
    $mdDialog.show({
      template: confirmEditVersionDialogTemplate,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function setPublicSharedUrl () {
    var href = $state.href('publicSharedDocument',
      {
        'sharedId': vm.sharedId
      })
    var port = $location.port() ? ':' + $location.port() : ''
    var domain = $location.host() + port
    vm.publicSharedUrl = domain + href
  }

  function onPublicSharedUrlClick ($event) {
    $event.target.select()
  };

  function updatePreview () {
    $state.reload()
  }

  function uploadNewVersionDialog () {
    $mdDialog.show({
      template: uploadNewVersionTemplate,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file) {
    vm.uploading = true
    ContentService.uploadNewVersion(file, vm.doc.parent.nodeRef, vm.doc.node.nodeRef)
      .then(function () {
        vm.uploading = false
        $mdDialog.cancel()
        updatePreview()
      })
  }
}
