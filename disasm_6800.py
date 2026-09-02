#!/usr/bin/env python3
"""
Motorola 6800 Disassembler
Produces 6800 assembly language from binary data.
"""

import sys
import struct

# 6800 Instruction Set
OPCODES_6800 = {
    # Inherent (single byte)
    0x01: ('NOP', 'i'),
    0x06: ('TAP', 'i'),
    0x07: ('TPA', 'i'),
    0x09: ('DEX', 'i'),
    0x0A: ('CLV', 'i'),
    0x0B: ('SEV', 'i'),
    0x0C: ('CLC', 'i'),
    0x0D: ('SEC', 'i'),
    0x0E: ('CLI', 'i'),
    0x0F: ('SEI', 'i'),
    0x19: ('DAA', 'i'),
    0x1B: ('ABA', 'i'),
    0x20: ('BRA', 'r'),  # Relative
    0x22: ('BHI', 'r'),
    0x23: ('BLS', 'r'),
    0x24: ('BCC', 'r'),
    0x25: ('BCS', 'r'),
    0x26: ('BNE', 'r'),
    0x27: ('BEQ', 'r'),
    0x28: ('BVC', 'r'),
    0x29: ('BVS', 'r'),
    0x2A: ('BPL', 'r'),
    0x2B: ('BMI', 'r'),
    0x2C: ('BGE', 'r'),
    0x2D: ('BLT', 'r'),
    0x2E: ('BGT', 'r'),
    0x2F: ('BLE', 'r'),
    0x39: ('RTS', 'i'),
    0x3E: ('WAI', 'i'),
    0x3F: ('SWI', 'i'),
    
    # Immediate
    0x81: ('CMPA', 'n'),
    0x82: ('SBCA', 'n'),
    0x84: ('ANDA', 'n'),
    0x85: ('BITA', 'n'),
    0x86: ('LDAA', 'n'),
    0x88: ('EORA', 'n'),
    0x89: ('ADCA', 'n'),
    0x8A: ('ORA', 'n'),
    0x8B: ('ADDA', 'n'),
    0x8D: ('BSR', 'r'),
    0xC1: ('CMPB', 'n'),
    0xC2: ('SBCB', 'n'),
    0xC4: ('ANDB', 'n'),
    0xC5: ('BITB', 'n'),
    0xC6: ('LDAB', 'n'),
    0xC8: ('EORB', 'n'),
    0xC9: ('ADCB', 'n'),
    0xCA: ('ORB', 'n'),
    0xCB: ('ADDB', 'n'),
    0xFE: ('LDX', 'e'),
    
    # Direct (single byte address)
    0x90: ('SUBA', 'd'),
    0x91: ('CMPA', 'd'),
    0x92: ('SBCA', 'd'),
    0x94: ('ANDA', 'd'),
    0x95: ('BITA', 'd'),
    0x96: ('LDAA', 'd'),
    0x97: ('STAA', 'd'),
    0x98: ('EORA', 'd'),
    0x99: ('ADCA', 'd'),
    0x9A: ('ORA', 'd'),
    0x9B: ('ADDA', 'd'),
    0x9C: ('CPX', 'd'),
    0x9D: ('JSR', 'd'),
    0x9E: ('LDX', 'd'),
    0x9F: ('STX', 'd'),
    
    # Direct mode B register
    0xD0: ('SUBB', 'd'),
    0xD1: ('CMPB', 'd'),
    0xD2: ('SBCB', 'd'),
    0xD4: ('ANDB', 'd'),
    0xD5: ('BITB', 'd'),
    0xD6: ('LDAB', 'd'),
    0xD7: ('STAB', 'd'),
    0xD8: ('EORB', 'd'),
    0xD9: ('ADCB', 'd'),
    0xDA: ('ORB', 'd'),
    0xDB: ('ADDB', 'd'),
    0xDC: ('CPX', 'd'),
    0xDD: ('JSR', 'd'),
    0xDE: ('LDX', 'd'),
    0xDF: ('STX', 'd'),
    
    # Indexed
    0xA0: ('SUBA', 'x'),
    0xA1: ('CMPA', 'x'),
    0xA2: ('SBCA', 'x'),
    0xA4: ('ANDA', 'x'),
    0xA5: ('BITA', 'x'),
    0xA6: ('LDAA', 'x'),
    0xA7: ('STAA', 'x'),
    0xA8: ('EORA', 'x'),
    0xA9: ('ADCA', 'x'),
    0xAA: ('ORA', 'x'),
    0xAB: ('ADDA', 'x'),
    0xAC: ('CPX', 'x'),
    0xAD: ('JSR', 'x'),
    0xAE: ('LDX', 'x'),
    0xAF: ('STX', 'x'),
    
    # Indexed mode B register
    0xE0: ('SUBB', 'x'),
    0xE1: ('CMPB', 'x'),
    0xE2: ('SBCB', 'x'),
    0xE4: ('ANDB', 'x'),
    0xE5: ('BITB', 'x'),
    0xE6: ('LDAB', 'x'),
    0xE7: ('STAB', 'x'),
    0xE8: ('EORB', 'x'),
    0xE9: ('ADCB', 'x'),
    0xEA: ('ORB', 'x'),
    0xEB: ('ADDB', 'x'),
    0xEC: ('CPX', 'x'),
    0xED: ('JSR', 'x'),
    0xEE: ('LDX', 'x'),
    0xEF: ('STX', 'x'),
    
    # Extended
    0xB0: ('SUBA', 'e'),
    0xB1: ('CMPA', 'e'),
    0xB2: ('SBCA', 'e'),
    0xB3: ('SUBD', 'e'),
    0xB4: ('ANDA', 'e'),
    0xB5: ('BITA', 'e'),
    0xB6: ('LDAA', 'e'),
    0xB7: ('STAA', 'e'),
    0xB8: ('EORA', 'e'),
    0xB9: ('ADCA', 'e'),
    0xBA: ('ORA', 'e'),
    0xBB: ('ADDA', 'e'),
    0xBC: ('CPX', 'e'),
    0xBD: ('JSR', 'e'),
    0xBE: ('LDX', 'e'),
    0xBF: ('STX', 'e'),
    
    # Extended mode B register
    0xF0: ('SUBB', 'e'),
    0xF1: ('CMPB', 'e'),
    0xF2: ('SBCB', 'e'),
    0xF3: ('ADDD', 'e'),
    0xF4: ('ANDB', 'e'),
    0xF5: ('BITB', 'e'),
    0xF6: ('LDAB', 'e'),
    0xF7: ('STAB', 'e'),
    0xF8: ('EORB', 'e'),
    0xF9: ('ADCB', 'e'),
    0xFA: ('ORB', 'e'),
    0xFB: ('ADDB', 'e'),
    0xFC: ('CPX', 'e'),
    0xFD: ('JSR', 'e'),
}

