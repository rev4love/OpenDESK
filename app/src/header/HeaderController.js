angular
    .module('openDeskApp')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, $mdComponentRegistry, APP_CONFIG, headerService, authService, notificationsService, userService) {
    var vm = this;

    $scope.headerService = headerService;
    $scope.notificationsService = notificationsService;
    $scope.user = authService.getUserInfo().user;

    $scope.title = 'titel';
    $scope.unseenNotifications = 0;

    $scope.landingPageState = APP_CONFIG.landingPageState;

    $scope.$watch('headerService.getTitle()', function (newVal) {
        $scope.title = newVal;
    });

    $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
        $scope.unseenNotifications = newVal;
    });

    $scope.toggleSystemSettings = function () {
        $state.go('systemsettings');
    }

    $scope.gotoLandingPage = function () {
        $state.go($scope.landingPageState);
    }

    $scope.toggleNotifications = buildToggler('notifications');
    $scope.toggleUserPanel = buildToggler('userpanel');
    $scope.toggleAppDrawer = buildToggler('appDrawer');

    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID,true).toggle();

            // $mdComponentRegistry.when(navID).then(function() {
            //     // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
            //     $mdSidenav(navID).toggle();
            //   })
        };
    }
}