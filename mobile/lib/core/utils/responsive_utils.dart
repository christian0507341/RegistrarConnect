import 'package:flutter/material.dart';

class ResponsiveUtils {
  /// Get responsive font size based on screen width
  static double getFontSize(BuildContext context, double baseSize) {
    final width = MediaQuery.of(context).size.width;
    
    if (width < 360) {
      return baseSize * 0.85; // Smaller screens
    } else if (width >= 600) {
      return baseSize * 1.15; // Tablets
    }
    return baseSize; // Normal phones
  }

  /// Get responsive padding
  static EdgeInsets getResponsivePadding(BuildContext context, EdgeInsets basePadding) {
    final width = MediaQuery.of(context).size.width;
    
    if (width < 360) {
      return basePadding * 0.8;
    } else if (width >= 600) {
      return basePadding * 1.2;
    }
    return basePadding;
  }

  /// Get responsive spacing
  static double getSpacing(BuildContext context, double baseSpacing) {
    final width = MediaQuery.of(context).size.width;
    
    if (width < 360) {
      return baseSpacing * 0.75;
    } else if (width >= 600) {
      return baseSpacing * 1.5;
    }
    return baseSpacing;
  }

  /// Get screen width
  static double getScreenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  /// Get screen height
  static double getScreenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  /// Check if device is small
  static bool isSmallDevice(BuildContext context) {
    return MediaQuery.of(context).size.width < 360;
  }

  /// Check if device is tablet
  static bool isTablet(BuildContext context) {
    return MediaQuery.of(context).size.width >= 600;
  }

  /// Get safe Text widget that prevents overflow
  static Widget safeText(
    String text, {
    TextStyle? style,
    TextAlign? textAlign,
    int? maxLines,
    TextOverflow overflow = TextOverflow.ellipsis,
  }) {
    return Text(
      text,
      style: style,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      softWrap: true,
    );
  }

  /// Wrap Row children to prevent overflow
  static List<Widget> wrapRowChildren(List<Widget> children) {
    return children.map((child) {
      if (child is Text) {
        return Flexible(child: child);
      }
      if (child is Expanded || child is Flexible) {
        return child;
      }
      // For other widgets, check if they might overflow
      return child;
    }).toList();
  }

  /// Create a safe Row that handles overflow
  static Widget safeRow({
    required List<Widget> children,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    MainAxisSize mainAxisSize = MainAxisSize.max,
  }) {
    return Row(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: wrapRowChildren(children),
    );
  }

  /// Create a safe Column that handles overflow
  static Widget safeColumn({
    required List<Widget> children,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    MainAxisSize mainAxisSize = MainAxisSize.max,
    bool scrollable = false,
  }) {
    final column = Column(
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: children,
    );

    if (scrollable) {
      return SingleChildScrollView(child: column);
    }
    return column;
  }
}

/// Extension for responsive sizing
extension ResponsiveDouble on double {
  /// Make size responsive based on screen width
  double responsive(BuildContext context) {
    return ResponsiveUtils.getSpacing(context, this);
  }

  /// Make font size responsive
  double responsiveFont(BuildContext context) {
    return ResponsiveUtils.getFontSize(context, this);
  }
}

/// Extension for responsive EdgeInsets
extension ResponsiveEdgeInsets on EdgeInsets {
  /// Make padding responsive
  EdgeInsets responsive(BuildContext context) {
    return ResponsiveUtils.getResponsivePadding(context, this);
  }
}

