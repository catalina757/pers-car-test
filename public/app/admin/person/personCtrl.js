angular.module('taxes-app').controller('personCtrl', personCtrl);
personCtrl.$inject = ['$scope', '$loading', '$localStorage', '$uibModal', 'dialogs', 'toastr', 'personModel', 'carModel', 'utils'];
function personCtrl($scope, $loading, $localStorage, $uibModal, dialogs, toastr, personModel, carModel, utils) {
    "use strict";
    let vm = this;

    vm.limit = {max: parseInt(window.innerHeight / 20)};
    vm.changeMaxLimit = utils.changeMaxLimit;

    vm.filterConcatName = (search) => {
        return function (person) {
            let concatenated = person.nume + " " + person.prenume;

            return !search || concatenated.toLowerCase().indexOf(search.toLowerCase()) !== -1;
        };
    };

    vm.filterCar = (search) => {
        return function (person) {
            let stringifiedCars = JSON.stringify(person.Pers_Car);
            return !search || stringifiedCars.toLowerCase().indexOf(search.toLowerCase()) !== -1;
        };
    };

    let load = () => {
        $loading.start(`loading-container`);
        personModel.simple.query().$promise.then(resp => {
            vm.data = resp;
            $loading.finish(`loading-container`);
            $(window).trigger('resize');
        }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
    };
    load();

    $(window).resize(() => {
        vm.limit = {max: parseInt(window.innerHeight / 20)};
        utils.setHeight('view', 40, 'maxHeight');
        utils.setHeight('scroll', 40, 'maxHeight');
    });

    vm.add = () => {
        $uibModal.open({
            templateUrl: 'app/admin/person/personModal/personModal',
            controller: 'personModalCtrl',
            controllerAs: 'mm',
            size: 'sm',
            resolve: {id_person: () => null}
        }).result.then(() => load()).catch(() => null);
    };

    vm.edit = ob => {
        $uibModal.open({
            templateUrl: 'app/admin/person/personModal/personModal',
            controller: 'personModalCtrl',
            controllerAs: 'mm',
            size: 'sm',
            resolve: {id_person: () => ob.id}
        }).result.then(()=>load()).catch(()=>null);
    };

    vm.remove = ob => {
        dialogs.confirm(`Confirmă ștergerea`, `Doriți să ștergeți rândul?`).result.then(() => {
            $loading.start(`loading-container`);
            personModel.byId.remove({id: ob.id}).$promise.then(() => {
                $loading.finish(`loading-container`);
                toastr.success(`Rândul a fost șters!`);
                load();
            }).catch(() => toastr.error(`Eroare la ștergere`));
        }).catch(() => null);
    };

}
