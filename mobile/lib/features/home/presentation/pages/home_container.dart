import 'package:flutter/material.dart';
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
    // Make sure the currently selected tab is created
    _tabs[_selectedIndex] ??= _buildTab(_selectedIndex);

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: List.generate(
          _tabs.length,
          (i) => _tabs[i] ?? const SizedBox.shrink(),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFF2196F3),
        unselectedItemColor: Colors.grey,
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
    );
  }
}
