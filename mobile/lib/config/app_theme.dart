import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Gurutattva App Theme
/// 
/// Custom theme matching the Gurutattva Android app design system

class GurutattvaTheme {
  // Private constructor to prevent instantiation
  GurutattvaTheme._();

  // ============ COLORS ============
  
  // Primary Colors
  static const Color navy = Color(0xFF1A1B4B);           // Deep navy for headers
  static const Color purple = Color(0xFF6B4E9B);         // Primary brand purple
  static const Color magenta = Color(0xFFC7417B);        // Accent magenta/pink
  
  // Secondary Colors
  static const Color lightPurple = Color(0xFFE8E0F5);    // Light purple background
  static const Color softPink = Color(0xFFFFE5F0);       // Soft pink background
  static const Color white = Color(0xFFFFFFFF);          // White
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1A1B4B);    // Navy for headings
  static const Color textSecondary = Color(0xFF6B7280);  // Gray for descriptions
  static const Color textTertiary = Color(0xFF9CA3AF);   // Light gray for metadata
  
  // Gradients
  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF6B4E9B), Color(0xFF8B5FBF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient pinkPurpleGradient = LinearGradient(
    colors: [Color(0xFFC7417B), Color(0xFF8B5FBF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Additional color aliases for easier access
  static const Color primaryNavy = navy;
  static const Color primaryPurple = purple;
  static const Color accentMagenta = magenta;
  static const Color accentPink = softPink;
  static const Color backgroundLight = lightPurple;
  static const Color surfaceLight = lightPurple;
  
  // Primary gradient used throughout the app
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [navy, purple, magenta],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Border radius constants
  static const double radiusSmall = radiusS;
  static const double radiusMedium = radiusM;
  static const double radiusLarge = radiusL;
  
  // Text styles for quick access
  static TextStyle get headingStyle => GoogleFonts.dmSerifDisplay(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: navy,
  );
  
  static TextStyle get subheadingStyle => GoogleFonts.dmSerifDisplay(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: navy,
  );
  
  static TextStyle get bodyStyle => GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: textPrimary,
  );
  
  static TextStyle get buttonTextStyle => GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  );


  // ============ TYPOGRAPHY ============
  
  static TextTheme get textTheme {
    return TextTheme(
      // Display - Large headings (Serif)
      displayLarge: GoogleFonts.dmSerifDisplay(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: navy,
      ),
      displayMedium: GoogleFonts.dmSerifDisplay(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: navy,
      ),
      displaySmall: GoogleFonts.dmSerifDisplay(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: navy,
      ),
      
      // Headlines (Serif)
      headlineLarge: GoogleFonts.dmSerifDisplay(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: navy,
      ),
      headlineMedium: GoogleFonts.dmSerifDisplay(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: navy,
      ),
      headlineSmall: GoogleFonts.dmSerifDisplay(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: navy,
      ),
      
      // Titles (Sans-serif)
      titleLarge: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: navy,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: navy,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: navy,
      ),
      
      // Body (Sans-serif)
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: textPrimary,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: textSecondary,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: textTertiary,
      ),
      
      // Labels
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: textPrimary,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: textSecondary,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: textTertiary,
      ),
    );
  }

  // ============ SPACING ============
  
  static const double spaceXS = 4.0;
  static const double spaceS = 8.0;
  static const double spaceM = 12.0;
  static const double space = 16.0;
  static const double spaceL = 20.0;
  static const double spaceXL = 24.0;
  static const double spaceXXL = 32.0;

  // ============ BORDER RADIUS ============
  
  static const double radiusS = 8.0;
  static const double radiusM = 12.0;
  static const double radius = 16.0;
  static const double radiusL = 20.0;
  static const double radiusXL = 24.0;
  static const double radiusPill = 28.0;

  // ============ THEME DATA ============
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      
      // Color Scheme
      colorScheme: ColorScheme.light(
        primary: purple,
        secondary: magenta,
        surface: white,
        error: Colors.red.shade400,
        onPrimary: white,
        onSecondary: white,
        onSurface: navy,
      ),
      
      // Scaffold
      scaffoldBackgroundColor: lightPurple,
      
      // App Bar
      appBarTheme: AppBarTheme(
        backgroundColor: white,
        foregroundColor: navy,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.dmSerifDisplay(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: navy,
        ),
        iconTheme: const IconThemeData(color: navy),
      ),
      
      // Card
      cardTheme: CardThemeData(
        color: white,
        elevation: 2,
        shadowColor: navy.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
        ),
        margin: const EdgeInsets.symmetric(
          horizontal: space,
          vertical: spaceS,
        ),
      ),
      
      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: purple,
          foregroundColor: white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(
            horizontal: spaceXL,
            vertical: spaceM,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusPill),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: purple,
          side: const BorderSide(color: purple, width: 2),
          padding: const EdgeInsets.symmetric(
            horizontal: spaceXL,
            vertical: spaceM,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusPill),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: purple,
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Icon Button
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          foregroundColor: purple,
        ),
      ),
      
      // Floating Action Button
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: magenta,
        foregroundColor: white,
        elevation: 6,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusPill),
        ),
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: space,
          vertical: spaceM,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusPill),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusPill),
          borderSide: BorderSide(color: lightPurple, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusPill),
          borderSide: const BorderSide(color: purple, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusPill),
          borderSide: BorderSide(color: Colors.red.shade400, width: 1),
        ),
        hintStyle: GoogleFonts.inter(
          color: textTertiary,
          fontSize: 14,
        ),
      ),
      
      // Bottom Navigation Bar
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: white,
        selectedItemColor: purple,
        unselectedItemColor: textTertiary,
        selectedLabelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.normal,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      
      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: lightPurple,
        labelStyle: GoogleFonts.inter(
          color: purple,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: spaceS,
          vertical: spaceXS,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusS),
        ),
      ),
      
      // Divider
      dividerTheme: DividerThemeData(
        color: lightPurple,
        thickness: 1,
        space: space,
      ),
      
      // Text Theme
      textTheme: textTheme,
    );
  }
}
