angular.module('taxes-app').config(function (toastrConfig) {
	angular.extend(toastrConfig, {
		autoDismiss: false,
		allowHtml: true,
		containerId: 'toast-container',
		maxOpened: 0,
		newestOnTop: true,
		positionClass: 'toast-top-right',
		preventDuplicates: false,
		preventOpenDuplicates: true,
		target: 'body'
	});
});