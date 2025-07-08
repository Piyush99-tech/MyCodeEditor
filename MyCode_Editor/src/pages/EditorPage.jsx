// import React, { useState, useRef, useEffect } from "react";
// import toast from "react-hot-toast";
// import ACTIONS from "../Actions";
// import Client from "../components/Client";
// import Editor from "../components/Editor";
// import { initSocket } from "../socket";
// import {
//   useLocation,
//   useNavigate,
//   Navigate,
//   useParams,
// } from "react-router-dom";

// const EditorPage = () => {
//   const socketRef = useRef(null);
//   const codeRef=useRef(null);
//   const location = useLocation();
//   const { roomId } = useParams();
//   const reactNavigator = useNavigate();

//   // Add language state and sidebar toggle
//   const [selectedLanguage, setSelectedLanguage] = useState("javascript");
//   const [sidebarVisible, setSidebarVisible] = useState(true);

//   const [clients, setClients] = useState([]);

//   // Language options
//   const languageOptions = [
//     { value: "javascript", label: "JavaScript" },
//     { value: "cpp", label: "C++" },
//     { value: "java", label: "Java" },
//   ];

//   async function copyRoomId(){
//     try{
//       await navigator.clipboard.writeText(roomId);
//       toast.success('Copied to your clipboard');
//     }
//     catch(error)
//     {
//       toast.error('Could not copy the RoomId');
//       console.log(error);
//     }
//   }

//   function LeaveRoom(){
//      reactNavigator("/");
//   }

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = await initSocket();
//       socketRef.current.on("connect_error", (err) => handleErrors(err));
//       socketRef.current.on("connect_failed", (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.log("socket error", e);
//         toast.error("Socket connection failed, try again later.");
//         reactNavigator("/");
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       // Listening for joined event  some other person joined our room
//       socketRef.current.on(
//         ACTIONS.JOINED,
//         ({ clients, username, socketId }) => {
//           if (username !== location.state?.username) {
//             toast.success(`${username} joined the room.`);
//             console.log(`${username} joined`);
//           }
//           setClients(clients);
//           socketRef.current.emit(ACTIONS.SYNC_CODE, {
//             code: codeRef.current,
//             socketId,
//           });
//         }
//       );

//       // Listening for disconnected  when someone left
//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast.success(`${username} left the room.`);
//         setClients((prev) => {
//           return prev.filter((client) => client.socketId !== socketId);
//         });
//       });
//     };

//     init();

//     return () => {
//       // 🔌 Step 1: Disconnect the socket connection
//       // This completely closes the WebSocket connection with the server.
//       // It's important to prevent memory leaks and unnecessary background activity.
//       socketRef.current.disconnect();

//       // 🧼 Step 2: Remove the 'JOINED' event listener
//       // This ensures that when this component unmounts, or useEffect re-runs (in some cases),
//       // it doesn't keep listening for old JOINED events and cause duplicate handling.
//       socketRef.current.off(ACTIONS.JOINED);

//       // 🧼 Step 3: Remove the 'DISCONNECTED' event listener
//       // Same as above — removes any lingering listener for DISCONNECTED events
//       // to avoid handling stale or duplicate events after re-renders or navigation.
//       socketRef.current.off(ACTIONS.DISCONNECTED);
//     };
//   }, []);

//   // Handle language change
//   const handleLanguageChange = (e) => {
//     setSelectedLanguage(e.target.value);
//     toast.success(
//       `Switched to ${e.target.options[e.target.selectedIndex].text}`
//     );
//   };

//   // Toggle sidebar visibility
//   const toggleSidebar = () => {
//     setSidebarVisible(!sidebarVisible);
//   };

//   if (!location.state) {
//     return <Navigate to="/" />;
//   }

//   return (
//     <div
//       className={`mainWrap ${!sidebarVisible ? "sidebar-hidden" : ""}`}
//       style={{
//         display: "grid",
//         gridTemplateColumns: sidebarVisible ? "230px 1fr" : "0px 1fr",
//         height: "100vh",
//         transition: "grid-template-columns 0.3s ease-in-out",
//       }}
//     >
//       {/* Sidebar */}
//       <div
//         className={`aside ${sidebarVisible ? "visible" : "hidden"}`}
//         style={{
//           overflow: "hidden",
//           width: sidebarVisible ? "230px" : "0px",
//           transition: "width 0.3s ease-in-out",
//         }}
//       >
//         <div
//           className="asideInner space-y-4 overflow-y-auto"
//           style={{
//             display: sidebarVisible ? "block" : "none",
//           }}
//         >
//           <div className="logo">
//             <img className="logoImage w-32" src="/code-sync.png" alt="logo" />
//           </div>
//           <h3 className="text-lg font-semibold">Connected</h3>
//           <div className="clientsList space-y-2">
//             {clients.map((client) => (
//               <Client key={client.socketId} username={client.username} />
//             ))}
//           </div>
//         </div>

