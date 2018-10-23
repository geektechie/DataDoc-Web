define([
  'angular',
  'angular-cookies',
  'cached-templates/templates-auth',
  'modules/login/controllers/index',
  'modules/main/services/websocket',
  'modules/main/services/locale-service'
], function (ng) {
  'use strict';

  return ng.module('app.login', ['app.login.controllers', 'templates-auth'])
});
