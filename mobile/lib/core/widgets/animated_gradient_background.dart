import 'package:flutter/material.dart';

class AnimatedGradientBackground extends StatefulWidget {
  final Widget child;
  final bool isDarkMode;
  final Duration duration;

  const AnimatedGradientBackground({
    super.key,
    required this.child,
    required this.isDarkMode,
    this.duration = const Duration(seconds: 3),
  });

  @override
  State<AnimatedGradientBackground> createState() => _AnimatedGradientBackgroundState();
}

class _AnimatedGradientBackgroundState extends State<AnimatedGradientBackground>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: widget.isDarkMode
                  ? [
                      const Color(0xFF0A0A0A),
                      const Color(0xFF1A1A1A),
                      Color.lerp(const Color(0xFF1A1A1A), const Color(0xFF2A2A2A), _animation.value)!,
                      Color.lerp(const Color(0xFF2A2A2A), const Color(0xFF3A3A3A), _animation.value)!,
                      const Color(0xFF4A4A4A),
                    ]
                  : [
                      const Color(0xFFFAFAFA),
                      const Color(0xFFF5F5F5),
                      Color.lerp(const Color(0xFFF5F5F5), const Color(0xFFF0F0F0), _animation.value)!,
                      Color.lerp(const Color(0xFFF0F0F0), const Color(0xFFE5E5E5), _animation.value)!,
                      const Color(0xFFE0E0E0),
                    ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: const [0.0, 0.25, 0.5, 0.75, 1.0],
            ),
            boxShadow: [
              BoxShadow(
                color: widget.isDarkMode 
                    ? Colors.black.withValues(alpha: 0.3)
                    : Colors.blue.withValues(alpha: 0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: widget.child,
        );
      },
    );
  }
}

class NeonGlowEffect extends StatelessWidget {
  final Widget child;
  final Color glowColor;
  final double blurRadius;
  final double spreadRadius;

  const NeonGlowEffect({
    super.key,
    required this.child,
    required this.glowColor,
    this.blurRadius = 20.0,
    this.spreadRadius = 5.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: glowColor.withValues(alpha: 0.6),
            blurRadius: blurRadius,
            spreadRadius: spreadRadius,
          ),
          BoxShadow(
            color: glowColor.withValues(alpha: 0.4),
            blurRadius: blurRadius * 0.5,
            spreadRadius: spreadRadius * 0.5,
          ),
        ],
      ),
      child: child,
    );
  }
}

class PulsingGlowEffect extends StatefulWidget {
  final Widget child;
  final Color glowColor;
  final Duration duration;

  const PulsingGlowEffect({
    super.key,
    required this.child,
    required this.glowColor,
    this.duration = const Duration(seconds: 2),
  });

  @override
  State<PulsingGlowEffect> createState() => _PulsingGlowEffectState();
}

class _PulsingGlowEffectState extends State<PulsingGlowEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: widget.glowColor.withValues(alpha:_animation.value),
                blurRadius: 20,
                spreadRadius: 5,
              ),
              BoxShadow(
                color: widget.glowColor.withValues(alpha:_animation.value * 0.5),
                blurRadius: 40,
                spreadRadius: 10,
              ),
            ],
          ),
          child: widget.child,
        );
      },
    );
  }
}
