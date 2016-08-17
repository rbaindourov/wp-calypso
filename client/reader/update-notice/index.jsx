/**
 * External Dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	noop = require( 'lodash/noop' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DocumentHead = require( 'components/data/document-head' ),
	Gridicon = require( 'components/gridicon' );

var UpdateNotice = React.createClass( {
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
		var counterClasses = classnames( {
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

module.exports = UpdateNotice;
