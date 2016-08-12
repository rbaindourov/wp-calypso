import React, { Component, PropTypes } from 'react';
import {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	convertToRaw
} from 'draft-js';

const buttonStyle = {
	padding: '3px',
	margin: '3px',
	marginRight: '5px',
	backgroundColor: '#ebebeb',
	borderRadius: '3px',
	fontWeight: 'bold'
};

const editorStyle = {
	margin: '12px',
	padding: '8px',
	border: '1px solid black',
	borderRadius: '3px'
};

const getWordAt = ( string, position ) => {
	// Perform type conversions.
	const str = String( string );
	const pos = Number( position ) >>> 0;

	// Search for the word's beginning and end.
	const left = str.slice( 0, pos + 1 ).search( /\S+$/ );
	const right = str.slice( pos ).search( /\s/ );

	// The last word in the string is a special case.
	if ( right < 0 ) {
		return {
			word: str.slice( left ),
			begin: left,
			end: str.length,
		};
	}

	// Return the word, using the located bounds to extract it from the string.
	return {
		word: str.slice( left, right + pos ),
		begin: left,
		end: right + pos,
	};
};

const getSearchText = ( editorState, selection ) => {
	const anchorKey = selection.getAnchorKey();
	const anchorOffset = selection.getAnchorOffset() - 1;
	const currentContent = editorState.getCurrentContent();
	const currentBlock = currentContent.getBlockForKey( anchorKey );
	const blockText = currentBlock.getText();
	return getWordAt( blockText, anchorOffset );
};

const Token = props => {
	console.log( props );
	const { name } = Entity.get( props.entityKey ).data;

	const style = {
		borderRadius: '3px',
		backgroundColor: '#08c',
		padding: '2px',
		color: '#fff'
	};

	return (
		<span style={ style }>{ name } x</span>
	);
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createEmpty( new CompositeDecorator( [ {
				strategy: this.tokenStrategy,
				component: Token
			} ] ) )
		};

		this.onChange = this.onChange.bind( this );
		this.addToken = this.addToken.bind( this );
		this.tokenStrategy = this.tokenStrategy.bind( this );
	}

	onChange( editorState ) {
		this.setState(
			{ editorState },
			() => {
				console.log( convertToRaw( this.state.editorState.getCurrentContent() ) );
				console.log( this.state.editorState.toJS() );
			}
		);
	}

	addToken( name ) {
		return () => {
			const { editorState } = this.state;
			const currentSelectionState = editorState.getSelection();
			const { begin, end } = getSearchText( editorState, currentSelectionState );

			// Get the selection of the :emoji: search text
			const emojiTextSelection = currentSelectionState.merge( {
				anchorOffset: begin,
				focusOffset: end,
			} );

			const entityKey = Entity.create( 'token', 'IMMUTABLE', { name } );

			let emojiReplacedContent = Modifier.replaceText(
				editorState.getCurrentContent(),
				emojiTextSelection,
				'',
				null,
				entityKey
			);

			// If the emoji is inserted at the end, a space is appended right after for
			// a smooth writing experience.
			const blockKey = emojiTextSelection.getAnchorKey();
			const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
			if ( blockSize === end ) {
				emojiReplacedContent = Modifier.insertText(
					emojiReplacedContent,
					emojiReplacedContent.getSelectionAfter(),
					'',
				);
			}

			const newEditorState = EditorState.push(
				editorState,
				emojiReplacedContent,
				'insert-token',
			);
			return this.onChange( EditorState.forceSelection(
				newEditorState,
				emojiReplacedContent.getSelectionAfter()
			) );
		};
	}

	tokenStrategy( contentBlock, callback ) {
		contentBlock.findEntityRanges(
			charMeta => {
				const entity = charMeta.getEntity();

				return entity && 'token' === Entity.get( entity ).type;
			},
			callback
		);
	}

	render() {
		const { editorState } = this.state;

		return (
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					<span style={ buttonStyle } onClick={ this.addToken( 'Site Name' ) }>Site Name</span>
					<span style={ buttonStyle } onClick={ this.addToken( 'Tagline' ) }>Tagline</span>
				</div>
				<Editor
					editorState={ editorState }
					onChange={ this.onChange }
				/>
			</div>
		);
	}
}

export default TitleFormatEditor;
