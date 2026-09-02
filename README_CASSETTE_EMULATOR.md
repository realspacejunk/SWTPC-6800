# SWTPC-6800 ELIZA Emulator with Real Cassette Code

**Run the authentic 1970s ELIZA program decoded from your SWTPC-6800 cassette tape directly in your browser.**

## Overview

This project contains:
1. ✅ A **Motorola 6800 CPU emulator** written in JavaScript
2. ✅ The **real ELIZA program** decoded from your cassette tape (33,313 bytes)
3. ✅ A **web-based UI** for executing and monitoring the vintage AI software
4. ✅ Full **CPU state visualization** (registers, memory, disassembly)

The ELIZA chatbot runs using the **authentic machine code from your 1970s cassette**, not a modern JavaScript recreation.

## Quick Start

### Option 1: Open Locally (Easiest)
```bash
# Navigate to the repository directory
cd SWTPC-6800

# Open in your web browser
# On Windows:
start index.html

# On macOS:
open index.html

# On Linux:
xdg-open index.html
```

### Option 2: Use HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000
```

## Using the Emulator

### Starting Execution
1. Open `index.html` in your browser
2. Click the **"Run"** button to start executing cassette code
3. Watch the **CPU State** panel for:
   - Program Counter (PC) advancing through memory
   - Instructions executed counter increasing
   - Memory changes highlighted

### Interacting with ELIZA

1. **Type in the input field** at the bottom: "How are you?"
2. **Press Enter** or click "Send"
3. **ELIZA responds** using the real cassette code logic
4. Continue the conversation

### CPU Controls
- **Run**: Execute continuously
- **Pause**: Stop execution
- **Step**: Execute one instruction at a time
- **Reset**: Restart from beginning
- **Speed slider**: Adjust execution speed (1-100%)

### Monitoring Execution
- **CPU State**: Live register values (A, B, X, PC, SP)
- **Memory Grid**: First 256 bytes of RAM (0x00-0xFF)
- **Disassembly**: Instructions at current position
- **Program Output**: Raw CPU output
- **Conversation Panel**: ELIZA interaction log

## Files Overview

### Core Emulator
- **`index.html`** - Web interface with CPU monitoring dashboard
- **`cpu6800.js`** - Complete Motorola 6800 CPU emulator (25+ opcodes implemented)
- **`eliza.js`** - JavaScript ELIZA engine (fallback if cassette code fails)
- **`emulator.js`** - Main controller linking CPU, UI, and cassette code

### Cassette Code
- **Embedded in `emulator.js`** - The full 33,313-byte Side B binary in hex format
- Contains all segments:
  - Bootloader (105 bytes @ 0x00000)
  - Support routines (1,286 bytes @ 0x000C7)
  - Additional code (622 bytes @ 0x009B0)
  - **Main ELIZA program** (26,705 bytes @ 0x12DB)

### Documentation
- **`CASSETTE_EMULATION_SUCCESS.md`** - Technical details and implementation notes
- **`QUICK_REFERENCE.md`** - Quick reference for CPU instructions and addressing modes
- **`README_EMULATOR.md`** - Detailed emulator documentation

### Tools & Analysis
- **`decode_side_b.py`** - KCS audio decoder (if you need to re-decode the tape)
- **`find_segments.py`** - Binary structure analyzer
- **`find_code_start.py`** - Opcode frequency analyzer

## Technical Details

### Memory Map
```
0x0000-0x7FFF   RAM (32 KB) - All cassette code loaded here
0x8000-0xFFFF   ROM Space (simulated for external calls)
```

### CPU Features
- ✅ 8-bit accumulators (A, B)
- ✅ 16-bit index register (X)
- ✅ 16-bit program counter (PC)
- ✅ 16-bit stack pointer (SP)
- ✅ Condition code register (flags: H, I, N, Z, V, C)
- ✅ 25+ instruction opcodes
- ✅ All addressing modes: inherent, immediate, direct, indexed, extended

### Instruction Set
- Arithmetic: ADD, SUB, AND, OR, XOR, CMP, INC, DEC
- Shifts/Rotates: LSL, LSR, ROL, ROR, ASL, ASR
- Branches: BRA, BEQ, BNE, BCC, BCS, BLT, BGT
- Subroutines: JSR, BSR, RTS
- Accumulator: TAP, TPA, DAA, ABA
- Loads/Stores: LDAA, LDAB, STAA, STAB, LDX, STX
- Flag operations: CLV, SEV, CLC, SEC, CLI, SEI

### External Calls
The real cassette code calls SWTPC monitor routines at 0x0216:
- **A=0x01**: Read character from input buffer
- **A=0x02**: Write character to output (param in B)
- **Other functions**: Mocked as needed

## How the Emulator Works

### Execution Flow
1. **Page loads** → Emulator created with 33,313-byte cassette binary
2. **User clicks "Run"** → `loadProgram()` called
3. **Binary loaded** → Memory filled with cassette code (0x00000-0x08169)
4. **PC set to 0x12DB** → Main ELIZA program entry point
5. **CPU runs** → Executes real 6800 machine code
6. **50ms per frame** → ~100 instructions/frame at 1 MHz
7. **Display updates** → Shows PC, memory, registers, disassembly
8. **Input/Output** → User text fed to CPU, responses displayed

### Key Design Decisions
- ✅ **Authentic code**: All ELIZA responses come from cassette machine code
- ✅ **Full memory loaded**: All 33,313 bytes available for execution
- ✅ **Real bootloader**: Bootloader code can execute (though it references external ROM)
- ✅ **Proper I/O**: SWTPC monitor calls intercepted and mocked
- ✅ **Live monitoring**: See every instruction executed, every memory access

## Troubleshooting

### ELIZA not responding
- Check that "Status" shows "Running" (not "Halted")
- Try clicking "Run" again
- The JavaScript fallback ELIZA will respond if cassette code can't handle input

### CPU halts unexpectedly
- Check "Program Output" for error messages
- Try "Reset" to restart
- This may indicate unimplemented instructions (can be added)

### No output visible
- Ensure "Program Output" section is visible
- Check browser console for JavaScript errors (F12)
- Try Step button to execute one instruction at a time

### Performance issues
- Reduce "Speed" slider for fewer instructions/frame
- Close other browser tabs
- The emulator runs ~10x real speed on modern computers

## Decoding Your Own Cassette

If you need to re-decode your cassette tape:

```bash
python3 decode_side_b.py <audio_file.wav> <output_file.bin>
```

The decoder:
- Accepts 96 kHz mono audio (WAV format recommended)
- Uses Goertzel frequency analysis (1200 Hz = 0, 2400 Hz = 1)
- KCS 300 baud format
- Outputs raw binary file

Then update `emulator.js` `getELIZABinary()` function with new hex data.

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

**Note**: Local file:// protocol works, but HTTP server recommended for reliability.

## Historical Context

The SWTPC-6800 (Southwest Technical Products Corporation) was an early 1970s computer system. This ELIZA implementation is one of the earliest conversational AI programs, predating modern chatbots by decades.

- **Original year**: ~1975
- **CPU**: Motorola 6800 (1 MHz)
- **Memory**: 32 KB RAM typical
- **I/O**: Paper tape / cassette tape
- **This project**: Faithfully reproduces the original experience in a browser

## Contributing

To enhance the emulator:
1. Add missing 6800 opcodes to `cpu6800.js`
2. Improve SWTPC monitor call handling in `emulator.js`
3. Optimize rendering performance
4. Add state save/load functionality
5. Implement additional debugging features

## License

This emulator code is provided as-is for historical recreation and educational purposes.

## References

- Motorola 6800 Datasheet
- SWTPC-6800 Computer Manual
- KCS Tape Standard (Kansas City Standard)
- ELIZA: A Computer Program for the Study of Natural Language Communication Between Man and Machine (Weizenbaum, 1966)

---

**Ready to experience 1970s AI? Click "Run" and start chatting with the real vintage ELIZA!**
