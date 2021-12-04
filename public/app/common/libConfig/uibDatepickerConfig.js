angular.module('taxes-app').config(function (uibDatepickerPopupConfig, uibDatepickerConfig) {
	uibDatepickerPopupConfig.currentText = 'Astăzi';
	uibDatepickerPopupConfig.clearText = 'Șterge';
	uibDatepickerPopupConfig.closeText = 'Închide';
	uibDatepickerConfig.showWeeks = false;
});