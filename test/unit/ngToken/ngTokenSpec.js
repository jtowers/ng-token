'use strict';

describe('', function () {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function (module) {
        return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function () {

        // Get module
        module = angular.module('ngToken');
        dependencies = module.requires;
    });

    it('should load provider module', function () {
        expect(true)to.be.true;
    })

});