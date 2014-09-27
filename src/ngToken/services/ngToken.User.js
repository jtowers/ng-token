(function () {
    'use strict';
    
    var app = angular.module('ngToken.User', []);
    /**
     * @ngdoc service
     * @name $tokenUser
     * @description Manages token storage - has functions for getting, setting, and removing tokens.
     */
    app.factory('$tokenUser',
        function ($window, $rootScope) {
            var User = {};
            User.$storage = $window.localStorage;
        /**
         * @ngdoc method
         * @name $tokenUser#setStorage
         * @description Sets the storage type
         * @param {String} stype Storage type - can be localStorage or sessionStorage
         */
            User.setStorage = function (stype) {
                this.$storage = $window[stype];
            };
        /**
         * @ngdoc method
         * @name $tokenUser#getStorage
         * @description Gets the storage type
         * @returns {Object} storage object
         */
            User.getStorage = function () {
                return this.$storage;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#getToken
         * @description Gets the stored token
         * @returns {String} Stored token
         */
            User.getToken = function () {
                return this.$storage.userToken;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#setToken
         * @description Sets a user token
         * @param {String} token Token to store
         * @returns {String} Stored token
         */
            User.setToken = function (token) {
                this.$storage.userToken = token;
                return token;
            };
        
        /**
         * @ngdoc method
         * @name $tokenUser#removeToken
         * @description Remove the stored token
         */
            User.removeToken = function () {
                return delete this.$storage.userToken;
            };

            return User;
        }
    );
})();