define(['./module', 'jquery', 'angular', 'common', 'lodash'], function (controllers, jquery, angular, common, _) {
    controllers.controller('myAccountCtrl', ['$scope', '$rootScope', '$state', '$uibModal', 'User','Account','TimeZoneService', '$timeout','CurrencyService',
        function ($scope, $rootScope, $state, $uibModal, User, Account, TimeZoneService, $timeout, CurrencyService) {

          $scope.user = User.getCurrent();
          $scope.password = 'pass@123';
          $scope.isCompanyOwner = User.isCompanyOwner();

          $scope.notificationUpdatedFor = {
             name:false,
             timeZone:false,
             dateFormat:false,
             currency:false
          }

          $scope.availableTimezones = TimeZoneService.getTimeZones();

          function triggerUpdateNotification(property){
             console.log("triggerUpdateNotification " , property);
              $scope.notificationUpdatedFor[property] = true;
              $timeout(function(){
                 $scope.notificationUpdatedFor[property] = false;
              }, 2000);
          }

            $scope.isShowBillingHistory = false;
            User.getBillingHistory().then(function(response) {
                if(response.length > 0)
                    $scope.isShowBillingHistory = true;
            }).catch(err => {
                $scope.isShowBillingHistory = false;
            });

          function initUserToUpdate() {
            $scope.user = User.getCurrent();
            let userTimezone = getCurrentUserTimezone();
            let currency = CurrencyService.findByCode($scope.user.currency)
            $scope.userToUpdate={
              fullName: $scope.user.fullName,
              timezone: userTimezone == null ? '('+TimeZoneService.getDefaultTimezone().displayZone+') '+TimeZoneService.getDefaultTimezone().text : userTimezone,
              currencyType: currency == null ? 'Albania Lek (Lek)':currency.name +" (" +currency.symbol + ")",
              dateFormatType: $scope.user.dateFormat==null ? 'DD / MM / YYYY':$scope.user.dateFormat
            };
          }

          function getCurrentUserTimezone() {
            let userTimezone = $scope.user.timezone;
            if(userTimezone && !TimeZoneService.findByName(userTimezone)){
                userTimezone = '('+TimeZoneService.getDefaultTimezone().displayZone+') '+TimeZoneService.getDefaultTimezone().text;
            }else{
                userTimezone = '('+TimeZoneService.findByName(userTimezone).displayZone+') '+TimeZoneService.findByName(userTimezone).text;
            }
            return userTimezone;
          }

          initUserToUpdate();

          $scope.onChangeFullName=function() {
             if($scope.user.fullName!=$scope.userToUpdate.fullName){
                $scope.updateUserDetail('name');
             }
          };

          $scope.updateUserDetail = function(property) {
             var timeZoneName = $scope.userToUpdate.timezone.split(") ");
             User.updateUserDetail(
                 $scope.userToUpdate.fullName,
                 TimeZoneService.findByText(timeZoneName[1]).name,
                 $scope.userToUpdate.dateFormatType,
                 $scope.userToUpdate.currencyType
             ).then(
                 function(response){
                     initUserToUpdate();
                     triggerUpdateNotification(property);
                 }
             ).catch(err => {
                console.log('Failed to update timezone', err);
                //TODO: Appropriate failure message on failure.
             })
          };

          $scope.getButtonLink = function(){
            if($scope.account.planType == 'FREE'){
                return 'Upgrade'
            }else if(($scope.account.accountType == 'BUSINESS' && User.isCompanyOwner())
             || ($scope.account.accountType == 'INDIVIDUAL' && $scope.account.planType == 'MONTHLY')){
                return 'Modify';
            }else {
                return ''
            }
          }

          Account.getAccount().then(function(response) {}).catch(err => {
               console.log('Error while fetch Account details', err);
           })
          Account.getPaymentInfo().then(function(response) {}).catch(err => {
              console.log('Error while fetch Payment details', err);
          });

          $scope.account = Account.account;
          $scope.paymentInfo = Account.paymentInfo;

          $scope.isFreePlan = function(){
            return $scope.account.planType == 'FREE';
          }
          $scope.getPaymentInfo = function(){
            var payment = {}
            payment.label = $scope.paymentInfo.cardLastFourDigit == null ? 'Add card' : 'Change card';
            payment.card = $scope.paymentInfo.cardLastFourDigit == null ? 'None on file' : '************'+$scope.paymentInfo.cardLastFourDigit;
            return payment;

          };

          $scope.getPlan = function(){
              if($scope.account.accountType === 'INDIVIDUAL' && $scope.account.planType === 'MONTHLY'){
                  return 'Individual Account';
              }else if($scope.account.accountType === 'INDIVIDUAL' && $scope.account.planType === 'FREE'){
                  return 'Free plan'
              } else{
                  if($scope.user.role == 'Owner' || $scope.user.role == 'Admin')
                      return "Company Account (" + $scope.account.numberOfLicenses + " licenses)";
                  else
                      return "Company Account";
              }
          };

          $scope.updateUserTimezone = function(timezone){
            $scope.userToUpdate.timezone='('+timezone.displayZone+') '+timezone.text;
            console.log('to update : ', timezone.abbr)
            if($scope.userToUpdate.timezone!=$scope.user.timezone){
               $scope.updateUserDetail('timeZone');
            }
          };

          $scope.dateFormatTypes = [
              'DD / MM / YYYY',
              'MM / DD / YYYY',
              'YYYY - MM - DD'
          ];

          $scope.dateFormatTypeSelected = function(dateFormat){
            $scope.userToUpdate.dateFormatType=dateFormat;
            if($scope.userToUpdate.dateFormatType!=$scope.user.dateFormat){
               $scope.updateUserDetail('dateFormat');
            }
          };

          $scope.currencyTypes = [
              'Albania Lek (Lek)','Afghanistan Afghani (؋)','Argentina Peso ($)','Aruba Guilder (ƒ)','Australia Dollar ($)','Azerbaijan Manat (₼)','Bahamas Dollar ($)','Barbados Dollar ($)','Belarus Ruble (Br)','Belize Dollar (BZ$)','Bermuda Dollar ($)','Bolivia Bolíviano ($b)','Bosnia and Herzegovina Convertible Marka (KM)','Botswana Pula (P)','Bulgaria Lev (лв)','Brazil Real (R$)','Brunei Darussalam Dollar ($)','Cambodia Riel (៛)','Canada Dollar ($)','Cayman Islands Dollar ($)','Chile Peso ($)','China Yuan Renminbi (¥)','Colombia Peso ($)','Costa Rica Colon (₡)','Croatia Kuna (kn)','Cuba Peso (₱)','Czech Republic Koruna (Kč)','Denmark Krone (kr)','Dominican Republic Peso (RD$)','East Caribbean Dollar ($)','Egypt Pound (£)','El Salvador Colon ($)','Euro Member Countries (€)','Falkland Islands (Malvinas)', 'Pound (£)','Fiji Dollar ($)','Ghana Cedi (¢)','Gibraltar Pound (£)','Guatemala Quetzal (Q)','Guernsey Pound (£)','Guyana Dollar ($)','Honduras Lempira (L)','Hong Kong Dollar ($)','Hungary Forint (Ft)','Iceland Krona (kr)','India Rupee (₹)','Indonesia Rupiah (Rp)','Iran Rial (﷼)','Isle of Man Pound (£)','Israel Shekel (₪)','Jamaica Dollar (J$)','Japan Yen (¥)','Jersey Pound (£)','Kazakhstan Tenge (лв)','Korea (North)', 'Won (₩)','Korea (South)','Kyrgyzstan Som (лв)','Laos Kip (₭)','Lebanon Pound (£)','Liberia Dollar ($)','Macedonia Denar (ден)','Malaysia Ringgit (RM)','Mauritius Rupee (₨)','Mexico Peso ($)','Mongolia Tughrik (₮)','Mozambique Metical (MT)','Namibia Dollar ($)','Nepal Rupee (₨)','Netherlands Antilles Guilder (ƒ)','New Zealand Dollar ($)','Nicaragua Cordoba (C$)','Nigeria Naira (₦)','Norway Krone (kr)','Oman Rial (﷼)','Pakistan Rupee (₨)','Panama Balboa (B/.)','Paraguay Guarani (Gs)','Peru Sol (S/.)','Philippines Piso (₱)','Poland Zloty (zł)','Qatar Riyal (﷼)','Romania Leu (lei)','Russia Ruble (₽)','Saint Helena Pound (£)','Saudi Arabia Riyal (﷼)','Serbia Dinar (Дин.)','Seychelles Rupee (₨)','Singapore Dollar ($)','Solomon Islands Dollar ($)','Somalia Shilling (S)','South Africa Rand (R)','Sri Lanka Rupee (₨)','Sweden Krona (kr)','Switzerland Franc (CHF)','Suriname Dollar ($)','Syria Pound (£)','Taiwan New Dollar (NT$)','Thailand Baht (฿)','Trinidad and Tobago Dollar (TT$)','Turkey Lira (₺)','Tuvalu Dollar ($)','Ukraine Hryvnia (₴)','United Kingdom Pound (£)','United States Dollar ($)','Uruguay Peso ($U)','Uzbekistan Som (лв)','Venezuela Bolívar (Bs)','Viet Nam Dong (₫)','Yemen Rial (﷼)','Zimbabwe Dollar (Z$)'
          ];

          $scope.currencyTypeSelected = function(currency){
            $scope.userToUpdate.currencyType=currency;
            if($scope.userToUpdate.currencyType!=$scope.user.currency){
               $scope.updateUserDetail('currency');
            }
          };

        //My account details
        $scope.showMyAccountDetailsModal = function() {
          $scope.myAccountDetailsModal = $uibModal.open({
            templateUrl: 'static/templates/include/modify-account-details.html',
            controller: 'modifyAccountDetailsCtrl',
            scope: $scope,
            animation: true,
            size: 'md'
          });
        };

        //Change password
        $scope.showChangePasswordModal = function() {
          $scope.changePasswordModal = $uibModal.open({
            templateUrl: 'static/templates/include/change-password.html',
            controller: 'changePasswordCtrl',
            scope: $scope,
            animation: true,
            size: 'md'
          });
        };

        //Change email
        $scope.showChangeEmailModal = function() {
          $scope.changeEmailModal = $uibModal.open({
            templateUrl: 'static/templates/include/change-email.html',
            controller: 'changeEmailCtrl',
            scope: $scope,
            animation: true,
            size: 'md'
          });

          $scope.changeEmailModal.result
             .then(function (selectedItem) {
             }, function () {
                $scope.user = User.getCurrent();
          });
        };

          // update credit card modal
          $scope.showUpdateCreditCardModal = function() {
              $scope.updateCreditCardModal = $uibModal.open({
                templateUrl: 'static/templates/include/update-credit-card.html',
                controller: 'updateCreditCardCtrl',
                scope: $scope,
                animation: true,
                size: 'md'
              });

              $scope.updateCreditCardModal.result
                 .then(function (selectedItem) {
                 }, function (updatedPaymentInfo) {
                    if(updatedPaymentInfo) {
                        $scope.paymentInfo = updatedPaymentInfo;
                    }
              });
          };

          $scope.showCloseAccountModal = function() {
                $scope.closeAccountModal = $uibModal.open({
                  templateUrl: 'static/templates/include/close-account.html',
                  controller: 'closeAccountCtrl',
                  scope: $scope,
                  animation: true,
                  size: 'md'
                });
              };

              function disconnectFromGoogle(){
                  var auth2 = gapi.auth2.getAuthInstance();
                  auth2.disconnect();
                  User.disconnectFromGoogle().then(function(){
                      $scope.user = User.getCurrent();
                  }).catch(err => {
                      //TODO: Appropriate failure message on failure.
                      console.log('Something went wrong, Unable to disconnect from google.')
                  })
              }

              $scope.disconnectGoogle = function(){
                 disconnectFromGoogle();
              };


            $scope.options = {
              'onsuccess': function(googleUser) {
                  var profile = googleUser.getBasicProfile();
                  User.checkAccount(profile.getEmail()).then(function(response) {
                      console.log('User connected...')
                      $scope.user = User.getCurrent();
                      $state.go('main.landing.my_account');
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

        $scope.showBillingHistory= function(){
        console.log('to billing history.');
            $state.go('main.landing.billing_history');
        }

        $scope.showReportDataUsage=function(){
            Account.reportDataUsage().then(function(response){
                if(response.status == '200'){
                    console.log('Success'+response);
                }
            }).catch(function(error) {

            });
        }


    }]);
});
