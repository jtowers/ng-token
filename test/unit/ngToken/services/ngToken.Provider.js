describe('token provider', function () {
    var tester;
    beforeEach(function () {
        tester = ngMidwayTester('ngToken');
    });
    
    afterEach(function(){
        tester.destroy();
        test = null;
    });

    it('should work', function(done){
        var $tokenProvider = tester.inject('$token');
        expect($tokenProvider).not.to.equal(null);
        done();
    });
});