//         <div
//           className="space-y-2 mt-4"
//           style={{
//             display: sidebarVisible ? "block" : "none",
//           }}
//         >
//           <button className="btn w-40% bg-amber-300 text-black border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 transition"
//             onClick={copyRoomId}>
//             Copy ROOM ID
//           </button>
//           <button className="btn leaveBtn w-full bg-green-400 text-white rounded px-4 py-2 hover:bg-green-500 transition"
//             onClick={LeaveRoom}>
//             Leave
//           </button>
//         </div>
//       </div>

//       {/* Editor Section */}
//       <div
//         className="editorWrap"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           overflow: "auto",
//         }}
//       >
//         {/* Language Selector Header */}
//         <div className="bg-gray-800 text-white p-3 border-b border-gray-700">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               {/* Sidebar Toggle Button */}
//               <button
//                 onClick={toggleSidebar}
//                 className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   {sidebarVisible ? (
//                     // Hide sidebar icon (arrow left)
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
//                     />
//                   ) : (
//                     // Show sidebar icon (arrow right)
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 5l7 7-7 7M5 5l7 7-7 7"
//                     />
//                   )}
//                 </svg>
//               </button>
//               <h2 className="text-lg font-semibold">Code Editor</h2>
//             </div>
//             <div className="flex items-center space-x-2">
//               <label htmlFor="language-select" className="text-sm font-medium">
//                 Language:
//               </label>
//               <select
//                 id="language-select"
//                 value={selectedLanguage}
//                 onChange={handleLanguageChange}
//                 className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {languageOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Editor */}
//         <div className="flex-1">
//           <Editor
//             language={selectedLanguage}
//             socketRef={socketRef}
//             roomId={roomId}
//             onCodeChange={(code) => {  // this will run when child component make call back and pass the code to it then we store it into out coderef
//                 codeRef.current = code;
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditorPage;
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  // Add language state and sidebar toggle
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [clients, setClients] = useState([]);

  // Language options
  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
  ];

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

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success('Copied to your clipboard');
    }
    catch(error)
    {
      toast.error('Could not copy the RoomId');
      console.log(error);
    }
  }

  function LeaveRoom(){
     reactNavigator("/");
  }

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event  some other person joined our room
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          
          // Sync both code and language to the new user
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            language: selectedLanguage,
            socketId,
          });
        }
      );

      // Listening for disconnected  when someone left
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      // Listen for language changes from other users
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language, code }) => {
        console.log('Received language change:', { language, code });
        setSelectedLanguage(language);
        codeRef.current = code;
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
    };
  }, []);

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    const newCode = getStarterCode(newLanguage);
    
    setSelectedLanguage(newLanguage);
    codeRef.current = newCode;
    
    // Emit language change to other users
    if (socketRef.current && roomId) {
      socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
        roomId,
        language: newLanguage,
        code: newCode,
      });
    }
    
    toast.success(
      `Switched to ${e.target.options[e.target.selectedIndex].text}`
    );
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div
      className={`mainWrap ${!sidebarVisible ? "sidebar-hidden" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: sidebarVisible ? "230px 1fr" : "0px 1fr",
        height: "100vh",
        transition: "grid-template-columns 0.3s ease-in-out",
      }}
    >
      {/* Sidebar */}
      <div
        className={`aside ${sidebarVisible ? "visible" : "hidden"}`}
        style={{
          overflow: "hidden",
          width: sidebarVisible ? "230px" : "0px",
          transition: "width 0.3s ease-in-out",
        }}
      >
        <div
          className="asideInner space-y-4 overflow-y-auto"
          style={{
            display: sidebarVisible ? "block" : "none",
          }}
        >
          <div className="logo">
            <img className="logoImage w-32" src="/code-sync.png" alt="logo" />
          </div>
          <h3 className="text-lg font-semibold">Connected</h3>
          <div className="clientsList space-y-2">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <div
          className="space-y-2 mt-4"
          style={{
            display: sidebarVisible ? "block" : "none",
          }}
        >
          <button className="btn w-40% bg-amber-300 text-black border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 transition"
            onClick={copyRoomId}>
            Copy ROOM ID
          </button>
          <button className="btn leaveBtn w-full bg-green-400 text-white rounded px-4 py-2 hover:bg-green-500 transition"
            onClick={LeaveRoom}>
            Leave
          </button>
        </div>
      </div>

      {/* Editor Section */}
      <div
        className="editorWrap"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Language Selector Header */}
        <div className="bg-gray-800 text-white p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarVisible ? (
                    // Hide sidebar icon (arrow left)
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  ) : (
                    // Show sidebar icon (arrow right)
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  )}
                </svg>
              </button>
              <h2 className="text-lg font-semibold">Code Editor</h2>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="language-select" className="text-sm font-medium">
                Language:
              </label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            language={selectedLanguage}
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {  // this will run when child component make call back and pass the code to it then we store it into out coderef
                codeRef.current = code;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

