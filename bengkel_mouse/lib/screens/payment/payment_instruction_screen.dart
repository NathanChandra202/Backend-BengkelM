import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme.dart';

class PaymentInstructionScreen extends StatefulWidget {
  final String bookingId;
  const PaymentInstructionScreen({super.key, required this.bookingId});

  @override
  State<PaymentInstructionScreen> createState() => _PaymentInstructionScreenState();
}

class _PaymentInstructionScreenState extends State<PaymentInstructionScreen> {
  bool _proofUploaded = false;
  bool _submitting    = false;

  // Mock data
  static const int _baseAmount  = 150000;
  static const int _uniqueCode  = 45;
  static const int _totalAmount = _baseAmount + _uniqueCode;

  final _banks = const [
    _BankInfo('BCA', '1234567890', 'PT Bengkel Mouse Dua Enam'),
    _BankInfo('BRI', '0987654321', 'PT Bengkel Mouse Dua Enam'),
  ];

  Future<void> _submit() async {
    setState(() => _submitting = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _submitting = false);
      _showSuccessSheet();
    }
  }

  void _showSuccessSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(28, 24, 28, 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppTheme.statusDone.withAlpha(30),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.statusDone.withAlpha(80)),
              ),
              child: const Icon(Icons.check_rounded, color: AppTheme.statusDone, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              'Bukti Transfer Terkirim!',
              style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textColor),
            ),
            const SizedBox(height: 8),
            Text(
              'Admin kami akan memverifikasi pembayaran kamu.\nNotifikasi akan dikirim setelah disetujui.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 14, color: AppTheme.textMuted, height: 1.6),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  context.go('/home');
                },
                child: Text('Kembali ke Beranda', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Instruksi Pembayaran',
            style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textColor),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.textColor),
            onPressed: () => Navigator.of(context).pop(),
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: AppTheme.borderColor),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Total bill card
              _buildBillCard(),
              const SizedBox(height: 20),

              // Warning info
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.statusChecking.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.statusChecking.withAlpha(80)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded, color: AppTheme.statusChecking, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Transfer tepat Rp ${_formatRp(_totalAmount)} termasuk kode unik .$_uniqueCode di akhir. Ini membantu admin memverifikasi pembayaran kamu dengan cepat.',
                        style: GoogleFonts.outfit(fontSize: 12, color: AppTheme.statusChecking, height: 1.6),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Rincian
              Text(
                'Rincian Tagihan',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textColor),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderColor),
                ),
                child: Column(
                  children: [
                    _billRow('Jasa Ganti Switch (Kailh)', 'Rp 80.000'),
                    const SizedBox(height: 10),
                    _billRow('Part: Switch Kailh GM 8.0 (x2)', 'Rp 70.000'),
                    const SizedBox(height: 12),
                    Container(height: 1, color: AppTheme.borderColor),
                    const SizedBox(height: 12),
                    _billRow('Subtotal', 'Rp 150.000'),
                    const SizedBox(height: 6),
                    _billRow('Kode Unik', '+Rp $_uniqueCode', highlight: true),
                    const SizedBox(height: 12),
                    Container(height: 1, color: AppTheme.borderColor),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('TOTAL BAYAR', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textColor)),
                        Text(
                          'Rp ${_formatRp(_totalAmount)}',
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Bank accounts
              Text(
                'Rekening Tujuan',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textColor),
              ),
              const SizedBox(height: 12),
              ..._banks.map((b) => _buildBankCard(b)),

              const SizedBox(height: 24),

              // Upload proof
              Text(
                'Upload Bukti Transfer',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textColor),
              ),
              const SizedBox(height: 8),
              Text(
                'Upload foto struk transfer sebagai bukti pembayaran.',
                style: GoogleFonts.outfit(fontSize: 13, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () {
                  // TODO: image picker
                  setState(() => _proofUploaded = true);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 120,
                  decoration: BoxDecoration(
                    color: _proofUploaded
                        ? AppTheme.statusDone.withAlpha(20)
                        : AppTheme.surfaceColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _proofUploaded ? AppTheme.statusDone.withAlpha(120) : AppTheme.borderColor,
                      width: _proofUploaded ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _proofUploaded ? Icons.check_circle_outline_rounded : Icons.upload_file_outlined,
                        size: 36,
                        color: _proofUploaded ? AppTheme.statusDone : AppTheme.textMuted,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _proofUploaded ? 'Foto berhasil dipilih' : 'Tap untuk pilih foto struk',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: _proofUploaded ? AppTheme.statusDone : AppTheme.textMuted,
                          fontWeight: _proofUploaded ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          decoration: BoxDecoration(
            color: AppTheme.backgroundColor,
            border: const Border(top: BorderSide(color: AppTheme.borderColor)),
          ),
          child: SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _proofUploaded && !_submitting ? _submit : null,
              style: ElevatedButton.styleFrom(
                disabledBackgroundColor: AppTheme.surfaceHighColor,
                disabledForegroundColor: AppTheme.textMuted,
              ),
              child: _submitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      _proofUploaded ? 'Kirim Bukti Transfer' : 'Upload Bukti Dulu',
                      style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBillCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDark, AppTheme.primaryColor.withAlpha(180)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(40),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  widget.bookingId,
                  style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white70),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Total Pembayaran',
            style: GoogleFonts.outfit(fontSize: 13, color: Colors.white70),
          ),
          const SizedBox(height: 6),
          Text(
            'Rp ${_formatRp(_totalAmount)}',
            style: GoogleFonts.outfit(
              fontSize: 38,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Termasuk kode unik: .$_uniqueCode',
            style: GoogleFonts.outfit(fontSize: 13, color: Colors.white60),
          ),
        ],
      ),
    );
  }

  Widget _buildBankCard(_BankInfo bank) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.surfaceHighColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                bank.name,
                style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textColor),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(bank.accountNumber, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.textColor, letterSpacing: 1.2)),
                Text('a.n. ${bank.accountName}', style: GoogleFonts.outfit(fontSize: 12, color: AppTheme.textMuted)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: bank.accountNumber));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Nomor rekening disalin!', style: GoogleFonts.outfit())),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.primaryColor.withAlpha(80)),
              ),
              child: Text(
                'Salin',
                style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryColor),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _billRow(String label, String value, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.outfit(fontSize: 13, color: AppTheme.textMuted)),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: highlight ? FontWeight.w600 : FontWeight.w500,
            color: highlight ? AppTheme.primaryColor : AppTheme.textColor,
          ),
        ),
      ],
    );
  }

  String _formatRp(int amount) {
    final s = amount.toString();
    final result = StringBuffer();
    int count = 0;
    for (int i = s.length - 1; i >= 0; i--) {
      result.write(s[i]);
      count++;
      if (count % 3 == 0 && i != 0) result.write('.');
    }
    return result.toString().split('').reversed.join();
  }
}

class _BankInfo {
  final String name, accountNumber, accountName;
  const _BankInfo(this.name, this.accountNumber, this.accountName);
}
