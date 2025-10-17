import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/notifications/presentation/pages/notification_page.dart';
import 'package:mobile/features/appointment/presentation/pages/calendar_page.dart';
import 'package:mobile/features/settings/presentation/pages/settings_page.dart';
import 'package:mobile/features/status/presentation/pages/status_page.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class HomeContainer extends StatefulWidget {
  const HomeContainer({super.key});

  @override
  State<HomeContainer> createState() => _HomeContainerState();
}

class _HomeContainerState extends State<HomeContainer> {
  int _selectedIndex = 0;

  final List<Widget?> _tabs = List<Widget?>.filled(5, null, growable: false);

  @override
  void initState() {
    super.initState();
    _tabs[0] = const HomePage();
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
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
        return const StatusPage();
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
    _tabs[_selectedIndex] ??= _buildTab(_selectedIndex);

    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
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
            label: "Status",
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
      },
    );
  }
}