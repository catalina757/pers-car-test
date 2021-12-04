angular.module('taxes-app').config(function ($translateProvider, dialogsProvider) {
	$translateProvider.translations('ro', {DIALOGS_YES: 'Da', DIALOGS_NO: 'Nu', DIALOGS_OK: 'Ok'});
	dialogsProvider.setSize('sm');
	dialogsProvider.useBackdrop('static');
	dialogsProvider.useEscClose(false);
});
