#!/bin/bash
# Setup script for data-over-sound
# Run this once to install everything

echo "Setting up Data-Over-Sound..."

# Create virtual environment
python3 -m venv ~/sound-venv

# Install packages
~/sound-venv/bin/pip install numpy scipy sounddevice

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the receiver:"
echo "  ~/sound-venv/bin/python ~/Documents/FUture/simple_sound_receiver.py"
echo ""
echo "To send a message:"
echo "  ~/sound-venv/bin/python ~/Documents/FUture/simple_sound_sender.py 'Hello World'"
