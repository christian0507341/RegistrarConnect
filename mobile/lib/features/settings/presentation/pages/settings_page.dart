import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_event.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      // Dispatch logout; global AuthBloc listener in main.dart will handle navigation
      context.read<AuthBloc>().add(const LogoutRequested());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signing out...')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          Navigator.of(context, rootNavigator: true)
              .pushNamedAndRemoveUntil('/login', (route) => false);
        }
      },
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          return Scaffold(
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text(
          "Settings",
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            "General",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 10),

          // 🔔 Notifications toggle
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
            child: SwitchListTile(
              title: const Text("Enable Notifications"),
              value: true,
              activeColor: Colors.blue,
              onChanged: (val) {
                // Handle notification preference
              },
            ),
          ),
          const SizedBox(height: 12),

          // 🌙 Dark Mode toggle
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
            child: SwitchListTile(
              title: const Text("Dark Mode"),
              subtitle: Text(themeState.isDarkMode ? "Dark theme enabled" : "Light theme enabled"),
              value: themeState.isDarkMode,
              activeColor: Colors.blue,
              onChanged: (val) {
                context.read<ThemeBloc>().add(const ToggleTheme());
              },
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            "About",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 10),

          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
            child: ListTile(
              leading: const Icon(Icons.info_outline, color: Colors.blue),
              title: const Text("App Version"),
              subtitle: const Text("1.0.0"),
            ),
          ),
          const SizedBox(height: 40),

          // 🚪 Logout button
          Center(
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              icon: const Icon(Icons.logout, color: Colors.white),
              label: const Text(
                "Logout",
                style: TextStyle(fontSize: 16, color: Colors.white),
              ),
              onPressed: () => _logout(context),
            ),
          ),
        ],
      ),
    );
        },
      ),
    );
  }
}