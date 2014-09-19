(function () {
    var app = angular.module('ngToken.TimeoutManager', ['ngToken.Provider', 'ngIdle']);
    app.factory('$tokenTimeout', function ($idle, $token, $window, $rootScope, $document) {
        var timeout = {};

        timeout.checkIdle = function (countdown) {
            if($token.getCachedToken()) {
                if($token.$storage.lastTouch <= this.lastActivity || !this.lastActivity) {
                    $rootScope.$broadcast('$tokenWarn', countdown);
                } else {
                    this.resetIdle();
                }
            }
        };

        timeout.resetIdle = function () {
            $idle.unwatch();
            $idle.watch();
        };

        timeout.watch = function () {
            var self = this;
            $idle.watch();

            $rootScope.$on('startIdle', $scope.resetIdle());

            $document.on($idle._options().events, function () {
                var newdate = new Date();
                $token.$storage.lastTouch = newdate;
                self.lastActivity = newdate;
            });

            $rootScope.$on('$idleWarn', function (e, countdown) {
                console.log('warning: ' + countdown);
                this.checkIdle(countdown);
            });

            $rootScope.$on('$idleTimeout', function () {
                console.log('timeout');
                $token.sessionExpired();
                $rootScope.$broadcast('$tokenExpired');
            });

            $rootScope.$on('$keepalive', function () {
                $token.keepAlive();
            });
        };
        
        return timeout;
    });
})();