define(['./module', 'jquery', 'lodash', 'moment'], function (module, $, _, moment) {
  module.factory('Account', ['$http', '$window', '$q', '$rootScope', '$uibModal', function ($http, $window, $q, $rootScope, $uibModal) {
    api_base_url = $rootScope.bseUrl

    var account = {}
    var paymentInfo = {}
    var freeUserLimit;

    function populateMemberIds(account){
        var membersWithId = _.each(account.members, function(m, i) { m.id = i+1;});
        account.members = membersWithId;
        return account;
    }

    return {
      account:account,
      paymentInfo:paymentInfo,
      addMember: function(email, role){
          return $http.post('/api/account/add-member', {
            email: email,
            role: role
          }).then(function (response){
              Object.assign(account, populateMemberIds(response.data));
              return response.data;
          });
      },

      modifyMember: function(email, role){
            return $http.post('/api/account/modify-member', {
              email: email,
              role:role
            }).then(function (response){
                Object.assign(account, populateMemberIds(response.data));
                return response.data;
            });
        },

      modifyAccountDetails: function(accountType, companyName, planType, numberOfLicenses, source){
        return $http.post('/api/account/modify-account-details', {
          accountType: accountType,
          companyName: companyName,
          planType: planType,
          subscriptionQuantity: numberOfLicenses,
          source: source
        }).then(function (response){
            Object.assign(account, populateMemberIds(response.data));
            return response.data;
        });
      },

      removeMembers: function(emailIds){
        return $http.post('/api/account/remove-members', {
          emailList : emailIds
        }).then(function (response){
            Object.assign(account, populateMemberIds(response.data));
            return response.data;
        });
      },

       getAccount: function(){
          return $http.get(api_base_url + '/api/account')
          .then(function (response){
              Object.assign(account, populateMemberIds(response.data));
              freeUserLimit = account.freeUserLimit;
              return response.data;
          });
      },

      reportDataUsage: function(){
           return $http.post('/api/account/report-data-usage', {}).then(function (response){
                return response.data;
          });
      },

      getCurrentMonthUsageCost: function () {
          return $http.get('/api/account/current-data-usage').then(function (response) {
              return response.data;
          });
      },

      downloadInvoice: function(invoiceId){
        window.location.href = '/api/account/download-invoice/'+invoiceId
       },

      getPaymentInfo: function(){
        return $http.get('/api/account/payment-info')
        .then(function (response){
            Object.assign(paymentInfo, response.data);
            return response.data;
        });
      },

      updateAccount: function(account) {
        Object.assign(account, populateMemberIds(account));
      },

      updatePaymentInfo: function(paymentInfo) {
        Object.assign(paymentInfo, paymentInfo);
      },

      getUserFreeLimit: function() {
            return freeUserLimit;
      }
    };
  }])
});
