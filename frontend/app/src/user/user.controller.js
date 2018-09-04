'use strict'
import '../shared/services/preference.service'

angular
  .module('openDeskApp.user')
  .controller('UserController', ['$scope', '$mdSidenav', 'userService', 'memberService', 'sessionService',
    'preferenceService', UserController])

function UserController ($scope, $mdSidenav, userService, memberService, sessionService, preferenceService) {
  var vm = this

  vm.close = close
  vm.setNotificationPreferences = setNotificationPreferences
  vm.user = userService.get()

  $scope.uploadAvatar = uploadAvatar

  loadNotificationPreferences()

  function close () {
    $mdSidenav('userpanel').close()
  }

  function loadNotificationPreferences () {
    preferenceService.getNotificationPreferences()
      .then(function (response) {
        vm.receiveNotifications = response
      })
  }

  function setNotificationPreferences () {
    preferenceService.setNotificationPreferences(vm.receiveNotifications)
  }

  function uploadAvatar (element) {
    var file = element.files[0]
    userService.uploadAvatar(file)
      .then(function (data) {
        loadAvatar()
        return data
      })
  }

  function loadAvatar () {
    memberService.get(vm.user.userName)
      .then(function (user) {
        vm.user.avatar = user.avatar
        userService.updateAvatar(user.avatar)
      })
  }
}
