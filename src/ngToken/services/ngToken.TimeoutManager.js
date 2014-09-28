(function () {
    var app = angular.module('ngToken.TimeoutManager', ['ngToken.Provider', 'ngIdle']);
    /**
     * @ngdoc service
     * @name $tokenTimeout
     * @description
     *     Keeps track of user activity and broadcasts event and removes tokens from storage on session end
     */
    app.factory('$tokenTimeout', ["$idle", "$token", "$window", "$rootScope", "$document", function ($idle, $token, $window, $rootScope, $document) {
        var timeout = {};

        timeout.lastActivity = new Date();

        /**
         * @ngdoc method
         * @name $tokenTimeout#checkIdle
         * @params {Integer} countdown Seconds to session timeout
         * @description
         *     Checks to make sure a token exists and that there isn't activity from another tab. Broadcasts a countdown event if the user is genuinely idle.
         */
        timeout.checkIdle = function (countdown) {
          var token = $token.getCachedToken();
          if(typeof token !== 'undefined') {
                if(Date.parse($token.$storage.lastTouch) <= this.lastActivity) {
                    $rootScope.$broadcast('$tokenWarn', countdown);
                } else {
                    this.resetIdle();
                }
            }
        };

        /**
         * @ngdoc method
         * @name $tokenTimeout#resetIdle
         * @description Resets the ng-idle's watch and broadcasts a reset event
         */
        timeout.resetIdle = function () {
            $idle.unwatch();
            $idle.watch();
            $rootScope.$broadcast('$tokenResetIdle');
        };

        /**
         * @ngdoc method
         * @name $tokenTimeout#watch
         * @description Starts the watch and sets event ng-idle event listeners
         */
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
              var token = $token.getCachedToken();
              self.resetIdle();
              if(typeof token !== 'undefined'){
                $token.sessionExpired();
                $rootScope.$broadcast('$tokenExpired');
              }
            });

            $rootScope.$on('$keepalive', function () {
                $token.keepAlive();
            });
        };

        return timeout;
    }]);
})();