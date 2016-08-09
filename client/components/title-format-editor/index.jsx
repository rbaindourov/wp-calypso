import React, { Component, PropTypes } from 'react';
import {
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

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createEmpty()
		};

		this.onChange = editorState => this.setState( { editorState }, console.log( convertToRaw( this.state.editorState.getCurrentContent() ) ) );

		this.addEntity = this.addEntity.bind( this );
	}

	addEntity() {
		const { editorState } = this.state;

		const atomizer = Entity.create( 'ATOM', 'IMMUTABLE' );

		this.onChange( EditorState.push(
			editorState,
			Modifier.applyEntity(
				editorState.getCurrentContent(),
				editorState.getSelection(),
				atomizer
			),
			'apply-entity'
		) );
	}

	render() {
		const { editorState } = this.state;

		return (
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					<span style={ buttonStyle } onClick={ this.addEntity }>Entity</span>
				</div>
				<Editor
					editorState={ editorState }
					onChange={ this.onChange }
					placeholder="Enter your site title here…"
				/>
			</div>
		);
	}
}

export default TitleFormatEditor;
