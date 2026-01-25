import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Language Provider
/// 
/// Manages language selection state (English/Hindi)

class LanguageProvider with ChangeNotifier {
  static const String _languageKey = 'selected_language';
  String _currentLanguage = 'en'; // Default to English

  LanguageProvider() {
    _loadLanguage();
  }

  // Getters
  String get currentLanguage => _currentLanguage;
  bool get isEnglish => _currentLanguage == 'en';
  bool get isHindi => _currentLanguage == 'hi';

  /// Load saved language preference
  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString(_languageKey) ?? 'en';
    notifyListeners();
  }

  /// Set language
  Future<void> setLanguage(String language) async {
    if (language != 'en' && language != 'hi') {
      throw ArgumentError('Language must be "en" or "hi"');
    }

    _currentLanguage = language;
    notifyListeners();

    // Save preference
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, language);
  }

  /// Toggle between English and Hindi
  Future<void> toggleLanguage() async {
    await setLanguage(_currentLanguage == 'en' ? 'hi' : 'en');
  }

  /// Get language display name
  String get languageDisplayName => _currentLanguage == 'en' ? 'English' : 'हिंदी';
}
