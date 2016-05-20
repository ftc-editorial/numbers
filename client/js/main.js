'use strict'
const DomDelegate = require('dom-delegate');
const oShare = require('ftc-share');
oShare.init();
const Sticky = require('./sticky');
const oToggler = require('./toggler');
oToggler.init();
const helper = require('./helper');

const leadEl = document.querySelector('.articlehead__lead');

const leadElPos = helper.getElementPosition(leadEl);
// console.log(leadElPos);

const headerEl = document.querySelector('[data-o-component=o-header]');
new Sticky(headerEl, {
	start: leadElPos.yBottom/*,
	debug: true*/
});


