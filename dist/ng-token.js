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
            if(rejection.status === 403){
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
        this.logout = function(url){
            if(url){
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

        this.$get = ["$rootScope", "$window", "$http", "$tokenUser", function ($rootScope, $window, $http, $tokenUser) {
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
        }];
    });
})();
(function () {
    var app = angular.module('ngToken.TimeoutManager', ['ngToken.Provider', 'ngIdle']);
    app.factory('$tokenTimeout', ["$idle", "$token", "$window", "$rootScope", "$document", function ($idle, $token, $window, $rootScope, $document) {
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
            $rootScope.$broadcast('$tokenResetIdle');
        };

        timeout.watch = function () {
            console.log('watching');
            var self = this;
            $idle.watch();

            $rootScope.$on('startIdle', self.resetIdle());

            $document.on($idle._options().events, function () {
                var newdate = new Date();
                $token.$storage.lastTouch = newdate;
                self.lastActivity = newdate;
            });

            $rootScope.$on('$idleWarn', function (e, countdown) {
                console.log('warning: ' + countdown);
                self.checkIdle(countdown);
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
    }]);
})();
(function () {
    'use strict';
    var app = angular.module('ngToken.User', []);
    app.factory('$tokenUser',
        ["$window", "$rootScope", function ($window, $rootScope) {
            var User = {};
            User.$storage = $window.localStorage;
            User.setStorage = function (stype) {
                this.$storage = $window[stype];
            };
            User.getStorage = function () {
                return this.$storage;
            };
            User.getToken = function () {
                return this.$storage.userToken;
            };
            User.setToken = function (token) {
                this.$storage.userToken = token;
                return token;
            };
            User.removeToken = function () {
                return delete this.$storage.userToken;
            };

            return User;
        }]
    );
})();
angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager']);
}());