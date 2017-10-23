'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteEditController', SiteEditController);

function SiteEditController(sitedata, $state, $scope, $mdDialog, siteService, userService, $mdToast, filterService,
                            groupService) {

    var vm = this;
    var availProjectOwners = [];

    vm.availStates = ['ACTIVE','CLOSED'];
    vm.availOrgs = [];
    vm.cancelDialog = cancelDialog;
    vm.newSite = sitedata;
    vm.site = sitedata;
    vm.searchPeople = searchPeople;
    vm.searchProjectOwners = searchProjectOwners;
    vm.updateSite = updateSite;

    activate();

    function activate() {
        siteService.getSiteOwner().then(function (owner) {
            vm.newSite.owner = owner;
        });

        siteService.getSiteManager().then(function (manager) {
            vm.newSite.manager = manager;
        });

        siteService.getAllOrganizationalCenters().then(function (response) {
            vm.availOrgs = response.data;
        });

        siteService.getAllOwners().then(function (response) {
            availProjectOwners = response;
        });

        vm.newSite.isPrivate = (vm.site.visibility === 'PRIVATE' ? true : false);
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }
    
    function getOwners() {
        availProjectOwners = groupService.getProjectOwners();
    }

    function searchProjectOwners(query) {
        return filterService.search(availProjectOwners, {
            displayName: query
        });
    }

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    function updatePdSite() {
        siteService.updatePDSite(vm.newSite).then(function (response) {
            $mdDialog.cancel();
            $state.reload();
            $mdToast.show(
                $mdToast.simple()
                .textContent('Du har opdateret: ' + vm.newSite.title)
                .hideDelay(3000)
            );
        },function (err) {
            console.log(err);
        });
    }

    function updateSite() {
        vm.newSite.visibility = vm.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC';

        if(vm.site.type == 'PD-Project') {
            updatePdSite();
            return;
        }

        siteService.updateSite(vm.newSite).then(function (response) {
            $mdDialog.cancel();
            $state.reload();
            $mdToast.show(
                $mdToast.simple()
                .textContent('Du har opdateret: ' + vm.newSite.siteName)
                .hideDelay(3000)
            );
        });
    }

}