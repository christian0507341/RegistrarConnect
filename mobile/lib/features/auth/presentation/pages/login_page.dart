import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_state.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool obscureText = true;
  bool rememberMe = false;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    final email = emailController.text.trim();
    final password = passwordController.text;
    if (email.isEmpty || password.isEmpty) return;

    context.read<AuthBloc>().add(
          LoginRequested(role: 'student', email: email, password: password),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is AuthError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
            if (state is AuthAuthenticated) {
              Navigator.of(context).pushReplacementNamed('/chat');
            }
          },
          builder: (context, state) {
            final loading = state is AuthLoading;

            return Container(
              width: double.infinity,
              height: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFB0C4DE), Color(0xFFE6ECF5)], // light blue gradient
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // 🔹 Logo
                      Image.asset(
                        "assets/images/logo.png",
                        width: 120,
                        height: 120,
                      ),
                      const SizedBox(height: 20),

                      // 🔹 White card
                      Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 32),
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                const Text(
                                  "Log in",
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 25),

                                // Email
                                TextField(
                                  controller: emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: const InputDecoration(
                                    prefixIcon: Icon(Icons.email_outlined),
                                    hintText: "Email",
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                                const SizedBox(height: 15),

                                // Password
                                TextField(
                                  controller: passwordController,
                                  obscureText: obscureText,
                                  decoration: InputDecoration(
                                    prefixIcon: const Icon(Icons.lock_outline),
                                    hintText: "Password",
                                    border: const OutlineInputBorder(),
                                    suffixIcon: IconButton(
                                      icon: Icon(obscureText
                                          ? Icons.visibility
                                          : Icons.visibility_off),
                                      onPressed: () =>
                                          setState(() => obscureText = !obscureText),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),

                                // Remember Me + Forgot
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Checkbox(
                                          value: rememberMe,
                                          onChanged: (val) {
                                            setState(() =>
                                                rememberMe = val ?? false);
                                          },
                                        ),
                                        const Text("Remember Me"),
                                      ],
                                    ),
                                    TextButton(
                                      onPressed: () {},
                                      child: const Text("Forgot Password?"),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),

                                // Login button
                                SizedBox(
                                  width: double.infinity,
                                  height: 45,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blueGrey[300],
                                    ),
                                    onPressed: loading ? null : _submit,
                                    child: Text(
                                      loading ? "Signing in…" : "Log in",
                                      style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // Debug button
                                SizedBox(
                                  width: double.infinity,
                                  height: 45,
                                  child: OutlinedButton(
                                    onPressed: () {
                                      Navigator.pushReplacementNamed(
                                          context, '/home');
                                    },
                                    child: const Text(
                                      "Skip to Home (Debug)",
                                      style: TextStyle(color: Colors.blue),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // Register
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Text("Don’t Have an Account? "),
                                    GestureDetector(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (context) =>
                                                  const RegisterPage()),
                                        );
                                      },
                                      child: const Text(
                                        "Register",
                                        style: TextStyle(
                                          color: Colors.blue,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
