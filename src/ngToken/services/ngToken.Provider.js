(function () {
    var app = angular.module('ngToken.Provider', [
        'ngToken.User'
    ]);
    app.provider('$token', function () {
        this.defaults = {
            endpoints: {
                login: '/api/token/new',
                keepAlive: 'api/token/keepAlive'
            },
            tokenStorage: 'localStorage',
            manageSessionTimeout: true,
        };

        this.newToken = function (method, url) {
            if(method) {
                this.defaults.endpoints.newToken.method = method;
            }

            if(url) {
                this.defaults.endpoints.newToken.url = url;
            }
        };

        this.keepAlive = function (url) {

            if(url) {
                this.defaults.endpoints.keepAlive.url = url;
            } else {
                throw new Error('keepalive endpoint must exist');
            }
        };
        this.tokenStorage = function (storage) {
            if(storage === 'localStorage' || storage === 'sessionStorage') {
                this.defaults.tokenStorage = storage;
            } else {
                throw new Error('storage must be localStorage or sessionStorage');
            }
        };

        this.manageSessionTimeout = function (val) {
            if(typeof val !== 'boolean') throw new Error('manageSessionTimeout should be boolean');
            this.defaults.manageSessionTimeout = val;
        };

        this.$get = function ($rootScope, $window, $http, UserService) {
            var self = this;
            this.srv = {};
            this.srv.manageSessionTimeout = this.defaults.manageSessionTimeout;
            if(this.defaults.tokenStorage === 'localStorage') {
                this.srv.$storage = $window[this.defaults.tokenStorage];
            }
            this.srv.getCachedToken = function () {
                return UserService.getToken();
            };
            this.srv.setToken = function (token) {
                UserService.setToken(token);
            };

            this.srv.sessionExpired = function () {
                UserService.removeToken();
                //maybe add in stuff to remove deserialized user from storage, too;
            };

            this.srv.logout = function(){
                self.srv.sessionExpired();
            };

            this.srv.login = function (cred) {
                $http.post(self.defaults.endpoints.login)
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
                .success(function(data){
                    UserService.setToken(data.token);
                    $rootScope.$broadcast('$tokenKeepAlive', data);
                })
                .error(function(data){
                    $rootScope.$broadcast('$tokenKeepAliveFail', data);
                });
            };

            return this.srv;
        };
    });
})();