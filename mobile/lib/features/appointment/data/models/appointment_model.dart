import '../../domain/entities/appointment.dart';

class AppointmentModel extends Appointment {
  AppointmentModel({required DateTime date, required String title})
      : super(date: date, title: title);

  Map<String, dynamic> toJson() => {
        'date': date.toIso8601String(),
        'title': title,
      };

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      date: DateTime.parse(json['date']),
      title: json['title'],
    );
  }
}
