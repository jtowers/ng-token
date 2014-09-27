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
         * @name $tokenProvider#tokenStorage
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

        this.$get = function ($rootScope, $window, $http, $tokenUser) {
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
        };
    });
})();