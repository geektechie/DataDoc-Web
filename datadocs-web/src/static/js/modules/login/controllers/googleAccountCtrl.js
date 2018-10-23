define(['./module', 'common', 'gapi'], function (controllers, cc, gapi) {
  'use strict';

  controllers.controller(
    'authWithGoogleAccountCtrl',['$scope','$http','$state', 'User', '$stateParams', 
    function($scope, $http, $state, User, $stateParams) {
    
    //$scope.reset = false;
    //var token = $stateParams.token;
    console.log('call autWithGoogleAccountCtrl');
    console.log('  gapi = ' + gapi);

    var CLIENT_ID = '221124010544-bpf0ernqa026kmdgo45ne0o7op30mvhh.apps.googleusercontent.com';
    var API_KEY = 'AIzaSyCWwVpQPch2TLl_CSx6FCwmICo6giS_QFE';
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"];
    var SCOPES = "https://www.googleapis.com/auth/contacts.readonly" ;

    function handleAuthClick(event) { gapi.auth2.getAuthInstance().signIn(); }

    var processLogin = function() {
      return gapi.client.people.people.get({
        'resourceName': 'people/me',
        'requestMask.includeField': 'person.names,person.emailAddresses'
      }).then(function(response) {
        //console.log(JSON.stringify(response.result, null, '  '));
        var names = response.result.names;
        var displayName = names[0].displayName;

        var emails = response.result.emailAddresses;
        var email  = emails[0].value;

        console.log('User Info:');
        console.log("displayName = " + names[0].displayName);
        console.log("email = " + emails[0].value);


        var successServerSignIn = function() {
          console.log('sucess server login');
          $scope.signingIn = true;
          $state.go('main');
        };

        var failServerSignIn = function() {
          console.log('fail server login');
          $scope.signingIn = false;
          $scope.error = "Incorrect login or password";
          $state.go('auth.register');
        };

        User.gapiAuth(email, displayName).then(successServerSignIn, failServerSignIn);
      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
      });
    };

    var updateSigninStatus = function(isSignedIn) {
      console.log('isSignedIn = ' + isSignedIn);
      if(isSignedIn) {
        processLogin();
      } else {
        var authorizeButton = document.getElementById('authorize-button');
        authorizeButton.style.display = 'block';
        authorizeButton.onclick = handleAuthClick;
      }
    };

    var initClient = function() {
      console.log('start initClient()');
      var gapiConfig = {
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      };
      gapi.client.init(gapiConfig).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
    };

    gapi.load('client:auth2', initClient);

    console.log('call autWithGoogleAccountCtrl done!!!!');

    //$scope.authWithGoogleAccount = function(){
    //  console.log('call authenticate with google account!!!');
    //}
  }])
});
