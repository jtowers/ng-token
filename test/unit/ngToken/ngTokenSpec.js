describe('core module', function () {

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

    it('should require provider module', function () {
        hasModule('ngToken.Provider').should.equal(true);
    });

    it('should require interceptor module', function () {
        hasModule('ngToken.Interceptor').should.equal(true);
    });

    it('should require timeout module', function () {
        hasModule('ngToken.TimeoutManager').should.equal(true);
    });

});