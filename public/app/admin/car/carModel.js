angular.module('taxes-app').factory('carModel', $resource => {
    return {
        simple: $resource('/api/car', {}, {
            update: {method: 'PUT'}
        }),
        byId: $resource('/api/car/:id'),
    };
});