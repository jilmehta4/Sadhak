# Sadhak Frontend

Web interface for the Sadhak multilingual semantic search engine and AI chat.

## Features

- **Dual Mode Interface**: Search mode and AI chat mode
- **Multilingual Support**: English and Hindi (हिंदी)
- **Google OAuth**: User authentication
- **Responsive Design**: Works on desktop and mobile
- **Chat History**: Saved chat sessions for authenticated users
- **Beautiful UI**: Modern, gradient-based design with animations

## Running Locally

### Option 1: Simple HTTP Server

```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Live Server (VS Code)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Configuration

### API Endpoint

Edit `app.js` to configure the backend API URL:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:3000';

// For production
const API_BASE_URL = 'http://your-ec2-ip';
```

### Google OAuth

Update the Google Client ID in your backend `.env` file and ensure the callback URL matches your deployment.

## Project Structure

```
frontend/
├── index.html          # Main HTML file
├── app.js              # Main application logic
├── style.css           # Main styles
├── auth.js             # Authentication logic
├── auth-modal.css      # Auth modal styles
├── sidebar.js          # Sidebar/chat history
├── sidebar.css         # Sidebar styles
├── footer.css          # Footer styles
└── i18n.js             # Internationalization
```

## Features

### Search Mode

- Enter search queries in English or Hindi
- View results with source information
- Language toggle (English/हिंदी)

### AI Chat Mode

- Ask questions in natural language
- Get AI-powered responses with context from your documents
- View chat history (when logged in)
- Start new chat sessions

### Authentication

- Sign in with Google
- Access chat history
- Persistent sessions

## Customization

### Styling

Edit `style.css` to customize:
- Colors and gradients
- Fonts and typography
- Layout and spacing
- Animations

### Language Support

Edit `i18n.js` to add or modify translations:

```javascript
const translations = {
  en: {
    // English translations
  },
  hi: {
    // Hindi translations
  }
};
```

## Deployment

### Static Hosting

The frontend is a static web application and can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

### With Backend

Make sure to update the `API_BASE_URL` in `app.js` to point to your deployed backend server.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

ISC
