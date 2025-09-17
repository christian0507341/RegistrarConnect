import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/notifications/presentation/pages/notification_page.dart';
import 'package:mobile/features/appointment/presentation/pages/calendar_page.dart';

// BLoC
import 'package:mobile/features/home/presentation/bloc/home_bloc.dart';
import 'package:mobile/features/home/presentation/bloc/home_event.dart';

// Repo
import 'package:mobile/features/home/domain/repositories/activity_repository.dart';
import 'package:mobile/features/home/data/repositories/activity_repository_impl.dart';

class HomeContainer extends StatefulWidget {
  const HomeContainer({super.key});

  @override
  State<HomeContainer> createState() => _HomeContainerState();
}

class _HomeContainerState extends State<HomeContainer> {
  int _selectedIndex = 0;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();

    _pages = [
      BlocProvider<HomeBloc>(
        create: (_) {
          final IActivityRepository repo = ActivityRepositoryImpl();
          return HomeBloc(repository: repo)..add(LoadActivities());
        },
        child: const HomePage(),
      ),
      const CalendarPage(),
      const Scaffold(body: Center(child: Text("Dashboard"))),
      const NotificationPage(),
      const Scaffold(body: Center(child: Text("Settings"))),
    ];
  }

  void _onItemTapped(int index) => setState(() => _selectedIndex = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.green,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: "Calendar",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: ""),
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
