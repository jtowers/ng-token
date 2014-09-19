(function () {
'use strict';
var app = angular.module('ngToken.User', []);
app.factory('UserService',
    function ($window, $rootScope) {
        var User = {};
    User.$storage = $window.localStorage;
    User.setStorage = function(stype){
        this.$storage = $window[stype];
    };
    User.getStorage = function(){
        return this.$storage;
    };
User.getToken = function(){
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
    }
);
})();