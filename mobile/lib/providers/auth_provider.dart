import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

/// Authentication Provider
/// 
/// Manages authentication state across the app

class AuthProvider with ChangeNotifier {
  final AuthService _authService;
  User? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider({required AuthService authService})
      : _authService = authService;

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  /// Initialize - check for existing session
  Future<void> initialize() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _authService.getCurrentUser();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // DEVELOPMENT BYPASS - Remove in production
      // This allows testing on web without Google OAuth setup
      if (kIsWeb && kDebugMode) {
        debugPrint('🔧 DEV MODE: Using mock authentication for web testing');
        await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
        
        _user = User(
          id: 'dev-user-123',
          email: 'dev@sadhak.app',
          displayName: 'Development User',
          photoUrl: null,
        );
        _isLoading = false;
        notifyListeners();
        return true;
      }
      
      // Normal Google Sign-In flow for Android/iOS
      _user = await _authService.signInWithGoogle();
      _isLoading = false;
      notifyListeners();
      return _user != null;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.signOut();
      _user = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
