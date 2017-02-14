'use strict';
angular
    .module('openDeskApp.lool', ['ngMaterial', 'pascalprecht.translate'])
    .config(config)
    .factory('serialzeJSONObject', serialzeJSONObject);;

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('lool', {
        parent: 'site',
        url: '/lool/',
        params: {nodeRef: null},
        views: {
            'content@': {
                templateUrl: 'app/src/lool/view/lool.html',
                controller: 'LoolController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}

/**
 * The workhorse; converts an object to x-www-form-urlencoded serialization.
 * @param {Object} obj
 * @return {String}
 */
function serialzeJSONObject(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
        value = obj[name];

        if (value instanceof Array) {
            for (i = 0; i < value.length; ++i) {
                subValue = value[i];
                fullSubName = name + '[' + i + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += serializeObj(innerObj) + '&';
            }
        }
        else if (value instanceof Object) {
            for (subName in value) {
                subValue = value[subName];
                fullSubName = name + '[' + subName + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += param(innerObj) + '&';
            }
        }
        else if (value !== undefined && value !== null)
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
}