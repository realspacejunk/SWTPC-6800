#!/usr/bin/env python3
"""
KCS (Kansas City Standard) Decoder
Decodes 300 baud audio data from WAV files.
"""

import wave
import struct
import sys
from collections import deque
import math

def decode_kcs(wav_file):
    """Decode a KCS-encoded WAV file."""
    
    with wave.open(wav_file, 'rb') as wf:
        # Get audio parameters
        n_channels = wf.getnchannels()
        sample_width = wf.getsampwidth()
        frame_rate = wf.getframerate()
        n_frames = wf.getnframes()
        
        print(f"Audio properties:")
        print(f"  Channels: {n_channels}")
        print(f"  Sample width: {sample_width} bytes")
        print(f"  Frame rate: {frame_rate} Hz")
        print(f"  Total frames: {n_frames}")
        print(f"  Duration: {n_frames / frame_rate:.2f} seconds")
        print()
        
        # Read audio data
        audio_data = wf.readframes(n_frames)
        
        # Convert byte data to samples
        if sample_width == 1:
            samples = struct.unpack(f'{n_frames}B', audio_data)
            samples = [s - 128 for s in samples]  # Convert from unsigned to signed
        elif sample_width == 2:
            samples = struct.unpack(f'{n_frames}h', audio_data)
        else:
            print(f"Unsupported sample width: {sample_width}")
            return
        
        # KCS standard uses 1200 Hz for 0-bit and 2400 Hz for 1-bit
        freq_0 = 1200
        freq_1 = 2400
        baud_rate = 300
        bits_per_sec = baud_rate
        samples_per_bit = frame_rate // bits_per_sec
        
        print(f"Decoding parameters:")
        print(f"  0-bit frequency: {freq_0} Hz")
        print(f"  1-bit frequency: {freq_1} Hz")
        print(f"  Baud rate: {baud_rate}")
        print(f"  Samples per bit: {samples_per_bit}")
        print()
        
        # Decode bits
        bits = []
        for i in range(0, len(samples) - samples_per_bit, samples_per_bit):
            chunk = samples[i:i + samples_per_bit]
            
            # Calculate DFT magnitude for both frequencies
            mag_0 = _magnitude_at_frequency(chunk, freq_0, frame_rate)
            mag_1 = _magnitude_at_frequency(chunk, freq_1, frame_rate)
            
            # Determine bit based on which frequency is stronger
            bit = 1 if mag_1 > mag_0 else 0
            bits.append(bit)
        
        print(f"Decoded {len(bits)} bits")
        print()
        
        # Convert bits to bytes
        bytes_data = _bits_to_bytes(bits)
        
        print(f"Decoded {len(bytes_data)} bytes")
        print()
        
        # Display decoded data
        print("First 256 bytes (hex):")
        for i, byte in enumerate(bytes_data[:256]):
            if i % 16 == 0:
                print(f"{i:04X}: ", end="")
            print(f"{byte:02X} ", end="")
            if (i + 1) % 16 == 0:
                print()
        print()
        print()
        
        # Try to interpret as ASCII where possible
        print("First 256 bytes (ASCII with hex for non-printable):")
        ascii_text = ""
        for byte in bytes_data[:256]:
            if 32 <= byte <= 126:
                ascii_text += chr(byte)
            else:
                ascii_text += f"[{byte:02X}]"
        print(ascii_text)
        print()
        
        # Save decoded data
        output_file = wav_file.replace('.wav', '.bin')
        with open(output_file, 'wb') as f:
            f.write(bytes(bytes_data))
        print(f"Saved decoded binary to: {output_file}")
        
        # Also save as hex
        hex_file = wav_file.replace('.wav', '.hex')
        with open(hex_file, 'w') as f:
            for i, byte in enumerate(bytes_data):
                if i % 16 == 0:
                    f.write(f"{i:06X}: ")
                f.write(f"{byte:02X} ")
                if (i + 1) % 16 == 0:
                    f.write("\n")
        print(f"Saved hex dump to: {hex_file}")


def _magnitude_at_frequency(samples, target_freq, sample_rate):
    """Calculate magnitude of signal at target frequency using Goertzel algorithm."""
    
    N = len(samples)
    k = (target_freq * N) / sample_rate
    w = 2.0 * math.pi * k / N
    
    # Goertzel algorithm
    coeff = 2.0 * math.cos(w)
    s0 = 0.0
    s1 = 0.0
    s2 = 0.0
    
    for sample in samples:
        s0 = sample + coeff * s1 - s2
        s2 = s1
        s1 = s0
    
    # Calculate magnitude
    real = s1 - s2 * math.cos(w)
    imag = s2 * math.sin(w)
    magnitude = math.sqrt(real * real + imag * imag)
    
    return magnitude


def _bits_to_bytes(bits):
    """Convert bits to bytes, assuming LSB first within each byte."""
    
    bytes_data = []
    
    # Process bits in groups of 8
    for i in range(0, len(bits) - 7, 8):
        byte_val = 0
        for j in range(8):
            byte_val |= (bits[i + j] << j)  # LSB first
        bytes_data.append(byte_val)
    
    return bytes_data


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: kcs_decoder.py <wav_file>")
        sys.exit(1)
    
    decode_kcs(sys.argv[1])
