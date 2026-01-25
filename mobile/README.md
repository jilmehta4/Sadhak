# Sadhak Mobile App

A Flutter mobile application for the Sadhak platform, providing spiritual guidance through semantic search and AI chat features.

## Features

- ✅ **Google OAuth Authentication** - Secure login with Google account
- ✅ **Semantic Search** - Search through spiritual resources in English and Hindi
- ✅ **AI Chat** - Chat with AI for spiritual guidance using RAG (Retrieval-Augmented Generation)
- ✅ **Multilingual Support** - Full support for English and Hindi
- ✅ **Session Persistence** - Stay logged in across app restarts
- ✅ **Chat History** - View previous conversations

## Architecture

The mobile app shares the same backend API as the web application:

```
Mobile App (Flutter) → REST API → Backend Server (Node.js)
                                         ↓
                                   Database + Vector Store
```

**API Base URL:**
- Development: `http://10.0.2.2:3000` (Android emulator)
- Production: Configure in `lib/config/api_config.dart`

## Prerequisites

- Flutter SDK 3.10.7 or higher
- Android Studio with Flutter plugin
- Android SDK (for Android development)
- Running Sadhak backend server

## Setup

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Backend URL

The app is pre-configured to connect to `http://10.0.2.2:3000` (Android emulator localhost).

To change the backend URL, edit `lib/config/api_config.dart`:

```dart
static const String devBaseUrl = 'http://your-backend-url:3000';
```

### 3. Start Backend Server

Make sure your Sadhak backend is running:

```bash
cd ../Sadhak
npm start
```

The server should be running on `http://localhost:3000`.

## Running the App

### On Android Emulator

1. Start an Android emulator from Android Studio
2. Run the app:

```bash
flutter run
```

### On Physical Device

1. Enable USB debugging on your Android device
2. Connect device via USB
3. Run the app:

```bash
flutter run
```

## Project Structure

```
lib/
├── config/
│   └── api_config.dart          # API endpoints configuration
├── models/
│   ├── user.dart                # User model
│   ├── search_result.dart       # Search result model
│   └── chat_message.dart        # Chat message model
├── services/
│   ├── api_service.dart         # Base HTTP client
│   ├── auth_service.dart        # Authentication service
│   ├── search_service.dart      # Search service
│   └── chat_service.dart        # Chat service
├── providers/
│   ├── auth_provider.dart       # Authentication state
│   └── language_provider.dart   # Language state
├── screens/
│   ├── login_screen.dart        # Login screen
│   ├── home_screen.dart         # Home with mode selection
│   ├── search_screen.dart       # Search interface
│   └── chat_screen.dart         # Chat interface
└── main.dart                    # App entry point
```

## API Endpoints Used

- `POST /auth/google` - Google OAuth authentication
- `GET /auth/user` - Get current user
- `POST /auth/logout` - Logout
- `POST /search` - Semantic search
- `POST /chat` - Send chat message
- `GET /history` - Get chat history

## Building for Release

### Android APK

```bash
flutter build apk --release
```

The APK will be generated at: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

## Troubleshooting

### Cannot connect to backend

- **Emulator**: Make sure backend is running and accessible at `http://10.0.2.2:3000`
- **Physical Device**: Use your computer's IP address instead of `localhost`
- Check firewall settings

### Google Sign-In not working

- Ensure Google OAuth is properly configured in the backend
- Check that the app's SHA-1 fingerprint is registered in Google Cloud Console

### Images not loading

- Verify backend is serving images correctly
- Check network connectivity
- Ensure image paths in API responses are correct

## Development

### Adding New Features

1. Create models in `lib/models/`
2. Create services in `lib/services/`
3. Create providers for state management in `lib/providers/`
4. Create UI screens in `lib/screens/`

### State Management

The app uses Provider for state management:
- `AuthProvider` - Manages authentication state
- `LanguageProvider` - Manages language selection

## Testing

Run tests:

```bash
flutter test
```

## License

Private - Gurutattva Project
