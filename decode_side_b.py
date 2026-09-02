#!/usr/bin/env python3
"""
Decode KCS 300-baud cassette audio to binary
Side B analysis
"""

import wave
import struct
import math
import os

def goertzel_filter(samples, freq, sample_rate, N=1024):
    """Goertzel algorithm to detect frequency"""
    k = int((N * freq) / sample_rate)
    w = 2.0 * math.pi * k / N
    
    coeff = 2.0 * math.cos(w)
    Q0 = Q1 = Q2 = 0
    
    for sample in samples:
        Q0 = sample + coeff * Q1 - Q2
        Q2 = Q1
        Q1 = Q0
    
    real = Q1 - Q2 * math.cos(w)
    imag = Q2 * math.sin(w)
    magnitude = math.sqrt(real**2 + imag**2)
    return magnitude

def decode_kcs(wav_path, output_path):
    """Decode KCS 300 baud audio to binary"""
    print(f'\nDecoding {os.path.basename(wav_path)}...')
    
    with wave.open(wav_path) as wav:
        params = wav.getparams()
        sample_rate = params.framerate
        frames = wav.readframes(params.nframes)
    
    # Convert bytes to samples
    samples = struct.unpack(f'<{len(frames)//2}h', frames)
    print(f'  Loaded {len(samples)} samples at {sample_rate} Hz')
    
    # KCS: 1200 Hz = 0, 2400 Hz = 1
    # 300 baud = ~800 samples per bit at 96kHz, ~1600 at 192kHz
    baud = 300
    samples_per_bit = int(sample_rate / baud)
    block_size = samples_per_bit  # Goertzel window
    
    print(f'  Samples per bit: {samples_per_bit}')
    
    bits = []
    mag_history = []
    
    for i in range(0, len(samples) - block_size, block_size):
        block = samples[i:i+block_size]
        mag_1200 = goertzel_filter(block, 1200, sample_rate, len(block))
        mag_2400 = goertzel_filter(block, 2400, sample_rate, len(block))
        
        # Choose the stronger frequency
        bit = 0 if mag_1200 > mag_2400 else 1
        bits.append(bit)
        mag_history.append((mag_1200, mag_2400))
    
    print(f'  Decoded {len(bits)} bits')
    
    # Analyze signal strength
    avg_1200 = sum(m[0] for m in mag_history) / len(mag_history)
    avg_2400 = sum(m[1] for m in mag_history) / len(mag_history)
    print(f'  Avg 1200 Hz: {avg_1200:.0f}, Avg 2400 Hz: {avg_2400:.0f}')
    
    # Pack bits into bytes (LSB first)
    data = bytearray()
    for i in range(0, len(bits) - 7, 8):
        byte = 0
        for j in range(8):
            byte |= (bits[i+j] << j)
        data.append(byte)
    
    # Write output
    with open(output_path, 'wb') as f:
        f.write(data)
    
    print(f'  Wrote {len(data)} bytes to {output_path}')
    
    # Analyze structure
    print(f'\n  Data Analysis:')
    print(f'    First 64 bytes (hex):')
    hex_str = ' '.join(f'{b:02X}' for b in data[:64])
    print(f'    {hex_str}')
    
    # Count patterns
    ff_count = sum(1 for b in data if b == 0xFF)
    zero_count = sum(1 for b in data if b == 0x00)
    print(f'    0xFF bytes: {ff_count}/{len(data)} ({100*ff_count/len(data):.1f}%)')
    print(f'    0x00 bytes: {zero_count}/{len(data)} ({100*zero_count/len(data):.1f}%)')
    
    # Find contiguous non-FF regions (segments)
    segments = []
    in_segment = False
    segment_start = 0
    
    for i, b in enumerate(data):
        if b != 0xFF:
            if not in_segment:
                segment_start = i
                in_segment = True
        else:
            if in_segment:
                segments.append((segment_start, i))
                in_segment = False
    
    if in_segment:
        segments.append((segment_start, len(data)))
    
    print(f'    Data segments: {len(segments)}')
    for idx, (start, end) in enumerate(segments):
        size = end - start
        print(f'      Segment {idx+1}: 0x{start:05X} - 0x{end:05X} ({size} bytes)')
        if size < 128:
            print(f'        Data: {data[start:end].hex()}')
    
    # Look for ASCII strings
    print(f'\n  ASCII Strings found:')
    current_string = []
    strings = []
    for i, b in enumerate(data):
        if 32 <= b <= 126:
            current_string.append((i, chr(b)))
        else:
            if len(current_string) >= 4:
                offset = current_string[0][0]
                text = ''.join(c for _, c in current_string)
                strings.append((offset, text))
            current_string = []
    
    if current_string and len(current_string) >= 4:
        offset = current_string[0][0]
        text = ''.join(c for _, c in current_string)
        strings.append((offset, text))
    
    if strings:
        for offset, text in strings[:20]:
            print(f'    0x{offset:05X}: {text}')
        if len(strings) > 20:
            print(f'    ... and {len(strings)-20} more strings')
    else:
        print('    None found')
    
    return data

# Main
if __name__ == '__main__':
    # Paths
    side_b_path = r'C:\Users\todda\.copilot\workspaces\0a523b1d-9888-4638-9801-1a4ef908a0a0\attachments\ab7c0f71-5f3a-43b9-ae4d-c92bd67d527e-eliza new b.wav'
    
    # Decode
    data_b = decode_kcs(side_b_path, 'eliza_side_b.bin')
    
    print(f'\n=== Summary ===')
    print(f'Total decoded: {len(data_b)} bytes')
