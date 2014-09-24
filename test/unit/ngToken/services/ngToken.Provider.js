describe('token provider', function () {
    describe('config', function () {
        var _tokenProvider;
        beforeEach(function () {

            angular.module('testMod', ['ngToken']).config(function ($tokenProvider) {
                _tokenProvider = $tokenProvider;
            });
            module('ngToken', 'testMod');
            inject(function () {});
        });

        it('should exist', function (done) {
            expect(_tokenProvider).to.not.equal(null);
            done();
        });

        it('should allow setting login endpoint', function (done) {
            _tokenProvider.newToken('/api/login');
            expect(_tokenProvider.defaults.endpoints.login).to.equal('/api/login');
            done();
        });

        it('should allow setting keepalive endpoint', function (done) {
            _tokenProvider.keepAlive('/api/keepalive');
            expect(_tokenProvider.defaults.endpoints.keepAlive).to.equal('/api/keepalive');
            done();
        });

        it('should allow setting logout endpoint', function (done) {
            _tokenProvider.logout('/api/logout');
            expect(_tokenProvider.defaults.endpoints.logout).to.equal('/api/logout');
            done();
        });

        it('should allow setting storage type', function (done) {
            _tokenProvider.tokenStorage('sessionStorage');
            expect(_tokenProvider.defaults.tokenStorage).to.equal('sessionStorage');
            done();
        });
    });
    describe('$token methods', function () {
        var tester;
        var $token;
        var $window;

        beforeEach(function () {
            tester = ngMidwayTester('ngToken.Provider');
            $token = tester.inject('$token');
            $window = tester.inject('$window');
            $httpBackend = tester.inject('$httpBackend');
        });
        afterEach(function () {
            tester.destroy();
            test = null;
        });

        it('should be able to set a token manually', function (done) {
            $token.setToken('testToken');
            expect($window.localStorage.userToken).to.equal('testToken');
            done();
        });

        it('should be able to get a token from localstorage', function (done) {
            $token.setToken('testToken');
            var token = $token.getCachedToken();
            expect(token).to.equal('testToken');
            done();
        });
        
        it('should be able to get a token from the server', function(done) {
     $token.login({});
            done();
   });

    });
});