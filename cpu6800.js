/**
 * Motorola 6800 CPU Emulator
 * Implements core instruction set and addressing modes
 */

class CPU6800 {
    constructor() {
        // Registers
        this.A = 0;          // Accumulator A (8-bit)
        this.B = 0;          // Accumulator B (8-bit)
        this.X = 0;          // Index Register (16-bit)
        this.PC = 0;         // Program Counter (16-bit)
        this.SP = 0x7FFF;    // Stack Pointer (16-bit)
        
        // Condition Code Register
        this.H = 0;          // Half-Carry
        this.I = 0;          // IRQ Mask
        this.N = 0;          // Negative
        this.Z = 0;          // Zero
        this.V = 0;          // Overflow
        this.C = 0;          // Carry
        
        // Memory
        this.memory = new Uint8Array(0x10000);  // 64K
        
        // Execution state
        this.running = false;
        this.cycles = 0;
        this.instructions = 0;
        this.halted = false;
        
        // Callback for external calls
        this.externalCallHandler = null;
    }
    
    /**
     * Load program into memory
     */
    loadProgram(data, address = 0) {
        for (let i = 0; i < data.length; i++) {
            this.memory[address + i] = data[i];
        }
    }
    
    /**
     * Execute one instruction
     */
    step() {
        if (this.halted) return false;
        
        const opcode = this.readByte(this.PC);
        const startPC = this.PC;
        let cycles = 1;
        
        try {
            cycles = this.execute(opcode);
        } catch (e) {
            console.error(`CPU Error at 0x${startPC.toString(16).padStart(4, '0')}: ${e.message}`);
            this.halted = true;
            return false;
        }
        
        this.cycles += cycles;
        this.instructions++;
        return true;
    }
    
