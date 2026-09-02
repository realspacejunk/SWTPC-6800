#!/usr/bin/env python3
"""
Analyze SWTPC-6800 code for emulator compatibility
Check for external dependencies, jump targets, and memory references
"""

import sys

def analyze_emulator_compatibility(asm_file):
    """Analyze disassembly for emulator compatibility."""
    
    with open(asm_file, 'r') as f:
        lines = f.readlines()
    
    print("=== SWTPC-6800 Emulator Compatibility Analysis ===\n")
    
    # Collect all jump/call targets
    jump_targets = set()
    external_refs = set()
    memory_refs = set()
    unresolved_refs = set()
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith(';'):
            continue
        
        # Parse: ADDR: BYTES  MNEMONIC OPERAND
        parts = line.split()
        if len(parts) < 2:
            continue
        
        # Extract operand (address/register references)
        if len(parts) >= 4:
            operand = parts[3]
            
            # JSR/BSR targets
            if parts[2] in ('JSR', 'BSR'):
                if operand.startswith('$'):
                    addr = int(operand[1:], 16)
                    jump_targets.add(addr)
                    if addr >= 0x0200:  # Outside decoded data
                        external_refs.add((addr, parts[2]))
            
            # Branch targets
            elif parts[2] in ('BRA', 'BEQ', 'BNE', 'BMI', 'BPL', 'BGE', 'BLT', 'BVC', 'BVS', 'BCC', 'BCS', 'BHI', 'BLS'):
                if operand.startswith('$'):
                    addr = int(operand[1:], 16)
                    jump_targets.add(addr)
                    # Check if forward/backward reference
                    if addr > 0x00C2:  # Beyond code section
                        external_refs.add((addr, parts[2]))
            
            # Memory references (LDA, STA, etc.)
            elif any(op in parts[2] for op in ['LDA', 'LDB', 'STA', 'STB', 'LDX', 'STX', 'CPX', 'CMX']):
                if operand.startswith('$') and not operand.endswith(',X'):
                    try:
                        addr = int(operand[1:], 16) if len(operand) > 1 else 0
                        memory_refs.add((addr, parts[2]))
                    except:
                        pass
    
    print(f"Total Jump/Branch Targets: {len(jump_targets)}")
    print(f"External References (JSR/BSR): {len(external_refs)}")
    print(f"Memory References: {len(memory_refs)}")
    print()
    
    if external_refs:
        print("External Subroutine References (NOT in decoded data):")
        for addr, instr in sorted(external_refs)[:10]:
            print(f"  0x{addr:04X}: {instr}")
        if len(external_refs) > 10:
            print(f"  ... and {len(external_refs) - 10} more")
        print()
    
    print("Jump Targets Found:")
    for addr in sorted(jump_targets)[:20]:
        if addr <= 0x00C2:
            print(f"  0x{addr:04X}: ✓ (in decoded data)")
        else:
            print(f"  0x{addr:04X}: ✗ (external reference)")
    print()
    
    # Analysis
    print("=== Emulator Compatibility Assessment ===\n")
    
    if external_refs:
        print("[WARNING] ISSUES FOUND:")
        print(f"   - Contains {len(external_refs)} external subroutine calls")
        print("   - References ROM addresses or external memory")
        print("   - Will NOT run standalone without SWTPC ROM emulation\n")
    
    print("VERDICT:")
    if external_refs or len(memory_refs) > 5:
        print("   [NO] NOT DIRECTLY RUNNABLE")
        print("\n   Reasons:")
        print("   1. External JSR/BSR calls to ROM routines (0x0216, etc.)")
        print("   2. No complete program image (likely bootloader fragment)")
        print("   3. Depends on SWTPC monitor/OS functions")
        print("\n   To Run:")
        print("   - Need full SWTPC ROM image")
        print("   - Use SWTPC-6800 emulator (e.g., MAME, py6800)")
        print("   - OR: Extract only the self-contained code segments")
    else:
        print("   [OK] Potentially runnable with configuration")
    
    print("\n=== What Would Be Needed ===\n")
    print("1. SWTPC-6800 System Emulator")
    print("   - Full 64K memory space")
    print("   - 6800 CPU core")
    print("   - SWTPC ROM (0x8000-0xFFFF)")
    print("   - I/O system (serial, cassette)")
    print()
    print("2. Memory Layout")
    print("   - 0x0000-0x7FFF: RAM (where this code loads)")
    print("   - 0x8000-0xFFFF: ROM (SWTPC monitor)")
    print()
    print("3. Supported Emulators")
    print("   - MAME (Multi Arcade Machine Emulator)")
    print("   - py6800 (Python 6800 emulator)")
    print("   - EXORsim (historical EXOR-based systems)")
    print("   - Custom SWTPC emulators")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: check_emulator_compat.py <disassembly_file>")
        sys.exit(1)
    
    analyze_emulator_compatibility(sys.argv[1])
