#!/usr/bin/env python3
"""
Simple Sound Data Receiver - FSK Demodulation
Listens for audio signals and decodes them into text/messages.
Works like a simple modem/fax receiver.

Location: ~/Documents/FUture/simple_sound_receiver.py

Usage:
    ~/sound-venv/bin/python ~/Documents/FUture/simple_sound_receiver.py
"""

import numpy as np
import sounddevice as sd
from scipy import signal
from collections import deque
import time

# Audio settings
SAMPLE_RATE = 44100
CHUNK_SIZE = 4096
CHANNELS = 1

# FSK Settings (Frequency Shift Keying)
# We use two frequencies like old modems
FREQ_MARK = 1200      # '1' bit frequency (Hz)
FREQ_SPACE = 2200     # '0' bit frequency (Hz)
BAUD_RATE = 300       # Bits per second (slow but reliable)
THRESHOLD = 0.01      # Minimum amplitude to detect

# Start/End markers
START_MARKER = b'\x7F'  # DEL character as start
END_MARKER = b'\x7E'    # ~ character as end


class SoundReceiver:
    def __init__(self):
        self.buffer = deque(maxlen=SAMPLE_RATE * 2)  # 2 second buffer
        self.receiving = False
        self.bit_buffer = []
        self.byte_buffer = bytearray()
        
    def detect_frequency(self, samples, target_freq):
        """Detect if a specific frequency is present in samples using Goertzel algorithm"""
        n = len(samples)
        k = int(0.5 + n * target_freq / SAMPLE_RATE)
        w = 2 * np.pi * k / n
        coeff = 2 * np.cos(w)
        
        s0, s1, s2 = 0.0, 0.0, 0.0
        for sample in samples:
            s0 = sample + coeff * s1 - s2
            s2 = s1
            s1 = s0
            
        power = s1*s1 + s2*s2 - coeff*s1*s2
        return power
    
    def decode_bit(self, samples):
        """Determine if the current sample contains a 0 or 1 bit"""
        # Get power at mark and space frequencies
        mark_power = self.detect_frequency(samples, FREQ_MARK)
        space_power = self.detect_frequency(samples, FREQ_SPACE)
        
        total_power = mark_power + space_power
        
        if total_power < THRESHOLD * n * 1000:  # Too quiet
            return None
            
        return 1 if mark_power > space_power else 0
    
    def process_audio(self, indata, frames, time_info, status):
        """Process incoming audio chunks"""
        samples = indata[:, 0]  # Get mono channel
        self.buffer.extend(samples)
        
        # Calculate samples per bit
        samples_per_bit = int(SAMPLE_RATE / BAUD_RATE)
        
        if len(self.buffer) >= samples_per_bit:
            # Get a chunk of samples for one bit period
            bit_samples = np.array(list(self.buffer))[-samples_per_bit:]
            
            bit = self.decode_bit(bit_samples)
            
            if bit is not None:
                self.bit_buffer.append(bit)
                
                # Check for byte completion (8 bits)
                if len(self.bit_buffer) >= 8:
                    byte_val = 0
                    for i, b in enumerate(self.bit_buffer[:8]):
                        byte_val |= (b << (7 - i))
                    
                    # Check for start marker
                    if byte_val == START_MARKER[0]:
                        self.receiving = True
                        self.byte_buffer = bytearray()
                        print(f"\n📡 Signal detected! Receiving...")
                    elif byte_val == END_MARKER[0] and self.receiving:
                        self.receiving = False
                        self.decode_message()
                    elif self.receiving:
                        self.byte_buffer.append(byte_val)
                    
                    self.bit_buffer = self.bit_buffer[8:]
    
    def decode_message(self):
        """Decode the received bytes into a message"""
        try:
            if len(self.byte_buffer) > 0:
                # Try to decode as UTF-8
                message = self.byte_buffer.decode('utf-8')
                print(f"\n✅ MESSAGE RECEIVED: {message}")
                print("-" * 40)
                
                # Special handling for structured data
                if message.startswith("ABRAHAM:"):
                    self.handle_abraham_message(message)
        except UnicodeDecodeError:
            # Raw bytes
            print(f"\n✅ BINARY DATA: {self.byte_buffer.hex()}")
            print("-" * 40)
    
    def handle_abraham_message(self, message):
        """Handle messages formatted for ABRAHAM/ROOTLESS system"""
        print("\n🧠 ABRAHAM Protocol Message:")
        parts = message.split(":")
        if len(parts) >= 3:
            msg_type = parts[1]
            content = ":".join(parts[2:])
            print(f"   Type: {msg_type}")
            print(f"   Content: {content}")
    
    def start_listening(self):
        """Start listening for audio signals"""
        print("🎙️ Sound Data Receiver Started")
        print(f"   Sample Rate: {SAMPLE_RATE} Hz")
        print(f"   FSK Frequencies: {FREQ_MARK} Hz (1) / {FREQ_SPACE} Hz (0)")
        print(f"   Baud Rate: {BAUD_RATE} bps")
        print("-" * 40)
        print("Listening for signals... (Press Ctrl+C to stop)")
        print()
        
        try:
            with sd.InputStream(samplerate=SAMPLE_RATE, 
                              channels=CHANNELS,
                              callback=self.process_audio,
                              blocksize=CHUNK_SIZE):
                while True:
                    sd.sleep(100)
        except KeyboardInterrupt:
            print("\n\n👋 Receiver stopped.")


def list_audio_devices():
    """List available audio input devices"""
    print("Available Audio Devices:")
    print("-" * 40)
    devices = sd.query_devices()
    for i, dev in enumerate(devices):
        if dev['max_input_channels'] > 0:
            default = " (DEFAULT)" if i == sd.default.device[0] else ""
            print(f"  [{i}] {dev['name']}{default}")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 40)
    print("  SOUND DATA RECEIVER")
    print("  Data-Over-Audio Communication")
    print("=" * 40 + "\n")
    
    # Show available devices
    list_audio_devices()
    
    # Start receiver
    receiver = SoundReceiver()
    receiver.start_listening()
