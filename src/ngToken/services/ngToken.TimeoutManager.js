(function () {
    var app = angular.module('ngToken.TimeoutManager', ['ngToken.Provider', 'ngIdle']);
    app.factory('$tokenTimeout', function ($idle, $token, $window, $rootScope, $document) {
        var timeout = {};

        timeout.lastActivity = new Date();
        timeout.checkIdle = function (countdown) {
            if($token.getCachedToken()) {
                if(Date.parse($token.$storage.lastTouch) <= this.lastActivity) {
                    $rootScope.$broadcast('$tokenWarn', countdown);
                } else {
                    this.resetIdle();
                }
            }
        };

        timeout.resetIdle = function () {
            $idle.unwatch();
            $idle.watch();
            $rootScope.$broadcast('$tokenResetIdle');
        };

        timeout.watch = function () {
            var self = this;
            $idle.watch();

            $rootScope.$on('startIdle', self.resetIdle());

            $document.on($idle._options().events, function () {
                var newdate = new Date();
                $token.$storage.lastTouch = newdate;
                self.lastActivity = newdate;
            });

            $rootScope.$on('$idleWarn', function (e, countdown) {
                self.checkIdle(countdown);
            });

            $rootScope.$on('$idleTimeout', function () {
                $token.sessionExpired();
                self.resetIdle();
                $rootScope.$broadcast('$tokenExpired');
            });

            $rootScope.$on('$keepalive', function () {
                $token.keepAlive();
            });
        };

        return timeout;
    });
})();