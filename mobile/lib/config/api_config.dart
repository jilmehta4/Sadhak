/// API Configuration for Sadhak Mobile App
/// 
/// This file contains all API endpoint configurations and base URLs
/// for development and production environments.

class ApiConfig {
  // Base URLs
  static const String devBaseUrl = 'http://10.0.2.2:3000'; // Android emulator localhost
  static const String prodBaseUrl = 'http://3.234.250.60'; // TODO: Update with production URL
  
  // Current environment
  static const bool isProduction = true; // Set to true for production builds
  
  // Get current base URL based on environment
  static String get baseUrl => isProduction ? prodBaseUrl : devBaseUrl;
  
  // API Endpoints
  static const String authGoogle = '/auth/google';
  static const String authUser = '/auth/user';
  static const String authLogout = '/auth/logout';
  static const String search = '/search';
  static const String chat = '/chat';
  static const String history = '/history';
  static const String resource = '/resource';
  
  // Full endpoint URLs
  static String get authGoogleUrl => '$baseUrl$authGoogle';
  static String get authUserUrl => '$baseUrl$authUser';
  static String get authLogoutUrl => '$baseUrl$authLogout';
  static String get searchUrl => '$baseUrl$search';
  static String get chatUrl => '$baseUrl$chat';
  static String get historyUrl => '$baseUrl$history';
  static String get resourceUrl => '$baseUrl$resource';
  
  // Request timeout
  static const Duration requestTimeout = Duration(seconds: 30);
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
