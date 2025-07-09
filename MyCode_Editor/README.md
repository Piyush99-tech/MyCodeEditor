# 🚀 Real-time Collaborative Code Editor

A modern, real-time collaborative code editor that allows multiple users to code together seamlessly. Built with React, Socket.IO, and CodeMirror for an exceptional coding experience.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously with live synchronization
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

### Backend
- **Node.js** - Runtime environment
- **Socket.IO** - Real-time communication server
- **Express** - Web application framework

### Code Editor Features
- **Language Extensions**: JavaScript, C++, Java support
- **Syntax Highlighting**: Custom color scheme for better readability
- **Auto-completion**: Intelligent code suggestions
- **Line Numbers**: Built-in line numbering
- **Bracket Matching**: Automatic bracket pairing and highlighting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/realtime-code-editor.git
   cd realtime-code-editor
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   ```

3. **Start the development servers**
   
   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm start
   ```
   
   **Terminal 2 - Start the client:**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Create a room or join an existing one
   - Start coding collaboratively!

## 📁 Project Structure

```
realtime-code-editor/
├── src/
│   ├── components/
│   │   ├── Client.jsx          # User avatar component
│   │   ├── Editor.jsx          # CodeMirror editor wrapper
│   │   └── ...
│   ├── pages/
│   │   ├── EditorPage.jsx      # Main editor page
│   │   ├── Home.jsx            # Landing page
│   │   └── ...
│   ├── socket.js               # Socket.IO client configuration
│   ├── Actions.js              # Socket event constants
│   └── App.js                  # Main app component
├── server/
│   ├── index.js                # Express server with Socket.IO
│   └── ...
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

### Supported Languages
- **JavaScript** - Full ES6+ syntax support
- **C++** - Modern C++ syntax highlighting
- **Java** - Complete Java language support

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

3. Add starter code template:
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

## 📧 Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/realtime-code-editor

---

⭐ Don't forget to star this repository if you found it helpful!
