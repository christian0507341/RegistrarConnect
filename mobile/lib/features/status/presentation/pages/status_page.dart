import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../../injection_container.dart';
import '../bloc/status_bloc.dart';
import '../bloc/status_event.dart';
import '../bloc/status_state.dart';

class StatusPage extends StatelessWidget {
  const StatusPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<StatusBloc>()..add(LoadStatuses()),
      child: Scaffold(
        appBar: AppBar(title: const Text('Status Page')),
        body: RefreshIndicator(
          onRefresh: () async {
            context.read<StatusBloc>().add(LoadStatuses());
            await Future.delayed(const Duration(seconds: 1));
          },
          child: BlocBuilder<StatusBloc, StatusState>(
            builder: (context, state) {
              if (state is StatusLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is StatusLoaded) {
                return ListView.builder(
                  itemCount: state.statuses.length,
                  itemBuilder: (context, index) {
                    final status = state.statuses[index];
                    return ListTile(
                      title: Text(status.title),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('Payment: '),
                          Checkbox(
                            value: status.payment,
                            onChanged: null,
                          ),
                          const SizedBox(width: 16),
                          const Text('Document: '),
                          Checkbox(
                            value: status.document,
                            onChanged: null,
                          ),
                        ],
                      ),
                    );
                  },
                );
              } else if (state is StatusError) {
                return Center(child: Text(state.message));
              } else {
                return const Center(child: Text('No data'));
              }
            },
          ),
        ),
      ),
    );
  }
}