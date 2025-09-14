import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_event.dart';
import '../bloc/home_state.dart';
import '../../domain/entities/activity.dart';
import '../pages/widgets/greeting_header.dart';
import '../pages/widgets/status_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key}); // Removed required homeBloc parameter

  @override
  Widget build(BuildContext context) {
    // Access global HomeBloc
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
              const GreetingHeader(userName: "Patrick"),
              const SizedBox(height: 20),
              Row(
                children: const [
                  Expanded(
                    child: StatusCard(
                      title: "Pending Requests",
                      subtitle: "3",
                      buttonLabel: "View",
                      icon: Icons.pending_actions,
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: StatusCard(
                      title: "Upcoming Appointments",
                      subtitle: "Sept 17",
                      icon: Icons.calendar_today,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                "Recent Activities:",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              ...state.activities.map((a) => ListTile(
                    title: Text(a.title),
                    subtitle: Text(a.timestamp.toString()),
                  )),
            ],
          );
        } else if (state is HomeError) {
          body = Center(child: Text(state.message));
        } else {
          body = const SizedBox.shrink();
        }

        return Scaffold(
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: body,
            ),
          ),
          // BottomNavigationBar handled by HomeContainer / IndexedStack
        );
      },
    );
  }
}
