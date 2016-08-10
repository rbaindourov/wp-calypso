/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getSelectedSite, getSectionGroup } from 'state/ui/selectors';

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
 * @return {?String}        Formatted title
 */
export function getFormattedTitle( state ) {
	const siteSpecificGroups = [ 'sites', 'editor' ];
	const title = getTitle( state );
	const unreadCount = getUnreadCount( state );
	const site = getSelectedSite( state );

	const titleParts = [];

	if ( unreadCount ) {
		titleParts.push( '(' + unreadCount + ')' );
	}

	// Display site name as title part only if we're in 'My Sites'
	if ( includes( siteSpecificGroups, getSectionGroup( state ) ) && site ) {
		titleParts.push( title + ' \u2039 ' + site.title );
	} else {
		titleParts.push( title );
	}

	const leftTitlePart = titleParts.join( ' ' );
	return [ decodeEntities( leftTitlePart ), 'WordPress.com' ].join( ' — ' );
}
