"use strict";

angular.module('taxes-app').controller('carModalCtrl', carModalCtrl);

carModalCtrl.$inject = ['$scope', '$loading', '$uibModal', '$uibModalInstance', 'dialogs', 'toastr', 'carModel', 'id_car'];
function carModalCtrl($scope, $loading, $uibModal, $uibModalInstance, dialogs, toastr, carModel, id_car) {
    let mm = this;

    let load = () => {
        if (id_car) {
            $loading.start(`loading-container`);
            carModel.byId.get({id: id_car}).$promise.then(resp => {
                mm.modal = resp;
                $loading.finish(`loading-container`);
            }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
        }
    };
    load();

    mm.save = modal => {
        $loading.start(`loading-container`);
        if (this.modal.id) {
            carModel.simple.update(modal).$promise.then(() => {
                $loading.finish(`loading-container`);
                toastr.success(`Datele au fost modificate`);
                $uibModalInstance.close();
            }).catch(e => toastr.error(`Eroare la modificarea datelor! ${e}`));
        } else {
            carModel.simple.save(modal).$promise.then(() => {
                $loading.finish(`loading-container`);
                toastr.success(`Datele au fost salvate`);
                $uibModalInstance.close();
            }).catch(e => toastr.error(`Eroare la salvarea datelor! ${e}`));
        }
    };

    mm.calcTax = (cap_cil) => {
        if (cap_cil <= 1500 && cap_cil > 0) {
            mm.modal.imp = 50;
        } else if (cap_cil <= 2000) {
            mm.modal.imp = 100;
        } else if (cap_cil > 2000) {
            mm.modal.imp = 200;
        } else {
            mm.modal.imp = null;
        }
        return mm.modal.imp;
    };
}