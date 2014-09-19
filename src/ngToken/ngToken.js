angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngIdle'])

    .run(function ($idle, $token, $window, $rootScope, $document) {
        var $scope = $rootScope;
        if($token.manageSessionTimeout) {
            $idle.watch();
            $scope.resetIdle = function () {
                $idle.unwatch();
                $idle.watch();
            };

            $scope.$on('startIdle', $scope.resetIdle());
            $scope.checkIdle = function (countdown) {
                if($token.getCachedToken()) {
                    if($token.$storage.lastTouch <= $scope.lastActivity || !$scope.lastActivity) {
                        $rootScope.$broadcast('$tokenWarn', countdown);
                    } else {
                        $scope.resetIdle();
                    }
                }
            };

            $document.on($idle._options().events, function () {
                var newdate = new Date();
                $token.$storage.lastTouch = newdate;
                $scope.lastActivity = newdate;
            });
            $scope.$on('$idleWarn', function (e, countdown) {
                console.log('warning: ' + countdown);
                $scope.checkIdle(countdown);
            });
            $scope.$on('$idleTimeout', function () {
                console.log('timeout');
                $token.sessionExpired();
                $rootScope.$broadcast('$tokenExpired');
            });
            $scope.$on('$keepalive', function(){
                $token.keepAlive();
            });
        }
    });