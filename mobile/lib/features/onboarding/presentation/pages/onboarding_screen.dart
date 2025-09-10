import 'package:flutter/material.dart';
import '../../../auth/presentation/pages/login_page.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative circles
            Positioned(
              top: -40,
              left: -40,
              child: _circle(120),
            ),
            Positioned(
              bottom: -30,
              left: -30,
              child: _circle(100),
            ),
            Positioned(
              bottom: -40,
              right: -40,
              child: _circle(140),
            ),

            // Content
            Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(height: 40),

                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // ✅ Logo
                      SizedBox(
                        width: 200,
                        height: 200,
                        child: Image.asset(
                          "assets/images/logo.png", // 🔄 replace with your asset
                          fit: BoxFit.contain,
                        ),
                      ),

                      const SizedBox(height: 30),

                      // ✅ Illustration
                      SizedBox(
                        width: 200,
                        height: 200,
                        child: Image.asset(
                          "assets/images/illustration.png", // 🔄 replace with your asset
                          fit: BoxFit.contain,
                        ),
                      ),

                      const SizedBox(height: 20),

                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24.0),
                        child: Text(
                          "Feeling lazy? Let the A.I do the work for you.",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // ✅ Bottom Section
                Column(
                  children: [
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 40, vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: () {
                        // Go to login page
                        Navigator.pushReplacementNamed(context, '/login');
                      },
                      child: const Text(
                        "Get Started",
                        style: TextStyle(fontSize: 16, color: Colors.white),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Page indicators
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _dot(true),
                        const SizedBox(width: 8),
                        _dot(false),
                        const SizedBox(width: 8),
                        _dot(false),
                      ],
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _circle(double size) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: Color(0xFF4CAF50),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _dot(bool isActive) {
    return Container(
      width: isActive ? 12 : 8,
      height: isActive ? 12 : 8,
      decoration: BoxDecoration(
        color: isActive ? Colors.green : Colors.grey,
        shape: BoxShape.circle,
      ),
    );
  }
}
