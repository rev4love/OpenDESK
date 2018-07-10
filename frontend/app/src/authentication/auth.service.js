'use strict'

angular
  .module('openDeskApp')
  .factory('authService', authService)

function authService ($http, $window, $state, sessionService, MemberService, notificationsService) {
  var service = {
    login: login,
    logout: logout,
    changePassword: changePassword,
    isAuthenticated: isAuthenticated,
    isAuthorized: isAuthorized,
    getUserInfo: getUserInfo,
    ssoLogin: ssoLogin
  }

  return service

  function getUserInfo () {
    return sessionService.getUserInfo()
  }

  function ssoLogin () {
    return $http.get('/alfresco/s/ssologin').then(function (response) {
      var username = response.data
      return MemberService.get(username).then(function (user) {
        sessionService.login(user, true)
        return user
      })
    })
  }

  function login (credentials) {
    return $http.post('/api/login', credentials).then(function (response) {
      sessionService.saveTicketToSession(response.data.data.ticket)
      return MemberService.get(credentials.username).then(function (user) {
        sessionService.login(user, false)
        return user
      })
    }, function (reason) {
      console.log(reason)
      return reason
    })
  }

  function logout () {
    var userInfo = sessionService.getUserInfo()
    if (userInfo) {
      var ticket = userInfo.ticket
      $http.delete('/api/login/ticket/' + ticket, {alf_ticket: ticket}).then(function (response) {
        sessionService.logout()
        notificationsService.stopUpdate()
        $state.go('login')
      })
    }
  }

  /**
     * Accepts a user email (which should be unique) bound to a unique user name, recreates a password for the user
     * and emails the user with the details required to login to the system.
     * @param email
     * @returns {*}
     */
  function changePassword (email) {
    return $http.post('/api/opendesk/reset-user-password', {email: email}).then(function (response) {
      return response
    })
  }

  function isAuthenticated () {
    return sessionService.getUserInfo()
  }

  function isAuthorized (authorizedRoles) {
    var userInfo = sessionService.getUserInfo()
    if (typeof userInfo === 'undefined')
      return false

    if (!angular.isArray(authorizedRoles))
      authorizedRoles = [authorizedRoles]

    return userInfo.user.capabilities.isAdmin ||
            (authorizedRoles.length > 0 && authorizedRoles.indexOf('user') > -1)
  }
}
