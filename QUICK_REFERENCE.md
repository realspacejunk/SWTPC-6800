# Quick Reference: SWTPC-6800 Emulator

## 🚀 Quick Start

```
1. Open: index.html (in web browser)
2. Click: "Run" button
3. Watch: Registers, memory, and disassembly update in real-time
```

## 📋 CPU State Display

```
CPU State Panel:
├─ Registers
│  ├─ A (Acc A):     0x00      [8-bit accumulator]
│  ├─ B (Acc B):     0x00      [8-bit accumulator]
│  ├─ X (Index):     0x0000    [16-bit index register]
│  ├─ PC (Program):  0x0000    [16-bit program counter]
│  ├─ SP (Stack):    0x7FFF    [16-bit stack pointer]
│  └─ Cycles:        0         [Total cycles executed]
└─ Flags
   ├─ H (Half-Carry)  [CLR]
   ├─ I (IRQ Mask)    [CLR]
   ├─ N (Negative)    [CLR]
   ├─ Z (Zero)        [CLR]
   ├─ V (Overflow)    [CLR]
   └─ C (Carry)       [CLR]
```

## 🎮 Controls

| Control | Shortcut | Effect |
|---------|----------|--------|
| Run | - | Execute at current speed |
| Pause | - | Pause execution |
| Step | - | Execute 1 instruction |
| Reset | - | Clear all state |
| Speed | Slider | 1% to 100% |

## 📍 Memory Map

```
0x0000 ────────────────────┐
       │    RAM (32 KB)      │
       │  Program loads here │
0x7FFF ────────────────────┤
       │    ROM Space (32KB) │  [External/Mock]
       │  JSR $0216 targets  │
0xFFFF ────────────────────┘
```

## 🔧 Instruction Set Quick Guide

### Data Transfer
- `LDAA $nn` - Load byte into A
- `LDAB $nn` - Load byte into B  
- `STAA $nn` - Store A to memory
- `STAB $nn` - Store B to memory

### Arithmetic
- `ADDA $nn` - A = A + byte
- `ADDB $nn` - B = B + byte
- `SUBA $nn` - A = A - byte
- `CMPA $nn` - Compare (sets flags)

### Logical
- `ANDA $nn` - A = A AND byte
- `ORA $nn`  - A = A OR byte
- `EORA $nn` - A = A XOR byte
- `BITA $nn` - Test bits (sets Z flag)

### Branches (Conditional)
```
BRA $addr    [Always branch]
BEQ $addr    [If Zero flag set]
BNE $addr    [If Zero flag clear]
BMI $addr    [If Negative flag set]
BPL $addr    [If Negative flag clear]
BCC $addr    [If Carry clear]
BCS $addr    [If Carry set]
```

### Subroutines
- `BSR $addr` - Branch to subroutine (relative)
- `JSR $addr` - Jump to subroutine (absolute)
- `RTS`       - Return from subroutine

### Control
- `NOP`       - No operation
- `SWI`       - Software interrupt
- `WAI`       - Wait for interrupt (halts)

## 🎯 Program Flow Example

```
Address  Instruction    Effect
───────  ────────────   ──────────────
0x0000   LDAA #$42      A = 0x42
0x0002   CMPA #$42      Compare (Z flag set)
0x0004   BEQ $0008      If equal, jump to 0x0008
0x0006   NOP            (skip if branch taken)
0x0007   RTS            Return
0x0008   ...            Continue here
```

## 🔍 Reading the Display

### Disassembly View
```
0000: B9 11 4D  ADCA  $114D      ← Current highlighted in blue
0003: 95 1B     BITA  $1B
0005: 33        DB    $33
```

Column breakdown:
- **0000**: Memory address (hex)
- **B9 11 4D**: Machine code bytes (hex)
- **ADCA**: Instruction mnemonic
- **$114D**: Operand (address/value)

### Memory Grid
```
00: 00 00 00 00 00 00 00 00
08: 00 00 00 00 00 00 00 00
...
50: [highlighted in blue = recently modified]
```

### Output Console
```
[Green text shows program output]
[Program status messages]
```

## 📊 Performance Metrics

- **Cycles**: Total CPU cycles executed
- **Instructions**: Total instructions executed
- **Clock**: MHz equivalent (cycles ÷ 1,000,000)
- **Status**: Running / Paused / Halted

## ⚡ Speed Presets

| Slider | Speed | Use Case |
|--------|-------|----------|
| 1% | Very Slow | Detailed observation |
| 25% | Slow | Normal debugging |
| 50% | Medium | Balanced viewing |
| 75% | Fast | Quick execution |
| 100% | Full Speed | Fastest possible |

## 🐛 Debugging Tips

1. **Trace Execution**
   - Set speed to 10%
   - Watch registers update step-by-step
   - Note memory changes (highlighted)

2. **Follow Branches**
   - Disassembly shows current instruction (blue)
   - PC register shows address
   - Watch X register for indexed addressing

3. **Check Memory**
   - Memory grid shows first 256 bytes
   - Highlighted = recently modified
   - Stack pointer at 0x7FFF

4. **Monitor Flags**
   - Z flag: zero result
   - C flag: carry/borrow
   - N flag: negative (bit 7 set)
   - V flag: signed overflow

## 🔗 Addressing Modes Explained

```
LDAA #$42     ← Immediate    [constant 0x42]
LDAA $80      ← Direct       [byte at address 0x80]
LDAA $2000    ← Extended     [byte at address 0x2000]
LDAA $10,X    ← Indexed      [byte at X+0x10]
BEQ $0050     ← Relative     [branch target]
```

## ⚠️ Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Program halts immediately | WAI instruction | Normal - program waiting |
| Infinite loop | Branch not working | Check branch target address |
| Crash/No output | External call to ROM | Mocked - expected behavior |
| Memory not changing | STAA/STAB used | Check Z flag in output |

## 📚 For More Information

- **ELIZA_DISASSEMBLY.md** - Technical analysis
- **EMULATOR_COMPATIBILITY.md** - System requirements
- **README_EMULATOR.md** - Complete reference
- **PROJECT_SUMMARY.md** - Overview and architecture

---

**SWTPC-6800 Emulator v1.0**  
*Run 1970s vintage computer code in your browser!*
