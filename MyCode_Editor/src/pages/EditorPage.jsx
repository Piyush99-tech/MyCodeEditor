import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import Output from "../components/Output"; // Add this import
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
  const editorRef = useRef(null); // Add ref for editor
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  // Add language state and sidebar toggle
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [outputVisible, setOutputVisible] = useState(false); // Add output panel toggle

  const [clients, setClients] = useState([]);

  // Get current username from location state
  const currentUser = location.state?.username;

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

  // Get current code from editor
  const getCurrentCode = () => {
    if (editorRef.current && editorRef.current.getCurrentCode) {
      return editorRef.current.getCurrentCode();
    }
    return codeRef.current || "";
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

      // 🚀 NEW: Listen for code execution results
      // This is handled inside the Output component, but we can add global handling here if needed
      socketRef.current.on(ACTIONS.CODE_OUTPUT, ({ result, isError, executedBy, timestamp }) => {
        console.log('Code execution result received in EditorPage:', { executedBy, isError });
        // The Output component will handle displaying the result
        // You can add additional logic here if needed (like logging, analytics, etc.)
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      socketRef.current.off(ACTIONS.CODE_OUTPUT); // Clean up new listener
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

  // Toggle output panel visibility
  const toggleOutput = () => {
    setOutputVisible(!outputVisible);
  };

  // Handle code execution
  const handleRunCode = (result) => {
    console.log("Code execution result:", result);
    // You can add more logic here if needed
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          sidebarVisible ? "w-60" : "w-0"
        } overflow-hidden`}
      >
        <div className={`w-60 h-full flex flex-col ${sidebarVisible ? "block" : "hidden"}`}>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-6">
              <img className="w-32" src="/code-sync.png" alt="logo" />
            </div>
            <h3 className="text-lg font-semibold mb-4">Connected</h3>
            <div className="space-y-2">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            <button 
              className="w-full bg-amber-300 text-black border border-gray-300 rounded px-4 py-2 hover:bg-amber-400 transition"
              onClick={copyRoomId}
            >
              Copy ROOM ID
            </button>
            <button 
              className="w-full bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition"
              onClick={LeaveRoom}
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  ) : (
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
            
            <div className="flex items-center space-x-4">
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
              
              {/* Output Toggle Button */}
              <button
                onClick={toggleOutput}
                className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={outputVisible ? "Hide Output" : "Show Output"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Editor and Output Container */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 relative">
            <Editor
              ref={editorRef}
              language={selectedLanguage}
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>

          {/* Output Panel - Sliding from right */}
          <div
            className={`bg-gray-800 border-l border-gray-700 transition-all duration-300 ease-in-out ${
              outputVisible ? "w-96" : "w-0"
            } overflow-hidden`}
          >
            <div className={`w-96 h-full ${outputVisible ? "block" : "hidden"}`}>
              <Output 
                getCurrentCode={getCurrentCode}
                language={selectedLanguage}
                onRunCode={handleRunCode}
                socketRef={socketRef}
                roomId={roomId}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default EditorPage;

