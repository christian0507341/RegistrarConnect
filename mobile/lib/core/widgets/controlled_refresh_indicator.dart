import 'package:flutter/material.dart';

/// A RefreshIndicator with better control to prevent accidental refreshes while scrolling
class ControlledRefreshIndicator extends StatefulWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final double displacement;
  final double edgeOffset;
  final Color? color;
  final Color? backgroundColor;

  const ControlledRefreshIndicator({
    super.key,
    required this.child,
    required this.onRefresh,
    this.displacement = 60.0,
    this.edgeOffset = 20.0,
    this.color,
    this.backgroundColor,
  });

  @override
  State<ControlledRefreshIndicator> createState() => _ControlledRefreshIndicatorState();
}

class _ControlledRefreshIndicatorState extends State<ControlledRefreshIndicator> {
  bool _isAtTop = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // Check if we're at the top of the scroll view
    if (_scrollController.hasClients) {
      setState(() {
        _isAtTop = _scrollController.offset <= 0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      displacement: widget.displacement,
      edgeOffset: widget.edgeOffset,
      color: widget.color,
      backgroundColor: widget.backgroundColor,
      strokeWidth: 3.0,
      // Only allow refresh when at the top
      notificationPredicate: (notification) {
        return _isAtTop && notification.depth == 0;
      },
      child: widget.child,
    );
  }
}

