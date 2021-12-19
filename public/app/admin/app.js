(function () {
  'use strict';

  angular.module('taxes-app', [
    'ngResource',
    'ngRoute',
    'ngStorage',
    // 'ui.grid',
    // 'ui.grid.selection',
    // 'ui.grid.resizeColumns',
    'ui.bootstrap',
    'dialogs.main',
    'toastr',
    'ui.select',
    'infinite-scroll',
    'ngSanitize',
    'darthwade.dwLoading',
    // 'ui.ace',
    'ui.bootstrap.contextMenu',
    // 'cfp.hotkeys',
    'angular.bind.notifier'
  ]);

  // function RequestService($q, $loading) {
  // 	return {
  // 		request: function (config) {
  // 			config.headers = config.headers || {};
  // 			if (window.bootstrappedUser.token) {
  // 				config.headers['x-access-token'] = window.bootstrappedUser.token;
  // 			}
  // 			return config;
  // 		},

  // 		responseError: function (response) {
  // 			$loading.finish('loading-container');
  // 			return $q.reject(response);
  // 		}
  // 	};
  // }

  function config($httpProvider, $locationProvider, $routeProvider) {
    // $httpProvider.interceptors.push('RequestService');
    $locationProvider.hashPrefix('');

    $routeProvider
      .when('/', {
        templateUrl: 'app/admin/main/dash',
        controller: 'dashCtrl'
      })
      .when('/information', {
        templateUrl: 'app/admin/information/information',
        controller: 'informationCtrl',
        controllerAs: 'vm'
      })
      .when('/person', {
        templateUrl: 'app/admin/person/person',
        controller: 'personCtrl',
        controllerAs: 'vm'
      })
      .when('/car', {
        templateUrl: 'app/admin/car/car',
        controller: 'carCtrl',
        controllerAs: 'vm'
      })
      // ----------------------END OTHER ACTIONS ----------------------
      .otherwise({redirectTo: '/'});
  }

  function run($templateCache, $rootScope, $location, $route, $uibModalStack) {
    $templateCache.put("select2/match-multiple.tpl.html", "<span class=\"ui-select-match\"><li class=\"ui-select-match-item select2-search-choice\" ng-repeat=\"$item in $select.selected track by $index\" ng-class=\"{\'select2-search-choice-focus\':$selectMultiple.activeMatchIndex === $index, \'select2-locked\':$select.isLocked(this, $index)}\" ng-click=\"$selectMultiple.removeChoice($index)\" ui-select-sort=\"$select.selected\"><span uis-transclude-append=\"\"></span> <a href=\"javascript:;\" class=\"ui-select-match-close select2-search-choice-close\" tabindex=\"-1\"></a></li></span>");
    $rootScope.$on('$routeChangeError', function (evt, currentUser, previous, rejection) {
      if (rejection === 'not authorized') {
        $location.path('/');
      }
      $route.reload();
    });
    $rootScope.$on('$locationChangeStart', () => $uibModalStack.dismissAll());
  }

  // function socketFactory() {
  // 	let socket = io.connect({'transports': ['websocket'], forceNew: true});
  // 	socket.on('reconnect', () => socket.emit('join', window.bootstrappedUser));
  // 	return {
  // 		on: (eventName, callback) => socket.on(eventName, callback),
  // 		emit: (eventName, data) => socket.emit(eventName, data),
  // 		off: eventName => {
  // 			if (eventName) {
  // 				socket.off(eventName);
  // 			} else {
  // 				socket.removeAllListeners();
  // 			}
  // 		}
  // 	};
  // }

  config
    .$inject = ['$httpProvider', '$locationProvider', '$routeProvider'];

  run
    .$inject = ['$templateCache', '$rootScope', '$location', '$route', '$uibModalStack'];

  // RequestService
  // 	.$inject = ['$q', '$loading'];

  angular
    .module('taxes-app')
    // .factory('RequestService', RequestService)
    // .factory('socket', socketFactory)
    .config(config)
    .run(run);
}());
