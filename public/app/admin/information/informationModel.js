angular.module('taxes-app').factory('informationModel', $resource => {
	return {
		simple: $resource('/api/information', {}, {
			update: {method: 'PUT'}
		}),
		byId: $resource('/api/information/:id'),
	};
});
