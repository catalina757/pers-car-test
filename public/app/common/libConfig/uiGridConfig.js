angular.module('ui.grid').config(['$provide', function ($provide) {
	$provide.decorator('i18nService', ['$delegate', function ($delegate) {
		$delegate.add('en', {
			headerCell: {
				aria: {
					defaultFilterLabel: 'Filter for column',
					removeFilter: 'Remove Filter',
					columnMenuButtonLabel: 'Column Menu'
				},
				priority: 'Priority:',
				filterLabel: "Filter for column: "
			},
			aggregate: {
				label: 'items'
			},
			groupPanel: {
				description: 'Drag a column header here and drop it to group by that column.'
			},
			search: {
				placeholder: 'Căutare...',
				showingItems: 'Înregistrări filtrate :',
				selectedItems: ' Înregistrări selectate:',
				totalItems: 'Total înregistrări:',
				size: 'Page Size:',
				first: 'First Page',
				next: 'Next Page',
				previous: 'Previous Page',
				last: 'Last Page'
			},
			menu: {
				text: 'Choose Columns:'
			},
			sort: {
				ascending: 'Sortează crescător',
				descending: 'Sortează descrescător',
				none: 'Sort None',
				remove: 'Șterge sortarea'
			},
			column: {
				hide: 'Hide Column'
			},
			aggregation: {
				count: 'total rows: ',
				sum: 'total: ',
				avg: 'avg: ',
				min: 'min: ',
				max: 'max: '
			},
			pinning: {
				pinLeft: 'Pin Left',
				pinRight: 'Pin Right',
				unpin: 'Unpin'
			},
			columnMenu: {
				close: 'Close'
			},
			gridMenu: {
				aria: {
					buttonLabel: 'Grid Menu'
				},
				columns: 'Coloane:',
				importerTitle: 'Import file',
				exporterAllAsCsv: 'Export all data as csv',
				exporterVisibleAsCsv: 'Export visible data as csv',
				exporterSelectedAsCsv: 'Export selected data as csv',
				exporterAllAsPdf: 'Export all data as pdf',
				exporterVisibleAsPdf: 'Export visible data as pdf',
				exporterSelectedAsPdf: 'Export selected data as pdf',
				clearAllFilters: 'Șterge filtre'
			},
			importer: {
				noHeaders: 'Column names were unable to be derived, does the file have a header?',
				noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
				invalidCsv: 'File was unable to be processed, is it valid CSV?',
				invalidJson: 'File was unable to be processed, is it valid Json?',
				jsonNotArray: 'Imported json file must contain an array, aborting.'
			},
			pagination: {
				aria: {
					pageToFirst: 'Page to first',
					pageBack: 'Page back',
					pageSelected: 'Selected page',
					pageForward: 'Page forward',
					pageToLast: 'Page to last'
				},
				sizes: 'items per page',
				totalItems: 'items',
				through: 'through',
				of: 'of'
			},
			grouping: {
				group: 'Group',
				ungroup: 'Ungroup',
				aggregate_count: 'Agg: Count',
				aggregate_sum: 'Agg: Sum',
				aggregate_max: 'Agg: Max',
				aggregate_min: 'Agg: Min',
				aggregate_avg: 'Agg: Avg',
				aggregate_remove: 'Agg: Remove'
			},
			validate: {
				error: 'Error:',
				minLength: 'Value should be at least THRESHOLD characters long.',
				maxLength: 'Value should be at most THRESHOLD characters long.',
				required: 'A value is needed.'
			}
		});
		return $delegate;
	}]);
}]);