#!/usr/bin/env python3
"""Find all data segments in Side B binary"""

with open('eliza_side_b.bin', 'rb') as f:
    data = f.read()

print('=== ALL DATA SEGMENTS ===\n')

segments = []
i = 0
seg_num = 1

while i < len(data):
    if data[i] != 0xFF:
        seg_start = i
        seg_data = []
        while i < len(data) and data[i] != 0xFF:
            seg_data.append(data[i])
            i += 1
        
        segments.append({
            'num': seg_num,
            'start': seg_start,
            'size': len(seg_data),
            'end': i - 1,
            'first_bytes': seg_data[:16]
        })
        
        print(f'Segment {seg_num}: 0x{seg_start:05X} - 0x{seg_start + len(seg_data) - 1:05X} ({len(seg_data)} bytes)')
        print(f'  First 16 bytes: {" ".join(f"{b:02X}" for b in seg_data[:16])}')
        
        seg_num += 1
    else:
        i += 1

print(f'\nTotal segments: {len(segments)}')
print(f'\nLargest segments:')
sorted_segs = sorted(segments, key=lambda x: x['size'], reverse=True)
for seg in sorted_segs[:5]:
    print(f'  Segment {seg["num"]}: {seg["size"]} bytes at 0x{seg["start"]:05X}')

print(f'\nAll segments:')
for seg in segments:
    print(f'  {seg["num"]:2d}: 0x{seg["start"]:05X} - 0x{seg["end"]:05X} ({seg["size"]:5d} bytes)')
