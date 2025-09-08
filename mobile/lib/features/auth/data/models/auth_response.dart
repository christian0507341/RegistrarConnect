import 'package:json_annotation/json_annotation.dart';

part 'auth_response_serialization.dart';

/// Matches the JSON your backend returns from /api/token/
/// { access, refresh, role, name, email }
@JsonSerializable()
class AuthResponse {
  final String access;
  final String refresh;
  final String role;
  final String name;
  final String email;

  const AuthResponse({
    required this.access,
    required this.refresh,
    required this.role,
    required this.name,
    required this.email,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}
