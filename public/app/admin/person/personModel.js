angular.module('taxes-app').factory('personModel', $resource => {
    return {
        simple: $resource('/api/person', {}, {
            update: {method: 'PUT'}
        }),
        byId: $resource('/api/person/:id'),
    };
});