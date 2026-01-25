import 'package:flutter/material.dart';
import '../config/app_theme.dart';

/// A custom button widget following Gurutattva design system
/// Features gradient background, rounded corners, and consistent styling
class GurutattvaButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isOutlined;
  final IconData? icon;
  final double? width;
  final double? height;

  const GurutattvaButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.icon,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final buttonHeight = height ?? 56.0;
    
    if (isOutlined) {
      return Container(
        width: width,
        height: buttonHeight,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
          border: Border.all(
            color: GurutattvaTheme.primaryPurple,
            width: 2,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : onPressed,
            borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
            child: Center(
              child: _buildButtonContent(context, true),
            ),
          ),
        ),
      );
    }

    return Container(
      width: width,
      height: buttonHeight,
      decoration: BoxDecoration(
        gradient: GurutattvaTheme.primaryGradient,
        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
        boxShadow: [
          BoxShadow(
            color: GurutattvaTheme.primaryPurple.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
          child: Center(
            child: _buildButtonContent(context, false),
          ),
        ),
      ),
    );
  }

  Widget _buildButtonContent(BuildContext context, bool isOutlined) {
    if (isLoading) {
      return SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            isOutlined ? GurutattvaTheme.primaryPurple : Colors.white,
          ),
        ),
      );
    }

    final textWidget = Text(
      text,
      style: GurutattvaTheme.buttonTextStyle.copyWith(
        color: isOutlined ? GurutattvaTheme.primaryPurple : Colors.white,
      ),
    );

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isOutlined ? GurutattvaTheme.primaryPurple : Colors.white,
            size: 20,
          ),
          const SizedBox(width: 8),
          textWidget,
        ],
      );
    }

    return textWidget;
  }
}
