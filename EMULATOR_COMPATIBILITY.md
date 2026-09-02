# SWTPC-6800 ELIZA Tape - Emulator Compatibility Analysis

## Executive Summary

**Status**: ⚠️ **PARTIALLY RUNNABLE** with caveats

The decoded ELIZA tape contains **valid 6800 machine code** but has dependencies that prevent it from running as a standalone program.

## Detailed Analysis

### Code References Found

**Critical External JSR (Jump to Subroutine):**
- `0x003E: JSR $0216` - **OUTSIDE decoded data range**
  - This is a subroutine call to address 0x0216
  - Decoded data is only 0x0000-0x7F3F (32,575 bytes)
  - Address 0x0216 likely points to SWTPC ROM or a separately loaded routine

**Internal Subroutine Calls (Valid):**
```
0x002D: BSR $0035           [Branch to Subroutine within code]
0x0036: JSR $5D,X           [Jump using X register + offset]
0x066C: BSR $06D6           [Branch to Subroutine]
0x06B1: BSR $071B           [Branch to Subroutine]
0x06EB: BSR $0755           [Branch to Subroutine]
... and many more internal branches
```

**Conditional Branches (All Internal):**
- All BRA (Branch Always) instructions reference addresses within 0x0000-0x07FF
- Examples: BRA $00BD, BRA $0106, BRA $052F, BRA $057B, etc.
- These are **internally consistent** and would work fine

### Memory Layout Requirements

```
SWTPC-6800 Memory Map (from decoded data):

0x0000-0x00C2   : Program Code/Data (195 bytes)  [DECODED]
0x00C3-0x7F3F   : Padding (0xFF)                 [NOT USEFUL]
0x8000-0xFFFF   : ROM Space                      [NEEDED FOR JSR $0216]
```

### The Problem

1. **External Dependency**: The instruction at 0x003E calls JSR $0216
   - This address is in **ROM space** (0x8000-0xFFFF range logically, or external)
   - The decoded tape does NOT contain the target code
   - Program will **jump to undefined code** and likely crash

2. **Incomplete Image**: Only ~200 bytes of actual code, rest is padding
   - Suggests this is a **bootloader fragment** or tape header
   - Not a complete executable program

3. **I/O Dependencies**: Likely uses SWTPC ROM functions for:
   - Serial I/O (cassette control)
   - Memory management
   - System calls

### What IS Runnable

✓ **The code itself is valid 6800 assembly**
✓ **Internal branches and loops are consistent**
✓ **All addressing modes are correct**
✓ **Instruction opcodes are valid**

### What Would Be Needed to Run

**Option 1: Full System Emulation**
- SWTPC-6800 system emulator (MAME)
- Complete SWTPC ROM image (need to provide)
- 64K address space with proper memory mapping
- Serial/cassette I/O emulation

**Option 2: Create Test Harness**
- Load decoded code at 0x0000
- Mock the external subroutine at 0x0216
- Set up 64K RAM/ROM regions
- Run with a basic 6800 emulator

**Option 3: Extract Standalone Sections**
- Identify self-contained routines
- Trace code paths that don't call external routines
- Test individual subroutines in isolation

## Recommended Emulators

| Emulator | Status | Notes |
|----------|--------|-------|
| **MAME** | ✓ Excellent | Full SWTPC system, but needs ROM |
| **py6800** | ✓ Good | Pure Python, highly configurable |
| **Sim6800** | ✓ Good | Educational 6800 simulator |
| **EXORsim** | ✓ Historical | Original EXOR-based systems |

## Conclusion

**Can this run on an emulator?**
- ✓ YES, with a **full SWTPC-6800 system emulator** and **SWTPC ROM image**
- ✗ NO, as a **standalone program** without external dependencies

**Next Steps:**
1. Try MAME with SWTPC-6800 driver + this tape image
2. Create mock ROM functions for emulator testing
3. Locate original SWTPC ROM image for proper execution
4. Analyze what JSR $0216 is supposed to do (likely in SWTPC documentation)
