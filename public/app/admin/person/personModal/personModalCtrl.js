angular.module('taxes-app').controller('personModalCtrl', personModalCtrl);
personModalCtrl.$inject = ['$scope', '$loading', '$uibModal', '$uibModalInstance', 'dialogs', 'toastr', 'personModel', 'carModel', 'id_person'];
function personModalCtrl($scope, $loading, $uibModal, $uibModalInstance, dialogs, toastr, personModel, carModel, id_person) {
    let mm = this;

    mm.select = {
        linkedCars: [],
        unlinkedCars: [],
        allCars: []
    };

    let load = () => {
        if (id_person) {
            $loading.start(`loading-container`);
            personModel.byId.get({id: id_person}).$promise.then(resp => {
                mm.modal = resp;

                console.log(mm.modal.Pers_Cars);
                console.log(mm.modal);

                $loading.finish(`loading-container`);
            }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
        }

        carModel.simple.query().$promise.then(resp => {
            mm.allCars = resp;
            for (let i = 0; i < mm.allCars.length; i++) {
                mm.select.allCars.push(mm.allCars[i].marca + "," + mm.allCars[i].model);
            }
        }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});


        console.log(mm.select);
    };
    load();

    mm.save = modal => {
        $loading.start(`loading-container`);
        if (this.modal.id) {
            personModel.simple.update(modal).$promise.then(() => {
                $loading.finish(`loading-container`);
                toastr.success(`Datele au fost modificate`);
                $uibModalInstance.close();
            }).catch(e => toastr.error(`Eroare la modificarea datelor! ${e}`));
        } else {
            personModel.simple.save(modal).$promise.then(() => {
                $loading.finish(`loading-container`);
                toastr.success(`Datele au fost salvate`);
                $uibModalInstance.close();
            }).catch(e => toastr.error(`Eroare la salvarea datelor! ${e}`));
        }
    };

    mm.calcAge = (cnp) => {
        let dateString = cnp.substr(1, 6);
        let dob = new Date(dateString.substr(0,2), dateString.substr(2,2)-1, dateString.substr(4,2));
        let age = new Date() - dob;
        mm.modal.varsta = Math.floor(age/365/24/60/60/1000);
        return mm.modal.varsta;
    };
}