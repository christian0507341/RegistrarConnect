import 'package:flutter/material.dart';
import 'draggable_fab.dart';

class GlobalFabWrapper extends StatelessWidget {
  final Widget child;
  final bool showFab;

  const GlobalFabWrapper({
    super.key,
    required this.child,
    required this.showFab,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          child,
          if (showFab)
            DraggableFab(
              onPressed: () {
                Navigator.pushNamed(context, '/chat');
              },
            ),
        ],
      ),
    );
  }
}
