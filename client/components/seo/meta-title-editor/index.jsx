/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	AtomicBlockUtils,
	CompositeDecorator,
	ContentState,
	Editor,
	EditorState,
	Entity,
	Modifier,
	RichUtils,
	convertToRaw
} from 'draft-js';
import { connect } from 'react-redux';
import {
	difference,
	findKey,
	get,
	identity,
	isString,
	isUndefined,
	map,
	matches,
	noop,
	pick,
	property,
	values as valuesOf
} from 'lodash';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import TokenField from 'components/token-field';
import { getSeoTitleFormats } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';

import { removeBlanks } from './mappings';

const titleTypes = translate => [
	{ value: 'frontPage', label: translate( 'Front Page' ) },
	{ value: 'posts', label: translate( 'Posts' ) },
	{ value: 'pages', label: translate( 'Pages' ) },
	{ value: 'groups', label: translate( 'Tags' ) },
	{ value: 'archives', label: translate( 'Archives' ) }
];

const getValidTokens = translate => ( {
	siteName: translate( 'Site Name' ),
	tagline: translate( 'Tagline' ),
	postTitle: translate( 'Post Title' ),
	pageTitle: translate( 'Page Title' ),
	groupTitle: translate( 'Category/Tag Title' ),
	date: translate( 'Date' )
} );

const tokenMap = {
	frontPage: [ 'siteName', 'tagline' ],
	posts: [ 'siteName', 'tagline', 'postTitle' ],
	pages: [ 'siteName', 'tagline', 'pageTitle' ],
	groups: [ 'siteName', 'tagline', 'groupTitle' ],
	archives: [ 'siteName', 'tagline', 'date' ]
};

const tokenize = translate => value => {
	if ( ! isString( value ) ) {
		return value;
	}

	// find token key from translated label
	// e.g. "Post Title" > postTitle: translate( 'Post Title' )
	//         value          type           translation
	const type = findKey( getValidTokens( translate ), matches( value ) );

	return isUndefined( type )
		? { type: 'string', isBorderless: true, value }
		: { type, value };
};

class Chip extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isHovering: false
		};

		this.setHover = isHovering => this.setState( { isHovering } );
		this.hoverOn = this.setHover.bind( this, true );
		this.hoverOff = this.setHover.bind( this, false );
	}

	render() {
		const { entityKey } = this.props;
		const { isHovering } = this.state;

		const instance = Entity.get( entityKey );
		const { type } = instance.getData();

		const baseStyle = {
			color: '#c00',
			fontSize: '18px'
		};

		const style = {
			...baseStyle,
			...(isHovering ? { backgroundColor: '#08c' } : {} )
		};

		return (
			<span
				contentEditable={ false }
				style={ style }
				onMouseEnter={ this.hoverOn }
				onMouseLeave={ this.hoverOff }
			>
				{ type }
			</span>
		);
	}
}

function getEntityStrategy(mutability) {
	return function(contentBlock, callback) {
		contentBlock.findEntityRanges(
			(character) => {
				const entityKey = character.getEntity();
				if (entityKey === null) {
					return false;
				}
				return Entity.get(entityKey).getMutability() === mutability;
			},
			callback
		);
	};
}

const decorator = new CompositeDecorator( [ {
	strategy: getEntityStrategy( 'IMMUTABLE' ),
	component: Chip
} ] );

export class MetaTitleEditor extends Component {
	constructor( props ) {
		super( props );

		const { titleFormats } = props;

		this.state = {
			editorState: ContentState.createFromText(''),
			titleFormats,
			type: 'frontPage'
		};

		this.switchType = this.switchType.bind( this );
		this.updateTitleFormat = this.updateTitleFormat.bind( this );

		this.updateEditor = editorState => this.setState( {
			editorState: EditorState.set( editorState, { decorator } )
		} );

		this.addChip = this.addChip.bind( this );
	}

	addChip( type ) {
		return function() {
			const entityKey = Entity.create( 'chip', 'IMMUTABLE', { type } );

			const { editorState } = this.state;

			const currentContent = editorState.getCurrentContent();
			const selection = editorState.getSelection();

			const chip = Modifier.insertText(
				currentContent,
				selection,
				' ',
				null,
				entityKey
			);

			this.setState( {
				editorState: EditorState.moveFocusToEnd( EditorState.push(
					editorState,
					chip,
					'insert-text'
				) )
			} );
		}.bind( this );
	}

	componentWillUpdate( nextProps ) {
		const { siteId: prevSiteId } = this.props;
		const { siteId: nextSiteId, titleFormats } = nextProps;

		if ( nextSiteId !== prevSiteId ) {
			// Clear all local changes when switching
			// sites to get the new site's data
			this.setState( { titleFormats } );
		}
	}

	switchType( { value: type } ) {
		this.setState( { type } );
	}

	updateTitleFormat( values ) {
		const { onChange, translate } = this.props;
		const { type } = this.state;

		const tokens = removeBlanks( map( values, tokenize( translate ) ) );

		this.setState( { titleFormats: {
			...this.state.titleFormats,
			[ type ]: tokens
		} }, () => onChange( this.state.titleFormats ) );
	}

	render() {
		const { disabled, translate } = this.props;
		const { editorState, type, titleFormats } = this.state;

		const validTokens = getValidTokens( translate );

		const values = map(
			get( titleFormats, type, [] ),
			token => 'string' !== token.type
				? { ...token, value: validTokens[ token.type ] } // use translations of token names
				: { ...token, isBorderless: true }               // and remove the styling on plain text
		);

		const suggestions = difference(
			valuesOf( pick( validTokens, tokenMap[ type ] ) ), // grab list of translated tokens for this type
			map( values, property( 'value' ) )                 // but remove tokens already in use in the format
		);

		return (
			<div className="meta-title-editor">
				<div style={ { border: '1px solid red', margin: '10px', padding: '10px' } }>
					<div>
						<span onClick={ this.addChip( 'siteName' ) } style={ { background: 'lightblue', marginRight: '10px' } }>Site Name</span>
						<span onClick={ this.addChip( 'tagline' ) } style={ { background: 'lightblue', marginRight: '10px' } }>Tagline</span>
					</div>
					<Editor { ...{
						editorState,
						onChange: this.updateEditor
					} } />
				</div>
				<SegmentedControl
					initialSelected={ type }
					options={ titleTypes( translate ) }
					onSelect={ this.switchType }
				/>
				<TokenField
					disabled={ disabled }
					onChange={ this.updateTitleFormat }
					saveTransform={ identity } // don't trim whitespace
					suggestions={ suggestions }
					value={ values }
				/>
			</div>
		);
	}
}

MetaTitleEditor.propTypes = {
	disabled: PropTypes.bool,
	onChange: PropTypes.func
};

MetaTitleEditor.defaultProps = {
	disabled: false,
	onChange: noop,
	translate: identity
};

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
	titleFormats: getSeoTitleFormats( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( MetaTitleEditor ) );
