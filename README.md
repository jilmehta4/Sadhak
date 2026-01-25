# Sadhak - Multilingual Semantic Search Engine

A powerful multilingual semantic search engine with AI chat capabilities, supporting English and Hindi content. Built with Node.js, Express, Flutter, and modern web technologies.

## 🌟 Features

- **Semantic Search**: Search through PDFs and images using advanced embeddings
- **Multilingual Support**: Full support for English and Hindi (हिंदी)
- **AI Chat**: Conversational AI with RAG (Retrieval Augmented Generation)
- **OCR Processing**: Extract text from images automatically
- **Cross-Platform**: Web, iOS, and Android applications
- **Google OAuth**: Secure user authentication
- **Chat History**: Save and resume conversations

## 📁 Project Structure

This is a monorepo containing all components of the Sadhak application:

```
Sadhak/
├── backend/           # Node.js API server
├── frontend/          # Web application
├── mobile/            # Flutter mobile app
├── database/          # PDF and image resources
├── deployment/        # Deployment configurations
└── docs/              # Documentation
```

### Components

- **[Backend](./backend/README.md)**: Express.js API server with vector database
- **[Frontend](./frontend/README.md)**: Web interface with search and chat modes
- **[Mobile](./mobile/README.md)**: Flutter app for iOS and Android
- **[Database](./database/README.md)**: Resource files and ingestion instructions
- **[Deployment](./deployment/README.md)**: AWS EC2 deployment guides

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
npm run ingest    # Process resources
npm start         # Start server on port 3000
```

### Frontend

```bash
cd frontend
python -m http.server 8000
# Open http://localhost:8000
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## 📋 Prerequisites

- **Backend**: Node.js 18.x or higher
- **Frontend**: Any modern web browser
- **Mobile**: Flutter SDK 3.0 or higher
- **Optional**: Ollama for AI chat functionality

## 🔧 Configuration

### Backend Environment

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

### Frontend API Configuration

Edit `frontend/app.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### Mobile API Configuration

Edit `mobile/lib/config/api_config.dart`:

```dart
static const String baseUrl = 'http://localhost:3000';
```

## 📚 Adding Content

1. Place PDF files or images in `database/resources/English/` or `database/resources/हिंदी/`
2. Run ingestion from backend:
   ```bash
   cd backend
   npm run ingest
   ```

## 🌐 Deployment

### Backend (AWS EC2)

See [deployment/AWS_DEPLOYMENT.md](./deployment/AWS_DEPLOYMENT.md) for detailed instructions.

Quick steps:
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js and PM2
3. Clone repository
4. Configure environment variables
5. Run with PM2

### Frontend

Deploy to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Mobile

- **Android**: Build APK or App Bundle for Google Play Store
- **iOS**: Build and submit to App Store

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

Use Live Server in VS Code or any local HTTP server.

### Mobile Development

```bash
cd mobile
flutter run
# Hot reload: Press 'r' in terminal
# Hot restart: Press 'R' in terminal
```

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Mobile

```bash
cd mobile
flutter test
```

## 📖 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Mobile App Documentation](./mobile/README.md)
- [Database & Resources](./database/README.md)
- [Deployment Guide](./deployment/README.md)
- [Flutter Setup Guide](./docs/FLUTTER_SETUP_GUIDE.md)
- [Mobile App Project Plan](./docs/PROJECT_PLAN_MOBILE_APP.md)

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (sql.js)
- **Vector Store**: Custom implementation
- **Embeddings**: Xenova/transformers
- **OCR**: Tesseract.js
- **AI**: Ollama integration

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript**: Vanilla JS (no framework)
- **Authentication**: Google OAuth 2.0

### Mobile Stack
- **Framework**: Flutter
- **Language**: Dart
- **State Management**: Provider/Riverpod
- **HTTP**: Dio
- **Authentication**: Google Sign-In

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check the component-specific README files
2. Review the documentation in `docs/`
3. Check backend logs: `cd backend && npm start`
4. For deployment issues, see `deployment/AWS_DEPLOYMENT.md`

## 🎯 Roadmap

- [ ] Offline support for mobile app
- [ ] More language support (Sanskrit, etc.)
- [ ] Voice search
- [ ] Advanced analytics
- [ ] Multi-user collaboration
- [ ] Cloud sync for chat history

---

Built with ❤️ for spiritual seekers worldwide
