angular.module('taxes-app').service('utils', ['$timeout',
	function ($timeout) {
		// set maxHeight or height for view with overflow-y auto
		this.setHeight = (viewId, bottom, attr) => {
			let id = viewId ? viewId : 'view';
			$timeout(() => {
				let e = document.getElementById(id);
				if (e) {
					let distanceToTop = e.getBoundingClientRect().top + (bottom ? bottom : 20);
					let vh = window.innerHeight;

					if (vh > 450) {
						e.style[attr ? attr : 'height'] = vh - distanceToTop + 'px';
					}
				}
			});
		};

		// set maxHeight or height for table view with overflow-y auto
		this.setTableHeight = (viewId, bottom, attr) => {
			let id = viewId ? viewId : 'view';
			$timeout(() => {
				let e = document.getElementById(id);
				if (e) {
					let distanceToTop = e.getBoundingClientRect().top + (bottom ? bottom : 20);
					let vh = window.innerHeight;
					if (vh > 450) {
						if (e.style.height) {
							e.style.height = null;
						}
						let elHeight = e.offsetHeight;
						if ((vh - distanceToTop) > elHeight) {
							e.style[attr ? attr : 'height'] = elHeight + 'px';
						} else {
							e.style[attr ? attr : 'height'] = vh - distanceToTop + 'px';
						}
					}
				}
			});
		};

		this.scrollTop = (className, top) => {
			let arr = document.getElementsByClassName(className);
			if (arr && arr.length) {
				arr[0].scrollTop = top ? top : 0;
			}
		};

		this.goTopButton = (view, button, distance) => {
			// handle scroll for go back to top button in tables with scroll
			view = view ? view : 'view-scroll';
			button = button ? button : '#back-top';
			distance = distance ? distance : 1500;
			$timeout(() => {
				let backTopBtn = $(button);
				let arr = document.getElementsByClassName(view);
				if (arr && arr.length && arr[0] && backTopBtn) {
					$(arr[0]).scroll(() => {
						if (arr[0].scrollTop > distance) {
							backTopBtn.addClass('show');
						} else {
							backTopBtn.removeClass('show');
						}
					});
				}
			}, 300);
		};

		// change max limit for ngInfiniteScroll
		this.changeMaxLimit = (arr, limit, step) => {
			if (arr && limit && limit.max < arr.length) {
				limit.max += step ? step : 2;
			}
		};

		this.replaceDiacritics = text => text ? text.toString().toLowerCase().normalize('NFKD').replace(/[^\w]/g, '') : null;
		this.replaceOnlyDiacritice = text => !!text ? text.normalize('NFKD').replace(/[^\w\s.\-_\/]/g, '') : null;

		this.roFilterWords = (searchTerm, cellValue) => {
			let words = searchTerm.split(' ');
			if (!cellValue) {
				return false;
			}
			let ok = true;
			for (let i = 0; i < words.length; i++) {
				ok = ok && this.replaceDiacritics(cellValue.toString()).indexOf(this.replaceDiacritics(words[i])) > -1;
			}
			return ok;
		};

		this.roFilter = (searchTerm, cellValue) => {
			if (!cellValue) {
				return false;
			}
			return this.replaceDiacritics(cellValue.toString()).indexOf(this.replaceDiacritics(searchTerm)) > -1;
		};
	}]);


