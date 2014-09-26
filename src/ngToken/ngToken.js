
/**
     * @ngdoc overview
     * @name ngToken
     * @description Bootstraps submodules
     * @requires ngToken.Provider
     * @requires ngToken.Interceptor
     * @requires ngToken.TimeoutManager
     */
angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager']);