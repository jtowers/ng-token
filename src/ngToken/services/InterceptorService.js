(function () {
    var app = angular.module('ngToken.Interceptor', ['ngToken.User']);
    app.factory('authIntercept', function ($rootScope, AUTH_EVENTS, $q, $window, UserService) {

        var intercept = {};
        intercept.request = function (config) {
            config.headers = config.headers || {};
            if(UserService.getToken()) {
                config.headers.Authorization = 'Bearer ' + UserService.getToken();
            }
            return config;
        };

        intercept.responseError = function (rejection) {
            if(rejection.status === 401) {
                rejection.data.reason = AUTH_EVENTS.notAuthenticated;
            }
            return $q.reject(rejection);
        };
        return intercept;
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('authIntercept');
    });

    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized',
        notImplemented: 'feature-not-implemented',
        notInstalled: 'install-not-complete'
    });
})();