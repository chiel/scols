'use strict';

var getScrollTop = function() {
	return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
};

/**
 * SCols
 *
 * @param {Element} container
 * @param {Object} options
 * @param {Object} options.colSelector - Column selector
 * @param {Object} options.fromTop - Determine how far from the top of the viewport columns should stick
 */
var SCols = function(container, options) {
	if (!container) return;

	this.container = container;
	this.options = options || {};

	if (!this.options.colSelector) {
		this.options.colSelector = '[data-scols-col]';
	}

	if (this.options.fromTop === undefined) {
		this.options.fromTop = 0;
	}

	this.cols = this.container.querySelectorAll(this.options.colSelector);
	if (!this.cols.length) return;

	this.bound = {
		scroll: this.scroll.bind(this),
		position: this.position.bind(this)
	};

	this.attach();
};

require('microevent').mixin(SCols);

/**
 * Attach SCols behaviour to container
 */
SCols.prototype.attach = function() {
	if (this.attached) return;
	this.attached = true;
	this.initialRects = this.getColRects();
	this.setContainerHeight();

	window.addEventListener('scroll', this.bound.scroll);
};

/**
 *
 */
SCols.prototype.detach = function() {
	if (!this.attached) return;
	this.attached = false;
	this.container.style.height = '';

	for (var i = 0; i < this.cols.length; i++) {
		var col = this.cols[i];
		col.style.position = '';
		col.style.top = '';
		col.style.left = '';
		col.style.right = '';
		col.style.width = '';
	}

	window.removeEventListener('scroll', this.bound.scroll);
};

/**
 * Get rects for all columns
 */
SCols.prototype.getColRects = function() {
	return [].map.call(this.cols, function(col) {
		return col.getBoundingClientRect();
	});
};

/**
 * Get the tallest rect
 *
 * @param {Array} rects
 *
 * @return {Object}
 */
SCols.prototype.getTallestRect = function(rects) {
	var heights = [].map.call(rects, function(r) {
		return r.bottom - r.top;
	});

	var tallest = { height: 0 };
	for (var i = 0; i < heights.length; i++) {
		if (heights[i] > tallest.height) {
			tallest = { index: i, height: heights[i] };
		}
	}
	return tallest;
};

/**
 * Make sure container is as tall as the tallest column
 */
SCols.prototype.setContainerHeight = function() {
	var heights = [].map.call(this.getColRects(), function(r) {
		return r.bottom - r.top;
	});

	var height = Math.max.apply(Math, heights);
	this.container.style.height = height + 'px';
};

/**
 * Fired on scroll
 */
SCols.prototype.scroll = function() {
	if (!this.rAFQueued) {
		requestAnimationFrame(this.bound.position);
		this.rAFQueued = true;
	}
};

/**
 * Calculate column positions
 */
SCols.prototype.position = function() {
	this.rAFQueued = false;

	this.lastDirection = this.lastDirection || 'down';

	var scrollTop = getScrollTop();
	var direction = scrollTop === this.lastScrollTop ? this.lastDirection : (!this.lastScrollTop || scrollTop > this.lastScrollTop) ? 'down' : 'up';
	var cr = this.container.getBoundingClientRect();
	var rects = this.getColRects();
	var tallest = this.getTallestRect(rects);
	var iW = window.innerWidth;
	var iH = window.innerHeight;

	var col, r, ir, pos, top;
	for (var i = 0; i < this.cols.length; i++) {
		if (i === tallest.index) continue;

		col = this.cols[i];
		r = rects[i];
		ir = this.initialRects[i];
		pos = undefined;
		top = undefined;

		if (direction === this.lastDirection) {
			if (direction === 'down') {
				if (cr.top >= this.options.fromTop) {
					pos = 'absolute';
					top = 0;
				} else if (r.top <= this.options.fromTop && r.height < iH) {
					pos = 'fixed';
					top = this.options.fromTop;
				} else if (r.bottom <= iH) {
					pos = 'fixed';
					top = iH - r.height;
				}
			} else if (direction === 'up') {
				if (r.top >= this.options.fromTop && cr.top < this.options.fromTop) {
					pos = 'fixed';
					top = this.options.fromTop;
				} else if (r.top <= cr.top) {
					pos = 'absolute';
					top = 0;
				} else {
					pos = 'absolute';
					top = r.top - cr.top;
				}
			}
		} else {
			pos = 'absolute';
			top = r.top - cr.top;
		}

		if (r.bottom >= cr.bottom && r.top <= this.options.fromTop) {
			pos = 'absolute';
			top = cr.height - r.height;
		}

		if (pos !== undefined && top !== undefined) {
			col.style.position = pos;
			col.style.top = top + 'px';

			if (pos === 'fixed') {
				col.style.left = ir.left + 'px';
				col.style.right = 'auto';
				col.style.width = (ir.right - ir.left) + 'px';
			} else {
				col.style.left = '';
				col.style.right = '';
				col.style.width = '';
			}
		}
	}

	col = this.cols[tallest.index];
	col.style.position = 'absolute';
	col.style.top = 0 + 'px';

	this.lastDirection = direction;
	this.lastScrollTop = scrollTop;

	this.trigger('position');
};

module.exports = SCols;
