(function () {
    var app = angular.module('ngToken.Provider', [
        'ngToken.User'
    ]);
    app.provider('$token', function () {
        this.defaults = {
            endpoints: {
                login: '/login',
                keepAlive: '/token/keepAlive',
                logout: '/logout'
            },
            tokenStorage: 'localStorage'
        };

        this.newToken = function (url) {
            if(url) {
                this.defaults.endpoints.login = url;
            } else {
                throw new Error('new token endpoint must exist');
            }
        };

        this.keepAlive = function (url) {

            if(url) {
                this.defaults.endpoints.keepAlive = url;
            } else {
                throw new Error('keepalive endpoint must exist');
            }
        };
        this.logout = function (url) {
            if(url) {
                this.defaults.endpoints.logout = url;
            } else {
                throw new Error('logout endpoint must exist');
            }
        };
        this.tokenStorage = function (storage) {
            if(storage === 'localStorage' || storage === 'sessionStorage') {
                this.defaults.tokenStorage = storage;
            } else {
                throw new Error('storage must be localStorage or sessionStorage');
            }
        };

        this.$get = function ($rootScope, $window, $http, $tokenUser) {
            var self = this;
            this.srv = {};

            this.srv.$storage = $window[this.defaults.tokenStorage];

            this.srv.getCachedToken = function () {
                return $tokenUser.getToken();
            };
            this.srv.setToken = function (token) {
                $tokenUser.setToken(token);
            };

            this.srv.sessionExpired = function () {
                $tokenUser.removeToken();
                //maybe add in stuff to remove deserialized user from storage, too;
            };

            this.srv.logout = function () {
                self.srv.sessionExpired();
            };

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
            this.srv.keepAlive = function () {
                $http.post(self.defaults.endpoints.keepAlive)
                    .success(function (data) {
                        UserService.setToken(data.token);
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