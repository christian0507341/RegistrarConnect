import 'package:flutter/material.dart';

class StatusCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? buttonLabel;
  final IconData icon;

  const StatusCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.buttonLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (buttonLabel != null) ...[
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () {},
                child: Text(buttonLabel!),
              ),
            ],
            const SizedBox(height: 8),
            Icon(icon, color: Colors.green),
          ],
        ),
      ),
    );
  }
}
