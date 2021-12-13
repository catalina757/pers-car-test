angular.module('taxes-app').controller('personModalCtrl', personModalCtrl);
personModalCtrl.$inject = ['$scope', '$loading', '$uibModal', '$uibModalInstance', 'dialogs', 'toastr', 'personModel', 'carModel', 'id_person'];
function personModalCtrl($scope, $loading, $uibModal, $uibModalInstance, dialogs, toastr, personModel, carModel, id_person) {
    let mm = this;

    let load = () => {
        if (id_person) {
            $loading.start(`loading-container`);
            personModel.byId.get({id: id_person}).$promise.then(resp => {
                mm.modal = resp;
                $loading.finish(`loading-container`);
            }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
        }

        if (id_person) {
            carModel.simpleUnlinkedAndLinkedCarsForPerson.query({id: id_person}).$promise.then(resp => {
                mm.unlinkedCarsAndLinkedCarsForPerson = resp;
                $loading.finish(`loading-container`);
            }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});
        }

        carModel.simpleUnlinked.query().$promise.then(resp => {
            mm.unlinkedCars = resp;
            $loading.finish(`loading-container`);
        }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});

        personModel.simple.query().$promise.then(resp => {
            mm.allPersons = resp;
            $loading.finish(`loading-container`);
        }).catch(() => {toastr.error(`Eroare la preluarea datelor!`);});


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
            }).catch(
                (e) => {
                    $loading.finish(`loading-container`);
                    toastr.error(`Eroare la salvarea datelor! Exista deja CNP-ul in baza de date! ${e}`);
                }
            );
        }
    };

    mm.calcAge = (cnp) => {
        if (cnp) {
            let dateString = cnp.substr(1, 6);
            let dob = new Date(dateString.substr(0,2), dateString.substr(2,2)-1, dateString.substr(4,2));
            let age = new Date() - dob;
            mm.modal.varsta = Math.floor(age/365/24/60/60/1000);
        } else {
            mm.modal.varsta = null;
        }

        return mm.modal.varsta;
    };
}
