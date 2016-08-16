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

const Token = props => {
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
			editorState: EditorState.createEmpty()
		};

		this.onChange = this.onChange.bind( this );
		this.addToken = this.addToken.bind( this );
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
			const currentSelection = editorState.getSelection();

			const tokenEntity = Entity.create( 'TOKEN', 'IMMUTABLE', { name } );

			const contentState = Modifier.replaceText(
				editorState.getCurrentContent(),
				currentSelection,
				' ',
				null,
				tokenEntity
			);

			this.onChange( EditorState.push(
				editorState,
				contentState,
				'replace-characters'
			) );
		};
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
