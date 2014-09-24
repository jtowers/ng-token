describe('User Service', function () {
    var tester;
    beforeEach(function () {
        tester = ngMidwayTester('ngToken.User');
    });

    afterEach(function () {
        tester.destroy();
        test = null;
    });

    it('should exist', function (done) {
        var $tokenUser = tester.inject('$tokenUser');
        expect($tokenUser).not.to.equal(null);
        done();
    });

    it('storage method should default to localStorage', function (done) {
        var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        expect($tokenUser.$storage).to.equal($window.localStorage);
        done();
    });

    it('storage method should be changeable', function (done) {
        var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        $tokenUser.setStorage('sessionStorage');
        expect($tokenUser.$storage).to.equal($window.sessionStorage);
        done();
    });

    it('should be able to return storage method', function (done) {
        var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        var $storage = $tokenUser.getStorage();
        expect($storage).to.equal($tokenUser.$storage);
        done();
    });

    it('should be able to set a token', function (done) {
        var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        $tokenUser.setToken('testToken');
        expect($window.localStorage.userToken).to.equal('testToken');
        done();
    });
    
    it('should be able to retrieve a token', function(done){
         var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        $tokenUser.setToken('testToken');
        expect($tokenUser.getToken()).to.equal($window.localStorage.userToken);
        done();
    });
    
    it('should be able to remove a token', function(done){
         var $tokenUser = tester.inject('$tokenUser');
        var $window = tester.inject('$window');
        $tokenUser.setToken('testToken');
        expect($tokenUser.getToken()).to.equal($window.localStorage.userToken);
        $tokenUser.removeToken();
        expect($tokenUser.getToken()).to.equal(undefined);
        done();
    });
});