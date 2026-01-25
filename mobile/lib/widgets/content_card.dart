import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/app_theme.dart';

/// A card widget for displaying content with optional thumbnail
/// Used for search results and other content displays
class ContentCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? thumbnailUrl;
  final VoidCallback? onTap;
  final Widget? trailing;
  final int? maxLines;

  const ContentCard({
    Key? key,
    required this.title,
    this.subtitle,
    this.thumbnailUrl,
    this.onTap,
    this.trailing,
    this.maxLines,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shadowColor: GurutattvaTheme.primaryPurple.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail (if provided)
              if (thumbnailUrl != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(GurutattvaTheme.radiusSmall),
                  child: CachedNetworkImage(
                    imageUrl: thumbnailUrl!,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      width: 80,
                      height: 80,
                      color: GurutattvaTheme.surfaceLight,
                      child: const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: GurutattvaTheme.surfaceLight,
                        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusSmall),
                      ),
                      child: Icon(
                        Icons.image_not_supported,
                        color: GurutattvaTheme.textSecondary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
              ],
              
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GurutattvaTheme.subheadingStyle,
                      maxLines: maxLines ?? 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        subtitle!,
                        style: GurutattvaTheme.bodyStyle.copyWith(
                          color: GurutattvaTheme.textSecondary,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              
              // Trailing widget (if provided)
              if (trailing != null) ...[
                const SizedBox(width: 8),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
