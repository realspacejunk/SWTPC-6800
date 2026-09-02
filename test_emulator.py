#!/usr/bin/env python3
"""
Test the 6800 emulator by simulating basic execution
"""

import sys
import json

# Read the Side B binary
with open('eliza_side_b.bin', 'rb') as f:
    data = f.read()

# Create a minimal memory representation
memory = bytearray(65536)
for i, byte in enumerate(data):
    memory[i] = byte

# Define 6800 opcodes for quick lookup
OPCODES = {
    0x01: 'NOP', 0x06: 'TAP', 0x07: 'TPA', 0x09: 'DEX', 0x0A: 'CLV', 0x0B: 'SEV',
    0x0C: 'CLC', 0x0D: 'SEC', 0x0E: 'CLI', 0x0F: 'SEI', 0x19: 'DAA', 0x1B: 'ABA',
    0x20: 'BRA', 0x39: 'RTS', 0x3F: 'SWI', 0x81: 'CMPA', 0x86: 'LDAA', 0x8B: 'ADDA',
    0x8D: 'BSR', 0x91: 'CMPA', 0x96: 'LDAA', 0x97: 'STAA', 0x9B: 'ADDA', 0x9D: 'JSR',
    0xBD: 'JSR', 0xC6: 'LDAB', 0xD7: 'STAB', 0xED: 'JSR',
}

def disasm_instruction(pc):
    """Disassemble one instruction at PC"""
    opcode = memory[pc]
    
    if opcode not in OPCODES:
        return f'0x{pc:04X}: {opcode:02X} ???'
    
    mnemonic = OPCODES[opcode]
    
    # Simple operand handling
    operand = ''
    size = 1
    
    # Relative addressing (branches)
    if opcode in [0x20, 0x8D]:  # BRA, BSR
        if pc + 1 < len(memory):
            offset = memory[pc + 1]
            if offset > 127:
                offset = offset - 256
            target = (pc + 2 + offset) & 0xFFFF
            operand = f'${target:04X}'
            size = 2
    # Extended addressing
    elif opcode in [0x96, 0x97, 0x9D, 0xBD]:  # LDAA, STAA, JSR
        if pc + 2 < len(memory):
            addr = (memory[pc + 1] << 8) | memory[pc + 2]
            operand = f'${addr:04X}'
            size = 3
    
    return f'0x{pc:04X}: {mnemonic:<6} {operand}'

print('=== 6800 EMULATOR TEST ===\n')

# Test execution from start
print('Starting execution at PC = 0x0000\n')
print('First 20 instructions:')

pc = 0
for i in range(20):
    instr_str = disasm_instruction(pc)
    print(f'{i+1:2d}: {instr_str}')
    
    opcode = memory[pc]
    if opcode in [0x20, 0x8D]:
        pc += 2
    elif opcode in [0x96, 0x97, 0x9D, 0xBD]:
        pc += 3
    else:
        pc += 1
    
    if pc >= len(memory):
        print('  (PC out of bounds)')
        break

print('\n=== ANALYSIS ===')
print(f'Total binary size: {len(data)} bytes')
print(f'First instruction at 0x0000: 0x{memory[0]:02X} ({OPCODES.get(memory[0], "unknown")})')
print(f'Segment 1 ends: 0x0068')
print(f'Segment 81 starts: 0x12DB')
print(f'Instruction at 0x12DB: 0x{memory[0x12DB]:02X} ({OPCODES.get(memory[0x12DB], "unknown")})')

# Check for RTS (return from subroutine) - 0x39
rts_count = sum(1 for i in range(len(memory)) if memory[i] == 0x39)
print(f'\nFound {rts_count} RTS (0x39) instructions in memory')

# Check for JSR (jump to subroutine) - 0x9D, 0xBD, 0xED
jsr_count = sum(1 for i in range(len(memory)) if memory[i] in [0x9D, 0xBD, 0xED])
print(f'Found {jsr_count} JSR (0x9D, 0xBD, 0xED) instructions in memory')
