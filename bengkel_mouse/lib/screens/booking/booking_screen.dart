import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _brandCtrl   = TextEditingController();
  final _modelCtrl   = TextEditingController();
  final _detailsCtrl = TextEditingController();
  String? _selectedCategory;

  final _categories = const [
    'Double Clicking / Klik Ganda',
    'Scroll Wheel Bermasalah',
    'Sensor Loncat / Tidak Akurat',
    'Kabel Rusak / Paracord',
    'Deep Cleaning',
    'Mouse Wireless - Baterai',
    'Modifikasi Custom',
    'Lainnya',
  ];

  int _step = 0; // 0 = info mouse, 1 = detail, 2 = kirim

  @override
  void dispose() {
    _brandCtrl.dispose();
    _modelCtrl.dispose();
    _detailsCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    context.push('/orders');
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Booking Servis',
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
        body: Column(
          children: [
            _buildStepIndicator(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: _step == 0
                      ? _mouseInfoStep()
                      : _step == 1
                          ? _detailStep()
                          : _shipStep(),
                ),
              ),
            ),
            _buildNavButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    final steps = ['Info Mouse', 'Detail Keluhan', 'Cara Kirim'];
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        color: AppTheme.backgroundColor,
        border: const Border(bottom: BorderSide(color: AppTheme.borderColor)),
      ),
      child: Row(
        children: List.generate(steps.length, (i) {
          final done  = i < _step;
          final active = i == _step;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: done
                        ? AppTheme.primaryColor
                        : active
                            ? AppTheme.primaryColor.withAlpha(30)
                            : AppTheme.surfaceColor,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: done || active ? AppTheme.primaryColor : AppTheme.borderColor,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: done
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : Text(
                            '${i + 1}',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: active ? AppTheme.primaryColor : AppTheme.textMuted,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        steps[i],
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                          color: active ? AppTheme.textColor : AppTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                if (i < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 1,
                      color: i < _step ? AppTheme.primaryColor : AppTheme.borderColor,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _mouseInfoStep() {
    return Column(
      key: const ValueKey(0),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Informasi Mouse', 'Isi detail mouse yang mau diservis.'),
        const SizedBox(height: 24),
        _label('Brand Mouse'),
        const SizedBox(height: 8),
        TextFormField(
          controller: _brandCtrl,
          style: GoogleFonts.outfit(color: AppTheme.textColor, fontSize: 15),
          decoration: const InputDecoration(
            hintText: 'Logitech, Razer, Zowie, dsb.',
            prefixIcon: Icon(Icons.mouse_outlined, size: 20),
            prefixIconConstraints: BoxConstraints(minWidth: 50),
          ),
        ),
        const SizedBox(height: 18),
        _label('Tipe / Model Mouse'),
        const SizedBox(height: 8),
        TextFormField(
          controller: _modelCtrl,
          style: GoogleFonts.outfit(color: AppTheme.textColor, fontSize: 15),
          decoration: const InputDecoration(
            hintText: 'G Pro X Superlight, Viper Mini, EC2-A, dsb.',
            prefixIcon: Icon(Icons.settings_input_composite_outlined, size: 20),
            prefixIconConstraints: BoxConstraints(minWidth: 50),
          ),
        ),
        const SizedBox(height: 18),
        _label('Kategori Masalah'),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _selectedCategory,
          decoration: const InputDecoration(
            hintText: 'Pilih kategori...',
            prefixIcon: Icon(Icons.category_outlined, size: 20),
            prefixIconConstraints: BoxConstraints(minWidth: 50),
          ),
          dropdownColor: AppTheme.surfaceHighColor,
          style: GoogleFonts.outfit(color: AppTheme.textColor, fontSize: 14),
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
          onChanged: (v) => setState(() => _selectedCategory = v),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _detailStep() {
    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Detail Keluhan', 'Ceritain masalahnya secara detail biar teknisi kita siap.'),
        const SizedBox(height: 24),
        _label('Deskripsi Masalah'),
        const SizedBox(height: 8),
        TextFormField(
          controller: _detailsCtrl,
          maxLines: 5,
          style: GoogleFonts.outfit(color: AppTheme.textColor, fontSize: 15),
          decoration: const InputDecoration(
            hintText: 'Contoh: klik kiri sering double click saat diklik sekali, sudah terjadi sejak 2 minggu lalu...',
          ),
        ),
        const SizedBox(height: 20),
        _label('Foto Kondisi Mouse (Opsional)'),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: () {
            // TODO: image picker
          },
          child: Container(
            height: 130,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppTheme.surfaceColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.borderColor, style: BorderStyle.solid),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_photo_alternate_outlined, size: 34, color: AppTheme.textMuted),
                const SizedBox(height: 8),
                Text(
                  'Tambah foto dari kamera atau galeri',
                  style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 13),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _shipStep() {
    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Cara Pengiriman', 'Kirimkan mouse kamu ke alamat bengkel kami.'),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.surfaceColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.primaryColor.withAlpha(60)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: AppTheme.primaryColor, size: 20),
                  const SizedBox(width: 8),
                  Text('Alamat Bengkel', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppTheme.textColor, fontSize: 15)),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Jl. H. Hasan No.26, RT.3/RW.10, Baru,\nKec. Pasar Rebo, Jakarta Timur 13780',
                style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 14, height: 1.7),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _infoTile(Icons.local_shipping_outlined, 'GoSend / JNE / J&T / Antar Langsung', 'Ongkir ditanggung pelanggan.'),
        const SizedBox(height: 10),
        _infoTile(Icons.receipt_long_outlined, 'ID Booking', 'Tuliskan ID Booking di paket untuk memudahkan admin.'),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _submit,
            child: Text('Buat Booking', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _infoTile(IconData icon, String title, String sub) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.textMuted, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textColor)),
                Text(sub, style: GoogleFonts.outfit(fontSize: 12, color: AppTheme.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavButtons() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: AppTheme.backgroundColor,
        border: const Border(top: BorderSide(color: AppTheme.borderColor)),
      ),
      child: Row(
        children: [
          if (_step > 0)
            Expanded(
              child: SizedBox(
                height: 48,
                child: OutlinedButton(
                  onPressed: () => setState(() => _step--),
                  child: Text('Kembali', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
          if (_step > 0) const SizedBox(width: 12),
          if (_step < 2)
            Expanded(
              child: SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: () => setState(() => _step++),
                  child: Text('Lanjut', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, String sub) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textColor, letterSpacing: -0.5)),
        const SizedBox(height: 4),
        Text(sub, style: GoogleFonts.outfit(fontSize: 13, color: AppTheme.textMuted)),
      ],
    );
  }

  Widget _label(String t) => Text(t, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.textColor));
}
