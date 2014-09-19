angular.module('ngToken', ['ngToken.Provider','ngToken.Interceptor', 'ngToken.TimeoutManager'])

    .run(function($token, $tokenTimeout){
    if($token.manageTimeout) {
        $tokenTimeout.watch();
    }
});