/* eslint-disable no-console */
class Sticky {
	/**
	* Create a sticky instance
	* param { String | HTMLElement } rootEl - The sticky element's container
	* param { Object } config
	* param { String | HTMLElement } config.relativeTo - The element to which the rootEl is relative
	*/
	constructor(rootEl, config) {

		if (!Sticky._stickies) {
			Sticky._stickies = [];
		}

		if (!rootEl) {
			return;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		this.rootEl = rootEl;
		console.log(this.rootEl);

		if (!config.relativeTo) {
			return;
		} else if (!(config.relativeTo instanceof HTMLElement)) {
			this.refEl = config.relativeTo;
		}

		if (!(this.refEl instanceof HTMLElement)) {
			this.refEl = document.querySelector(this.refEl);
		}


		this.distance = this.getDistance();

		this.sticky = false;

		this.updatePosition();
		this.rootEl.setAttribute('data-o-sticky--js', 'true');

		Sticky._stickies.push(this);
/*
 *{Boolean} _listenerAdded - Flag to prevent event added multiple time on window. 
 */
		if (!Sticky._listenerAdded) {
			console.log('Add scroll event on window');
			window.addEventListener('scroll', Sticky._winScroll);

			window.addEventListener('unload', function() {
				window.removeEventListener('scroll', Sticky._winScroll);
			});	

			Sticky._listenerAdded = true;
		}		
	}

	getDistance() {
		return this.refEl.getBoundingClientRect().bottom - this.rootEl.getBoundingClientRect().bottom;
	}

	setDistance() {
		this.distance = this.getDistance();
	}

/**
 * @param { String } newState - `top`, `fixed` or `bottom`
 */
	setSticky(state) {
		if (state !== this.sticky) {
			this.rootEl.setAttribute('aria-sticky', state);
			this.sticky = state;
		}
	}

// Since updatePosition will be executed in scroll event, avoid calculation dynamically.
	updatePosition() {
// displacement changes on every scroll. Reset it every time.
		this.setDistance();
		if (this.distance > 0) {
			this.setSticky(false);
		} else {
			this.setSticky(true)
		}
	}

	static _winScroll() {
		Sticky._stickies.forEach((sticky) => {
			if (sticky.rootEl.hasAttribute('data-o-sticky--js')) {
				sticky.updatePosition();
			}
		});
	}

}

export default Sticky;