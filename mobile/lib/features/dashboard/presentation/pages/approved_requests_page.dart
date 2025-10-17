import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/theme_bloc.dart';

class ApprovedRequestsPage extends StatelessWidget {
  const ApprovedRequestsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        // TODO: Replace with BlocBuilder if you already fetch approved requests
        final approvedRequests = [
          {"title": "Transcript of Records", "date": "Sept 15, 2025"},
          {"title": "Good Moral Certificate", "date": "Sept 10, 2025"},
        ];

        return Scaffold(
          backgroundColor: isDarkMode ? const Color(0xFF121212) : Colors.grey[100],
          appBar: AppBar(
            title: const Text("Approved Requests"),
            elevation: 0,
          ),
      body: approvedRequests.isEmpty
          ? const Center(
              child: Text(
                "No approved requests yet.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: approvedRequests.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final req = approvedRequests[index];
                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 3,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.green.withOpacity(0.2),
                      child: const Icon(Icons.check_circle, color: Colors.blue),
                    ),
                    title: Text(
                      req["title"]!,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text("Approved on ${req["date"]}"),
                  ),
                );
              },
            ),
        );
      },
    );
  }
}
