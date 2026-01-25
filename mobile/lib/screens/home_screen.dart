import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../widgets/icon_card.dart';
import 'search_screen.dart';
import 'chat_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final languageProvider = Provider.of<LanguageProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Sadhak',
          style: GurutattvaTheme.headingStyle.copyWith(
            fontSize: 24,
            color: Colors.white,
          ),
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: GurutattvaTheme.primaryGradient,
          ),
        ),
        actions: [
          // Language Toggle
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
            ),
            child: Row(
              children: [
                _buildLanguageButton(
                  context,
                  'EN',
                  languageProvider.currentLanguage == 'en',
                  () => languageProvider.setLanguage('en'),
                ),
                _buildLanguageButton(
                  context,
                  'हिं',
                  languageProvider.currentLanguage == 'hi',
                  () => languageProvider.setLanguage('hi'),
                ),
              ],
            ),
          ),
          
          // User Menu
          PopupMenuButton<void>(
            icon: CircleAvatar(
              backgroundImage: user?.photoUrl != null
                  ? NetworkImage(user!.photoUrl!)
                  : null,
              backgroundColor: Colors.white,
              child: user?.photoUrl == null
                  ? Icon(Icons.person, color: GurutattvaTheme.primaryPurple)
                  : null,
            ),
            itemBuilder: (context) => [
              PopupMenuItem<void>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.displayName ?? 'User',
                      style: GurutattvaTheme.subheadingStyle,
                    ),
                    if (user?.email != null)
                      Text(
                        user!.email!,
                        style: GurutattvaTheme.bodyStyle.copyWith(
                          color: GurutattvaTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<void>(
                onTap: () => authProvider.signOut(),
                child: Row(
                  children: [
                    Icon(Icons.logout, color: GurutattvaTheme.primaryPurple),
                    const SizedBox(width: 12),
                    const Text('Sign Out'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              GurutattvaTheme.backgroundLight,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                
                // Welcome Message
                Text(
                  languageProvider.currentLanguage == 'en'
                      ? 'Welcome, ${user?.displayName?.split(' ').first ?? 'Seeker'}'
                      : 'स्वागत है, ${user?.displayName?.split(' ').first ?? 'साधक'}',
                  style: GurutattvaTheme.headingStyle.copyWith(fontSize: 32),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                
                Text(
                  languageProvider.currentLanguage == 'en'
                      ? 'Choose your path to spiritual wisdom'
                      : 'आध्यात्मिक ज्ञान के लिए अपना मार्ग चुनें',
                  style: GurutattvaTheme.bodyStyle.copyWith(
                    color: GurutattvaTheme.textSecondary,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 48),
                
                // Mode Selection Cards
                Expanded(
                  child: GridView.count(
                    crossAxisCount: MediaQuery.of(context).size.width > 600 ? 2 : 1,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: 1.2,
                    children: [
                      // Search Mode
                      IconCard(
                        icon: Icons.search,
                        iconGradient: LinearGradient(
                          colors: [
                            GurutattvaTheme.primaryPurple,
                            GurutattvaTheme.accentMagenta,
                          ],
                        ),
                        title: languageProvider.currentLanguage == 'en'
                            ? 'Search'
                            : 'खोज',
                        description: languageProvider.currentLanguage == 'en'
                            ? 'Find specific teachings and scriptures'
                            : 'विशिष्ट शिक्षाओं और ग्रंथों को खोजें',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const SearchScreen(),
                            ),
                          );
                        },
                      ),
                      
                      // AI Chat Mode
                      IconCard(
                        icon: Icons.chat_bubble_outline,
                        iconGradient: LinearGradient(
                          colors: [
                            GurutattvaTheme.accentMagenta,
                            GurutattvaTheme.accentPink,
                          ],
                        ),
                        title: languageProvider.currentLanguage == 'en'
                            ? 'AI Chat'
                            : 'AI चैट',
                        description: languageProvider.currentLanguage == 'en'
                            ? 'Have a conversation about spiritual topics'
                            : 'आध्यात्मिक विषयों पर बातचीत करें',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const ChatScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageButton(
    BuildContext context,
    String label,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
        ),
        child: Text(
          label,
          style: GurutattvaTheme.buttonTextStyle.copyWith(
            color: isSelected
                ? GurutattvaTheme.primaryPurple
                : Colors.white,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
