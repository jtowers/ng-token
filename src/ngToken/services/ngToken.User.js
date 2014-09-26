(function () {
    'use strict';
    /**
     * @ngdoc overview
     * @name ngToken.User
     * @description Manages token storage - has functions for getting, setting, and removing tokens.
     */
    var app = angular.module('ngToken.User', []);
    app.factory('$tokenUser',
        function ($window, $rootScope) {
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
        }
    );
})();