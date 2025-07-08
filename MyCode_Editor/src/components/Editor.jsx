// import React, { useEffect, useRef } from "react";
// import { EditorState } from "@codemirror/state";
// import { EditorView, basicSetup } from "codemirror";
// import { javascript } from "@codemirror/lang-javascript";
// import { cpp } from "@codemirror/lang-cpp";
// import { java } from "@codemirror/lang-java";
// import { syntaxHighlighting } from "@codemirror/language";
// import { tags } from "@lezer/highlight";
// import { HighlightStyle } from "@codemirror/language";
// import ACTIONS from "../Actions";

// // 🧠 Custom Theme
// const myDarkTheme = EditorView.theme(
//   {
//     "&": {
//       backgroundColor: "#1e1e1e",
//       color: "#ffffff",
//       fontSize: "20px",
//       fontFamily: "Fira Code, monospace",
//       height: "100%",
//     },
//     ".cm-content": {
//       caretColor: "#0e9",
//       padding: "16px",
//       lineHeight: "1.6",
//     },
//     "&.cm-focused .cm-cursor": {
//       borderLeftColor: "#0e9",
//     },
//     "&.cm-focused .cm-selectionBackground, ::selection": {
//       backgroundColor: "#074",
//     },
//     ".cm-gutters": {
//       backgroundColor: "#1e1e1e",
//       color: "#555",
//       border: "none",
//     },
//   },
//   { dark: true }
// );

// // 🎨 Syntax Highlighting
// const myHighlightStyle = HighlightStyle.define([
//   { tag: tags.keyword, color: "#c678dd", fontWeight: "bold" },
//   { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
//   { tag: tags.string, color: "#98c379" },
//   { tag: tags.variableName, color: "#e06c75" },
//   { tag: tags.function(tags.variableName), color: "#61afef" },
//   { tag: tags.typeName, color: "#e5c07b" },
//   { tag: tags.className, color: "#e5c07b" },
//   { tag: tags.number, color: "#d19a66" },
// ]);

// // 🧩 Language Resolver
// const getLanguageExtension = (language) => {
//   switch (language) {
//     case 'javascript':
//       return javascript();
//     case 'cpp':
//       return cpp();
//     case 'java':
//       return java();
//     default:
//       return javascript();
//   }
// };

// // Get starter code for each language
// const getStarterCode = (language) => {
//   switch (language) {
//     case 'javascript':
//       return `// JavaScript - Start coding here...
// function greet(name) {
//     return \`Hello, \${name}!\`;
// }

// console.log(greet('World'));`;
    
//     case 'cpp':
//       return `// C++ - Start coding here...
// #include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// }`;
    
//     case 'java':
//       return `// Java - Start coding here...
// public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// }`;
    
//     default:
//       return '// Start coding here...';
//   }
// };

// const Editor = ({ language = "javascript", onCodeChange, socketRef, roomId }) => {
//   const editorRef = useRef(null);
//   const viewRef = useRef(null);
//   const isRemoteChange = useRef(false); // Flag to prevent infinite loops

//   useEffect(() => {
//     if (!editorRef.current) return;

//     // Destroy existing editor if it exists
//     if (viewRef.current) {
//       viewRef.current.destroy();
//     }

//     const state = EditorState.create({
//       doc: getStarterCode(language),
//       extensions: [
//         basicSetup,
//         getLanguageExtension(language),
//         myDarkTheme,
//         syntaxHighlighting(myHighlightStyle),
//         // Add change listener for collaboration
//         EditorView.updateListener.of((update) => {
//           if (update.docChanged && !isRemoteChange.current) {
//             const code = update.state.doc.toString();
//             console.log("Editor content changed:", code);
            
//             // Call the onCodeChange callback if provided
//             if (onCodeChange) {
//               onCodeChange(code);
//             }
            
//             // Emit code change to other clients via socket
//             if (socketRef?.current && roomId) {
//               console.log("Emitting code change to server:", { roomId, code });
//               console.log("Socket connected:", socketRef.current.connected);
              
//               socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//                 roomId,
//                 code,
//               });
              
//               console.log("Code change emitted successfully");
//             } else {
//               console.log("Cannot emit - missing socket or roomId:", { 
//                 hasSocket: !!socketRef?.current, 
//                 socketConnected: socketRef?.current?.connected,
//                 roomId 
//               });
//             }
//           } else {
//             if (isRemoteChange.current) {
//               console.log("Skipping emit - this is a remote change");
//             }
//           }
//         }),
//       ],
//     });

//     viewRef.current = new EditorView({
//       state,
//       parent: editorRef.current,
//     });

//     return () => {
//       if (viewRef.current) {
//         viewRef.current.destroy();
//       }
//     };
//   }, [language, onCodeChange, socketRef, roomId]);

//   // Socket listener for receiving code changes from other clients
//   useEffect(() => {
//     if (socketRef?.current && roomId) {
//       console.log('Setting up socket listener for room:', roomId);
//       console.log('Socket ID:', socketRef.current.id);
//       console.log('Socket connected:', socketRef.current.connected);
      
//       const handleCodeChange = (data) => {
//         console.log('Raw data received from server:', data);
//         console.log('Data type:', typeof data);
        
//         // Handle both object and direct code scenarios
//         let code;
//         if (typeof data === 'object' && data !== null) {
//           code = data.code;
//         } else {
//           code = data;
//         }
        
//         console.log('Processed code:', code);
        
//         if (code !== null && code !== undefined && viewRef.current) {
//           const currentCode = viewRef.current.state.doc.toString();
          
//           // Only update if the code is different to avoid unnecessary updates
//           if (currentCode !== code) {
//             console.log('Updating editor with remote code');
//             isRemoteChange.current = true; // Set flag to prevent emitting back
            
