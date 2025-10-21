import 'package:flutter/material.dart';

/// A Row widget that prevents overflow by making children flexible
class ResponsiveRow extends StatelessWidget {
  final List<Widget> children;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;
  final EdgeInsetsGeometry? padding;

  const ResponsiveRow({
    super.key,
    required this.children,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    Widget row = Row(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: children.map((child) {
        // Wrap Text widgets in Flexible to prevent overflow
        if (child is Text) {
          return Flexible(
            child: child,
          );
        }
        // Wrap containers with children in Flexible
        if (child is Container && child.child is Text) {
          return Flexible(child: child);
        }
        return child;
      }).toList(),
    );

    if (padding != null) {
      return Padding(
        padding: padding!,
        child: row,
      );
    }

    return row;
  }
}

/// A Column widget that prevents overflow with scrolling
class ResponsiveColumn extends StatelessWidget {
  final List<Widget> children;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;
  final EdgeInsetsGeometry? padding;
  final bool scrollable;

  const ResponsiveColumn({
    super.key,
    required this.children,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.padding,
    this.scrollable = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget column = Column(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: children,
    );

    if (padding != null) {
      column = Padding(
        padding: padding!,
        child: column,
      );
    }

    if (scrollable) {
      return SingleChildScrollView(
        child: column,
      );
    }

    return column;
  }
}

/// A flexible Text widget that handles overflow gracefully
class ResponsiveText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow overflow;
  final bool softWrap;

  const ResponsiveText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow = TextOverflow.ellipsis,
    this.softWrap = true,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: style,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      softWrap: softWrap,
    );
  }
}

/// Helper extension for safe spacing
extension ResponsiveSpacing on num {
  /// Returns a smaller spacing on smaller screens
  double responsiveSize(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < 360) {
      return (this * 0.8).toDouble();
    } else if (width > 600) {
      return (this * 1.2).toDouble();
    }
    return toDouble();
  }
}

