import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/status/presentation/bloc/status_bloc.dart';
import 'package:mobile/features/status/presentation/bloc/status_event.dart';
import 'package:mobile/features/status/presentation/bloc/status_state.dart';
import 'package:mobile/injection_container.dart' as di;

class StatusPage extends StatelessWidget {
  const StatusPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => di.sl<StatusBloc>()..add(const LoadStatuses()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'Status',
            style: TextStyle(
              fontSize: 20.0,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          backgroundColor: const Color(0xFF2196F3), // Green from main.dart
          elevation: 2,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Container(
          color: Colors.grey[100], // Light background to match modern themes
          child: RefreshIndicator(
            onRefresh: () async {
              context.read<StatusBloc>().add(const LoadStatuses());
              await Future.delayed(const Duration(seconds: 1));
            },
            color: const Color(0xFF2196F3),
            backgroundColor: Colors.white,
            child: BlocBuilder<StatusBloc, StatusState>(
              builder: (context, state) {
                if (state is StatusLoading) {
                  return const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF2196F3),
                    ),
                  );
                } else if (state is StatusLoaded) {
                  return ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: state.statuses.length,
                    itemBuilder: (context, index) {
                      final status = state.statuses[index];
                      final payment = status['payment'] is String
                          ? status['payment'].toLowerCase() == 'true'
                          : status['payment'] as bool;
                      final document = status['document'] is String
                          ? status['document'].toLowerCase() == 'true'
                          : status['document'] as bool;

                      return Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        margin: const EdgeInsets.only(bottom: 12.0),
                        color: Colors.white,
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16.0,
                            vertical: 8.0,
                          ),
                          leading: const Icon(
                            Icons.description,
                            color: Color(0xFF2196F3),
                          ),
                          title: Text(
                            status['title'] as String,
                            style: const TextStyle(
                              fontSize: 18.0,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2196F3),
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text(
                                'Payment: ',
                                style: TextStyle(
                                  fontSize: 14.0,
                                  color: Colors.black87,
                                ),
                              ),
                              Checkbox(
                                value: payment,
                                onChanged: null,
                                activeColor: const Color(0xFF2196F3),
                                checkColor: Colors.white,
                              ),
                              const SizedBox(width: 16),
                              const Text(
                                'Document: ',
                                style: TextStyle(
                                  fontSize: 14.0,
                                  color: Colors.black87,
                                ),
                              ),
                              Checkbox(
                                value: document,
                                onChanged: null,
                                activeColor: const Color(0xFF2196F3),
                                checkColor: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                } else if (state is StatusError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        state.message,
                        style: const TextStyle(
                          color: Colors.red,
                          fontSize: 16.0,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                } else {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        'No data',
                        style: TextStyle(
                          fontSize: 16.0,
                          color: Colors.black54,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                }
              },
            ),
          ),
        ),
      ),
    );
  }
}