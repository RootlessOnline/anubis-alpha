# Data-Over-Sound Receiver Setup Guide

## What You Need
- PC with microphone (built-in or external)
- Python installed
- 5 minutes

---

## Method 1: GGWave (Recommended - Open Source)

### Step 1: Install Dependencies
```bash
# Ubuntu/Debian
sudo apt-get install portaudio19-dev

# macOS
brew install portaudio

# Windows - download from: https://www.portaudio.com/
```

### Step 2: Install GGWave
```bash
pip install ggwave
pip install pyaudio
```

### Step 3: Create Receiver Script
```python
# receiver.py
import ggwave
import pyaudio

# Initialize
p = pyaudio.PyAudio()
ggwave_instance = ggwave.init()

# Open microphone
stream = p.open(
    format=pyaudio.paFloat32,
    channels=1,
    rate=48000,
    input=True,
    frames_per_buffer=1024
)

print("🎧 Listening for data-over-sound messages...")
print("Press Ctrl+C to stop\n")

try:
    while True:
        # Read audio
        data = stream.read(1024, exception_on_overflow=False)
        
        # Try to decode
        result = ggwave.decode(ggwave_instance, data)
        
        if result:
            print(f"📨 Received: {result.decode('utf-8')}")
            
except KeyboardInterrupt:
    print("\n\nStopped listening")
    
finally:
    stream.stop_stream()
    stream.close()
    p.terminate()
```

### Step 4: Run It
```bash
python receiver.py
```

---

## Method 2: Simple FSK Decoder (From Scratch)

If GGWave doesn't work, here's a simple custom decoder:

```python
# simple_receiver.py
import numpy as np
import pyaudio
from collections import deque

# Settings
CHUNK = 1024
RATE = 44100
FREQ_LOW = 1000    # Hz for '0'
FREQ_HIGH = 2000   # Hz for '1'

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paFloat32, channels=1, rate=RATE, input=True, frames_per_buffer=CHUNK)

print("🎧 Listening... (Simple FSK mode)")

def detect_frequency(data):
    """Detect dominant frequency in audio chunk"""
    # FFT to find frequency
    fft = np.abs(np.fft.fft(data))
    freqs = np.fft.fftfreq(len(fft))
    
    # Find peak
    peak = np.argmax(fft[:len(fft)//2])
    freq = abs(freqs[peak] * RATE)
    
    return freq

buffer = deque(maxlen=100)

try:
    while True:
        data = np.frombuffer(stream.read(CHUNK), dtype=np.float32)
        freq = detect_frequency(data)
        
        # Classify as 0 or 1
        if freq > 1500:
            buffer.append('1')
        elif freq > 500 and freq < 1500:
            buffer.append('0')
        
        # Try to decode when we have enough bits
        if len(buffer) >= 8:
            bits = ''.join(list(buffer)[:8])
            char = chr(int(bits, 2))
            if 32 <= ord(char) <= 126:  # Printable ASCII
                print(f"Received: {char}", end='', flush=True)
            buffer.clear()
            
except KeyboardInterrupt:
    print("\n\nStopped")
    stream.close()
    p.terminate()
```

---

## Method 3: Use a Phone App as Sender

### Android/iOS Apps That Send Data Over Sound:
1. **GGWave Demo** (Android) - Free, open source
2. **Chirp** (iOS/Android) - Free tier available
3. **Sonic Share** - Simple file sharing

### How to Use:
1. Install app on phone
2. Run your Python receiver on PC
3. Type message in app and hit "Send"
4. Point phone speaker toward PC microphone
5. Message appears on PC!

---

## Quick Test

1. Open YouTube and search "ggwave test sound"
2. Play the video
3. Your receiver should pick it up

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No messages received | Check microphone permissions |
| Garbled output | Reduce background noise |
| Too quiet | Increase microphone sensitivity in OS settings |
| ImportError | `pip install --upgrade ggwave pyaudio` |

---

## How the Technology Works

```
┌────────────────────────────────────────────────────────┐
│                 FSK (Frequency Shift Keying)           │
├────────────────────────────────────────────────────────┤
│                                                        │
│   Binary:  1    0    1    1    0    0    1    0        │
│            │    │    │    │    │    │    │    │        │
│            ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼        │
│                                                        │
│   Audio:  ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐      │
│           ││   │    ││   ││   │    │    ││   │        │
│           ││   │    ││   ││   │    │    ││   │        │
│           └┘   └────┘┘   └┘   └────└────┘┘   └────    │
│                                                        │
│   Freq:  2kHz 1kHz 2kHz 2kHz 1kHz 1kHz 2kHz 1kHz      │
│                                                        │
│   = The "weird fax sound" you hear!                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Why Use This?

✅ **No WiFi/Bluetooth needed**
✅ **Works between any devices with speaker + mic**
✅ **Air-gapped security** (no network exposure)
✅ **Fun for offline communication**
✅ **Works through speakers/PA systems**

---

## File Location

This guide saved to:
`/home/z/my-project/download/Data_Over_Sound_Setup_Guide.md`

