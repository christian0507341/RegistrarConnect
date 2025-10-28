import 'package:flutter/material.dart';

class FuturisticCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final double? elevation;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  final bool showGlow;
  final Color? glowColor;

  const FuturisticCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.elevation,
    this.backgroundColor,
    this.borderRadius,
    this.showGlow = true,
    this.glowColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Container(
      margin: margin,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: padding ?? const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: backgroundColor ?? theme.cardColor,
          borderRadius: borderRadius ?? BorderRadius.circular(24),
          border: Border.all(
            color: theme.primaryColor.withValues(alpha: isDark ? 0.6 : 0.3),
            width: isDark ? 2.0 : 1.5,
          ),
          boxShadow: [
            if (showGlow)
              BoxShadow(
                color: (glowColor ?? theme.primaryColor).withValues(alpha: 0.4),
                blurRadius: 20,
                offset: const Offset(0, 8),
                spreadRadius: 4,
              ),
            BoxShadow(
              color: (glowColor ?? theme.primaryColor).withValues(alpha: 0.2),
              blurRadius: 12,
              offset: const Offset(0, 4),
              spreadRadius: 2,
            ),
            BoxShadow(
              color: theme.shadowColor.withValues(alpha:isDark ? 0.4 : 0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}

class AnimatedFuturisticCard extends StatefulWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final double? elevation;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  final bool showGlow;
  final Color? glowColor;
  final VoidCallback? onTap;

  const AnimatedFuturisticCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.elevation,
    this.backgroundColor,
    this.borderRadius,
    this.showGlow = true,
    this.glowColor,
    this.onTap,
  });

  @override
  State<AnimatedFuturisticCard> createState() => _AnimatedFuturisticCardState();
}

class _AnimatedFuturisticCardState extends State<AnimatedFuturisticCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _glowAnimation = Tween<double>(
      begin: 0.2,
      end: 0.4,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return GestureDetector(
      onTapDown: widget.onTap != null ? (_) => _controller.forward() : null,
      onTapUp: widget.onTap != null ? (_) => _controller.reverse() : null,
      onTapCancel: widget.onTap != null ? () => _controller.reverse() : null,
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              margin: widget.margin,
              padding: widget.padding ?? const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: widget.backgroundColor ?? theme.cardColor,
                borderRadius: widget.borderRadius ?? BorderRadius.circular(24),
                border: Border.all(
                  color: theme.primaryColor.withValues(alpha: 0.4),
                  width: 1.5,
                ),
                boxShadow: [
                  if (widget.showGlow)
                    BoxShadow(
                      color: (widget.glowColor ?? theme.primaryColor)
                          .withValues(alpha:_glowAnimation.value * 0.6),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                      spreadRadius: 6,
                    ),
                  if (widget.showGlow)
                    BoxShadow(
                      color: (widget.glowColor ?? theme.primaryColor)
                          .withValues(alpha:_glowAnimation.value * 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                      spreadRadius: 3,
                    ),
                  BoxShadow(
                    color: theme.shadowColor.withValues(alpha:isDark ? 0.4 : 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: widget.child,
            ),
          );
        },
      ),
    );
  }
}
