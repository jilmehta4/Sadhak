import 'package:flutter/material.dart';
import '../config/app_theme.dart';

/// A card widget with an icon, title, and description
/// Used for mode selection on the home screen
class IconCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;
  final Color? iconColor;
  final Gradient? iconGradient;

  const IconCard({
    Key? key,
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
    this.iconColor,
    this.iconGradient,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: GurutattvaTheme.primaryPurple.withOpacity(0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon with gradient background
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: iconGradient ?? GurutattvaTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
                  boxShadow: [
                    BoxShadow(
                      color: (iconColor ?? GurutattvaTheme.primaryPurple)
                          .withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  icon,
                  size: 40,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              
              // Title
              Text(
                title,
                style: GurutattvaTheme.headingStyle.copyWith(fontSize: 20),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              
              // Description
              Text(
                description,
                style: GurutattvaTheme.bodyStyle.copyWith(
                  color: GurutattvaTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
