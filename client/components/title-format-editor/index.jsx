import React, { Component, PropTypes } from 'react';
import {
	AtomicBlockUtils,
	Editor,
	EditorState,
	Entity,
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

const Block = props => {
	const { block } = props;
	const { name } = Entity.get( block.getEntityAt( 0 ) ).getData();

	return (
		<span>{ name }</span>
	);
};

const blockRenderer = block => {
	if ( block.getType() === 'atomic' ) {
		return {
			component: Block,
			editable: false
		};
	}

	return null;
};

export class TitleFormatEditor extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			editorState: EditorState.createEmpty()
		};

		this.onChange = this.onChange.bind( this );
		this.addBlock = this.addBlock.bind( this );
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

	addBlock( name ) {
		return () => {
			const { editorState } = this.state;

			const entity = Entity.create( 'TOKEN', 'IMMUTABLE', { name } );

			this.onChange(
				AtomicBlockUtils.insertAtomicBlock(
					editorState,
					entity,
					' '
				)
			);
		};
	}

	render() {
		const { editorState } = this.state;

		return (
			<div style={ editorStyle }>
				<div style={ { marginBottom: '10px' } }>
					<span style={ buttonStyle } onClick={ this.addBlock( 'Site Name' ) }>Site Name</span>
					<span style={ buttonStyle } onClick={ this.addBlock( 'Tagline' ) }>Tagline</span>
				</div>
				<Editor
					blockRendererFn={ blockRenderer }
					editorState={ editorState }
					onChange={ this.onChange }
				/>
			</div>
		);
	}
}

export default TitleFormatEditor;
