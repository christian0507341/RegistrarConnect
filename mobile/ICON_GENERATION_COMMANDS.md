# 🎨 Icon Generation - Quick Commands

## ✅ Updated for Flutter 3.8+ / Dart 3.8+

### 🚀 Complete Command (Copy & Paste)

```bash
cd mobile && flutter pub get && dart run flutter_launcher_icons && flutter run
```

---

## 📝 Step-by-Step

### 1. Navigate to mobile folder
```bash
cd mobile
```

### 2. Get packages (first time or after updating pubspec.yaml)
```bash
flutter pub get
```

### 3. Generate icons from logo
```bash
dart run flutter_launcher_icons
```

### 4. Run your app
```bash
flutter run
```

---

## 🔄 Full Clean & Regenerate

If icons aren't showing or you want a fresh start:

```bash
cd mobile
flutter clean
flutter pub get
dart run flutter_launcher_icons
flutter run
```

---

## 📱 Platform-Specific Builds

### Android APK
```bash
dart run flutter_launcher_icons
flutter build apk
```

### iOS Build
```bash
dart run flutter_launcher_icons
flutter build ios
```

### Web Build
```bash
dart run flutter_launcher_icons
flutter build web
```

---

## 🛠️ Using Scripts

### Windows
```bash
cd mobile
generate_icons.bat
```

### Mac/Linux
```bash
cd mobile
chmod +x generate_icons.sh
./generate_icons.sh
```

---

## ⚠️ Important Notes

- **Use `dart run` NOT `flutter pub run`** (old command deprecated)
- **Package version**: flutter_launcher_icons: ^0.14.1
- **Logo location**: `assets/images/logo.png`
- **Recommended logo size**: 1024x1024 pixels

---

## 🎯 What This Does

✅ Generates Android icons (all densities)
✅ Generates iOS icons (all sizes)
✅ Generates Web icons (favicon + PWA)
✅ Generates Windows icons
✅ Uses your logo from `assets/images/logo.png`

---

## 🚨 Troubleshooting

### Error: "Could not find bin\flutter_launcher_icons.dart"
**Solution:** Use `dart run` instead of `flutter pub run`

### Icons not showing
**Solution:** 
```bash
flutter clean
flutter pub get
dart run flutter_launcher_icons
flutter run
```

### Package not found
**Solution:**
```bash
flutter pub cache repair
flutter pub get
dart run flutter_launcher_icons
```

---

**🎉 That's all you need! Your logo is now your app icon!**
