import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { HighlightStyle } from "@codemirror/language";
import ACTIONS from "../Actions";

// 🧠 Custom Theme
const myDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e1e",
      color: "#ffffff",
      fontSize: "20px",
      fontFamily: "Fira Code, monospace",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#0e9",
      padding: "16px",
      lineHeight: "1.6",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#0e9",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#074",
    },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      color: "#555",
      border: "none",
    },
  },
  { dark: true }
);

// 🎨 Syntax Highlighting
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c678dd", fontWeight: "bold" },
  { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
  { tag: tags.string, color: "#98c379" },
  { tag: tags.variableName, color: "#e06c75" },
  { tag: tags.function(tags.variableName), color: "#61afef" },
  { tag: tags.typeName, color: "#e5c07b" },
  { tag: tags.className, color: "#e5c07b" },
  { tag: tags.number, color: "#d19a66" },
]);

// 🧩 Language Resolver
const getLanguageExtension = (language) => {
  switch (language) {
    case "javascript":
      return javascript();
    case "cpp":
      return cpp();
    case "java":
      return java();
    default:
      return javascript();
  }
};

// Get starter code for each language
const getStarterCode = (language) => {
  switch (language) {
    case "javascript":
      return `// JavaScript - Start coding here...
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));`;

    case "cpp":
      return `// C++ - Start coding here...
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

    case "java":
      return `// Java - Start coding here...
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;

    default:
      return "// Start coding here...";
  }
};

const Editor = forwardRef(({
  language = "javascript",
  onCodeChange,
  socketRef,
  roomId,
}, ref) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false); // Flag to prevent infinite loops
  const currentLanguage = useRef(language);
  const currentCode = useRef(getStarterCode(language)); // Store current code

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentCode: () => {
      if (viewRef.current) {
        return viewRef.current.state.doc.toString();
      }
      return currentCode.current;
    },
    focus: () => {
      if (viewRef.current) {
        viewRef.current.focus();
      }
    }
  }));

  // Function to update editor content
  const updateEditorContent = (newCode) => {
    if (viewRef.current) {
      isRemoteChange.current = true;

      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newCode,
        },
      });

      viewRef.current.dispatch(transaction);
      currentCode.current = newCode; // Update stored code

      setTimeout(() => {
        isRemoteChange.current = false;
      }, 100);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Check if language changed
    const languageChanged = currentLanguage.current !== language;
    
    // Preserve current code if editor exists and language hasn't changed
    let codeToUse;
    if (viewRef.current && !languageChanged) {
      codeToUse = viewRef.current.state.doc.toString();
    } else if (languageChanged) {
      codeToUse = getStarterCode(language);
      currentCode.current = codeToUse;
    } else {
      codeToUse = currentCode.current;
    }

    currentLanguage.current = language;

    // Destroy existing editor if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: codeToUse, // Use preserved code instead of always using starter code
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        myDarkTheme,
        syntaxHighlighting(myHighlightStyle),
        // Add change listener for collaboration
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isRemoteChange.current) {
            const code = update.state.doc.toString();
            currentCode.current = code; // Update stored code

            // Call the onCodeChange callback if provided
            if (onCodeChange) {
              onCodeChange(code);
            }

            // Emit code change to other clients via socket
            if (socketRef?.current && roomId) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
            } else {
              console.log("Cannot emit - missing socket or roomId:", {
                hasSocket: !!socketRef?.current,
                socketConnected: socketRef?.current?.connected,
                roomId,
              });
            }
          } else {
            if (isRemoteChange.current) {
              console.log("Skipping emit - this is a remote change");
            }
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    // If language changed, emit the new starter code but only if this is not a remote change
    if (
      languageChanged &&
      !isRemoteChange.current &&
      socketRef?.current &&
      roomId
    ) {
      console.log("Language changed, emitting new starter code:", {
        language,
        initialCode: codeToUse,
      });

      // Update the parent's code reference
      if (onCodeChange) {
        onCodeChange(codeToUse);
      }

      // Emit the starter code change
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: codeToUse,
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [language, onCodeChange, socketRef, roomId]);

  // Socket listener for receiving code changes from other clients
  useEffect(() => {
    if (socketRef?.current && roomId) {
      const handleCodeChange = (data) => {
        // Handle both object and direct code scenarios
        let code;
        if (typeof data === "object" && data !== null) {
          code = data.code;
        } else {
          code = data;
        }

        if (code !== null && code !== undefined && viewRef.current) {
          const currentEditorCode = viewRef.current.state.doc.toString();

          // Only update if the code is different to avoid unnecessary updates
          if (currentEditorCode !== code) {
            updateEditorContent(code);
          }
        } else {
          console.log("Invalid code or no editor:", {
            code,
            hasEditor: !!viewRef.current,
          });
        }
      };

      // IMPORTANT: Remove ALL existing listeners first to prevent duplicates
      socketRef.current.off(ACTIONS.CODE_CHANGE);

      // Add the new listener
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        }
      };
    } else {
      console.log("Cannot set up socket listener:", {
        hasSocket: !!socketRef?.current,
        roomId,
        socketConnected: socketRef?.current?.connected,
      });
    }
  }, [socketRef.current, roomId]);

  return <div ref={editorRef} />;
});


Editor.displayName = "Editor";

export default Editor;

