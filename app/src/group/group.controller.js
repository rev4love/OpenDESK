angular
    .module('openDeskApp.group')
    .controller('GroupController', GroupController);

function GroupController($mdDialog, $mdToast, $translate, group, groupService, userService, avatarUtilsService,
                         sessionService) {

    var vm = this;
    vm.group = group;

    vm.cancelDialog = cancelDialog;
    vm.updateMembers = updateMembers;
    vm.search = search;
    vm.addMember = addMember;
    vm.removeMember = removeMember;
    vm.getMemberShortName = getMemberShortName;

    function cancelDialog () {
        $mdDialog.cancel();
    }

    function updateMembers() {
        this.cancelDialog();
        $translate('MEMBER.MEMBERS_UPDATED').then(function (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .hideDelay(3000)
            );
        });
    }

    function search(query) {
        if (query) {
            switch(vm.group.type){
                case 'USER':
                    return userService.getUsers(query);
                case 'GROUP':
                    return groupService.getGroups(query);
            }
        }
    }

    function addMember(member, groupName) {
        var shortName = this.getMemberShortName(member);
        groupService.addMember(shortName, groupName).then(function () {
            member.avatar = avatarUtilsService.getAvatarFromUser(member);
            if (member.avatar.indexOf("app/assets") === -1)
                member.avatar = sessionService.makeURL("/alfresco/s/" + member.avatar);
            vm.groups.push(member);
        });
    }

    function removeMember(member, groupName) {
        var shortName = this.getMemberShortName(member);
        groupService.removeMember(shortName, groupName);
    }

    function getMemberShortName(member) {
        if (member.userName)
            return member.userName;
        else if (member.fullName)
            return member.fullName;
        else return '';
    }
}