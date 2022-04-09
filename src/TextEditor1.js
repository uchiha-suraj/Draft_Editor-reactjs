import React, { useRef, useState } from 'react';
import {Editor, EditorState, CompositeDecorator, RichUtils, getDefaultKeyBinding, convertToRaw} from 'draft-js';
import './TextEditor.css';
import '../node_modules/draft-js/dist/Draft.css';

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'blockquote') {
    return 'superFancyBlockquote';
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

const TextEditor1 = () => {

  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );
  const [charlength, setCharlength] = useState(0)

  const editor = useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  function textExceed(values) {
    return <span className="bg-maroon-500 text-white">{values}</span>;
  }

  const onChange = (editState) => {
    const blocks = convertToRaw(editState.getCurrentContent()).blocks;
    let value = blocks
      .map((block) => block.text)
      .join("\n");
    setEditorState(editState);
    setCharlength(value.length);
    console.log("value", value);

    const inputs = [];
    inputs.push(value.slice(500));
    
    inputs.map((input) => {
      console.log("input ==> ", input);
      textExceed(input)
    })
    console.log("value substring", inputs)

  }

  // const onChange = (editorState) => {
  //   const contentState = editorState.getCurrentContent();
  //   if (contentState.getPlainText().length > 1000) {
  //       editorState = EditorState.undo(editorState);
  //   }
  //   setEditorState(editorState);
  //   setCharlength(contentState.getPlainText().length);
  // }

  const handleKeyCommandFunc = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  }

  const mapKeyToEditorCommandFunc = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        editorState,
        4, /* maxDepth */
      );
      if (newEditorState !== editorState) {
        onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }

  const toggleBlockTypeFunc = (blockType) => {
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  }

  const toggleInlineStyleFunc = (inlineStyle) => {
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    );
  }

  let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

  return (
    <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={toggleBlockTypeFunc}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={toggleInlineStyleFunc}
        />
        <div className={className} onClick={focusEditor}>
          {console.log('charlength length', charlength)}
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={handleKeyCommandFunc}
              keyBindingFn={mapKeyToEditorCommandFunc}
              onChange={onChange}
              placeholder="Tell a story..."
              ref={editor}
              spellCheck={true}
            />
          
        </div>
      </div>
  )
}

export default TextEditor1