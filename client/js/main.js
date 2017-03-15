import Share from 'ftc-share';
import {ToggleMenu} from 'ftc-toggle';
import Sticky from './sticky.js';

Share.init();
new ToggleMenu('.o-header__right');

new Sticky('.o-header', {
	relativeTo: '.articlehead__lead'
});

