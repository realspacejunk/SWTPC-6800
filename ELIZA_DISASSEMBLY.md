# SWTPC-6800 ELIZA Tape Decoding - Disassembly Analysis

## Overview
This document analyzes the disassembly of the decoded KCS (Kansas City Standard) tape recording from "ELIZA Side A" for the SWTPC-6800 computer system.

## Decoding Details

### Audio Specifications
- **Original Recording**: 44.1 kHz sample rate, 859.66 seconds
- **Re-recorded**: 192 kHz sample rate, 868.67 seconds (BETTER QUALITY)
- **KCS Format**: 1200 Hz for 0-bit, 2400 Hz for 1-bit, 300 baud
- **Decoded Size**: 32,575 bytes (0x7F3F)

### Decoding Process
1. KCS audio converted to bits using frequency analysis (Goertzel algorithm)
2. Bits packed into bytes (LSB first)
3. Data ends with 0xFF padding (typical tape format)

## Disassembly Observations

### Code Structure

The disassembly reveals the data is **primarily raw machine code with some data regions**:

#### Known 6800 Instructions Found:
- **Subroutine Calls**: JSR $0216, JSR $005D,X
- **Conditional Branches**: BRA, BEQ, BNE, BMI, BPL, BGE, BLT, BVC, BVS, BCC, BCS
- **Return Instructions**: RTS at 0x004B
- **Accumulator Operations**: LSL, LSR, ROR, ASR, NEG, CLR, INC, DEC, TST

#### Key Subroutines:
```
0000: ADCA $114D        ; Add to Acc A with carry
0003: BITA $1B          ; Bit test A
...
002D: BSR $0035         ; Branch to subroutine
003E: JSR $0216         ; Jump to subroutine at 0216
```

### Data Regions

**Compressed/Encoded Data Section (0x0000 - 0x00C2)**
- Contains mix of valid opcodes and likely encoded program data
- Many single-byte values without clear instruction context suggest packed data
- Addresses reference ROM space (0x8000+) typical of SWTPC bootcode

**Padding Section (0x00C2 onwards)**
- Large block of 0xFF bytes indicates tape end marker
- Typical SWTPC tape format marker

### Analysis Summary

| Section | Bytes | Type | Notes |
|---------|-------|------|-------|
| 0x0000-0x004B | 75 | Code/Data | Bootloader or main program entry |
| 0x004C-0x00C2 | 119 | Code/Data | Secondary code/data segment |
| 0x00C3-0x7F3F | 32,701 | Padding | 0xFF padding (unused tape space) |

## Interpretation

This appears to be:

1. **SWTPC Bootloader or Monitor Code**: Contains JSR/BSR instructions typical of a monitor ROM or bootloader
2. **Entry Point at 0x0000**: Suggests code is meant to execute from the start
3. **Subroutine at 0x0216**: Likely a utility routine (not visible in decoded data, may be in ROM)
4. **Tape Format**: Standard SWTPC tape with data followed by padding

## Possible Next Steps

1. **Full Code Analysis**: Trace subroutine calls and conditional branches
2. **SWTPC ROM Lookup**: Cross-reference addresses with known SWTPC ROM maps
3. **Data Recovery**: Analyze non-instruction bytes for encoded program data
4. **Side B Comparison**: Decode and compare with "Side B" of the tape if available

## Files Generated

- `eliza_disasm.asm` - Full 6800 disassembly (32,575 lines)
- `eliza a new.bin` - Decoded binary data
- `eliza a new.hex` - Hex dump for analysis
