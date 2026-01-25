import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/language_provider.dart';
import '../services/api_service.dart';
import '../services/search_service.dart';
import '../models/search_result.dart';
import '../widgets/content_card.dart';
import '../widgets/gurutattva_button.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<SearchResult> _results = [];
  bool _isLoading = false;
  String? _errorMessage;
  late SearchService _searchService;

  @override
  void initState() {
    super.initState();
    final apiService = Provider.of<ApiService>(context, listen: false);
    _searchService = SearchService(apiService: apiService);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final languageProvider = Provider.of<LanguageProvider>(context, listen: false);
      final results = await _searchService.search(
        query: query,
        language: languageProvider.currentLanguage,
      );

      setState(() {
        _results = results;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Search failed: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          languageProvider.currentLanguage == 'en' ? 'Search' : 'खोज',
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
        iconTheme: const IconThemeData(color: Colors.white),
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
        child: Column(
          children: [
            // Search Input
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: languageProvider.currentLanguage == 'en'
                            ? 'Search for teachings...'
                            : 'शिक्षाओं की खोज करें...',
                        hintStyle: GurutattvaTheme.bodyStyle.copyWith(
                          color: GurutattvaTheme.textSecondary,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
                          borderSide: BorderSide(color: GurutattvaTheme.primaryPurple),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
                          borderSide: BorderSide(color: GurutattvaTheme.surfaceLight),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
                          borderSide: BorderSide(
                            color: GurutattvaTheme.primaryPurple,
                            width: 2,
                          ),
                        ),
                        prefixIcon: Icon(
                          Icons.search,
                          color: GurutattvaTheme.primaryPurple,
                        ),
                        filled: true,
                        fillColor: GurutattvaTheme.backgroundLight,
                      ),
                      onSubmitted: (_) => _performSearch(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GurutattvaButton(
                    text: languageProvider.currentLanguage == 'en' ? 'Search' : 'खोज',
                    onPressed: _performSearch,
                    isLoading: _isLoading,
                    width: 100,
                    height: 56,
                  ),
                ],
              ),
            ),

            // Results
            Expanded(
              child: _buildResultsSection(languageProvider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsSection(LanguageProvider languageProvider) {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              color: GurutattvaTheme.primaryPurple,
            ),
            const SizedBox(height: 16),
            Text(
              languageProvider.currentLanguage == 'en'
                  ? 'Searching...'
                  : 'खोज रहे हैं...',
              style: GurutattvaTheme.bodyStyle.copyWith(
                color: GurutattvaTheme.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: GurutattvaTheme.accentMagenta,
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                style: GurutattvaTheme.bodyStyle,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (_results.isEmpty && _searchController.text.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.search_off,
                size: 64,
                color: GurutattvaTheme.textSecondary,
              ),
              const SizedBox(height: 16),
              Text(
                languageProvider.currentLanguage == 'en'
                    ? 'No results found'
                    : 'कोई परिणाम नहीं मिला',
                style: GurutattvaTheme.subheadingStyle,
              ),
            ],
          ),
        ),
      );
    }

    if (_results.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.search,
                size: 64,
                color: GurutattvaTheme.textSecondary,
              ),
              const SizedBox(height: 16),
              Text(
                languageProvider.currentLanguage == 'en'
                    ? 'Enter a search query to begin'
                    : 'खोज शुरू करने के लिए क्वेरी दर्ज करें',
                style: GurutattvaTheme.bodyStyle.copyWith(
                  color: GurutattvaTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _results.length,
      itemBuilder: (context, index) {
        final result = _results[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: ContentCard(
            title: result.filename,
            subtitle: result.text ?? '',
            thumbnailUrl: result.getThumbnailUrl('http://10.0.2.2:3000'),
            trailing: Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: GurutattvaTheme.textSecondary,
            ),
            onTap: () {
              // TODO: Navigate to detail view
            },
          ),
        );
      },
    );
  }
}
