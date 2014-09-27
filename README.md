# ng-token
Angular provider to help manage token-based authentication in localStorage or sessionStorage with angular.

Handles retrieving tokens, setting them in storage, injecting them into HTTP requests, and removing tokens from storage when the user logs out or is idle.

Requires [ng-idle](https://github.com/HackedByChinese/ng-idle).

## What it does
ng-token does a few different things to help manage tokens and cookie-less user sessions.
Features include:

1. exposes several methods for requesting, renewing, and removing tokens.
2. adds an interceptor that adds the stored token to each HTTP requests if it exists. Adds an Authentication header with the 'Bearer' scheme.
3. adds an interceptor that broadcasts an event on 401 and 403 errors so that they can be handled
4. Uses ng-idle to remove the token from storage when the user is idle

Activity and idle state are stored in localStorage so that they can be monitored across browser tabs. Sessions should stay alive in both tabs if a user is logged into the app from two different tabs in the same browser.

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
## Usage
See the documentation for explanations examples of [$token](http://jtowers.github.io/ng-token/docs/$token.html) and [$tokenTimeout](http://jtowers.github.io/ng-token/docs/$tokenTimeout.html) methods.


## Todo
1. Write more substantial tests

