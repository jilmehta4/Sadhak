import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Authentication Service
/// 
/// Handles user authentication via Google OAuth and session management

class AuthService {
  final ApiService _apiService;
  final GoogleSignIn _googleSignIn;
  static const String _userKey = 'user_data';
  static const String _sessionKey = 'session_cookie';

  AuthService({
    required ApiService apiService,
    GoogleSignIn? googleSignIn,
  })  : _apiService = apiService,
        _googleSignIn = googleSignIn ??
            GoogleSignIn(
              scopes: ['email', 'profile'],
            );

  /// Sign in with Google
  Future<User?> signInWithGoogle() async {
    try {
      // Sign in with Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return null; // User cancelled sign-in
      }

      // Get authentication details
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Send token to backend
      final response = await _apiService.post(
        ApiConfig.authGoogleUrl,
        body: {
          'idToken': googleAuth.idToken,
          'accessToken': googleAuth.accessToken,
        },
      );

      // Parse user from response
      final user = User.fromJson(response['user'] ?? response);

      // Save user data and session
      await _saveUserData(user);

      return user;
    } catch (e) {
      throw AuthException('Google sign-in failed: $e');
    }
  }

  /// Get current user from backend
  Future<User?> getCurrentUser() async {
    try {
      // Try to load session from storage
      await _loadSession();

      // Get user from backend
      final response = await _apiService.get(ApiConfig.authUserUrl);

      if (response['user'] != null) {
        final user = User.fromJson(response['user']);
        await _saveUserData(user);
        return user;
      }

      return null;
    } catch (e) {
      // Session expired or invalid
      await clearSession();
      return null;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      // Sign out from Google
      await _googleSignIn.signOut();

      // Call backend logout
      try {
        await _apiService.post(ApiConfig.authLogoutUrl);
      } catch (_) {
        // Ignore backend errors during logout
      }

      // Clear local session
      await clearSession();
    } catch (e) {
      throw AuthException('Sign out failed: $e');
    }
  }

  /// Save user data to local storage
  Future<void> _saveUserData(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, user.toJson().toString());
  }

  /// Load session from local storage
  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionCookie = prefs.getString(_sessionKey);
    if (sessionCookie != null) {
      _apiService.setSessionCookie(sessionCookie);
    }
  }

  /// Clear session data
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
    await prefs.remove(_sessionKey);
    _apiService.setSessionCookie(null);
  }

  /// Check if user is signed in (has valid session)
  Future<bool> isSignedIn() async {
    final user = await getCurrentUser();
    return user != null;
  }
}

/// Authentication Exception
class AuthException implements Exception {
  final String message;

  AuthException(this.message);

  @override
  String toString() => message;
}
