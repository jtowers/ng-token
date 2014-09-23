# ng-token
Angular provider to help manage token-based authentication in localStorage or sessionStorage with angular.

Handles retrieving tokens, setting them in storage, injecting them into HTTP requests, and removing tokens from storage when the user logs out or is idle.

Requires [ng-idle](https://github.com/HackedByChinese/ng-idle).

## Basic Setup:

1. Include ng-token and ng-idle on your page
2. Create a module and require ngIdle and ngToken
3. Use your module's config blocks and $tokenProvider, $idleProvider, and $keepaliveProvider to configure ng-token and ng-idle settings
```
var app = angular.module('myModule', ['ngIdle', 'ngToken'])
app.config(function($tokenProvider, $idleProvider){
           // configure $idle settings
            $idleProvider.idleDuration(5); // in seconds
            $idleProvider.warningDuration(5); // in seconds
            $keepaliveProvider.interval(2); // in seconds
            
           // configure $token settings
           
            // Will make a GET request to this URL to create a new token. Response should be {token: '*token*'}
            $tokenProvider.newToken('/api/token')
            
            // Will make a GET request to this URL to keep the token alive
            $tokenProvider.keepAlive('/api/token/keepAlive') 
            
            // Will make a GET request to this URL when $token.logout() is called
            $tokenProvider.logout('/logout') 
            
            // Sets the storage type. Can be localStorage or sessionStorage
            $tokenProvider.tokenStorage('localStorage') 
       });
```
4. Call `$tokenTimeout.watch()` in a controller to start manging the timeout

```
app.controller('myModuleController', function($token, $tokenTimeout){
// Starts to watch for browser activity.
  $tokenTimeout.watch();
});
```
## Requesting a new token
Call `$token.login()` and pass a user credentials hash to authenticate a user and request a token back.

Listen for '$tokenAuthSuccess' and '$tokenAuthFail' events to respond to token requests.

```
app.controller('myModuleController', function($token, $scope){
    var user = {
      username: 'someUser',
      password: 'somePassword'
    };
    $scope.$on('$tokenAuthSuccess', function(event, data){
        console.log(data) // data is the data returned from the auth request
    });
    
    $scope.$on('$tokenAuthFail', function(event, data){
        console.log(data) // data is the data returned from the request
    })
    $token.login();
});
```

Logging in will automatically set the token. A successful login response should be a hash with a key named 'token' that contains the token to store.

The hash can contain anything else necessary for your app (e.g., a deserialized user).

