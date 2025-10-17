import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/notifications/presentation/pages/notification_page.dart';
import 'package:mobile/features/appointment/presentation/pages/calendar_page.dart';
import 'package:mobile/features/settings/presentation/pages/settings_page.dart';
import 'package:mobile/features/dashboard/presentation/pages/approved_requests_page.dart';

class HomeContainer extends StatefulWidget {
  const HomeContainer({super.key});

  @override
  State<HomeContainer> createState() => _HomeContainerState();
}

class _HomeContainerState extends State<HomeContainer> {
  int _selectedIndex = 0;

  /// Use nullable slots so we only create a tab the first time it's shown.
  /// IndexedStack will keep the subtree alive once created.
  final List<Widget?> _tabs = List<Widget?>.filled(5, null, growable: false);

  @override
  void initState() {
    super.initState();
    // Eager-create the first tab only
    _tabs[0] = const HomePage();
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
      // Lazy instantiate the tab when first selected
      _tabs[index] ??= _buildTab(index);
    });
  }

  Widget _buildTab(int index) {
    switch (index) {
      case 0:
        return const HomePage();
      case 1:
        return const CalendarPage();
      case 2:
        return const ApprovedRequestsPage();
      case 3:
        return const NotificationPage();
      case 4:
        return const SettingsPage();
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        // Make sure the currently selected tab is created
        _tabs[_selectedIndex] ??= _buildTab(_selectedIndex);

        return Scaffold(
          backgroundColor: Colors.transparent,
          body: AnimatedGradientBackground(
            isDarkMode: isDarkMode,
            child: IndexedStack(
              index: _selectedIndex,
              children: List.generate(
                _tabs.length,
                (i) => _tabs[i] ?? const SizedBox.shrink(),
              ),
            ),
          ),
          bottomNavigationBar: Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDarkMode
                    ? [
                        const Color(0xFF1A1A1A),
                        const Color(0xFF2D2D2D),
                      ]
                    : [
                        const Color(0xFFF8F9FA),
                        const Color(0xFFF0F0F0),
                      ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                  spreadRadius: 4,
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                  spreadRadius: 2,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BottomNavigationBar(
                type: BottomNavigationBarType.fixed,
                currentIndex: _selectedIndex,
                selectedItemColor: Theme.of(context).primaryColor,
                unselectedItemColor: isDarkMode ? Colors.grey[400] : Colors.grey,
                backgroundColor: Colors.transparent,
                elevation: 0,
                onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: "Calendar",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: "Approved",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: "Notifications",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: "Settings",
          ),
        ],
              ),
            ),
          ),
        );
      },
    );
  }
}
