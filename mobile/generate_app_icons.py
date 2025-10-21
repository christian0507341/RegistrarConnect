#!/usr/bin/env python3
"""
Generate app icons from logo for Flutter mobile app
This script creates all required icon sizes for Android and iOS
"""

import os
from PIL import Image

def generate_icons():
    """Generate app icons from logo"""
    
    # Source logo path
    logo_path = "assets/images/logo.png"
    
    if not os.path.exists(logo_path):
        print(f"❌ Logo not found at {logo_path}")
        return
    
    print(f"📱 Generating app icons from {logo_path}")
    
    try:
        # Open the logo
        logo = Image.open(logo_path)
        print(f"✅ Logo loaded: {logo.size}")
        
        # Convert to RGBA if needed
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Icon sizes for different platforms
        icon_sizes = {
            # Android
            'android/app/src/main/res/mipmap-mdpi/ic_launcher.png': 48,
            'android/app/src/main/res/mipmap-hdpi/ic_launcher.png': 72,
            'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png': 96,
            'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png': 144,
            'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png': 192,
            
            # iOS
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png': 20,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png': 40,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png': 60,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png': 29,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png': 58,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png': 87,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png': 40,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png': 80,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png': 120,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png': 120,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png': 180,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png': 76,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png': 152,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png': 167,
            'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png': 1024,
            
            # Web
            'web/icons/Icon-192.png': 192,
            'web/icons/Icon-512.png': 512,
            'web/icons/Icon-maskable-192.png': 192,
            'web/icons/Icon-maskable-512.png': 512,
            'web/favicon.png': 16,
            
            # Assets
            'assets/icons/icon.png': 512,
        }
        
        # Generate each icon size
        generated_count = 0
        for path, size in icon_sizes.items():
            try:
                # Create directory if it doesn't exist
                dir_path = os.path.dirname(path)
                if dir_path and not os.path.exists(dir_path):
                    os.makedirs(dir_path, exist_ok=True)
                
                # Resize logo to icon size
                icon = logo.resize((size, size), Image.Resampling.LANCZOS)
                
                # Save icon
                icon.save(path, 'PNG')
                generated_count += 1
                print(f"✅ Generated {path} ({size}x{size})")
                
            except Exception as e:
                print(f"⚠️ Error generating {path}: {e}")
        
        print(f"\n🎉 Successfully generated {generated_count} icon files!")
        print("\n📝 Next steps:")
        print("1. The icons have been generated in all required sizes")
        print("2. For Android, the icons are in android/app/src/main/res/mipmap-*/")
        print("3. For iOS, the icons are in ios/Runner/Assets.xcassets/AppIcon.appiconset/")
        print("4. Rebuild your app to see the new icon!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("1. Pillow is installed: pip install Pillow")
        print("2. Your logo.png exists in assets/images/")
        print("3. The logo is a valid PNG file")

if __name__ == "__main__":
    print("🎨 App Icon Generator")
    print("=" * 50)
    generate_icons()

