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

const isFocusedOnAtom = editorState => {
	const selection = editorState.getSelection();
	const blockKey = selection.getFocusKey();
	const focusOffset = selection.getFocusOffset();
	const contentState = editorState.getCurrentContent();
	const block = contentState.getBlockForKey( blockKey );
	const entity = block.getEntityAt( focusOffset );

	return !! entity && 'ATOM' === Entity.get( entity ).type;
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createEmpty()
		};

		this.onChange = this.onChange.bind( this );
		this.addEntity = this.addEntity.bind( this );
	}

	onChange( editorState ) {
		if ( isFocusedOnAtom( editorState ) ) {
			console.log( 'In an atom, aborting!' );
		}

		this.setState(
			{ editorState },
			() => {
				console.log( convertToRaw( this.state.editorState.getCurrentContent() ) );
				console.log( this.state.editorState.toJS() );
			}
		);
	}

	addEntity( name ) {
		return () => {
			const { editorState } = this.state;

			const atomizer = Entity.create( 'ATOM', 'IMMUTABLE', { name } );

			this.onChange( EditorState.push(
				editorState,
				Modifier.applyEntity(
					editorState.getCurrentContent(),
					editorState.getSelection(),
					atomizer
				),
				'apply-entity'
			) );
		};
	}

	render() {
		const { editorState } = this.state;

		return (
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					<span style={ buttonStyle } onClick={ this.addEntity( 'Site Name' ) }>Site Name</span>
					<span style={ buttonStyle } onClick={ this.addEntity( 'Tagline' ) }>Tagline</span>
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
