import '../models/chat_message.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Chat Service
/// 
/// Handles AI chat requests and history retrieval

class ChatService {
  final ApiService _apiService;

  ChatService({required ApiService apiService}) : _apiService = apiService;

  /// Send a chat message to the AI
  /// 
  /// [message] - User's message content
  /// [language] - Language code ('en' or 'hi')
  Future<ChatMessage> sendMessage({
    required String message,
    required String language,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConfig.chatUrl,
        body: {
          'message': message,
          'language': language,
        },
      );

      // Parse AI response
      final aiResponse = response['response'] ?? response['message'] ?? '';
      final sources = response['sources'] != null
          ? List<String>.from(response['sources'])
          : null;

      return ChatMessage.ai(aiResponse, sources: sources);
    } catch (e) {
      throw ChatException('Failed to send message: $e');
    }
  }

  /// Get chat history
  Future<List<ChatMessage>> getHistory() async {
    try {
      final response = await _apiService.get(ApiConfig.historyUrl);

      final List<dynamic> history = response['history'] ?? response['messages'] ?? [];
      return history
          .map((json) => ChatMessage.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ChatException('Failed to load chat history: $e');
    }
  }
}

/// Chat Exception
class ChatException implements Exception {
  final String message;

  ChatException(this.message);

  @override
  String toString() => message;
}
