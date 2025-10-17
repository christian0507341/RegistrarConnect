import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/widgets/futuristic_card.dart';
import 'package:mobile/core/widgets/futuristic_button.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_event.dart';
import '../bloc/home_state.dart';
import 'package:mobile/features/chat/presentation/pages/chat_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final HomeBloc _homeBloc;

  @override
  void initState() {
    super.initState();
    _homeBloc = BlocProvider.of<HomeBloc>(context);
    _homeBloc.add(LoadActivities()); // fire once
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      bloc: _homeBloc,
      builder: (context, state) {
        Widget body;

        if (state is HomeLoading || state is HomeInitial) {
          body = const Center(child: CircularProgressIndicator());
        } else if (state is HomeLoaded) {
          body = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween, // <-- fixed
                children: [
                  Row(
                    children: const [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.home, color: Colors.green),
                      ),
                      SizedBox(width: 12),
                      Text(
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
                      Icon(
                        Icons.qr_code_scanner,
                        color: Colors.white,
                        size: 26,
                      ),
                      SizedBox(width: 16),
                      Icon(
                        Icons.notifications_none,
                        color: Colors.white,
                        size: 26,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 25),

              // Status Cards
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

              // Recently Opened
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

              // Recent Activity
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Recent Activity",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
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
          body: AnimatedGradientBackground(
            isDarkMode: Theme.of(context).brightness == Brightness.dark,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: body,
              ),
            ),
          ),
          floatingActionButton: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            child: FuturisticIconButton(
              icon: Icons.chat_bubble_outline,
              onPressed: () {
                Navigator.push(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) => const ChatPage(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) {
                      return SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0.0, 1.0),
                          end: Offset.zero,
                        ).animate(CurvedAnimation(
                          parent: animation,
                          curve: Curves.easeOutCubic,
                        )),
                        child: FadeTransition(
                          opacity: animation,
                          child: child,
                        ),
                      );
                    },
                    transitionDuration: const Duration(milliseconds: 400),
                  ),
                );
              },
              size: 64,
              isGlowing: true,
            ),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        );
      },
    );
  }
}

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
    return FuturisticCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
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
                foregroundColor: const Color(0xFF2196F3),
                elevation: 0,
                side: const BorderSide(color: Colors.blue),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
              ),
              child: Text(buttonLabel!),
            ),
        ],
      ),
    );
  }
}

class _RecentDocCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 90,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.description_outlined,
            size: 40,
            color: Colors.black54,
          ),
        ),
      ),
    );
  }
}
