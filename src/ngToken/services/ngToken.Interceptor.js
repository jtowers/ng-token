(function () {
    var app = angular.module('ngToken.Interceptor', ['ngToken.User']);
    /**
     * @ngdoc service
     * @name ngToken.Intercept
     * @description Interceptor that adds the stored token to requests and broadcasts 401 and 403 errors
     */
    app.factory('ngToken.Intercept', function ($rootScope, $q, $window, $tokenUser) {
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
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('ngToken.Intercept');
    });

})();