# Accumulator operations (single byte)
ACCUM_OPS = {
    0x00: ('NEG', 'a'),
    0x03: ('COM', 'a'),
    0x04: ('LSR', 'a'),
    0x06: ('ROR', 'a'),
    0x07: ('ASR', 'a'),
    0x08: ('LSL', 'a'),
    0x09: ('ROL', 'a'),
    0x0A: ('DEC', 'a'),
    0x0C: ('INC', 'a'),
    0x0D: ('TST', 'a'),
    0x0F: ('CLR', 'a'),
}

def disassemble_6800(bin_file, output_file=None):
    """Disassemble 6800 machine code."""
    
    with open(bin_file, 'rb') as f:
        data = f.read()
    
    lines = []
    lines.append("; Motorola 6800 Disassembly")
    lines.append(f"; File: {bin_file}")
    lines.append(f"; Size: {len(data)} bytes (0x{len(data):04X})")
    lines.append(";")
    lines.append("")
    
    i = 0
    while i < len(data):
        opcode = data[i]
        addr = i
        
        # Format: ADDR: BYTES  MNEMONIC OPERAND
        instr_bytes = [opcode]
        mnemonic = "???"
        operand = ""
        size = 1
        
        # Look up opcode
        if opcode in OPCODES_6800:
            mnemonic, mode = OPCODES_6800[opcode]
            
            if mode == 'i':  # Inherent
                operand = ""
                size = 1
            elif mode == 'n':  # Immediate
                if i + 1 < len(data):
                    val = data[i + 1]
                    instr_bytes.append(val)
                    operand = f"#${val:02X}"
                    size = 2
            elif mode == 'r':  # Relative (for branches)
                if i + 1 < len(data):
                    offset = struct.unpack('b', bytes([data[i + 1]]))[0]  # Signed
                    instr_bytes.append(data[i + 1])
                    target = (i + 2 + offset) & 0xFFFF
                    operand = f"${target:04X}"
                    size = 2
            elif mode == 'd':  # Direct (single byte address)
                if i + 1 < len(data):
                    addr_low = data[i + 1]
                    instr_bytes.append(addr_low)
                    operand = f"${addr_low:02X}"
                    size = 2
            elif mode == 'x':  # Indexed (X register)
                if i + 1 < len(data):
                    offset = data[i + 1]
                    instr_bytes.append(offset)
                    operand = f"${offset:02X},X"
                    size = 2
            elif mode == 'e':  # Extended (16-bit address)
                if i + 2 < len(data):
                    addr_high = data[i + 1]
                    addr_low = data[i + 2]
                    instr_bytes.extend([addr_high, addr_low])
                    target = (addr_high << 8) | addr_low
                    operand = f"${target:04X}"
                    size = 3
        
        # Check for single-byte register operations
        elif opcode in ACCUM_OPS:
            mnemonic, mode = ACCUM_OPS[opcode]
            operand = ""
            size = 1
        
        # Format output line
        hex_str = ' '.join(f'{b:02X}' for b in instr_bytes)
        line = f"{addr:04X}: {hex_str:<12} {mnemonic:<8} {operand}"
        lines.append(line)
        
        i += size
    
    # Write output
    output_text = '\n'.join(lines)
    
    if output_file:
        with open(output_file, 'w') as f:
            f.write(output_text)
        print(f"Disassembly saved to: {output_file}")
    
    # Print first section
    print("=== 6800 Disassembly (First 256 bytes) ===\n")
    print('\n'.join(lines[5:max(100, len(lines))]))  # Skip header, show 95 lines
    
    return output_text


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: disasm_6800.py <binary_file> [output_file]")
        sys.exit(1)
    
    bin_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else bin_file.replace('.bin', '.asm')
    
    disassemble_6800(bin_file, output_file)
