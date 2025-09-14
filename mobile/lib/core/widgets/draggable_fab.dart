import 'package:flutter/material.dart';

class DraggableFab extends StatefulWidget {
  final VoidCallback onPressed;
  const DraggableFab({super.key, required this.onPressed});

  @override
  State<DraggableFab> createState() => _DraggableFabState();
}

class _DraggableFabState extends State<DraggableFab> {
  Offset offset = const Offset(400, 600); // default position

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    const double fabSize = 60; // FAB size

    return Positioned(
      left: offset.dx,
      top: offset.dy,
      child: Draggable(
        feedback: FloatingActionButton(
          backgroundColor: Colors.grey[300],
          onPressed: widget.onPressed,
          child: const Icon(Icons.chat_bubble_outline, color: Colors.black),
        ),
        childWhenDragging: Container(),
        onDragEnd: (details) {
          setState(() {
            double dx = details.offset.dx;
            double dy = details.offset.dy;

            // Clamp vertically
            dy = dy.clamp(0, screenSize.height - fabSize);

            // Snap horizontally to nearest edge
            if (dx + fabSize / 2 < screenSize.width / 2) {
              dx = 0; // snap left
            } else {
              dx = screenSize.width - fabSize; // snap right
            }

            offset = Offset(dx, dy);
          });
        },
        child: FloatingActionButton(
          backgroundColor: Colors.grey[300],
          onPressed: widget.onPressed,
          child: const Icon(Icons.chat_bubble_outline, color: Colors.black),
        ),
      ),
    );
  }
}
