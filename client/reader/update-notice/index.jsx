/**
 * External Dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Gridicon from 'components/gridicon';

const UpdateNotice = React.createClass( {
	mixins: [ PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { onClick: noop };
	},

	countString: function() {
		return this.props.count >= 40 ? '40+' : ( '' + this.props.count );
	},

	render: function() {
		const counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0
		} );

		return (
			<div className={ counterClasses } onTouchTap={ this.handleClick } >
				<DocumentHead unreadCount={ this.props.count ? this.countString() : '' } />
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.translate( '%s new post', '%s new posts', { args: [ this.countString() ], count: this.props.count } ) }
			</div>
		);
	},

	handleClick: function( event ) {
		event.preventDefault();
		this.props.onClick();
	}
} );

export default UpdateNotice;
