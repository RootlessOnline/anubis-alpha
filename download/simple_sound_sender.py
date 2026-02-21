#!/usr/bin/env python3
"""
Simple Sound Data Sender - FSK Modulation
Encodes text/messages into audio signals.
Works like a simple modem/fax sender.

Location: ~/Documents/FUture/simple_sound_sender.py

Usage:
    ~/sound-venv/bin/python ~/Documents/FUture/simple_sound_sender.py "Hello World"
    ~/sound-venv/bin/python ~/Documents/FUture/simple_sound_sender.py --interactive
"""

import numpy as np
import sounddevice as sd
import sys
import argparse

# Audio settings
SAMPLE_RATE = 44100
CHANNELS = 1

# FSK Settings (Frequency Shift Keying)
FREQ_MARK = 1200      # '1' bit frequency (Hz)
FREQ_SPACE = 2200     # '0' bit frequency (Hz)
BAUD_RATE = 300       # Bits per second

# Start/End markers
START_MARKER = b'\x7F'  # DEL character as start
END_MARKER = b'\x7E'    # ~ character as end


class SoundSender:
    def __init__(self):
        self.sample_rate = SAMPLE_RATE
        
    def bits_to_fsk(self, bits):
        """Convert a sequence of bits to FSK audio signal"""
        samples_per_bit = int(self.sample_rate / BAUD_RATE)
        t = np.linspace(0, samples_per_bit / self.sample_rate, samples_per_bit)
        
        signal = np.array([])
        for bit in bits:
            freq = FREQ_MARK if bit else FREQ_SPACE
            bit_signal = 0.5 * np.sin(2 * np.pi * freq * t)
            signal = np.concatenate([signal, bit_signal])
            
        return signal
    
    def text_to_bits(self, text):
        """Convert text to a list of bits"""
        bits = []
        # Add start marker
        for byte in START_MARKER:
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
        
        # Add message bytes
        for char in text:
            byte = ord(char) if isinstance(char, str) else char
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
        
        # Add end marker
        for byte in END_MARKER:
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
                
        return bits
    
    def send_message(self, message, volume=0.5):
        """Send a message via sound"""
        print(f"\n📤 Sending message: {message}")
        print(f"   Length: {len(message)} bytes")
        print(f"   FSK: {FREQ_MARK}/{FREQ_SPACE} Hz @ {BAUD_RATE} baud")
        print()
        
        # Convert message to bits
        bits = self.text_to_bits(message)
        print(f"   Total bits: {len(bits)}")
        
        # Generate FSK signal
        signal = self.bits_to_fsk(bits)
        signal = signal * volume  # Apply volume
        
        duration = len(signal) / self.sample_rate
        print(f"   Duration: {duration:.2f} seconds")
        print("\n🔊 Transmitting...")
        
        # Play the signal
        sd.play(signal, self.sample_rate)
        sd.wait()  # Wait until playback is done
        
        print("✅ Transmission complete!")
        
    def send_tone(self, freq=1000, duration=1.0, volume=0.5):
        """Send a simple test tone"""
        t = np.linspace(0, duration, int(self.sample_rate * duration))
        signal = volume * np.sin(2 * np.pi * freq * t)
        
        print(f"\n🔊 Playing {freq} Hz tone for {duration}s...")
        sd.play(signal, self.sample_rate)
        sd.wait()
        print("✅ Done")


def list_audio_devices():
    """List available audio output devices"""
    print("Available Audio Devices:")
    print("-" * 40)
    devices = sd.query_devices()
    for i, dev in enumerate(devices):
        if dev['max_output_channels'] > 0:
            default = " (DEFAULT)" if i == sd.default.device[1] else ""
            print(f"  [{i}] {dev['name']}{default}")
    print()


def interactive_mode(sender):
    """Interactive mode for sending multiple messages"""
    print("\n🎮 Interactive Mode")
    print("Type messages to send. Press Ctrl+C to exit.")
    print("-" * 40)
    
    while True:
        try:
            message = input("\nMessage to send: ")
            if message.strip():
                sender.send_message(message)
        except KeyboardInterrupt:
            print("\n\n👋 Exiting interactive mode.")
            break
        except EOFError:
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send data via sound")
    parser.add_argument('message', nargs='?', help='Message to send')
    parser.add_argument('-i', '--interactive', action='store_true',
                       help='Interactive mode')
    parser.add_argument('-t', '--test-tone', type=float, 
                       help='Play test tone (specify frequency)')
    parser.add_argument('-v', '--volume', type=float, default=0.5,
                       help='Volume (0.0 to 1.0)')
    parser.add_argument('-l', '--list-devices', action='store_true',
                       help='List audio devices')
    
    args = parser.parse_args()
    
    print("\n" + "=" * 40)
    print("  SOUND DATA SENDER")
    print("  Data-Over-Audio Communication")
    print("=" * 40)
    
    sender = SoundSender()
    
    if args.list_devices:
        list_audio_devices()
    elif args.test_tone:
        sender.send_tone(freq=args.test_tone, volume=args.volume)
    elif args.interactive:
        interactive_mode(sender)
    elif args.message:
        sender.send_message(args.message, volume=args.volume)
    else:
        # Default: show help
        parser.print_help()
        print("\nQuick Examples:")
        print("  Send message:  python simple_sound_sender.py 'Hello World'")
        print("  Test tone:     python simple_sound_sender.py -t 1000")
        print("  Interactive:   python simple_sound_sender.py -i")
