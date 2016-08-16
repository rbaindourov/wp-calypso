import React, { Component, PropTypes } from 'react';
import {
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	convertToRaw
} from 'draft-js';
import {
	get
} from 'lodash';

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

const Token = props => {
	const style = {
		borderRadius: '3px',
		backgroundColor: '#08c',
		marginLeft: '1px',
		marginRight: '1px',
		padding: '2px',
		color: '#fff'
	};

	return (
		<span style={ style }>{ props.children }</span>
	);
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createEmpty( new CompositeDecorator( [
				{
					strategy: this.renderTokens,
					component: Token
				}
			] ) )
		};

		this.storeEditorReference = r => (this.editor = r);
		this.focusEditor = () => this.editor.focus();

		this.onChange = this.onChange.bind( this );
		this.addToken = this.addToken.bind( this );
		this.renderTokens = this.renderTokens.bind( this );
	}

	onChange( editorState ) {
		const { editorState: oldState } = this.state;

		const oldBlockCount = convertToRaw( oldState.getCurrentContent() ).blocks.length;
		const newBlockCount = convertToRaw( editorState.getCurrentContent() ).blocks.length;

		if ( newBlockCount > oldBlockCount ) {
			return;
		}

		this.setState(
			{ editorState },
			() => {
				editorState.lastChangeType === 'add-token' && this.focusEditor();
				console.log( convertToRaw( editorState.getCurrentContent() ) );
			}
		);
	}

	addToken( name ) {
		return () => {
			const { editorState } = this.state;
			const currentSelection = editorState.getSelection();

			const tokenEntity = Entity.create( 'TOKEN', 'IMMUTABLE', { name } );

			const contentState = Modifier.replaceText(
				editorState.getCurrentContent(),
				currentSelection,
				name,
				null,
				tokenEntity
			);

			this.onChange( EditorState.push(
				editorState,
				contentState,
				'add-token'
			) );
		};
	}

	renderTokens( contentBlock, callback ) {
		contentBlock.findEntityRanges(
			character => {
				const entity = character.getEntity();

				if ( null === entity ) {
					return false;
				}

				return 'TOKEN' === Entity.get( entity ).getType();
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
					ref={ this.storeEditorReference }
				/>
			</div>
		);
	}
}

export default TitleFormatEditor;
