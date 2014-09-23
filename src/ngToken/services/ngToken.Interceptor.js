(function () {
    var app = angular.module('ngToken.Interceptor', ['ngToken.User']);
    app.factory('ngToken.Intercept', function ($rootScope, $q, $window, $tokenUser) {

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
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('ngToken.Intercept');
    });

})();