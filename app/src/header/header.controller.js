angular
    .module('openDeskApp.header')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, APP_CONFIG, headerService, authService, notificationsService, userService) {
    var vm = this;

    vm.avatar = userService.getAvatarFromUser(authService.getUserInfo().user);
    vm.title = '';
    vm.toggleAppDrawer = buildToggler('appDrawer');
    vm.toggleNotifications = buildToggler('notifications');
    vm.toggleSystemSettings = toggleSystemSettings;
    vm.toggleUserPanel = buildToggler('userpanel');
    vm.unseenNotifications = 0;
    vm.user = authService.getUserInfo().user;

    function toggleSystemSettings() {
        $state.go('systemsettings');
    }

    $scope.headerService = headerService;
    $scope.notificationsService = notificationsService;

    $scope.$watch('headerService.getTitle()', function (newVal) {
        $scope.title = newVal;
    });

    $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
        $scope.unseenNotifications = newVal;
    });

    function buildToggler(navID) {
        return function () {
            $mdSidenav(navID).toggle();
        };
    }
}