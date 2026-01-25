/// Search Result Model
/// 
/// Represents a search result from the Sadhak backend

class SearchResult {
  final String id;
  final String filename;
  final String? thumbnailPath;
  final String language;
  final double score;
  final String? text;
  final int? pageNumber;

  SearchResult({
    required this.id,
    required this.filename,
    this.thumbnailPath,
    required this.language,
    required this.score,
    this.text,
    this.pageNumber,
  });

  /// Create SearchResult from JSON
  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      id: json['id']?.toString() ?? '',
      filename: json['filename'] ?? '',
      thumbnailPath: json['thumbnail_path'] ?? json['thumbnailPath'],
      language: json['language'] ?? 'en',
      score: (json['score'] ?? 0.0).toDouble(),
      text: json['text'],
      pageNumber: json['page_number'] ?? json['pageNumber'],
    );
  }

  /// Convert SearchResult to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'filename': filename,
      'thumbnail_path': thumbnailPath,
      'language': language,
      'score': score,
      'text': text,
      'page_number': pageNumber,
    };
  }

  /// Get thumbnail URL
  String? getThumbnailUrl(String baseUrl) {
    if (thumbnailPath == null) return null;
    return '$baseUrl$thumbnailPath';
  }
}
