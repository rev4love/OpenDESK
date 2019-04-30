//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import moveDialog from './components/moveDialog.view.html'

angular
  .module('openDeskApp.fund')
  .controller('FundApplicationController', ['$scope', '$stateParams', '$state', 'fundService', 'browserService', 'headerService', 'alfrescoNodeService', 'fundApplicationEditing', '$mdDialog', FundApplicationController])

function FundApplicationController ($scope, $stateParams, $state, fundService, browserService, headerService, alfrescoNodeService, fundApplicationEditing, $mdDialog) {
  var vm = this

  $scope.application = null
  $scope.currentAppPage = $stateParams.currentAppPage || 'application'
  $scope.isEditing = fundApplicationEditing
  $scope.findField = findField
  vm.prevAppId = null
  vm.nextAppId = null
  vm.origValue = null
  vm.moveToBranch = null
  vm.branches = []
  vm.customFullscreen = false

  vm.moveApp = moveApp
  vm.editApplication = editApplication
  vm.saveApplication = saveApplication
  vm.cancelEditApplication = cancelEditApplication
  vm.paginateApps = paginateApps

  activate()

  function activate() {
    fundApplicationEditing.set(false) // set editing state to false, in case we edited an application, went to the list, and opened another application
    fundService.getApplication($stateParams.applicationID)
    .then(function (response) {
      $scope.application = response
      $scope.$broadcast('applicationWasLoaded', null)
      browserService.setTitle(response.title)
      headerService.setTitle(response.title)
      // if we have a workflow in store, but it doesn't match the workflow of the
      // application we just loaded, get new values for the store so we can
      // populate the left-hand nav. The same applies if we have no workflow in store
      // If we already have a matching workflow in store, don't do anything (reuse it)
      if ($scope.application.workflow) {
        if(!$scope.$parent.workflow || $scope.$parent.workflow && $scope.$parent.workflow.nodeID !== $scope.application.workflow.nodeID) { // need to also check that a workflow exists in the parent, otherwise we'll get an error of undefined
          fundService.getWorkflow($scope.application.workflow.nodeID)
          .then(function (response) {
            $scope.$parent.workflow = response
          })
        }
      }
      // similarly, if we have a state in store, but it doesn't match the state of the
      // application we just loaded, get new values for the store. The same applies if we have
      // no state in store. If we already have a matching state in store, don't do anything (reuse it)
      if ($scope.application.state) {
        if(!$scope.$parent.state || $scope.$parent.state && $scope.$parent.state.nodeID !== $scope.application.state.nodeID) { // need to also check that a state exists in the parent, otherwise we'll get an error of undefined
          fundService.getWorkflowState($scope.application.state.nodeID)
          .then(function (response) {
            $scope.$parent.state = response
          })
        }
      }
      // generate pagination links
      generatePaginationLinks()
    })
  }

  function moveApp () {
    $mdDialog.show({
      controller: 'MoveDialogController',
      controllerAs: 'self',
      template: moveDialog,
      parent: angular.element(document.body),
      locals: {
        application: $scope.application
      },
      clickOutsideToClose:true,
    })
  }

  function findField(fieldKey, fieldVal) {
    // We need a method that passes fields as references, not as values.
    // Two-way binding only works for references.

    // if no application, just return an empty object
    if (!$scope.application) {
      return {}
    }

    // in order to pass a reference, we need the index of the block and
    // the index of the field
    var blockIdx = -1
    var fieldIdx = -1
    $scope.application.blocks.forEach(function (block, i) {
      block.fields.forEach(function (field, j) {
        if (field[fieldKey] == fieldVal) {
          fieldIdx = j
          blockIdx = i
        }
      })
    })

    // if the field in question was not found, just return an empty object
    if (blockIdx < 0 && fieldIdx < 0) {
      return {}
    }

    return $scope.application.blocks[blockIdx].fields[fieldIdx]
  }

  function paginateApps(appId) {
    $state.go('fund.application', { applicationID: appId })
  }

  function editApplication() {
    vm.origValue = JSON.parse(JSON.stringify($scope.application)) // make a copy instead of passing a reference
    fundApplicationEditing.set(true)
  }

  function saveApplication () {
    fundApplicationEditing.set(false)

    // for each file field we have in the application, upload the
    // new file, if a new file has been added.
    // Only when all these uploads have succeeded can we update the application
    var files = []
    $scope.application.blocks.forEach(function (block) {
      block.fields.forEach(function (field) {
        if (field.component === 'file') {
          // the field only allows the user to select one file, so we can just
          // take item 0
          var file = document.getElementById(alfrescoNodeService.processNodeRef(field.nodeRef).id).files[0]
          if (file) {
            var upload = fundService.uploadContent(file, $scope.application.nodeID, field.nodeRef)
            .then(function (response) {
              field.value = alfrescoNodeService.processNodeRef(response.data.nodeRef).id
            })
            files.push(upload)
          }
        }
      })
    })

    Promise.all(files)
    .then(function () {
      fundService.updateApplication($scope.application.nodeID, $scope.application)
      .then(function (response) {
        if (response.status === 'OK') {
          activate()
        }
      })
    })
  }

  function cancelEditApplication () {
    $scope.application = JSON.parse(JSON.stringify(vm.origValue))
    fundApplicationEditing.set(false)
  }

  function generatePaginationLinks () {
    // load variables for next/previous buttons, if they exist
    if ($scope.$parent.state && $scope.$parent.state.applications) {
      var currAppIdx = $scope.$parent.state.applications.findIndex(app => app.nodeID == $scope.application.nodeID)
      var prevAppIdx = currAppIdx - 1 < 0 ? null : currAppIdx - 1 // we can't paginate to negative indices
      var nextAppIdx = currAppIdx + 1 >= $scope.$parent.state.applications.length ? null : currAppIdx + 1 // neither can we paginate to pages out of length
      vm.prevAppId = prevAppIdx !== null ? $scope.$parent.state.applications[prevAppIdx].nodeID : null
      vm.nextAppId = nextAppIdx !== null ? $scope.$parent.state.applications[nextAppIdx].nodeID : null
    }
  }

  // asynchronously generate prev/next links, as they may not be ready when we first load the page
  // (fundService needs to finish the requests)
  $scope.$on('workflowstatechange', function (event, args) {
    generatePaginationLinks()
  })

  vm.moveApplication = function () {
    if(vm.moveToBranch) {
      fundService.setApplicationState($scope.application.nodeID, vm.moveToBranch)
      .then(function () {
        activate()
      })
    }
  }
}
