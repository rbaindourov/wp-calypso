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
	return state.documentHead.unreadCount;
}

/**
 * Returns the formatted document title, based on the currently set title,
 * unreadCount, and selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         Formatted title
 */
export function getFormattedTitle( state ) {
	let title = '';

	const unreadCount = getUnreadCount( state );
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
