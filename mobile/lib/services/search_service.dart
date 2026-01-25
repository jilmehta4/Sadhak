import '../models/search_result.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Search Service
/// 
/// Handles search requests to the Sadhak backend

class SearchService {
  final ApiService _apiService;

  SearchService({required ApiService apiService}) : _apiService = apiService;

  /// Perform semantic search
  /// 
  /// [query] - Search query text
  /// [language] - Language code ('en' or 'hi')
  Future<List<SearchResult>> search({
    required String query,
    required String language,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConfig.searchUrl,
        body: {
          'query': query,
          'resourceLanguage': language,
        },
      );

      // Parse results
      final List<dynamic> results = response['results'] ?? [];
      return results
          .map((json) => SearchResult.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw SearchException('Search failed: $e');
    }
  }
}

/// Search Exception
class SearchException implements Exception {
  final String message;

  SearchException(this.message);

  @override
  String toString() => message;
}
