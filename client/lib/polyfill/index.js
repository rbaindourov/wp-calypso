/**
 * Internal dependencies
 */
import localStoragePolyfill from 'lib/local-storage';

export default ( () => {
	if ( 'undefined' === typeof window ) {
		return;
	}

	localStoragePolyfill( window );
} )();