//             // Replace the entire document content
//             const transaction = viewRef.current.state.update({
//               changes: {
//                 from: 0,
//                 to: viewRef.current.state.doc.length,
//                 insert: code,
//               },
//             });
            
//             viewRef.current.dispatch(transaction);
            
//             // Reset flag after a short delay
//             setTimeout(() => {
//               isRemoteChange.current = false;
//             }, 100);
//           } else {
//             console.log('Code is same, skipping update');
//           }
//         } else {
//           console.log('Invalid code or no editor:', { code, hasEditor: !!viewRef.current });
//         }
//       };

//       // IMPORTANT: Remove ALL existing listeners first to prevent duplicates
//       socketRef.current.off(ACTIONS.CODE_CHANGE);
//       socketRef.current.offAny(); // Remove all 'any' listeners
      
//       // Add the new listener
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      
//       console.log('Socket listener set up successfully');

//       return () => {
//         console.log('Cleaning up socket listener');
//         if (socketRef.current) {
//           socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//           socketRef.current.offAny(); // Clean up any listeners
//         }
//       };
//     } else {
//       console.log('Cannot set up socket listener:', { 
//         hasSocket: !!socketRef?.current, 
//         roomId,
//         socketConnected: socketRef?.current?.connected 
//       });
//     }
//   }, [socketRef.current, roomId]);

//   return <div ref={editorRef} />;
// };
// export default Editor





// // 🏠 Analogy: "CodeMirror is like building a smart whiteboard inside your app."
// // editorRef → The wall where you'll mount the whiteboard.

// // EditorView → The whiteboard itself: It appears on the wall and people write on it.

// // EditorState → The current contents and settings of the whiteboard.

// // viewRef → A remote control to access/change what’s written on the whiteboard.





import React, { useEffect, useRef } from "react";
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
    case 'javascript':
      return javascript();
    case 'cpp':
      return cpp();
    case 'java':
      return java();
    default:
      return javascript();
  }
};

// Get starter code for each language
const getStarterCode = (language) => {
  switch (language) {
    case 'javascript':
      return `// JavaScript - Start coding here...
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));`;
    
    case 'cpp':
      return `// C++ - Start coding here...
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
    
    case 'java':
      return `// Java - Start coding here...
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
    
    default:
      return '// Start coding here...';
  }
};

const Editor = ({ language = "javascript", onCodeChange, socketRef, roomId }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false); // Flag to prevent infinite loops
  const currentLanguage = useRef(language);

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
      
      setTimeout(() => {
        isRemoteChange.current = false;
      }, 100);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Check if language changed
    const languageChanged = currentLanguage.current !== language;
    currentLanguage.current = language;

    // Destroy existing editor if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const initialCode = getStarterCode(language);
    
    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        myDarkTheme,
        syntaxHighlighting(myHighlightStyle),
        // Add change listener for collaboration
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isRemoteChange.current) {
            const code = update.state.doc.toString();
           // console.log("Editor content changed:", code);
            
            // Call the onCodeChange callback if provided
            if (onCodeChange) {
              onCodeChange(code);
            }
            
            // Emit code change to other clients via socket
            if (socketRef?.current && roomId) {
              //console.log("Emitting code change to server:", { roomId, code });
              //console.log("Socket connected:", socketRef.current.connected);
              
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
              
             // console.log("Code change emitted successfully");
            } else {
              console.log("Cannot emit - missing socket or roomId:", { 
                hasSocket: !!socketRef?.current, 
                socketConnected: socketRef?.current?.connected,
                roomId 
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
    if (languageChanged && !isRemoteChange.current && socketRef?.current && roomId) {
      console.log("Language changed, emitting new starter code:", { language, initialCode });
      
      // Update the parent's code reference
      if (onCodeChange) {
        onCodeChange(initialCode);
      }
      
      // Emit the starter code change
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: initialCode,
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
      // console.log('Setting up socket listener for room:', roomId);
      // console.log('Socket ID:', socketRef.current.id);
      // console.log('Socket connected:', socketRef.current.connected);
      
      const handleCodeChange = (data) => {
        // console.log('Raw data received from server:', data);
        // console.log('Data type:', typeof data);
        
        // Handle both object and direct code scenarios
        let code;
        if (typeof data === 'object' && data !== null) {
          code = data.code;
        } else {
          code = data;
        }
        
       // console.log('Processed code:', code);
        
        if (code !== null && code !== undefined && viewRef.current) {
          const currentCode = viewRef.current.state.doc.toString();
          
          // Only update if the code is different to avoid unnecessary updates
          if (currentCode !== code) {
         //   console.log('Updating editor with remote code');
            updateEditorContent(code);
          } else {
            //console.log('Code is same, skipping update');
          }
        } else {
          console.log('Invalid code or no editor:', { code, hasEditor: !!viewRef.current });
        }
      };

      // IMPORTANT: Remove ALL existing listeners first to prevent duplicates
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      
      // Add the new listener
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      
     // console.log('Socket listener set up successfully');

      return () => {
        //console.log('Cleaning up socket listener');
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        }
      };
    } else {
      console.log('Cannot set up socket listener:', { 
        hasSocket: !!socketRef?.current, 
        roomId,
        socketConnected: socketRef?.current?.connected 
      });
    }
  }, [socketRef.current, roomId]);

  return <div ref={editorRef} />;
};

export default Editor;

// 🏠 Analogy: "CodeMirror is like building a smart whiteboard inside your app."
// editorRef → The wall where you'll mount the whiteboard.
// EditorView → The whiteboard itself: It appears on the wall and people write on it.
// EditorState → The current contents and settings of the whiteboard.
// viewRef → A remote control to access/change what's written on the whiteboard.