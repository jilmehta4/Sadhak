import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

/// Base API Service
/// 
/// Handles all HTTP requests to the Sadhak backend API

class ApiService {
  final http.Client _client;
  String? _sessionCookie;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// Set session cookie for authenticated requests
  void setSessionCookie(String? cookie) {
    _sessionCookie = cookie;
  }

  /// Get headers with session cookie if available
  Map<String, String> _getHeaders() {
    final headers = Map<String, String>.from(ApiConfig.defaultHeaders);
    if (_sessionCookie != null) {
      headers['Cookie'] = _sessionCookie!;
    }
    return headers;
  }

  /// Make a GET request
  Future<Map<String, dynamic>> get(String url) async {
    try {
      final response = await _client
          .get(
            Uri.parse(url),
            headers: _getHeaders(),
          )
          .timeout(ApiConfig.requestTimeout);

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('GET request failed: $e');
    }
  }

  /// Make a POST request
  Future<Map<String, dynamic>> post(
    String url, {
    Map<String, dynamic>? body,
  }) async {
    try {
      final response = await _client
          .post(
            Uri.parse(url),
            headers: _getHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.requestTimeout);

      // Extract and store session cookie if present
      _extractSessionCookie(response);

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('POST request failed: $e');
    }
  }

  /// Extract session cookie from response
  void _extractSessionCookie(http.Response response) {
    final setCookie = response.headers['set-cookie'];
    if (setCookie != null) {
      _sessionCookie = setCookie.split(';')[0];
    }
  }

  /// Handle HTTP response
  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {'success': true};
      }
      try {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } catch (e) {
        throw ApiException('Failed to parse response: $e');
      }
    } else {
      String errorMessage = 'Request failed with status ${response.statusCode}';
      try {
        final errorBody = jsonDecode(response.body);
        errorMessage = errorBody['message'] ?? errorBody['error'] ?? errorMessage;
      } catch (_) {
        // Use default error message if parsing fails
      }
      throw ApiException(errorMessage, statusCode: response.statusCode);
    }
  }

  /// Close the HTTP client
  void dispose() {
    _client.close();
  }
}

/// API Exception
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}
