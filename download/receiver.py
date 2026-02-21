#!/usr/bin/env python3
"""
GGWave Receiver - Listen for data-over-sound messages
Install: pip install ggwave pyaudio
Run: python receiver.py
"""

import ggwave
import pyaudio
import sys

print("=" * 50)
print("  🎧 GGWAVE RECEIVER - Data Over Sound")
print("=" * 50)
print()

# Initialize PyAudio
p = pyaudio.PyAudio()

# List available microphones
print("Available microphones:")
for i in range(p.get_device_count()):
    dev = p.get_device_info_by_index(i)
    if dev['maxInputChannels'] > 0:
        default = " (DEFAULT)" if i == p.get_default_input_device_info()['index'] else ""
        print(f"  [{i}] {dev['name']}{default}")
print()

# Initialize GGWave
ggwave_instance = ggwave.init()

# Open microphone stream
try:
    stream = p.open(
        format=pyaudio.paFloat32,
        channels=1,
        rate=48000,
        input=True,
        frames_per_buffer=1024
    )
except Exception as e:
    print(f"❌ Error opening microphone: {e}")
    print("\nTry: sudo apt-get install portaudio19-dev")
    print("Then: pip install pyaudio --upgrade")
    sys.exit(1)

print("🎧 Listening for messages...")
print("   (Play a GGWave sound from phone/YouTube to test)")
print("   Press Ctrl+C to stop\n")
print("-" * 50)

received_messages = []

try:
    while True:
        # Read audio chunk
        data = stream.read(1024, exception_on_overflow=False)
        
        # Try to decode
        result = ggwave.decode(ggwave_instance, data)
        
        if result:
            msg = result.decode('utf-8', errors='replace')
            print(f"\n📨 [{len(received_messages)+1}] Received: {msg}")
            print("-" * 50)
            received_messages.append(msg)
            
except KeyboardInterrupt:
    print("\n\n" + "=" * 50)
    print("  Session ended")
    if received_messages:
        print(f"  Total messages received: {len(received_messages)}")
    print("=" * 50)
    
finally:
    stream.stop_stream()
    stream.close()
    p.terminate()
