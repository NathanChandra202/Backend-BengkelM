import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme.dart';

class TrackingDetailScreen extends StatelessWidget {
  final String bookingId;
  const TrackingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    // Mock current status index
    const currentStep = 2; // WAITING_PAYMENT

    final steps = [
      _TrackStep('Menunggu Paket', 'Booking dibuat. Kirimkan mouse kamu ke bengkel kami.', AppTheme.statusWaiting, Icons.local_shipping_outlined, '20 Jul, 10:00'),
      _TrackStep('Pengecekan', 'Mouse diterima dan sedang dicek oleh teknisi.', AppTheme.statusChecking, Icons.search_outlined, '21 Jul, 09:30'),
      _TrackStep('Menunggu Pembayaran', 'Estimasi biaya sudah dikirim. Mohon lakukan transfer.', AppTheme.statusPayment, Icons.payment_outlined, '21 Jul, 11:00'),
      _TrackStep('Review Pembayaran', 'Bukti transfer sedang diverifikasi admin.', AppTheme.statusReview, Icons.verified_outlined, null),
      _TrackStep('Sedang Diperbaiki', 'Teknisi sedang mengerjakan mouse kamu.', AppTheme.statusRepairing, Icons.build_outlined, null),
      _TrackStep('Testing & QC', 'Mouse sedang diuji sebelum dikirim balik.', AppTheme.statusQC, Icons.science_outlined, null),
      _TrackStep('Selesai', 'Mouse sudah beres dan dikirim kembali ke kamu.', AppTheme.statusDone, Icons.check_circle_outline_rounded, null),
    ];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            bookingId,
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface, letterSpacing: 0.3),
          ),
          leading: IconButton(
            icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface),
            onPressed: () => Navigator.of(context).pop(),
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.share_outlined, color: Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight),
              onPressed: () {},
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: Theme.of(context).dividerTheme.color!),
          ),
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Mouse info card
              _buildMouseCard(context),
              // If waiting payment, show payment banner
              if (currentStep == 2) _buildPaymentBanner(context),
              // Timeline
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
                child: Text(
                  'Riwayat Status',
                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface),
                ),
              ),
              _buildTimeline(context, steps, currentStep),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMouseCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerTheme.color!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.primaryColor.withAlpha(60)),
                ),
                child: const Icon(Icons.mouse_outlined, color: AppTheme.primaryColor, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Logitech G Pro X Superlight',
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface),
                    ),
                    Text(
                      'Double Click / Klik Ganda',
                      style: GoogleFonts.outfit(fontSize: 13, color: (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(height: 1, color: Theme.of(context).dividerTheme.color!),
          const SizedBox(height: 14),
          _buildInfoRow(context, 'Status Saat Ini', 'Menunggu Pembayaran', AppTheme.statusPayment),
          const SizedBox(height: 8),
          _buildInfoRow(context, 'Tanggal Booking', '21 Jul 2026', (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight)),
          const SizedBox(height: 8),
          _buildInfoRow(context, 'Estimasi Selesai', '1–3 Hari Kerja', (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight)),
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.outfit(fontSize: 13, color: (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight))),
        Text(
          value,
          style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor),
        ),
      ],
    );
  }

  Widget _buildPaymentBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDark, AppTheme.primaryColor.withAlpha(200)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(Icons.payment_rounded, color: Colors.white, size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tagihan Menunggu Pembayaran',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 14),
                ),
                Text(
                  'Transfer sesuai nominal + kode unik.',
                  style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => context.push('/payment/$bookingId'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(40),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.white.withAlpha(80)),
              ),
              child: Text(
                'Bayar →',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline(BuildContext context, List<_TrackStep> steps, int currentStep) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: List.generate(steps.length, (i) {
          final isDone    = i < currentStep;
          final isCurrent = i == currentStep;
          final isPending = i > currentStep;
          final step      = steps[i];
          final color     = isDone || isCurrent ? step.color : (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight).withAlpha(80);

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left: dot + line
              Column(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isPending ? Theme.of(context).colorScheme.surface : color.withAlpha(30),
                      shape: BoxShape.circle,
                      border: Border.all(color: isPending ? Theme.of(context).dividerTheme.color! : color, width: 1.5),
                    ),
                    child: Center(
                      child: isDone
                          ? Icon(Icons.check_rounded, size: 18, color: color)
                          : Icon(step.icon, size: 18, color: isPending ? (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight).withAlpha(100) : color),
                    ),
                  ),
                  if (i < steps.length - 1)
                    Container(
                      width: 2,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: isDone
                              ? [color.withAlpha(120), color.withAlpha(40)]
                              : [Theme.of(context).dividerTheme.color!, Theme.of(context).dividerTheme.color!],
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 16),
              // Right: content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 6, bottom: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              step.label,
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                                color: isPending ? (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight).withAlpha(120) : Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                          ),
                          if (step.time != null)
                            Text(
                              step.time!,
                              style: GoogleFonts.outfit(fontSize: 11, color: (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        step.note,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: isPending ? (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight).withAlpha(100) : (Theme.of(context).brightness == Brightness.dark ? AppTheme.textMuted : AppTheme.textMutedLight),
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}

class _TrackStep {
  final String label, note;
  final Color color;
  final IconData icon;
  final String? time;
  _TrackStep(this.label, this.note, this.color, this.icon, this.time);
}
