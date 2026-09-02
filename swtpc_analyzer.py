#!/usr/bin/env python3
"""
SWTPC-6800 File Format Analyzer
Analyzes decoded KCS tape data for SWTPC machine code and tape formats.
"""

import sys
import struct

def analyze_swtpc_file(bin_file):
    """Analyze a SWTPC-6800 binary file."""
    
    with open(bin_file, 'rb') as f:
        data = f.read()
    
    print(f"File size: {len(data)} bytes (0x{len(data):X})")
    print()
    
    # Check for SWTPC tape format headers
    print("=== SWTPC Tape Format Analysis ===")
    print()
    
    # SWTPC tape format typically uses blocks with headers
    # Look for common patterns
    analyze_tape_blocks(data)
    
    print()
    print("=== 6800 Machine Code Analysis ===")
    print()
    
    # Analyze for 6800 opcodes
    analyze_6800_code(data)
    
    print()
    print("=== String/ASCII Content ===")
    print()
    
    # Extract ASCII strings
    extract_strings(data)
    
    print()
    print("=== Memory Map (First 128 bytes with interpretation) ===")
    print()
    
    # Display annotated first section
    display_memory_map(data[:128])


def analyze_tape_blocks(data):
    """Analyze SWTPC tape block structure."""
    
    print("Looking for tape block markers and structure...")
    print()
    
    # SWTPC uses specific block structures
    # Check for common headers
    
    # Look for Motorola S-record format (common for 6800)
    if data[0:1] == b'S':
        print("Found Motorola S-record format!")
        parse_s_records(data)
        return
    
    # Look for other known tape format markers
    print("Checking for tape block patterns...")
    
    # Look for repeated patterns or block markers
    i = 0
    block_num = 0
    
    while i < len(data) and i < 1000:  # Check first 1000 bytes
        byte = data[i]
        
        # Look for potential block headers (common: 0x02, 0x03 sync bytes)
        if byte in (0x02, 0x03, 0x55, 0xAA):  # Sync patterns
            print(f"  Offset 0x{i:04X}: Found pattern byte 0x{byte:02X}")
            # Show context
            context = data[i:i+16]
            print(f"    Context: {' '.join(f'{b:02X}' for b in context)}")
        
        i += 1
    
    print()
    print("Checking for 6800 RAM/ROM address patterns...")
    
    # SWTPC typically has RAM at 0x0000-0x7FFF and ROM at 0x8000-0xFFFF
    # Look for code that references these areas
    for i in range(0, min(len(data) - 2, 256)):
        # Check for possible 16-bit addresses
        addr = struct.unpack('>H', data[i:i+2])[0]
        if addr in range(0x0000, 0x10000):
            if addr >= 0x8000:  # ROM range
                print(f"  Offset 0x{i:04X}: Potential ROM address 0x{addr:04X}")


def parse_s_records(data):
    """Parse Motorola S-record format."""
    
    print("Parsing S-records...")
    
    lines = data.decode('latin1').split('\n')
    
    record_count = {}
    total_bytes = 0
    
    for line in lines[:20]:  # Show first 20 records
        line = line.strip()
        if line.startswith('S'):
            record_type = line[0:2]
            record_count[record_type] = record_count.get(record_type, 0) + 1
            
            if record_type in ('S0', 'S1', 'S2', 'S3'):
                try:
                    byte_count = int(line[2:4], 16)
                    total_bytes += byte_count
                    print(f"  {line[:30]}...")
                except:
                    pass
    
    print()
    print("Record type summary:")
    for rtype in sorted(record_count.keys()):
        print(f"  {rtype}: {record_count[rtype]} records")


def analyze_6800_code(data):
    """Analyze for 6800 machine code patterns."""
    
    # 6800 opcodes - common ones
    opcodes_6800 = {
        0x86: ('LDA A', 'Load A with immediate'),
        0xC6: ('LDB', 'Load B with immediate'),
        0x7E: ('JMP', 'Jump'),
        0x20: ('BRA', 'Branch always'),
        0x97: ('STA A', 'Store A'),
        0xD7: ('STB', 'Store B'),
        0x39: ('RTS', 'Return from subroutine'),
        0x3E: ('WAI', 'Wait for interrupt'),
        0x3F: ('SWI', 'Software interrupt'),
        0x81: ('CMP A', 'Compare A'),
        0xC1: ('CMP B', 'Compare B'),
    }
    
    print("Scanning for 6800 opcodes...")
    print()
    
    opcode_hits = {}
    
    for i in range(min(len(data), 1000)):
        byte = data[i]
        if byte in opcodes_6800:
            mnemonic, desc = opcodes_6800[byte]
            opcode_hits[byte] = opcode_hits.get(byte, 0) + 1
    
    if opcode_hits:
        print("Found 6800 opcodes:")
        for byte in sorted(opcode_hits.keys()):
            mnemonic, desc = opcodes_6800[byte]
            count = opcode_hits[byte]
            print(f"  0x{byte:02X}: {mnemonic:8} ({desc}) - {count} occurrences")
    else:
        print("No obvious 6800 opcodes found in first 1000 bytes")
    
    # Check for common code patterns
    print()
    print("Looking for common 6800 code patterns...")
    
    # Look for JSR (jump to subroutine): 0xBD followed by address
    for i in range(min(len(data) - 2, 500)):
        if data[i] == 0xBD:  # JSR
            addr = struct.unpack('>H', data[i+1:i+3])[0]
            print(f"  0x{i:04X}: JSR 0x{addr:04X}")


def extract_strings(data):
    """Extract printable ASCII strings from binary."""
    
    print("Extracting ASCII strings (min 4 chars)...")
    print()
    
    current_string = []
    string_offsets = []
    
    for i, byte in enumerate(data):
        # Look for printable ASCII
        if 32 <= byte <= 126:  # Printable ASCII
            current_string.append(chr(byte))
        else:
            if len(current_string) >= 4:
                string_text = ''.join(current_string)
                string_offsets.append((i - len(current_string), string_text))
            current_string = []
    
    # Check last string
    if len(current_string) >= 4:
        string_text = ''.join(current_string)
        string_offsets.append((len(data) - len(current_string), string_text))
    
    if string_offsets:
        for offset, text in string_offsets[:20]:  # Show first 20
            print(f"  0x{offset:04X}: '{text}'")
    else:
        print("  (No significant ASCII strings found)")


def display_memory_map(data):
    """Display first section with annotations."""
    
    print("Offset   Hex Data                         ASCII")
    print("-" * 60)
    
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        hex_str = ' '.join(f'{b:02X}' for b in chunk)
        ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        
        print(f"0x{i:04X}:  {hex_str:<48} {ascii_str}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: swtpc_analyzer.py <binary_file>")
        sys.exit(1)
    
    analyze_swtpc_file(sys.argv[1])
