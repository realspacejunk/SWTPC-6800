#!/usr/bin/env python3
"""
Load Side B ELIZA binary and prepare for emulation
Extract and analyze the main program segment
"""

import os

def create_loader():
    """Create JavaScript code to load Side B binary into emulator"""
    
    # Read the binary
    with open('eliza_side_b.bin', 'rb') as f:
        data = f.read()
    
    print(f'Total binary: {len(data)} bytes')
    
    # The largest segment starts at 0x12DB and is 26,705 bytes
    # This is the ELIZA main program
    main_start = 0x12DB
    main_end = 0x07B2C
    main_size = main_end - main_start
    
    print(f'\nMain ELIZA program segment:')
    print(f'  Start: 0x{main_start:05X}')
    print(f'  End:   0x{main_end:05X}')
    print(f'  Size:  {main_size} bytes')
    
    # Extract the main segment
    main_program = data[main_start:main_end]
    
    # Also include the earlier code segments
    # Segment at 0x00C7-0x05CD (1286 bytes) - appears to be support code
    support_start = 0x00C7
    support_end = 0x05CD
    support_size = support_end - support_start
    
    print(f'\nSupport code segment:')
    print(f'  Start: 0x{support_start:05X}')
    print(f'  End:   0x{support_end:05X}')
    print(f'  Size:  {support_size} bytes')
    
    # Get first 100 bytes of main program for analysis
    print(f'\nMain program first 100 bytes:')
    hex_str = ' '.join(f'{b:02X}' for b in main_program[:100])
    print(hex_str)
    
    # Generate a compact hex string for JavaScript embedding
    hex_data = ''.join(f'{b:02X}' for b in data)
    
    # Write JavaScript constant
    js_code = f'''/**
 * ELIZA SWTPC-6800 Binary Data
 * Decoded from cassette Side B
 * {len(data)} bytes total
 * 
 * Structure:
 * 0x00000 - 0x00069 (105 bytes): Boot code
 * 0x000C7 - 0x005CD (1286 bytes): Support routines  
 * 0x012DB - 0x07B2C (26705 bytes): MAIN ELIZA PROGRAM
 */

const ELIZA_BINARY_SIDEB = new Uint8Array([
'''
    
    # Add bytes in groups of 16 per line for readability
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        bytes_str = ', '.join(f'0x{b:02X}' for b in chunk)
        js_code += f'    {bytes_str},\n'
    
    js_code = js_code.rstrip(',\n') + '\n]);'
    
    # Write to file
    with open('eliza_binary_sideb.js', 'w') as f:
        f.write(js_code)
    
    print(f'\nWrote {len(js_code)} bytes to eliza_binary_sideb.js')
    
    # Also write just the hex string (more compact)
    hex_only = ''.join(f'{b:02X}' for b in data)
    
    js_hex = f'''/**
 * ELIZA Side B binary as hex string
 * {len(data)} bytes
 */
const ELIZA_BINARY_HEX = "{hex_only}";
'''
    
    with open('eliza_binary_sideb_hex.js', 'w') as f:
        f.write(js_hex)
    
    print(f'Wrote hex version to eliza_binary_sideb_hex.js')
    
    # Analysis output
    print(f'\n=== ELIZA CASSETTE STRUCTURE ===')
    print(f'Side A: 32,575 bytes (bootloader + padding)')
    print(f'Side B: {len(data)} bytes (main program)')
    print(f'Total program: ~{len(data) + 200} bytes')
    print(f'\nKey insight:')
    print(f'  Side A loads a bootloader that likely loads Side B from cassette')
    print(f'  Side B contains the complete ELIZA conversation engine')
    print(f'  Main segment at 0x12DB is 26,705 bytes of pure code/data')

if __name__ == '__main__':
    create_loader()
