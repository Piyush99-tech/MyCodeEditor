# 🚀 Real-time Collaborative Code Editor with Code Execution

A modern, real-time collaborative code editor that allows multiple users to code together seamlessly AND execute code in real-time. Built with React, Socket.IO, CodeMirror, and Piston API for an exceptional coding experience with live code execution.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously with live synchronization
- **🔥 Code Execution**: Execute JavaScript, C++, and Java code in real-time using Piston API
- **Live Output Display**: See execution results instantly with proper error handling
- **Multi-language Support**: JavaScript, C++, and Java with syntax highlighting
- **Language Synchronization**: When one user changes language, all participants see the update
- **Live User Presence**: See who's currently in the coding session
- **Room-based Sessions**: Create or join coding rooms with unique IDs
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark theme optimized for long coding sessions
- **Collapsible Sidebar**: Toggle sidebar for more coding space

## 🛠️ Tech Stack

### Frontend
- **React** - User interface framework
- **Socket.IO Client** - Real-time bidirectional communication
- **CodeMirror 6** - Advanced code editor with syntax highlighting
- **React Router** - Navigation and routing
- **React Hot Toast** - Beautiful notifications
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - Runtime environment
- **Socket.IO** - Real-time communication server
- **Express** - Web application framework
- **Piston API** - Code execution engine

### Code Editor Features
- **Language Extensions**: JavaScript, C++, Java support
- **Syntax Highlighting**: Custom color scheme for better readability
- **Auto-completion**: Intelligent code suggestions
- **Line Numbers**: Built-in line numbering
- **Bracket Matching**: Automatic bracket pairing and highlighting
- **Code Execution**: Run code with real-time output display
- **Error Handling**: Proper error display for compilation/runtime errors

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Piyush99-tech/MyCodeEditor.git
   cd MyCodeEditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Create a room or join an existing one
   - Start coding collaboratively and execute code in real-time!

## 📁 Project Structure

```
MyCodeEditor/
├── src/
│   ├── components/
│   │   ├── Client.jsx          # User avatar component
│   │   ├── Editor.jsx          # CodeMirror editor wrapper
│   │   ├── Output.jsx          # Code execution output display
│   │   └── ...
│   ├── pages/
│   │   ├── EditorPage.jsx      # Main editor page
│   │   ├── Home.jsx            # Landing page
│   │   └── ...
│   ├── socket.js               # Socket.IO client configuration
│   ├── Actions.js              # Socket event constants
│   ├── api.js                  # Piston API integration
│   ├── constants.js            # Language configurations
│   └── App.js                  # Main app component
├── server.js                   # Express server with Socket.IO
├── build/                      # Production build files
└── public/
    └── code-sync.png           # App logo
```

## 🔧 Configuration

### Socket Actions
The application uses the following socket events:
- `JOIN` - User joins a room
- `JOINED` - User successfully joined
- `DISCONNECTED` - User left the room
- `CODE_CHANGE` - Real-time code updates
- `LANGUAGE_CHANGE` - Language switch synchronization
- `SYNC_CODE` - Sync code with new users

### Code Execution
- **Piston API Integration**: Secure code execution environment
- **Supported Languages**: 
  - **JavaScript** - Node.js runtime
  - **C++** - GCC compiler
  - **Java** - OpenJDK runtime
- **Real-time Output**: Execution results displayed instantly
- **Error Handling**: Compilation and runtime errors properly formatted

### Language Support
- **JavaScript** - Full ES6+ syntax support with Node.js execution
- **C++** - Modern C++ syntax highlighting with GCC compilation
- **Java** - Complete Java language support with OpenJDK execution

## 🎨 Customization

### Adding New Languages
1. Install the language package:
   ```bash
   npm install @codemirror/lang-python
   ```

2. Add to language resolver in `Editor.jsx`:
   ```javascript
   import { python } from "@codemirror/lang-python";
   
   const getLanguageExtension = (language) => {
     switch (language) {
       case 'python':
         return python();
       // ... other cases
     }
   };
   ```

3. Add to constants.js for execution support:
   ```javascript
   export const LANGUAGE_VERSIONS = {
     python: "3.10.0",
     // ... other languages
   };
   ```

4. Add starter code template:
   ```javascript
   const getStarterCode = (language) => {
     switch (language) {
       case 'python':
         return `# Python - Start coding here...
   def greet(name):
       return f"Hello, {name}!"
   
   print(greet("World"))`;
       // ... other cases
     }
   };
   ```

### Theming
Customize the editor theme in `Editor.jsx`:
```javascript
const myDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#your-color",
    color: "#your-text-color",
    // ... other styles
  }
});
```

## 🚀 Deployment

The application is deployed on Render with automatic deployments from the main branch:
- **Live URL**: https://mycodeeditor.onrender.com
- **Monolithic Architecture**: Single server serving both frontend and backend
- **Static Build**: React app served as static files from Express server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the powerful code editor
- [Socket.IO](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the amazing UI framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Piston API](https://piston.readthedocs.io/) for secure code execution
- [Render](https://render.com/) for reliable hosting

## 📧 Contact

Piyush Kala - piyushkala9@gmail.com
Project Link: https://mycodeeditor.onrender.com
GitHub: https://github.com/Piyush99-tech/MyCodeEditor

---

⭐ Don't forget to star this repository if you found it helpful!

## 🎯 Features in Action

- **Real-time Collaboration**: Multiple users can edit the same code simultaneously
- **Instant Code Execution**: Run JavaScript, C++, and Java code with live output
- **Error Handling**: Proper display of compilation and runtime errors
- **Language Switching**: Switch between languages with starter code templates
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Optimized for long coding sessions
