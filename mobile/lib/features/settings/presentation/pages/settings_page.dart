import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';
import 'package:mobile/features/settings/presentation/bloc/notification_settings_bloc.dart';
import 'package:mobile/core/services/notification_settings_service.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  void _logout(BuildContext context) {
    // Show confirmation dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Row(
            children: [
              Icon(
                Icons.logout,
                color: Colors.red,
                size: 24,
              ),
              SizedBox(width: 8),
              Text('Logout'),
            ],
          ),
          content: const Text(
            'Are you sure you want to logout?',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _performLogout(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }

  void _performLogout(BuildContext context) {
    // Show loading indicator
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            const SizedBox(width: 12),
            const Text('Logging out...'),
          ],
        ),
        backgroundColor: Colors.blue[600],
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );

    // Dispatch logout event via AuthBloc
    context.read<AuthBloc>().add(const LogoutRequested());
    
    // Navigate to login page
    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  }


  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          // Show success message when logout is complete
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Logged out successfully',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green[600],
              duration: const Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );
        }
      },
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
          
          return Scaffold(
          appBar: AppBar(
            title: const Text(
              "Settings",
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            elevation: 0,
          ),
          body: AnimatedGradientBackground(
            isDarkMode: isDarkMode,
            child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            "General",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white70 : Colors.black54,
            ),
          ),
          const SizedBox(height: 10),

          // 🔔 Notification Settings Section
          _buildNotificationSettingsSection(context, isDarkMode),
          const SizedBox(height: 12),

          // 🌙 Dark Mode toggle
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 12,
            shadowColor: Theme.of(context).primaryColor.withValues(alpha: 0.4),
            child: SwitchListTile(
              title: const Text("Dark Mode"),
              subtitle: Text(isDarkMode ? "Currently enabled" : "Currently disabled"),
              value: isDarkMode,
              onChanged: (val) {
                context.read<ThemeBloc>().add(ThemeToggled());
              },
            ),
          ),
          const SizedBox(height: 20),

          Text(
            "About",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white70 : Colors.black54,
            ),
          ),
          const SizedBox(height: 10),

          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 12,
            shadowColor: Theme.of(context).primaryColor.withValues(alpha: 0.4),
            child: ListTile(
              leading: Icon(Icons.info_outline, color: Theme.of(context).primaryColor),
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
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
          ),
        );
        },
      ),
    );
  }

  Widget _buildNotificationSettingsSection(BuildContext context, bool isDarkMode) {
    return BlocProvider(
      create: (context) => NotificationSettingsBloc(
        settingsService: NotificationSettingsService(),
      )..add(LoadNotificationSettings()),
      child: BlocBuilder<NotificationSettingsBloc, NotificationSettingsState>(
        builder: (context, state) {
          if (state is NotificationSettingsLoading) {
            return const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              ),
            );
          }

          if (state is NotificationSettingsError) {
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Failed to load notification settings',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {
                        context.read<NotificationSettingsBloc>().add(LoadNotificationSettings());
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is NotificationSettingsLoaded) {
            final settings = state.settings;
            
            return Column(
              children: [
                // Main notifications toggle
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  elevation: 12,
                  shadowColor: Theme.of(context).primaryColor.withValues(alpha: 0.4),
                  child: SwitchListTile(
                    title: const Text(
                      "Enable Notifications",
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      settings.notificationsEnabled 
                          ? "Receive notifications for important updates"
                          : "Notifications are disabled",
                      style: TextStyle(
                        fontSize: 12,
                        color: isDarkMode ? Colors.white70 : Colors.black54,
                      ),
                    ),
                    value: settings.notificationsEnabled,
                    activeColor: Colors.blue,
                    onChanged: (value) {
                      context.read<NotificationSettingsBloc>().add(
                        ToggleMainNotifications(value),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),

                // Notification type toggles (only show if main notifications are enabled)
                if (settings.notificationsEnabled) ...[
                  _buildNotificationTypeCard(
                    context,
                    isDarkMode,
                    "Document Status",
                    "Get notified when your document status changes",
                    Icons.description,
                    settings.documentStatusNotifications,
                    (value) => context.read<NotificationSettingsBloc>().add(
                      ToggleDocumentStatusNotifications(value),
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildNotificationTypeCard(
                    context,
                    isDarkMode,
                    "Appointments",
                    "Get notified about appointment scheduling",
                    Icons.event,
                    settings.appointmentNotifications,
                    (value) => context.read<NotificationSettingsBloc>().add(
                      ToggleAppointmentNotifications(value),
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildNotificationTypeCard(
                    context,
                    isDarkMode,
                    "Payments",
                    "Get notified about payment status updates",
                    Icons.payment,
                    settings.paymentNotifications,
                    (value) => context.read<NotificationSettingsBloc>().add(
                      TogglePaymentNotifications(value),
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildNotificationTypeCard(
                    context,
                    isDarkMode,
                    "Receipts",
                    "Get notified when receipts are uploaded",
                    Icons.receipt,
                    settings.receiptNotifications,
                    (value) => context.read<NotificationSettingsBloc>().add(
                      ToggleReceiptNotifications(value),
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildNotificationTypeCard(
                    context,
                    isDarkMode,
                    "System Announcements",
                    "Get notified about system updates and maintenance",
                    Icons.announcement,
                    settings.systemNotifications,
                    (value) => context.read<NotificationSettingsBloc>().add(
                      ToggleSystemNotifications(value),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Notification preferences
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 12,
                    shadowColor: Theme.of(context).primaryColor.withValues(alpha: 0.4),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Notification Preferences",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDarkMode ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 12),
                          
                          SwitchListTile(
                            title: const Text("Sound"),
                            subtitle: const Text("Play sound for notifications"),
                            value: settings.soundEnabled,
                            onChanged: (value) {
                              context.read<NotificationSettingsBloc>().add(
                                ToggleSound(value),
                              );
                            },
                          ),
                          
                          SwitchListTile(
                            title: const Text("Vibration"),
                            subtitle: const Text("Vibrate for notifications"),
                            value: settings.vibrationEnabled,
                            onChanged: (value) {
                              context.read<NotificationSettingsBloc>().add(
                                ToggleVibration(value),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Reset to defaults button
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 12,
                    shadowColor: Colors.orange.withValues(alpha: 0.4),
                    child: ListTile(
                      leading: const Icon(Icons.restore, color: Colors.orange),
                      title: const Text(
                        "Reset to Defaults",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      subtitle: const Text("Reset all notification settings to default"),
                      onTap: () {
                        _showResetConfirmation(context);
                      },
                    ),
                  ),
                ],
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildNotificationTypeCard(
    BuildContext context,
    bool isDarkMode,
    String title,
    String subtitle,
    IconData icon,
    bool value,
    Function(bool) onChanged,
  ) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 8,
      shadowColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
      child: ListTile(
        leading: Icon(
          icon,
          color: value ? Theme.of(context).primaryColor : Colors.grey,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            color: isDarkMode ? Colors.white70 : Colors.black54,
          ),
        ),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Theme.of(context).primaryColor,
        ),
      ),
    );
  }

  void _showResetConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text("Reset Notification Settings"),
          content: const Text(
            "Are you sure you want to reset all notification settings to their default values?",
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                context.read<NotificationSettingsBloc>().add(ResetToDefaults());
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Notification settings reset to defaults"),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
              child: const Text("Reset"),
            ),
          ],
        );
      },
    );
  }
}
