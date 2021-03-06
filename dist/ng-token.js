(function() {


(function () {
    var app = angular.module('ngToken.Interceptor', ['ngToken.User']);
    /**
     * @ngdoc service
     * @name ngToken.Intercept
     * @description Interceptor that adds the stored token to requests and broadcasts 401 and 403 errors
     */
    app.factory('ngToken.Intercept', ["$rootScope", "$q", "$window", "$tokenUser", function ($rootScope, $q, $window, $tokenUser) {
        var intercept = {};
       /**
        * @ngdoc method
        * @name ngToken.Intercept#request
        * @description Checks to see if the token exists. If so, adds it to the Autorization header using the Bearer scheme.
        * 
        */
        intercept.request = function (config) {
            config.headers = config.headers || {};
            if($tokenUser.getToken()) {
                config.headers.Authorization = 'Bearer ' + $tokenUser.getToken();
            }
            return config;
        };
        /**
         * @ngdoc method
         * @name ngToken.Intercept#responseError
         * @description Checks errors for a 401 or 403 status and broadcasts and event accordingly. Could be used to redirect users or invalidate tokens on authentication or authorization errors.
         */
        intercept.responseError = function (rejection) {
            if(rejection.status === 401) {
                $rootScope.$broadcast('$tokenNotAuthenticated', rejection);

            }
            if(rejection.status === 403) {
                $rootScope.$broadcast('$tokenNotAuthorized', rejection);

            }
            return $q.reject(rejection);
        };
        return intercept;
    }]);

    app.config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('ngToken.Intercept');
    }]);

})();
(function () {
    var app = angular.module('ngToken.Provider', [
        'ngToken.User'
    ]);

    /**
     * @ngdoc provider
     * @name $tokenProvider
     * @description Provider for ngToken. Sets configuration options and exposes the $token service.
     */
    app.provider('$token', function () {

        this.defaults = {
            endpoints: {
                login: '/login',
                keepAlive: '/token/keepAlive',
                logout: '/logout'
            },
            tokenStorage: 'localStorage'
        };

        /**
         * @ngdoc method
         * @name $tokenProvider#newToken
         * @description Sets the endpoint for a new token
         * @param {String} url URL to set as the endpoint
         * @example
         * angular.module('someModule', ['ngToken'])
         *        .config(function($tokenProvider){
         *              $tokenProvider.newToken('/api/token');
         *         });
         */
        this.newToken = function (url) {
            if(url) {
                this.defaults.endpoints.login = url;
            } else {
                throw new Error('new token endpoint must exist');
            }
        };

        /**
         * @ngdoc method
         * @name $tokenProvider#keepAlive
         * @description Sets the endpoint to call to keep a token alive
         * @param {String} url URL to set as the endpoint
         * @example
         * angular.module('someModule', ['ngToken'])
         *        .config(function($tokenProvider){
         *              $tokenProvider.keepAlive('/api/keepAlive');
         *         });
         */
        this.keepAlive = function (url) {

            if(url) {
                this.defaults.endpoints.keepAlive = url;
            } else {
                throw new Error('keepalive endpoint must exist');
            }
        };

        /**
         * @ngdoc method
         * @name $tokenProvider#logout
         * @description Sets the endpoint to call to log a user out
         * @param {String} url URL to set as the endpoint
         * @example
         * angular.module('someModule', ['ngToken'])
         *        .config(function($tokenProvider){
         *              $tokenProvider.logout('/api/logout');
         *         });
         */
        this.logout = function (url) {
            if(url) {
                this.defaults.endpoints.logout = url;
            } else {
                throw new Error('logout endpoint must exist');
            }
        };

        /**
         * @ngdoc method
         * @name $tokenProvider#tokenStorage
         * @description Sets the storage type.
         * @param {String} storage Type of storage. Can be localStorage or sessionStorage
         * @example
         * angular.module('someModule', ['ngToken'])
         *        .config(function($tokenProvider){
         *              $tokenProvider.tokenStorage('sessionStorage');
         *         });
         */
        this.tokenStorage = function (storage) {
            if(storage === 'localStorage' || storage === 'sessionStorage') {
                this.defaults.tokenStorage = storage;
            } else {
                throw new Error('storage must be "localStorage" or "sessionStorage"');
            }
        };

        this.$get = ["$rootScope", "$window", "$http", "$tokenUser", function ($rootScope, $window, $http, $tokenUser) {
            /**
             * @ngdoc service
             * @name $token
             */
            var self = this;

            this.srv = {};

            this.srv.$storage = $window[this.defaults.tokenStorage];

            /**
             * @ngdoc method
             * @name $token#getCachedToken
             * @returns {string} Stored token
             * @description Get the token saved in localStorage or sessionStorage
             * @example
             * angular.module('someModule', ['ngToken'])
             *        .controller(function($token){
             *              var token = $token.getCachedToken();
             *              console.log(token);
             *         });
             */

            this.srv.getCachedToken = function () {
                return $tokenUser.getToken();
            };
            /**
             * @ngdoc method
             * @name $token#setToken
             * @param {string} token Token to store
             * @description Sets a new token in storage. ng-token will automatically set tokens, so this method is mostly for convenience or if you need to reset a token manually.
             * @example
             * angular.module('someModule', ['ngToken'])
             *        .controller(function($token){
             *              $token.setToken('someToken');
             *              var token = $token.getCachedToken();
             *              console.log(token); // 'someToken'
             *         });
             */
            this.srv.setToken = function (token) {
                $tokenUser.setToken(token);
            };

            /**
             * @ngdoc method
             * @name $token#sessionExpired
             * @description Called when user session expires to clear the stored token out of storage. Called automatically by {@link $token#logout}
             */
            this.srv.sessionExpired = function () {
                $tokenUser.removeToken();
                //maybe add in stuff to remove deserialized user from storage, too;
            };

            /**
             * @ngdoc method
             * @name $token#logout
             * @description Makes a request to the logout endpoint, calls {@link $token#sessionExpired}, and broadcasts an event
             * @example
             * angular.module('someModule', ['ngToken'])
             *        .controller(function($scope, $token){
             *
             *              $scope.$on('$tokenLogoutSuccess', function(event, data){
             *                  // do post logout stuff
             *                  // data will be the response from the http request
             *              });
             *
             *              $scope.$on('$tokenLogoutFail', function(event, data){
             *                  // handle logout failure
             *                  // data will be the response from the http request
             *              });
             *
             *              $token.logout(); // log the user out
             *         });
             */
            this.srv.logout = function () {
                $http.post(self.defaults.endpoints.logout)
                    .success(function (data) {
                        self.srv.sessionExpired();
                        $rootScope.$broadcast('$tokenLogoutSuccess', data);
                    })
                    .error(function (data) {
                        $rootScope.$broadcast('$tokenLogoutFail', data);
                    });
            };

            /**
             * @ngdoc method
             * @name $token#login
             * @param {*} credentials Credentials to pass to the server using the login endpoint
             * @returns {*} Data from http request
             * @description Takes login credentials and sends them to the login endpoint.
             * If successful, saves the token to storage and broadcasts a succss event. Otherwise it broadcasts a failure event.
             * @example
             * angular.module('someModule', ['ngToken'])
             *        .controller(function($scope, $token){
             *
             *              $scope.$on('$tokenAuthSuccess', function(event, data){
             *                  // do post login stuff
             *                  // data will be the response from the http request
             *              });
             *
             *              $scope.$on('$tokenAuthFail', function(event, data){
             *                  // handle login failure
             *                  // data will be the response from the http request
             *              });
             *
             *               var user = {"username":"user", "password":"password"}
             *              $token.login(user); // log the user in
             *         });
             */
            this.srv.login = function (cred) {
                $http.post(self.defaults.endpoints.login, cred)
                    .success(function (data) {
                        self.srv.setToken(data.token);
                        $rootScope.$broadcast('$tokenAuthSuccess', data);
                    })
                    .error(function (data) {
                        $rootScope.$broadcast('$tokenAuthFail', data);
                    });
            };

            /**
             * @ngdoc method
             * @name $token#keepAlive
             * @returns {*} Data from http request
             * @description Calls the keepAlive endpoint to keep the session alive. This keeps tokens from expiring when the user is still browsing.
             * If successful, sets a new user token and calls a success event. Otherwise, calls a failure event.
             * This is automatically called by $tokenTimeout when the keepalive event is broadcast.
             * @example
             * angular.module('someModule', ['ngToken'])
             *        .controller(function($scope, $token){
             *
             *              $scope.$on('$tokenKeepalive', function(event, data){
             *                  // do post keepalive stuff
             *                  // data will be the response from the http request
             *              });
             *
             *              $scope.$on('$tokenKeepAliveFail', function(event, data){
             *                  // handle keepalive failure
             *                  // probably means that the token has expired
             *                  // data will be the response from the http request
             *              });
             *
             *               var user = {"username":"user", "password":"password"}
             *              $token.keepAlive(user);
             *         });
             */
            this.srv.keepAlive = function () {
                $http.post(self.defaults.endpoints.keepAlive)
                    .success(function (data) {
                        $tokenUser.setToken(data.token);

                        $rootScope.$broadcast('$tokenKeepAlive', data);
                    })
                    .error(function (data) {
                        $rootScope.$broadcast('$tokenKeepAliveFail', data);
                    });
            };

            return this.srv;
        }];
    });
})();
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
(function () {
    'use strict';
    
    var app = angular.module('ngToken.User', []);
    /**
     * @ngdoc service
     * @name $tokenUser
     * @description Manages token storage - has functions for getting, setting, and removing tokens.
     */
    app.factory('$tokenUser',
        ["$window", "$rootScope", function ($window, $rootScope) {
            var User = {};
            User.$storage = $window.localStorage;
        /**
         * @ngdoc method
         * @name $tokenUser#setStorage
         * @description Sets the storage type
         * @param {String} stype Storage type - can be localStorage or sessionStorage
         */
            User.setStorage = function (stype) {
                this.$storage = $window[stype];
            };
        /**
         * @ngdoc method
         * @name $tokenUser#getStorage
         * @description Gets the storage type
         * @returns {Object} storage object
         */
            User.getStorage = function () {
                return this.$storage;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#getToken
         * @description Gets the stored token
         * @returns {String} Stored token
         */
            User.getToken = function () {
                return this.$storage.userToken;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#setToken
         * @description Sets a user token
         * @param {String} token Token to store
         * @returns {String} Stored token
         */
            User.setToken = function (token) {
                this.$storage.userToken = token;
                return token;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#removeToken
         * @description Remove the stored token
         */
            User.removeToken = function () {
                return delete this.$storage.userToken;
            };

            return User;
        }]
    );
})();

/**
     * @ngdoc module
     * @name ngToken
     * @description Bootstraps submodules
     */
angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager']);
}());