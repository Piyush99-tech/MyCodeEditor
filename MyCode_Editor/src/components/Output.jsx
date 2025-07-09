import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { executeCode } from "../api";
import ACTIONS from "../Actions";

const Output = ({ getCurrentCode, language, onRunCode, socketRef, roomId, currentUser }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executedBy, setExecutedBy] = useState(null); // Track who executed the code

  // Listen for code execution results from other users
  useEffect(() => {
    if (socketRef?.current && roomId) {
      const handleCodeOutput = ({ result, isError, executedBy, timestamp }) => {
        console.log('Received code output from:', executedBy);
        
        // Update the output state with the received result
        if (result.stderr) {
          setIsError(true);
          setOutput(result.stderr.split("\n"));
        } else {
          setIsError(false);
          setOutput(result.stdout ? result.stdout.split("\n") : ["No output"]);
        }
        
        setExecutedBy(executedBy);
        
        // Show toast notification if someone else executed the code
        if (executedBy !== currentUser) {
          toast.success(`Code executed by ${executedBy}`);
        }
      };

      // Remove existing listener to prevent duplicates
      socketRef.current.off(ACTIONS.CODE_OUTPUT);
      
      // Add new listener
      socketRef.current.on(ACTIONS.CODE_OUTPUT, handleCodeOutput);

      // Cleanup
      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_OUTPUT, handleCodeOutput);
        }
      };
    }
  }, [socketRef.current, roomId, currentUser]);

  const runCode = async () => {
    // Get the current code from the editor
    const code = getCurrentCode();

    if (!code || !code.trim()) {
      toast.error("Please write some code to execute");
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log('Executing code:', code);
      console.log('Language:', language);
      
      const { run: result } = await executeCode(language, code);
      
      // Determine if there's an error
      const hasError = !!result.stderr;
      
      // Broadcast the execution result to all users in the room
      if (socketRef?.current && roomId) {
        socketRef.current.emit(ACTIONS.CODE_EXECUTION, {
          roomId,
          result,
          isError: hasError,
          executedBy: currentUser
        });
      }
      
      // Call parent callback if provided
      if (onRunCode) {
        onRunCode({ result, isError: hasError });
      }
      
    } catch (error) {
      console.error("Execution error:", error);
      const errorResult = {
        stderr: error.message || "Failed to execute code",
        stdout: ""
      };
      
      // Broadcast error result to all users
      if (socketRef?.current && roomId) {
        socketRef.current.emit(ACTIONS.CODE_EXECUTION, {
          roomId,
          result: errorResult,
          isError: true,
          executedBy: currentUser
        });
      }
      
      toast.error("An error occurred while executing the code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Output</h3>
            {executedBy && (
              <p className="text-sm text-gray-400">
                {executedBy === currentUser ? "Executed by you" : `Executed by ${executedBy}`}
              </p>
            )}
          </div>
          <button
            onClick={runCode}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {isLoading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Output Display */}
      <div className="flex-1 p-4 bg-gray-900 text-white overflow-auto">
        <div
          className={`font-mono text-sm h-full border rounded-md p-3 ${
            isError
              ? "border-red-500 bg-red-900/20"
              : "border-gray-600 bg-gray-800/50"
          }`}
        >
          {output ? (
            <div className={isError ? "text-red-400" : "text-green-400"}>
              {output.map((line, index) => (
                <div key={index} className="mb-1">
                  {line || "\u00A0"} {/* Non-breaking space for empty lines */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Click "Run Code" to see the output here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Output;
