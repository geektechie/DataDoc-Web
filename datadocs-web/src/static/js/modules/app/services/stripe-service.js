define(['./module', 'jquery', 'lodash', 'moment'], function (module, $, _, moment) {
  module.factory('StripeService', ['$http', 'User','Account', '$rootScope', function ($http, User, Account, $rootScope) {

    api_base_url = $rootScope.bseUrl
    
    var publishableKey = undefined;
    let STRIPE_BASE_URL = 'https://api.stripe.com/v1/';
    var stripe;
    var getStripe = function(){
      return stripe;
    };


    let loadPublishableKey = function(){
      $http({
          method: 'GET',
          url: '/api/payment/publishableKey',
          headers: {'Content-Type': 'application/json'}
      }).then(function (response) {
          console.log('publishable key is :'+response.data.publishableKey);
          console.log(response);
          publishableKey = response.data.publishableKey;
          stripe = Stripe(publishableKey)
      });
    }
    loadPublishableKey();

    return {
      getStripe,
      createToken: function(card){
        return stripe.createToken(card);
      },
      subscribe: function (billingDetails) {
        return $http({
          method: 'POST',
          url: api_base_url + '/api/user/billing-details',
          data: billingDetails,
          headers: {'Content-Type': 'application/json'}
        });
      },
      updateCard: function (cardDetails) {
            return $http({
              method: 'POST',
              url: '/api/account/update-card',
              data: cardDetails,
              headers: {'Content-Type': 'application/json'}
        }).then(function(response){
            Account.updatePaymentInfo(response.data);
            return response;
        });
       }

    };
  }])
});
