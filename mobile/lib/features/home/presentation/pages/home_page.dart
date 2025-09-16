import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_event.dart';
import '../bloc/home_state.dart';
import '../../domain/entities/activity.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final homeBloc = BlocProvider.of<HomeBloc>(context);
    homeBloc.add(LoadActivities());

    return BlocBuilder<HomeBloc, HomeState>(
      bloc: homeBloc,
      builder: (context, state) {
        Widget body;

        if (state is HomeLoading || state is HomeInitial) {
          body = const Center(child: CircularProgressIndicator());
        } else if (state is HomeLoaded) {
          body = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 🔹 Greeting Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.home, color: Colors.green),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        "Hello, Patrick",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: const [
                      Icon(Icons.qr_code_scanner,
                          color: Colors.white, size: 26),
                      SizedBox(width: 16),
                      Icon(Icons.notifications_none,
                          color: Colors.white, size: 26),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 25),

              // 🔹 Status Cards
              Row(
                children: [
                  Expanded(
                    child: _StatusCard(
                      title: "Pending Requests",
                      value: "3",
                      buttonLabel: "View",
                      icon: Icons.pending_actions,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _StatusCard(
                      title: "Upcoming Appointments",
                      value: "Sept 17",
                      icon: Icons.calendar_today,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // 🔹 Recently Opened
              const Text(
                "RECENTLY OPENED",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.black54,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _RecentDocCard(),
                  const SizedBox(width: 12),
                  _RecentDocCard(),
                ],
              ),
              const SizedBox(height: 30),

              // 🔹 Recent Activity
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Recent Activity",
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const Divider(),
                    ...state.activities.map(
                      (a) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Text(a.title),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        } else if (state is HomeError) {
          body = Center(child: Text(state.message));
        } else {
          body = const SizedBox.shrink();
        }

        return Scaffold(
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFB0C4DE), Color(0xFFE6ECF5)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: body,
              ),
            ),
          ),
        );
      },
    );
  }
}

// 🔹 Status Card Widget
class _StatusCard extends StatelessWidget {
  final String title;
  final String value;
  final String? buttonLabel;
  final IconData icon;

  const _StatusCard({
    required this.title,
    required this.value,
    required this.icon,
    this.buttonLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style:
                  const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (buttonLabel != null)
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.blue,
                elevation: 0,
                side: const BorderSide(color: Colors.blue),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              ),
              child: Text(buttonLabel!),
            ),
        ],
      ),
    );
  }
}

// 🔹 Recent Doc Card
class _RecentDocCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 90,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
                color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
          ],
        ),
        child: const Center(
          child: Icon(Icons.description_outlined, size: 40, color: Colors.black54),
        ),
      ),
    );
  }
}
