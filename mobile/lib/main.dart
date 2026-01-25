import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SadhakApp());
}

class SadhakApp extends StatelessWidget {
  const SadhakApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize services
    final apiService = ApiService();
    final authService = AuthService(apiService: apiService);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: authService)..initialize(),
        ),
        ChangeNotifierProvider(
          create: (_) => LanguageProvider(),
        ),
        // Provide services for dependency injection
        Provider.value(value: apiService),
        Provider.value(value: authService),
      ],
      child: MaterialApp(
        title: 'Sadhak',
        debugShowCheckedModeBanner: false,
        theme: GurutattvaTheme.lightTheme,
        home: const AuthWrapper(),
      ),
    );
  }
}

/// Auth Wrapper
/// 
/// Determines whether to show login screen or home screen based on auth state

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // Show loading indicator while checking auth status
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // Show home screen if authenticated, otherwise show login
        return authProvider.isAuthenticated
            ? const HomeScreen()
            : const LoginScreen();
      },
    );
  }
}
