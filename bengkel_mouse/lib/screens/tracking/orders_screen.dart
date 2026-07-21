import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        appBar: AppBar(
          title: Text('Pesanan Saya', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textColor)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.textColor),
            onPressed: () => Navigator.of(context).pop(),
          ),
          bottom: TabBar(
            controller: _tabController,
            indicatorColor: AppTheme.primaryColor,
            indicatorWeight: 2,
            labelColor: AppTheme.primaryColor,
            unselectedLabelColor: AppTheme.textMuted,
            labelStyle: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600),
            unselectedLabelStyle: GoogleFonts.outfit(fontSize: 13),
            dividerColor: AppTheme.borderColor,
            tabs: const [
              Tab(text: 'Aktif'),
              Tab(text: 'Selesai'),
              Tab(text: 'Semua'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildOrderList(_activeOrders),
            _buildOrderList(_completedOrders),
            _buildOrderList([..._activeOrders, ..._completedOrders]),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderList(List<_Order> orders) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 56, color: AppTheme.textMuted.withAlpha(100)),
            const SizedBox(height: 12),
            Text('Belum ada pesanan', style: GoogleFonts.outfit(color: AppTheme.textMuted, fontSize: 15)),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      itemCount: orders.length,
      separatorBuilder: (context, index) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) => _buildOrderCard(ctx, orders[i]),
    );
  }

  Widget _buildOrderCard(BuildContext ctx, _Order o) {
    return GestureDetector(
      onTap: () => ctx.push('/tracking/${o.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  o.id,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textMuted,
                    letterSpacing: 0.5,
                  ),
                ),
                const Spacer(),
                _statusBadge(o.status, o.statusColor),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(9),
                    border: Border.all(color: AppTheme.primaryColor.withAlpha(50)),
                  ),
                  child: const Icon(Icons.mouse_outlined, size: 20, color: AppTheme.primaryColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        o.mouseName,
                        style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textColor),
                      ),
                      Text(
                        o.issue,
                        style: GoogleFonts.outfit(fontSize: 12, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Container(height: 1, color: AppTheme.borderColor),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today_outlined, size: 12, color: AppTheme.textMuted),
                const SizedBox(width: 5),
                Text(o.date, style: GoogleFonts.outfit(fontSize: 12, color: AppTheme.textMuted)),
                const Spacer(),
                Text(
                  'Lihat Detail →',
                  style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryColor),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(35),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }

  final _activeOrders = [
    _Order('ORD-2026-001', 'Logitech G Pro X Superlight', 'Double Click', 'SEDANG DIPERBAIKI', AppTheme.statusRepairing, '21 Jul 2026'),
    _Order('ORD-2026-002', 'Razer Viper Mini', 'Scroll Wheel', 'MENUNGGU BAYAR', AppTheme.statusPayment, '20 Jul 2026'),
  ];

  final _completedOrders = [
    _Order('ORD-2026-000', 'Zowie EC2-A', 'Ganti Kabel Paracord', 'SELESAI', AppTheme.statusDone, '15 Jul 2026'),
  ];
}

class _Order {
  final String id, mouseName, issue, status, date;
  final Color statusColor;
  _Order(this.id, this.mouseName, this.issue, this.status, this.statusColor, this.date);
}
