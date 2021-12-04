angular.module('taxes-app').controller('informationModalCtrl', informationModalCtrl);
informationModalCtrl.$inject = ['$scope', '$loading', '$uibModal', '$uibModalInstance', 'dialogs', 'toastr', 'informationModel', 'id_info'];
function informationModalCtrl($scope, $loading, $uibModal, $uibModalInstance, dialogs, toastr, informationModel, id_info) {
  let mm = this;

  let load = () => {
    if (id_info) {
      $loading.start(`loading-container`);
      informationModel.byId.get({id: id_info}).$promise.then(resp => {
        mm.modal = resp;
        $loading.finish(`loading-container`);
      }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
    }
  };
  load();

  mm.save = modal => {
    $loading.start(`loading-container`);
    if (this.modal.id) {
      informationModel.simple.update(modal).$promise.then(() => {
        $loading.finish(`loading-container`);
        toastr.success(`Datele au fost modificate`);
        $uibModalInstance.close();
      }).catch(e => toastr.error(`Eroare la modificarea datelor! ${e}`));
    } else {
      informationModel.simple.save(modal).$promise.then(() => {
        $loading.finish(`loading-container`);
        toastr.success(`Datele au fost salvate`);
        $uibModalInstance.close();
      }).catch(e => toastr.error(`Eroare la salvarea datelor! ${e}`));
    }
	};
}