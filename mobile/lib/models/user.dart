/// User Model
/// 
/// Represents a user in the Sadhak application

class User {
  final String id;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final String? googleId;

  User({
    required this.id,
    required this.email,
    this.displayName,
    this.photoUrl,
    this.googleId,
  });

  /// Create User from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      displayName: json['displayName'] ?? json['display_name'],
      photoUrl: json['photoUrl'] ?? json['photo_url'],
      googleId: json['googleId'] ?? json['google_id'],
    );
  }

  /// Convert User to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'googleId': googleId,
    };
  }

  /// Create a copy of User with updated fields
  User copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoUrl,
    String? googleId,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      googleId: googleId ?? this.googleId,
    );
  }
}
