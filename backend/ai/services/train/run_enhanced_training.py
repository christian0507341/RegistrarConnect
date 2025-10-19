#!/usr/bin/env python3
"""
Run Enhanced AI Training
This script runs the enhanced training with improved data and parameters.
"""

import os
import sys
import subprocess
import json
from datetime import datetime

def run_enhanced_training():
    """Run the enhanced training script."""
    print("Starting Enhanced AI Training")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    enhanced_training_script = os.path.join(script_dir, "enhanced_training.py")
    
    # Check if the enhanced training script exists
    if not os.path.exists(enhanced_training_script):
        print("ERROR: Enhanced training script not found!")
        return False
    
    try:
        # Run the enhanced training script
        print("Running enhanced training...")
        result = subprocess.run([
            sys.executable, enhanced_training_script
        ], cwd=script_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Enhanced training completed successfully!")
            print("\nTraining Output:")
            print(result.stdout)
            
            # Save training log
            log_file = os.path.join(script_dir, "training_log.txt")
            with open(log_file, "w", encoding="utf-8") as f:
                f.write(f"Enhanced Training Log - {datetime.now()}\n")
                f.write("=" * 50 + "\n")
                f.write(result.stdout)
                if result.stderr:
                    f.write("\nErrors:\n")
                    f.write(result.stderr)
            
            print(f"Training log saved to: {log_file}")
            return True
        else:
            print("Enhanced training failed!")
            print("Error output:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"Error running enhanced training: {e}")
        return False

def check_training_requirements():
    """Check if all requirements are met for training."""
    print("Checking training requirements...")
    
    required_files = [
        "enhanced_training_data.jsonl",
        "enhanced_training.py",
        "data/val.jsonl"
    ]
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    missing_files = []
    
    for file in required_files:
        file_path = os.path.join(script_dir, file)
        if not os.path.exists(file_path):
            missing_files.append(file)
    
    if missing_files:
        print(f"Missing required files: {missing_files}")
        return False
    
    print("All required files found!")
    return True

def main():
    """Main function to run enhanced training."""
    print("RegistrarConnect Enhanced AI Training")
    print("=" * 60)
    
    # Check requirements
    if not check_training_requirements():
        print("Training requirements not met!")
        return
    
    # Run enhanced training
    success = run_enhanced_training()
    
    if success:
        print("\nEnhanced training completed successfully!")
        print("Check the 'checkpoints' directory for trained models")
        print("Models are ready for deployment!")
    else:
        print("\nEnhanced training failed!")
        print("Please check the error messages above")

if __name__ == "__main__":
    main()
