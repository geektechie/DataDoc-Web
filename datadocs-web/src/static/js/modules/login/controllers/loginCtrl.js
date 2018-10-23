define(['./module', 'jquery', 'ladda', 'lodash'], function (controllers, jquery, ladda, _) {
  'use strict';

  controllers.controller('loginCtrl',['$scope','$rootScope','$http','$state','User', '$stateParams','$location','Account',
    function($scope, $rootScope, $http, $state, User, $stateParams, $location,Account) {
      $scope.error = undefined;
      $scope.signingIn = false;

      $scope.fromJoinCompanyLink = false;

    var hash = $location.search().hash?$location.search().hash.trim():undefined;
        if(hash && hash != ''){
           User.getInviteUser(hash).then(function () {
                let invitee = User.inviteeUser;
                $scope.fromJoinCompanyLink = true;
                $scope.username = invitee.username;
                $scope.companyName = invitee.companyName;
             }).catch(err => {
                $scope.fromJoinCompanyLink = false;
                $scope.username = '';
                $scope.companyName = '';
                console.log('Error while get invitee');
            });
     }
      $scope.signIn = function (anon) {
        $scope.signingIn = true;
        User.signIn($scope.username, $scope.password, anon).then(function () {
          User.resetInviteUser();
          $scope.fromJoinCompanyLink = false;
          var nextPage = $rootScope.nextPageAfterLogin;

          if($stateParams.state && $stateParams.param) {
            //todo replace this one day with lodash fromPairs
            const params = _.reduce(_.chunk($stateParams.param.split(':'), 2), (acc, val, key) => {
              (acc || (acc = {}));
              acc[val[0]] = val[1];
              return acc;
            }, {});
            $state.go($stateParams.state, params)
          } else if (nextPage) {
            $rootScope.nextPageAfterLogin = null;
            $state.go(nextPage.name, nextPage.params);
          } else {
            $state.go('main');
          }

        }, function(response){
             $scope.signingIn = false;
            if(response.status == 301){
                $scope.error = "Your account was closed.";
            }else{
                $scope.error = "Incorrect login or password";
            }
        });
      };

      function grantPermissions() {
          var auth2 = gapi.auth2.getAuthInstance();
          var options = new gapi.auth2.SigninOptionsBuilder();
          options.setAppPackageName('datadocs');
          options.setPrompt('none');
          options.setScope('https://www.googleapis.com/auth/contacts.readonly');

          auth2.currentUser.get().grant(options).then(function(response){
            console.log('user consent taken');
            console.log(auth2.currentUser.get().getBasicProfile());

            var profile = auth2.currentUser.get().getBasicProfile();
            var successServerSignIn = function() {
                    $scope.signingIn = true;
                    checkSubscriptionAndRedirect();
                 };
            var failServerSignIn = function() {
               $scope.signingIn = false;
               $scope.error = "Incorrect login or password";
               $state.go('auth.login');
            };
            User.gapiRegister(profile.getEmail(), profile.getName()).then(successServerSignIn, failServerSignIn);
          }, function(err) {
            console.log("something went wrong while granting option");
            console.log(err);
            if(err.error == 'access_denied'){
              $state.go('main');
            }else{
              $state.go('auth.login');
            }

          });
      };

      function checkSubscriptionAndRedirect(){
        if(User.hasFinishedSubscription()){
           $state.go('main', $stateParams);
        }else{
           $state.go('auth.billing', $stateParams);
        }
      }

      $scope.options = {
        'onsuccess': function(googleUser) {
            var profile = googleUser.getBasicProfile();
            User.checkAccount(profile.getEmail()).then(function(response) {
                checkSubscriptionAndRedirect();
            },
            function(err){
              var status = err.status;
              if(status == '404') {
                  grantPermissions();
              }else if(status == '301') {
                  $scope.signingIn = false;
                  $scope.error = "Your account was closed.";
              }
            });
        }
      };

      $('#email-input').focus();
    }])
});
