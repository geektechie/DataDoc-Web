define(['./module', 'angular', 'common'], function (controllers, angular, common) {
  'use strict';
  controllers.controller('billingHistoryCtrl', ['$scope', '$rootScope','$http','$timeout','$uibModal','Account','StripeService','User',
    function ($scope, $rootScope, $http, $timeout, $uibModal, Account,StripeService,User) {

        Account.getCurrentMonthUsageCost().then(function(response) {
            $scope.usageOfTheMonth = response.totalCost;
        }).catch(err => {
            if(err.status == '401'){
                $scope.error = '';
            }else{
                $scope.error = '';
            }
        });


        $scope.billingHistoryData = []
        $scope.showBillingHistory = (function(){
            User.getBillingHistory().then(function(response) {
                $scope.billingHistoryData = response;
            }).catch(err => {
                if(err.status == '401'){
                    $scope.error = '';
                }else{
                    $scope.error = '';
                }
            });
        })();



        $scope.downloadInvoice = function(invoiceId){
            Account.downloadInvoice(invoiceId)
        }


    }]);
});