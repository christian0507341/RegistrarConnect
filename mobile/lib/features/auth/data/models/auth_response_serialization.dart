// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) => AuthResponse(
  access: json['access'] as String,
  refresh: json['refresh'] as String,
  role: json['role'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
);

Map<String, dynamic> _$AuthResponseToJson(AuthResponse instance) =>
    <String, dynamic>{
      'access': instance.access,
      'refresh': instance.refresh,
      'role': instance.role,
      'name': instance.name,
      'email': instance.email,
    };
