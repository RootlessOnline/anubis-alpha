# Data-Over-Sound Setup - Quick Guide

## ✅ Virtual Environment Created

Your virtual environment is ready at: `~/sound-venv/`

## 🚀 Quick Start Commands

### 1. Send a Message
```bash
~/sound-venv/bin/python ~/download/simple_sound_sender.py "Hello World"
```

### 2. Start the Receiver (in another terminal)
```bash
~/sound-venv/bin/python ~/download/simple_sound_receiver.py
```

### 3. Interactive Mode (send multiple messages)
```bash
~/sound-venv/bin/python ~/download/simple_sound_sender.py -i
```

### 4. Test Tone (verify speaker works)
```bash
~/sound-venv/bin/python ~/download/simple_sound_sender.py -t 1000  # 1000Hz tone
```

## 📋 How It Works

```
SENDER                              RECEIVER
  │                                    │
  │ "Hello World"                      │
  │     ↓                              │
  │ Text → Bits → FSK Audio            │
  │     ↓                              │
  │ 🔊 ████████████████████ 🔊 ──────► │ Audio waves
  │                                    │ ↓
  │                                    │ FSK → Bits → Text
  │                                    │ "Hello World" ✅
```

## 🎛️ Technical Specs

| Setting | Value |
|---------|-------|
| Sample Rate | 44100 Hz |
| FSK Mark (1) | 1200 Hz |
| FSK Space (0) | 2200 Hz |
| Baud Rate | 300 bps |
| Range | ~1-2 meters (speaker to mic) |

## 🔧 For ABRAHAM Integration

Messages are formatted as:
```
ABRAHAM:TYPE:CONTENT
```

Example:
```bash
~/sound-venv/bin/python ~/download/simple_sound_sender.py "ABRAHAM:QUERY:What is consciousness?"
```

## ⚠️ Troubleshooting

### No audio devices found?
Check if PulseAudio/PipeWire is running:
```bash
pactl info
```

### Permission denied?
Make sure your user is in the `audio` group:
```bash
sudo usermod -a -G audio $USER
# Then logout and login again
```

### Install system audio dependencies (if needed):
```bash
sudo apt-get install libportaudio2 portaudio19-dev
```

## 📁 File Locations

- **Sender**: `/home/z/my-project/download/simple_sound_sender.py`
- **Receiver**: `/home/z/my-project/download/simple_sound_receiver.py`
- **Virtual Environment**: `~/sound-venv/`

---

*Part of the ROOTLESS / ABRAHAM project*
