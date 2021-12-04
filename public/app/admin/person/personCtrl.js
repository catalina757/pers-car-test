angular.module('taxes-app').controller('personCtrl', personCtrl);
personCtrl.$inject = ['$scope', '$loading', '$localStorage', '$uibModal', 'dialogs', 'toastr', 'personModel', 'utils'];
function personCtrl($scope, $loading, $localStorage, $uibModal, dialogs, toastr, personModel, utils) {
    "use strict";
    let vm = this;

    vm.limit = {max: parseInt(window.innerHeight / 20)};
    vm.changeMaxLimit = utils.changeMaxLimit;

    let load = () => {
        // $loading.start;
        console.log('ok');
        personModel.simple.query().$promise.then(resp => {
            console.log('load..111.');
            vm.data = resp;
            // $loading.finish();
        });
    };

    load();

    // let load = () => {
    //     $loading.start(`loading-container`);
    //     personModel.simple.query().$promise.then(resp => {
    //         vm.data = resp;
    //         $loading.finish(`loading-container`);
    //         $(window).trigger('resize');
    //     }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
    // };
    // load();
    //
    // $(window).resize(() => {
    //     vm.limit = {max: parseInt(window.innerHeight / 20)};
    //     utils.setHeight('view', 40, 'maxHeight');
    //     utils.setHeight('scroll', 40, 'maxHeight');
    // });
}
