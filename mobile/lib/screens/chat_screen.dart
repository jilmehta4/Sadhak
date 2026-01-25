import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/language_provider.dart';
import '../services/api_service.dart';
import '../services/chat_service.dart';
import '../models/chat_message.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  late ChatService _chatService;

  @override
  void initState() {
    super.initState();
    final apiService = Provider.of<ApiService>(context, listen: false);
    _chatService = ChatService(apiService: apiService);
    _loadChatHistory();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadChatHistory() async {
    // Chat history loading not implemented yet
    // User will start with fresh conversation
  }

  Future<void> _sendMessage() async {
    final messageText = _messageController.text.trim();
    if (messageText.isEmpty || _isLoading) return;

    // Add user message
    final userMessage = ChatMessage.user(messageText);
    setState(() {
      _messages.add(userMessage);
      _messageController.clear();
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      final languageProvider = Provider.of<LanguageProvider>(context, listen: false);
      final response = await _chatService.sendMessage(
        message: messageText,
        language: languageProvider.currentLanguage,
      );

      setState(() {
        _messages.add(response);
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage.ai(
          'Sorry, I encountered an error. Please try again.',
        ));
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          languageProvider.currentLanguage == 'en' ? 'AI Chat' : 'AI चैट',
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
            // Messages List
            Expanded(
              child: _messages.isEmpty
                  ? _buildEmptyState(languageProvider)
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16.0),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        return _buildMessageBubble(_messages[index]);
                      },
                    ),
            ),

            // Loading Indicator
            if (_isLoading)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: GurutattvaTheme.primaryPurple,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      languageProvider.currentLanguage == 'en'
                          ? 'Thinking...'
                          : 'सोच रहे हैं...',
                      style: GurutattvaTheme.bodyStyle.copyWith(
                        color: GurutattvaTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

            // Message Input
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        decoration: InputDecoration(
                          hintText: languageProvider.currentLanguage == 'en'
                              ? 'Ask a question...'
                              : 'एक प्रश्न पूछें...',
                          hintStyle: GurutattvaTheme.bodyStyle.copyWith(
                            color: GurutattvaTheme.textSecondary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
                            borderSide: BorderSide(color: GurutattvaTheme.primaryPurple),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
                            borderSide: BorderSide(color: GurutattvaTheme.surfaceLight),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
                            borderSide: BorderSide(
                              color: GurutattvaTheme.primaryPurple,
                              width: 2,
                            ),
                          ),
                          filled: true,
                          fillColor: GurutattvaTheme.backgroundLight,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 16,
                          ),
                        ),
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: GurutattvaTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
                        boxShadow: [
                          BoxShadow(
                            color: GurutattvaTheme.primaryPurple.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _sendMessage,
                          borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
                          child: const Icon(
                            Icons.send,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(LanguageProvider languageProvider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: GurutattvaTheme.primaryGradient,
                borderRadius: BorderRadius.circular(GurutattvaTheme.radiusLarge),
              ),
              child: const Icon(
                Icons.chat_bubble_outline,
                size: 50,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              languageProvider.currentLanguage == 'en'
                  ? 'Start a Conversation'
                  : 'बातचीत शुरू करें',
              style: GurutattvaTheme.headingStyle.copyWith(fontSize: 24),
            ),
            const SizedBox(height: 12),
            Text(
              languageProvider.currentLanguage == 'en'
                  ? 'Ask me anything about spiritual teachings'
                  : 'मुझसे आध्यात्मिक शिक्षाओं के बारे में कुछ भी पूछें',
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

  Widget _buildMessageBubble(ChatMessage message) {
    final isUser = message.isUser;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: GurutattvaTheme.primaryGradient,
                borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
              ),
              child: const Icon(
                Icons.psychology,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                gradient: isUser
                    ? GurutattvaTheme.primaryGradient
                    : null,
                color: isUser ? null : Colors.white,
                borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.content,
                    style: GurutattvaTheme.bodyStyle.copyWith(
                      color: isUser ? Colors.white : GurutattvaTheme.textPrimary,
                    ),
                  ),
                  if (message.sources != null && message.sources!.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Divider(),
                    const SizedBox(height: 8),
                    Text(
                      'Sources:',
                      style: GurutattvaTheme.bodyStyle.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: GurutattvaTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    ...message.sources!.map((source) => Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            '• $source',
                            style: GurutattvaTheme.bodyStyle.copyWith(
                              fontSize: 12,
                              color: GurutattvaTheme.textSecondary,
                            ),
                          ),
                        )),
                  ],
                ],
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 12),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: GurutattvaTheme.surfaceLight,
                borderRadius: BorderRadius.circular(GurutattvaTheme.radiusMedium),
              ),
              child: Icon(
                Icons.person,
                color: GurutattvaTheme.primaryPurple,
                size: 24,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
