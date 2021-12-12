angular.module('taxes-app').factory('carModel', $resource => {
    return {
        simple: $resource('/api/car', {}, {
            update: {method: 'PUT'},
        }),

        simpleUnlinked: $resource('/api/car/unlink', {}, {
            update: {method: 'PUT'},
        }),

        simpleUnlinkedAndLinkedCarsForPerson: $resource('/api/car/unlinkAndLinkedCarsForPerson', {}, {
            update: {method: 'PUT'},
        }),

        byId: $resource('/api/car/:id'),
    };
});