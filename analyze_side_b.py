#!/usr/bin/env python3
"""
Detailed analysis of ELIZA Side B decoded data
Looking for code segments and data patterns
"""

def analyze_segments(data_path):
    """Analyze the decoded binary in detail"""
    with open(data_path, 'rb') as f:
        data = f.read()
    
    print(f'Total bytes: {len(data)}\n')
    
    # Find major segments (contiguous non-FF data)
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
    
    print(f'Major data segments: {len(segments)}\n')
    
    # Analyze largest segments (likely to be real code/data)
    large_segments = [(s, e) for s, e in segments if e - s > 100]
    
    print(f'Segments larger than 100 bytes: {len(large_segments)}\n')
    
    for idx, (start, end) in enumerate(large_segments):
        size = end - start
        segment_data = data[start:end]
        
        print(f'Segment {idx+1}: 0x{start:05X} - 0x{end:05X} ({size} bytes)')
        
        # Try to identify 6800 instructions
        print(f'  First 16 bytes (hex): {segment_data[:16].hex()}')
        
        # Analyze content type
        ascii_count = sum(1 for b in segment_data if 32 <= b <= 126)
        ascii_pct = 100 * ascii_count / size
        
        zero_count = sum(1 for b in segment_data if b == 0x00)
        zero_pct = 100 * zero_count / size
        
        ff_count = sum(1 for b in segment_data if b == 0xFF)
        ff_pct = 100 * ff_count / size
        
        print(f'  ASCII: {ascii_pct:.1f}%')
        print(f'  Zeros: {zero_pct:.1f}%')
        print(f'  0xFF:  {ff_pct:.1f}%')
        
        # Extract any ASCII strings
        strings = []
        current = []
        for b in segment_data:
            if 32 <= b <= 126:
                current.append(chr(b))
            else:
                if len(current) >= 4:
                    strings.append(''.join(current))
                current = []
        if len(current) >= 4:
            strings.append(''.join(current))
        
        if strings:
            print(f'  ASCII Strings: {strings[:5]}')
        
        # Look for 6800 opcodes
        opcodes = {
            0xA9: 'ADC A', 0xB9: 'ADC Extended', 0xA0: 'SUB A',
            0xBD: 'JSR Extended', 0x39: 'RTS',
            0x20: 'BRA', 0x27: 'BEQ', 0x26: 'BNE',
            0x4F: 'CLR A', 0x8B: 'ADD A Imm', 0xAE: 'LDX'
        }
        
        opc_found = []
        for addr, b in enumerate(segment_data):
            if b in opcodes:
                opc_found.append((addr, hex(b), opcodes[b]))
        
        if opc_found:
            print(f'  Potential 6800 opcodes: {len(opc_found)}')
            for addr, h, name in opc_found[:5]:
                print(f'    +0x{addr:04X}: {h} = {name}')
        
        print()

if __name__ == '__main__':
    analyze_segments('eliza_side_b.bin')
    
    # Now let's compare Side A and Side B
    print('\n' + '='*60)
    print('COMPARISON: Side A vs Side B')
    print('='*60 + '\n')
    
    try:
        with open('eliza_side_b.bin', 'rb') as f:
            side_b = f.read()
        
        print(f'Side B size: {len(side_b)} bytes')
        print(f'Side A size: 32,575 bytes (from notes)')
        print(f'Difference: {len(side_b) - 32575} bytes')
        print(f'\nSide B has more data! This likely contains:')
        print('  - Main ELIZA program code')
        print('  - Conversation patterns')
        print('  - Response database')
        print('  - Dictionary/substitution rules')
        
    except:
        pass
