#!/usr/bin/env python3
"""
GGWave Sender - Send data-over-sound messages
Install: pip install ggwave pyaudio
Run: python sender.py "your message"
"""

import ggwave
import pyaudio
import sys

if len(sys.argv) < 2:
    print("Usage: python sender.py \"your message\"")
    print("Example: python sender.py \"Hello World!\"")
    sys.exit(1)

message = sys.argv[1]

print("=" * 50)
print("  🔊 GGWAVE SENDER - Data Over Sound")
print("=" * 50)
print()
print(f"Message: {message}")
print(f"Length: {len(message)} bytes")
print()
print("Playing sound... (turn up your speakers!)")
print()

# Initialize
p = pyaudio.PyAudio()
ggwave_instance = ggwave.init()

# Generate waveform
waveform = ggwave.encode(ggwave_instance, message.encode())

# Play
stream = p.open(
    format=pyaudio.paFloat32,
    channels=1,
    rate=48000,
    output=True
)

stream.write(waveform.tobytes())

stream.stop_stream()
stream.close()
p.terminate()

print("✅ Done! Message sent via sound.")
