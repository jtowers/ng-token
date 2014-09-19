angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager'])

    .run(function($token, $tokenTimeout){
    console.log($token.manageTimeout);
    if($token.manageTimeout) {
        $tokenTimeout.watch();
    }
});