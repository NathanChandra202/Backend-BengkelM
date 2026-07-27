import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  void _sendLink() {
    setState(() => _sent = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) context.pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface),
            onPressed: () => context.pop(),
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: Theme.of(context).dividerTheme.color!),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          child: _sent ? _sentView() : _formView(),
        ),
      ),
    );
  }

  Widget _formView() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withAlpha(30),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.primaryColor.withAlpha(80)),
        ),
        child: const Icon(Icons.lock_reset_rounded, color: AppTheme.primaryColor, size: 28),
      ),
      const SizedBox(height: 24),
      Text(
        'Reset Password',
        style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface, letterSpacing: -0.5),
      ),
      const SizedBox(height: 8),
      Text(
        'Masukkan email kamu dan kami akan kirimkan link reset password.',
        style: GoogleFonts.outfit(fontSize: 14, color: (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight), height: 1.6),
      ),
      const SizedBox(height: 36),
      TextFormField(
        controller: _emailCtrl,
        keyboardType: TextInputType.emailAddress,
        style: GoogleFonts.outfit(color: Theme.of(context).colorScheme.onSurface, fontSize: 15),
        decoration: const InputDecoration(
          labelText: 'Alamat Email',
          hintText: 'nama@email.com',
          prefixIcon: Icon(Icons.email_outlined, size: 20),
          prefixIconConstraints: BoxConstraints(minWidth: 50),
        ),
      ),
      const SizedBox(height: 28),
      SizedBox(
        height: 50,
        child: ElevatedButton(
          onPressed: _sendLink,
          child: Text('Kirim Link Reset', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600)),
        ),
      ),
    ],
  );

  Widget _sentView() => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          color: const Color(0xFF22C55E).withAlpha(30),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF22C55E).withAlpha(80)),
        ),
        child: const Icon(Icons.check_rounded, color: Color(0xFF22C55E), size: 36),
      ),
      const SizedBox(height: 24),
      Text('Email Terkirim!', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      const SizedBox(height: 8),
      Text('Cek inbox kamu untuk link reset password.', style: GoogleFonts.outfit(color: (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight)), textAlign: TextAlign.center),
    ],
  );
}
