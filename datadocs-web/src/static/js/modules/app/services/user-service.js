define(['./module', 'jquery', 'lodash', 'moment'], function (module, $, _, moment) {
  module.factory('User', ['$http', '$window', '$q', '$rootScope', '$uibModal','$localStorage','Account', function ($http, $window, $q, $rootScope, $uibModal, $localStorage, Account) {
    api_base_url = $rootScope.bseUrl
    
    let UserModel = {},
      networkModal,
      storageKey = "userInfo";
      tokenKey = "token"

    var inviteeUser = {}
    var isBillingHistoryAvailable = false;

    const networkModalTemplate = `<form class="network-modal">
      <div class="modal-header">
        <h4 class="modal-title">Not connected</h4>
      </div>
      <div class="modal-body" id="modal-body">
        <div class="body-description">It looks like you are offline. Trying to reconnect...</div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary-goog pull-right" ng-click="forceRefreshPage()">Retry</button>
      </div>
    </form>`; // Storing template here to prevent failure GET request

    function showSignedOutModal() {
      $uibModal.open({
        templateUrl: 'static/templates/include/signed-out-modal.html',
        scope: $rootScope,
        animation: true,
        windowClass: 'network-modal-window',
        backdrop: 'static',
        size: 'sm',
      });
    }

    function serializeToSession() {
      $window.localStorage[storageKey] = JSON.stringify(UserModel);
    }

    function deserializeFromSession() {
      if ($window.localStorage[storageKey]) {
        UserModel = JSON.parse($window.localStorage[storageKey]);
      }
    }

    function clearFromSession() {
      delete $window.localStorage[storageKey];
      delete $window.localStorage[tokenKey];
      UserModel = {};
    }

    function showNetworkModal() {
      return $uibModal.open({
        template: networkModalTemplate,
        scope: $rootScope,
        animation: true,
        windowClass: 'network-modal-window',
        backdrop: 'static',
        size: 'sm',
      });
    }

    async function guessUserTimezone() {
      let currentUser = await reinitialize();
      let timezone = currentUser.timezone;
      return timezone ? timezone : moment.tz.guess();
    }

    async function updateUserTimezone(timezone) {
      // if (_.isEmpty(UserModel))
      //   return;

      // if (!timezone) {
      //   timezone = await guessUserTimezone();
      // }

      // const response = await $http.post("/api/user/update_timezone", {timezone});
      // console.log("Fetched user time zone:", response.data.timezone);
      // UserModel.timezone = response.data.timezone;
      // serializeToSession(UserModel);
      return timezone;
    }

    $rootScope.forceRefreshPage = () => {
      $localStorage['userSessionTimeout'] = true;
      $window.location.reload();
    };

    $rootScope.$watch('isOnline', online => {
      let connectionStatus = {};
      online
        ? connectionStatus = {msg: "established", online: true}
        : connectionStatus = {msg: "interrupted", online: false};
        
        console.log(`%cInternet Connection ${connectionStatus.msg}.`,
        `color: ${connectionStatus.online ? 'green' : 'red'}`);

      if (!online) {
        networkModal = showNetworkModal();
      } else if (networkModal) {
        networkModal.dismiss();
      }
    });

    deserializeFromSession();
    updateUserTimezone();

    function get_user_info(tk){
      return $http({
        method : 'GET',
        url : api_base_url + '/api/auth/get_user_info',
        headers : {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Authorization' : tk
        }
      }).then(function (response) {
          UserModel = response.data;
          serializeToSession(UserModel);
          return UserModel;
        });
    }
    
    function reinitialize() {
      return $http({
          method: 'GET',
          url: api_base_url + '/api/auth/current',
          headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
          }
        }).then(function (response) {
          UserModel = response.data;
          serializeToSession(UserModel);
          return UserModel;
        });
    }
    return {
      storageKey,
      showSignedOutModal,
      reinitialize,

      
      signIn: function (username, password, anon) {
        return $http({
          method: 'POST',
          url: api_base_url + '/api/auth/login',
          data: $.param({'username': username, 'password': password, 'anon': anon}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
          UserModel = response.data;
          tkn = $window.localStorage[tokenKey] = JSON.stringify(response.data);
          tk = JSON.parse(localStorage.getItem('token'));
          UserModel = get_user_info(tk.token);
          serializeToSession();
          $rootScope.$broadcast('sign_in');
          return UserModel;
        }).then(() => updateUserTimezone());
      },
      signUp: function (username, fullName, email, password) {
         return $http({
            method: 'POST',
            url: api_base_url + "/api/user/register",
            data: $.param({
              username:username,
              fullname:fullName,
              email:email,
              password:password
            }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
            UserModel1 = response.data;
            
            //serializeToSession();
            // $rootScope.$broadcast('sign_in');
            return UserModel;
          }).then(() => updateUserTimezone());
              
      },
      checkAccount: function(email) {
        return $http({
                   method: 'POST',
                   url: '/api/auth/check-account',
                   data: $.param({ 'email': email}),
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                 }).then(function(response){
                   console.log(response, "check-account")
                   UserModel = response.data;
                   serializeToSession();
                   $rootScope.$broadcast('sign_in');
                   return UserModel;
                 }).then(() => updateUserTimezone());
      },
      gapiLogin: function(email) {
        return $http({
                   method: 'POST',
                   url: '/api/auth/gapi-login',
                   data: $.param({ 'email': email}),
                   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                 }).then(function(response){
                   console.log(response)
                   UserModel = response.data;
                   serializeToSession();
                   $rootScope.$broadcast('sign_in');
                   return UserModel;
                 }).then(() => updateUserTimezone());
      },
      gapiRegister: function (email, fullName, currencyCode, timeZone) {
        return $http({
          method: 'POST',
          url: '/api/auth/gapi-register',
          data: $.param({ 'email': email, 'fullName': fullName, 'currencyCode':currencyCode, 'timeZone':timeZone }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function (response) {
          UserModel = response.data;
          serializeToSession();
          $rootScope.$broadcast('sign_in');
          return UserModel;
        }).then(() => updateUserTimezone());
      },

      signOut: function () {
        clearFromSession();
        return $http({
          method: 'POST',
          url: '/api/auth/logout'
        }).then(function () {
          $rootScope.$broadcast('sign_out');
        });
      },

      inviteeUser : inviteeUser,
      getInviteUser: function(hash){
          return $http.get('/api/user/invite-user/' +hash)
          .then(function (response){
              Object.assign(inviteeUser, response.data);
              return response.data;
          });
      },

      resetInviteUser: function(){
          Object.assign(inviteeUser, {});
      },


     changePassword: function (oldPassword, newPassword) {
        return $http.post('/api/user/change-password', {
            oldPassword: oldPassword,
            newPassword: newPassword
          }).then(function (response) {
            return response.data;
        });
      },

      updateUserDetail: function(fullName, timeZone, dateFormat, currency){
          return $http.post('/api/user/update-user-detail',{
                 fullName: fullName,
                 timeZone: timeZone,
                 dateFormat: dateFormat,
                 currency: currency
          }).then(function(response){
                UserModel = response.data;
                serializeToSession();
                return response.data;
          }).catch(err => {
               console.log('Error while updating user details',err);
               $scope.inRequest = false;
          });
      },
       sendCode: function (email) {
            return $http.post('/api/user/send-code', {
                email: email
              }).then(function (response) {
                return response.data;
            });
          },

       changeEmail: function (code) {
            return $http.post('/api/user/change-email', {
                code: code
              }).then(function (response) {
                UserModel = response.data;
                serializeToSession();
                return UserModel;
            });
          },


    getBillingHistory: function () {
        return $http.get('/api/user/billing-history').then(function (response) {
            if(response.data != null && response.data.length > 0){
                isBillingHistoryAvailable= true;
            }else{
                isBillingHistoryAvailable= true;
            }
            return response.data;
        });
    },

    closeAccount: function () {
           return $http.get('/api/user/close-account').then(function (response) {
               console.log(response);
               return response.data;
             });
          },

      disconnectFromGoogle: function () {
         return $http.get('/api/user/google-disconnect').then(function (response) {
             console.log(response);
             UserModel = response.data;
             serializeToSession();
             $rootScope.$broadcast('sign_in');
             return UserModel;
           });
        },
      getUserInitials: (user = UserModel) => {
        const name = user.fullName || user.email || '';

        return _.chain(name)
          .thru(name => name.split(' ')) // Lodash 3 doesn't have built-in split() method
          .compact() // For empty parts
          .take(2)
          .reduce((initials, namePart) => initials += _.first(namePart).toUpperCase(), '')
          .value();
      },

      isSignedIn: function () {
        return UserModel ? UserModel.id : undefined;
      },

      isUserSessionTimeout: function () {
          return ( $localStorage['userSessionTimeout'] && $localStorage['userSessionTimeout'] != null) ? $localStorage['userSessionTimeout'] : false;
      },

      getCurrent: function () {
        return UserModel;
      },
      refreshCurrent: function (user) {
          UserModel = user;
          serializeToSession(UserModel);
      },
      hasFinishedSubscription: function () {
        if(UserModel.account.stripeSubscriptionId || UserModel.account.planType == 'FREE'){
            return true;
        }
        return false;
      },
      isCompanyAdmin: function()
      {
         if(!UserModel || !UserModel.role){
            return false;
         }
         if(UserModel.role == 'Admin' || UserModel.role == 'Owner'){
           return true;
         }
         return false;
      },
      isCompanyOwner: function()
      {
        if(UserModel.role == 'Owner'){
            return true;
        }else{
            return false;
        }
      },
      updateUserRole: function(role){
         UserModel.role = role;
      },

      isBillingHistoryAvailable: function () {
           return isBillingHistoryAvailable;
      },
    };
  }])
});
