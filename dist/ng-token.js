(function() {


(function () {
    var app = angular.module('ngToken.Interceptor', ['ngToken.User']);
    app.factory('ngToken.Intercept', ["$rootScope", "$q", "$window", "$tokenUser", function ($rootScope, $q, $window, $tokenUser) {

        var intercept = {};
        intercept.request = function (config) {
            config.headers = config.headers || {};
            if($tokenUser.getToken()) {
                config.headers.Authorization = 'Bearer ' + $tokenUser.getToken();
            }
            return config;
        };

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
     *
     */
    app.provider('$token', function () {
        
         /**
       * @ngdoc property
       * @name $tokenProvider.defaults.endpoints#login
       *
       * @description
       * Reference to the root scope.
       */
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
         * @ngdoc $tokenProvider#tokenStorage
         * @description Sets the storage type.
         * @param {String} storage Type of storage. Can be localStorage or sessionStorage
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
             * @requires $rootScope
             * @requires $window
             * @requires $http
             * @requires $tokenUser
             */
            var self = this;

            this.srv = {};

            this.srv.$storage = $window[this.defaults.tokenStorage];

            /**
             * @ngdoc method
             * @name $token#getCachedToken
             * @returns {string} Stored token
             * @description Get the token saved in localStorage or sessionStorage
             */
            this.srv.getCachedToken = function () {
                return $tokenUser.getToken();
            };
            /**
             * @ngdoc method
             * @name $token#setToken
             * @param {string} Token to store
             * @description Sets a new token in storage
             */
            this.srv.setToken = function (token) {
                $tokenUser.setToken(token);
            };

            /**
             * @ngdoc method
             * @name $token#sessionExpired
             * @description Called when user session expires to clear the stored token out of storage
             */
            this.srv.sessionExpired = function () {
                $tokenUser.removeToken();
                //maybe add in stuff to remove deserialized user from storage, too;
            };

            /**
             * @ngdoc method
             * @name $token#logout
             * @description Makes a request to the logout endpoint, calls {@link $token#sessionExpired}, and broadcasts an event
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
    app.factory('$tokenTimeout', ["$idle", "$token", "$window", "$rootScope", "$document", function ($idle, $token, $window, $rootScope, $document) {
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
    }]);
})();
(function () {
    'use strict';
    /**
     * @ngdoc overview
     * @name ngToken.User
     * @description Manages token storage - has functions for getting, setting, and removing tokens.
     */
    var app = angular.module('ngToken.User', []);
    app.factory('$tokenUser',
        ["$window", "$rootScope", function ($window, $rootScope) {
            var User = {};
            User.$storage = $window.localStorage;
        /**
         * @description Sets the storage type
         * @param {String} stype Storage type - can be localStorage or sessionStorage
         */
            User.setStorage = function (stype) {
                this.$storage = $window[stype];
            };
        /**
         * @description Gets the storage type
         */
            User.getStorage = function () {
                return this.$storage;
            };
        
        /**
         * @description Gets the stored token
         * @returns {String}
         */
            User.getToken = function () {
                return this.$storage.userToken;
            };
        
        /**
         * @description Sets a user token
         * @param {String} token Token to store
         */
            User.setToken = function (token) {
                this.$storage.userToken = token;
                return token;
            };
        
        /**
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
     * @ngdoc overview
     * @name ngToken
     * @description Bootstraps submodules
     * @requires ngToken.Provider
     * @requires ngToken.Interceptor
     * @requires ngToken.TimeoutManager
     */
angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager']);
}());