    /**
     * Execute instruction
     */
    execute(opcode) {
        let cycles = 1;
        
        // Decode and execute
        switch(opcode) {
            // NOP
            case 0x01: break;
            
            // TAP - Transfer Accumulator A to CC register
            case 0x06:
                this.setCC(this.A);
                break;
            
            // TPA - Transfer CC register to Accumulator A
            case 0x07:
                this.A = this.getCC();
                this.updateZ(this.A);
                break;
            
            // DEX - Decrement Index Register
            case 0x09:
                this.X = (this.X - 1) & 0xFFFF;
                this.updateZ((this.X >> 8) | (this.X & 0xFF));
                break;
            
            // CLV - Clear Overflow
            case 0x0A:
                this.V = 0;
                break;
            
            // SEV - Set Overflow
            case 0x0B:
                this.V = 1;
                break;
            
            // CLC - Clear Carry
            case 0x0C:
                this.C = 0;
                break;
            
            // SEC - Set Carry
            case 0x0D:
                this.C = 1;
                break;
            
            // CLI - Clear IRQ Mask
            case 0x0E:
                this.I = 0;
                break;
            
            // SEI - Set IRQ Mask
            case 0x0F:
                this.I = 1;
                break;
            
            // DAA - Decimal Adjust A
            case 0x19:
                this.A = this.decimalAdjust(this.A);
                break;
            
            // ABA - Add B to A
            case 0x1B:
                this.add8(this.A, this.B);
                break;
            
            // BRA - Branch Always
            case 0x20:
                this.PC = this.readRelative();
                cycles = 3;
                break;
            
            // BHI - Branch if Higher
            case 0x22:
                if (!this.C && !this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BLS - Branch if Lower or Same
            case 0x23:
                if (this.C || this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BCC - Branch if Carry Clear
            case 0x24:
                if (!this.C) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BCS - Branch if Carry Set
            case 0x25:
                if (this.C) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BNE - Branch if Not Equal
            case 0x26:
                if (!this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BEQ - Branch if Equal
            case 0x27:
                if (this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BVC - Branch if Overflow Clear
            case 0x28:
                if (!this.V) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BVS - Branch if Overflow Set
            case 0x29:
                if (this.V) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BPL - Branch if Plus
            case 0x2A:
                if (!this.N) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BMI - Branch if Minus
            case 0x2B:
                if (this.N) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BGE - Branch if Greater or Equal
            case 0x2C:
                if (!(this.N ^ this.V)) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BLT - Branch if Less Than
            case 0x2D:
                if (this.N ^ this.V) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BGT - Branch if Greater Than
            case 0x2E:
                if (!(this.N ^ this.V) && !this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // BLE - Branch if Less or Equal
            case 0x2F:
                if ((this.N ^ this.V) || this.Z) {
                    this.PC = this.readRelative();
                    cycles = 3;
                } else {
                    this.PC += 2;
                }
                break;
            
            // RTS - Return from Subroutine
            case 0x39:
                this.PC = this.pullWord();
                cycles = 5;
                break;
            
            // WAI - Wait for Interrupt
            case 0x3E:
                this.halted = true;
                break;
            
            // SWI - Software Interrupt
            case 0x3F:
                this.pushWord(this.PC + 1);
                this.I = 1;
                this.halted = true;
                cycles = 12;
                break;
            
            // CMPA - Compare A (Immediate)
            case 0x81:
                this.compare8(this.A, this.readByte(this.PC + 1));
                this.PC += 2;
                cycles = 2;
                break;
            
            // SBCA - Subtract with Carry from A
            case 0x82:
                this.A = this.sub8(this.A, this.readByte(this.PC + 1) + this.C);
                this.PC += 2;
                cycles = 2;
                break;
            
            // ANDA - AND A with Immediate
            case 0x84:
                this.A &= this.readByte(this.PC + 1);
                this.updateNZ(this.A);
                this.PC += 2;
                cycles = 2;
                break;
            
            // BITA - Bit Test A
            case 0x85:
                this.updateNZ(this.A & this.readByte(this.PC + 1));
                this.PC += 2;
                cycles = 2;
                break;
            
            // LDAA - Load A (Immediate)
            case 0x86:
                this.A = this.readByte(this.PC + 1);
                this.updateNZ(this.A);
                this.PC += 2;
                cycles = 2;
                break;
            
            // EORA - Exclusive OR A
            case 0x88:
                this.A ^= this.readByte(this.PC + 1);
                this.updateNZ(this.A);
                this.PC += 2;
                cycles = 2;
                break;
            
            // ADCA - Add with Carry to A
            case 0x89:
                this.A = this.add8(this.A, this.readByte(this.PC + 1) + this.C);
                this.PC += 2;
                cycles = 2;
                break;
            
            // ORA - OR A with Immediate
            case 0x8A:
                this.A |= this.readByte(this.PC + 1);
                this.updateNZ(this.A);
                this.PC += 2;
                cycles = 2;
                break;
            
            // ADDA - Add to A
            case 0x8B:
                this.A = this.add8(this.A, this.readByte(this.PC + 1));
                this.PC += 2;
                cycles = 2;
                break;
            
            // BSR - Branch to Subroutine (Relative)
            case 0x8D:
                this.pushWord(this.PC + 2);
                this.PC = this.readRelative();
                cycles = 8;
                break;
            
            // CMPA - Compare A (Direct)
            case 0x91:
                this.compare8(this.A, this.readByte(this.readByte(this.PC + 1)));
                this.PC += 2;
                cycles = 3;
                break;
            
            // SBCA - Subtract with Carry from A (Direct)
            case 0x92:
                this.A = this.sub8(this.A, this.readByte(this.readByte(this.PC + 1)) + this.C);
                this.PC += 2;
                cycles = 3;
                break;
            
            // LDAA - Load A (Direct)
            case 0x96:
                this.A = this.readByte(this.readByte(this.PC + 1));
                this.updateNZ(this.A);
                this.PC += 2;
                cycles = 3;
                break;
            
            // STAA - Store A (Direct)
            case 0x97:
                this.writeByte(this.readByte(this.PC + 1), this.A);
                this.PC += 2;
                cycles = 3;
                break;
            
            // ADDA - Add to A (Direct)
            case 0x9B:
                this.A = this.add8(this.A, this.readByte(this.readByte(this.PC + 1)));
                this.PC += 2;
                cycles = 3;
                break;
            
            // JSR - Jump to Subroutine (Direct)
            case 0x9D:
                this.pushWord(this.PC + 2);
                this.PC = this.readByte(this.PC + 1);
                cycles = 7;
                break;
            
            // JSR - Jump to Subroutine (Extended)
            case 0xBD:
                this.pushWord(this.PC + 3);
                const target = this.readWord(this.PC + 1);
                this.PC = target;
                cycles = 9;
                // Handle external calls
                if (this.externalCallHandler) {
                    this.externalCallHandler(target);
                }
                break;
            
            // CMPB - Compare B (Immediate)
            case 0xC1:
                this.compare8(this.B, this.readByte(this.PC + 1));
                this.PC += 2;
                cycles = 2;
                break;
            
            // LDAB - Load B (Immediate)
            case 0xC6:
                this.B = this.readByte(this.PC + 1);
                this.updateNZ(this.B);
                this.PC += 2;
                cycles = 2;
                break;
            
            // ADDB - Add to B (Immediate)
            case 0xCB:
                this.B = this.add8(this.B, this.readByte(this.PC + 1));
                this.PC += 2;
                cycles = 2;
                break;
            
            // LDAB - Load B (Direct)
            case 0xD6:
                this.B = this.readByte(this.readByte(this.PC + 1));
                this.updateNZ(this.B);
                this.PC += 2;
                cycles = 3;
                break;
            
            // STAB - Store B (Direct)
            case 0xD7:
                this.writeByte(this.readByte(this.PC + 1), this.B);
                this.PC += 2;
                cycles = 3;
                break;
            
            // JSR - Jump to Subroutine (Indexed)
            case 0xAD:
                this.pushWord(this.PC + 2);
                const offset = this.readByte(this.PC + 1);
                this.PC = (this.X + offset) & 0xFFFF;
                cycles = 8;
                break;
            
            // JSR - Jump to Subroutine (Extended, Indexed via X)
            case 0xED:
                this.pushWord(this.PC + 2);
                const offset2 = this.readByte(this.PC + 1);
                this.PC = (this.X + offset2) & 0xFFFF;
                cycles = 8;
                break;
            
            // Default - Unknown opcode
            default:
                this.PC++;
                break;
        }
        
        return cycles;
    }
    
    /**
     * Memory operations
     */
    readByte(addr) {
        return this.memory[addr & 0xFFFF];
    }
    
    writeByte(addr, value) {
        this.memory[addr & 0xFFFF] = value & 0xFF;
    }
    
    readWord(addr) {
        const high = this.readByte(addr);
        const low = this.readByte(addr + 1);
        return (high << 8) | low;
    }
    
    writeWord(addr, value) {
        this.writeByte(addr, (value >> 8) & 0xFF);
        this.writeByte(addr + 1, value & 0xFF);
    }
    
    /**
     * Stack operations
     */
    pushByte(value) {
        this.writeByte(this.SP, value);
        this.SP = (this.SP - 1) & 0xFFFF;
    }
    
    pullByte() {
        this.SP = (this.SP + 1) & 0xFFFF;
        return this.readByte(this.SP);
    }
    
    pushWord(value) {
        this.pushByte((value >> 8) & 0xFF);
        this.pushByte(value & 0xFF);
    }
    
    pullWord() {
        const low = this.pullByte();
        const high = this.pullByte();
        return (high << 8) | low;
    }
    
    /**
     * Addressing modes
     */
    readRelative() {
        const offset = this.readByte(this.PC + 1);
        const signed = offset > 127 ? offset - 256 : offset;
        return (this.PC + 2 + signed) & 0xFFFF;
    }
    
    /**
     * ALU operations
     */
    add8(a, b) {
        const result = (a + b) & 0xFF;
        this.updateNZ(result);
        if (a + b > 0xFF) this.C = 1; else this.C = 0;
        // Overflow: positive + positive = negative, or negative + negative = positive
        if ((a & 0x80) === (b & 0x80) && (result & 0x80) !== (a & 0x80)) this.V = 1; else this.V = 0;
        return result;
    }
    
    sub8(a, b) {
        const result = (a - b) & 0xFF;
        this.updateNZ(result);
        if (a < b) this.C = 1; else this.C = 0;
        if ((a & 0x80) !== (b & 0x80) && (result & 0x80) !== (a & 0x80)) this.V = 1; else this.V = 0;
        return result;
    }
    
    compare8(a, b) {
        const result = (a - b) & 0xFF;
        this.updateNZ(result);
        if (a < b) this.C = 1; else this.C = 0;
    }
    
    decimalAdjust(value) {
        let result = value;
        if ((value & 0x0F) > 0x09 || this.H) {
            result += 0x06;
        }
        if ((result & 0xF0) > 0x90 || this.C) {
            result += 0x60;
            this.C = 1;
        } else {
            this.C = 0;
        }
        return result & 0xFF;
    }
    
    /**
     * Flag updates
     */
    updateNZ(value) {
        this.N = (value & 0x80) ? 1 : 0;
        this.Z = (value === 0) ? 1 : 0;
    }
    
    updateZ(value) {
        this.Z = (value === 0) ? 1 : 0;
    }
    
    /**
     * Condition Code Register (CCR)
     * Bits: H I N Z V C (+ 2 unused bits)
     */
    getCC() {
        return (this.H << 5) | (this.I << 4) | (this.N << 3) | 
               (this.Z << 2) | (this.V << 1) | this.C;
    }
    
    setCC(value) {
        this.H = (value >> 5) & 1;
        this.I = (value >> 4) & 1;
        this.N = (value >> 3) & 1;
        this.Z = (value >> 2) & 1;
        this.V = (value >> 1) & 1;
        this.C = value & 1;
    }
}
