/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getSelectedSiteId, isSiteSection } from 'state/ui/selectors';
import { getSiteTitle } from 'state/sites/selectors';

/**
 * Returns the document title as set by the DocumentHead component or setTitle
 * action.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Document title
 */
export function getTitle( state ) {
	return state.documentHead.title;
}

/**
 * Returns a count reflecting unread items.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Unread count (string because it can be e.g. '40+')
 */
export function getUnreadCount( state ) {
	return state.documentHead.unreadCount || 0;
}

/**
 * Returns a count reflecting unread items, capped at a given value.
 * Any value greater than the cap yields 'cap+'. Examples with cap=40 (default):
 * '1', '20', '39', '40+'
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  cap    Cap above which 'cap+' is returned
 * @return {?String}        Unread count (string because it can be e.g. '40+')
 */
export function getCappedUnreadCount( state, cap = 40 ) {
	const unreadCount = getUnreadCount( state );
	if ( ! unreadCount ) {
		return false;
	}

	return unreadCount <= cap
		? String( unreadCount )
		: `${ cap }+`;
}

/**
 * Returns the formatted document title, based on the currently set title,
 * capped unreadCount, and selected site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  cap    Cap above which 'cap+' is returned for unread count
 * @return {String}         Formatted title
 */
export function getFormattedTitle( state, cap = 40 ) {
	let title = '';

	const unreadCount = getCappedUnreadCount( state, cap );
	if ( unreadCount ) {
		title += `(${ unreadCount }) `;
	}

	title += compact( [
		getTitle( state ),
		isSiteSection( state ) && getSiteTitle( state, getSelectedSiteId( state ) )
	] ).join( ' ‹ ' );

	if ( title ) {
		title = decodeEntities( title ) + ' — ';
	}

	return title + 'WordPress.com';
}
