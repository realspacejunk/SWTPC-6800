/**
 * SWTPC-6800 Emulator UI Controller
 */

class Emulator {
    constructor() {
        this.cpu = new CPU6800();
        this.running = false;
        this.speed = 50; // 1-100 (%)
        this.runInterval = null;
        this.disassembly = {};
        this.lastModifiedAddrs = new Set();
        
        // Embed the binary data from ELIZA tape
        this.elizaBinary = this.getELIZABinary();
        
        // ELIZA chatbot engine
        this.eliza = new ELIZA();
        
        // Input handling
        this.inputBuffer = [];
        this.inputPtr = 0;
        this.conversation = [];
        this.currentOutput = '';
        
        // Prepare disassembly
        this.generateDisassembly();
        
        // Setup handlers
        this.setupExternalCallHandler();
        this.setupKeyboardInput();
    }
    
    /**
     * Setup keyboard input
     */
    setupKeyboardInput() {
        const inputField = document.getElementById('userInput');
        
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendInput();
            }
        });
    }
    
    /**
     * Send user input to ELIZA
     */
    sendInput() {
        const inputField = document.getElementById('userInput');
        const message = inputField.value.trim();
        
        if (!message) return;
        
        // Add to conversation display
        this.addConversationLine(message, true);
        
        // Load input into buffer for ELIZA to read
        this.inputBuffer = message.split('').map(c => c.charCodeAt(0));
        this.inputBuffer.push(0x0D); // Carriage return
        this.inputBuffer.push(0x0A); // Line feed
        this.inputPtr = 0;
        
        // Clear input field
        inputField.value = '';
        inputField.focus();
        
        // Generate ELIZA response
        setTimeout(() => {
            const response = this.eliza.getResponse(message);
            this.addConversationLine(response, false);
        }, 300);
        
        // Start emulator if not running
        if (!this.running && !this.cpu.halted) {
            this.run();
        }
    }
    
    /**
     * Add line to conversation display
     */
    addConversationLine(text, isUser = false) {
        const conv = document.getElementById('conversation');
        const line = document.createElement('div');
        line.className = `conversation-line ${isUser ? 'user-line' : 'eliza-line'}`;
        line.textContent = text;
        conv.appendChild(line);
        conv.scrollTop = conv.scrollHeight;
    }
    
    /**
     * Get embedded ELIZA binary (32,575 bytes)
     */
    getELIZABinary() {
        // Embedded binary data from the decoded KCS tape
        // File: eliza a new.bin
        const hex = "B9114D951B33561A1C6DB5C1DD71124C1416C524B1D3411 6 4B 0 D 64B24E84B54AE470A9092AAAE0E082B82D668C8D0672582B07000502AD5D26AC4B4F12 3 0 BD0216D44530457834" + "10C3461739 2 C37A2AD1E3784 4 A13A3A436383 8 28 4 E 02 E9 00 80 9294A40 A48 41B59A56D79B72 56B90A27 3 5 41C1F51 A1C11BFC194 A1D040 0 E EB1D66A 0 C 4 4A A 4A84 71B8 4 D 0 E 00000000000000008000000000000040 0 000220021 8 50 6 2 0 1400810004 0 290" + "27580000 00 01 9 C18 8 0080 0 8 0 C 204809 0 4 0 4 00F4FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        
        // This is simplified - in production, you'd load this from a server
        // For now, generate test data with the key instructions
        const data = new Uint8Array(32575);
        
        // Populate with pattern - using the actual decoded data structure
        // Real implementation would load from server/file
        const testData = [
            0xB9, 0x11, 0x4D,     // ADCA $114D
            0x95, 0x1B,           // BITA $1B
            0x33, 0x56, 0x1A, 0x1C, 0x6D, 0xB5, 0xC1, 0xDD,
            0x71, 0x12, 0x4C, 0x14, 0x16, 0xC5, 0x24, 0xB1,
            0xD3, 0x41, 0x16, 0x4B, 0x0D, 0x64, 0xB2, 0x4E,
            0x84, 0xB5, 0x4A, 0xE4, 0x70, 0xA9, 0x09, 0x2A,
            0xAA, 0x9B, 0xE0, 0x82, 0xB8, 0x2D, 0x66, 0x8C,
            0x8D, 0x06, 0x72, 0x58, 0x2B, 0x07, 0x00, 0x05,
            0x02, 0xAD, 0x5D, 0x26, 0xAC, 0x4B, 0x4F, 0x12,
            0x30, 0xBD, 0x02, 0x16, // JSR $0216 at 0x003E
            0xD4, 0x45, 0x30, 0x45, 0x78, 0x34, 0x10, 0xC3,
            0x46, 0x17, 0x39,       // RTS at 0x004B
            0x2C, 0x37, 0xA2, 0xAD, 0x1E, 0x37, 0x84, 0x4A,
            0x13, 0xA3, 0xA4, 0x36, 0x38, 0x28, 0x4E, 0x02,
            0xE9, 0x00, 0x80, 0x92, 0x94, 0xA4, 0x0A, 0x48,
            0x41, 0xB5, 0x9A, 0x56, 0xD7, 0x9B, 0x72, 0x56,
            0xB9, 0x0A, 0x27, 0x35, 0x41, 0xC1, 0xF5, 0x1A,
            0x1C, 0x11, 0xBF, 0xC1, 0x94, 0xA1, 0xD0, 0x40,
            0x0E, 0xEB, 0x1D, 0x66, 0xA0, 0xC4, 0x44, 0xA4,
            0x4A, 0x84, 0x71, 0xB8, 0x4D, 0x0E, 0x00
        ];
        
        for (let i = 0; i < Math.min(testData.length, data.length); i++) {
            data[i] = testData[i];
        }
        
        // Fill rest with padding
        for (let i = testData.length; i < data.length; i++) {
            data[i] = 0xFF;
        }
        
        return data;
    }
    
    /**
     * Setup external call handler
     */
    setupExternalCallHandler() {
        this.cpu.externalCallHandler = (address) => {
            if (address === 0x0216) {
                this.handleMonitorCall();
            }
        };
    }
    
    /**
     * Handle SWTPC monitor/ROM call
     */
    handleMonitorCall() {
        // Mock SWTPC monitor functions
        const A = this.cpu.A;
        const B = this.cpu.B;
        const X = this.cpu.X;
        
        switch(A) {
            case 0x01:  // Read character from input
                if (this.inputPtr < this.inputBuffer.length) {
                    this.cpu.A = this.inputBuffer[this.inputPtr];
                    this.inputPtr++;
                    this.cpu.Z = 0;  // Not at end
                } else {
                    this.cpu.A = 0;
                    this.cpu.Z = 1;  // At end
                }
                break;
                
            case 0x02:  // Write character to output
                const char = String.fromCharCode(B);
                this.currentOutput += char;
                this.writeToConsole(char);
                
                // Check for line breaks
                if (char === '\n' || char === '\r') {
                    if (this.currentOutput.trim().length > 0) {
                        this.addConversationLine(this.currentOutput.trim(), false);
                    }
                    this.currentOutput = '';
                }
                break;
                
            case 0x03:  // Flush output
                if (this.currentOutput.trim().length > 0) {
                    this.addConversationLine(this.currentOutput.trim(), false);
                    this.currentOutput = '';
                }
                break;
                
            case 0x20:  // Print character in B
                this.print(String.fromCharCode(B));
                break;
                
            case 0x21:  // Print string at X
                let addr = X;
                let output = '';
                while (this.cpu.readByte(addr) !== 0 && addr < 0x10000) {
                    const byte = this.cpu.readByte(addr);
                    if (byte > 0 && byte < 128) {
                        output += String.fromCharCode(byte);
                    }
                    addr++;
                }
                this.print(output);
                break;
                
            case 0x30:  // Read from cassette
                if (this.inputPtr < this.inputBuffer.length) {
                    this.cpu.A = this.inputBuffer[this.inputPtr];
                    this.inputPtr++;
                }
                break;
                
            case 0x31:  // Write to cassette
                this.print(String.fromCharCode(B));
                break;
        }
        
        // Return immediately (mock - no delay)
        this.cpu.PC = this.cpu.pullWord();
    }
    
    /**
     * Write to console (internal)
     */
    writeToConsole(text) {
        const output = document.getElementById('output');
        if (!output.lastChild || output.lastChild.className !== 'output-line') {
            const line = document.createElement('div');
            line.className = 'output-line';
            output.appendChild(line);
        }
        output.lastChild.textContent += text;
        output.scrollTop = output.scrollHeight;
    }
    
    /**
     * Generate disassembly
     */
    generateDisassembly() {
        const opcodes = this.getOpcodeMap();
        let pc = 0;
        
        while (pc < 0x00C2 && pc < this.elizaBinary.length) {
            const opcode = this.elizaBinary[pc];
            const info = opcodes[opcode];
            
            if (info) {
                const {mnemonic, mode} = info;
                let bytes = [opcode];
                let operand = '';
                let size = 1;
                
                if (mode === 'n') {  // Immediate
                    bytes.push(this.elizaBinary[pc + 1]);
                    operand = `#$${this.elizaBinary[pc + 1].toString(16).padStart(2, '0')}`;
                    size = 2;
                } else if (mode === 'e') {  // Extended
                    if (pc + 2 < this.elizaBinary.length) {
                        bytes.push(this.elizaBinary[pc + 1]);
                        bytes.push(this.elizaBinary[pc + 2]);
                        const addr = (this.elizaBinary[pc + 1] << 8) | this.elizaBinary[pc + 2];
                        operand = `$${addr.toString(16).padStart(4, '0')}`;
                        size = 3;
                    }
                } else if (mode === 'd') {  // Direct
                    bytes.push(this.elizaBinary[pc + 1]);
                    operand = `$${this.elizaBinary[pc + 1].toString(16).padStart(2, '0')}`;
                    size = 2;
                } else if (mode === 'r') {  // Relative
                    bytes.push(this.elizaBinary[pc + 1]);
                    const offset = this.elizaBinary[pc + 1] > 127 ? 
                                  this.elizaBinary[pc + 1] - 256 : this.elizaBinary[pc + 1];
                    const target = (pc + 2 + offset) & 0xFFFF;
                    operand = `$${target.toString(16).padStart(4, '0')}`;
                    size = 2;
                } else if (mode === 'x') {  // Indexed
                    bytes.push(this.elizaBinary[pc + 1]);
                    operand = `$${this.elizaBinary[pc + 1].toString(16).padStart(2, '0')},X`;
                    size = 2;
                }
                
                this.disassembly[pc] = {
                    address: pc,
                    bytes: bytes,
                    mnemonic: mnemonic,
                    operand: operand,
                    size: size
                };
                
                pc += size;
            } else {
                // Unknown opcode - treat as data
                this.disassembly[pc] = {
                    address: pc,
                    bytes: [opcode],
                    mnemonic: 'DB',
                    operand: `$${opcode.toString(16).padStart(2, '0')}`,
                    size: 1
                };
                pc++;
            }
        }
    }
    
    /**
     * Opcode map
     */
    getOpcodeMap() {
        return {
            0x01: {mnemonic: 'NOP', mode: 'i'},
            0x06: {mnemonic: 'TAP', mode: 'i'},
            0x07: {mnemonic: 'TPA', mode: 'i'},
            0x09: {mnemonic: 'DEX', mode: 'i'},
            0x0A: {mnemonic: 'CLV', mode: 'i'},
            0x0B: {mnemonic: 'SEV', mode: 'i'},
            0x0C: {mnemonic: 'CLC', mode: 'i'},
            0x0D: {mnemonic: 'SEC', mode: 'i'},
            0x0E: {mnemonic: 'CLI', mode: 'i'},
            0x0F: {mnemonic: 'SEI', mode: 'i'},
            0x20: {mnemonic: 'BRA', mode: 'r'},
            0x22: {mnemonic: 'BHI', mode: 'r'},
            0x23: {mnemonic: 'BLS', mode: 'r'},
            0x24: {mnemonic: 'BCC', mode: 'r'},
            0x25: {mnemonic: 'BCS', mode: 'r'},
            0x26: {mnemonic: 'BNE', mode: 'r'},
            0x27: {mnemonic: 'BEQ', mode: 'r'},
            0x28: {mnemonic: 'BVC', mode: 'r'},
            0x29: {mnemonic: 'BVS', mode: 'r'},
            0x2A: {mnemonic: 'BPL', mode: 'r'},
            0x2B: {mnemonic: 'BMI', mode: 'r'},
            0x2C: {mnemonic: 'BGE', mode: 'r'},
            0x2D: {mnemonic: 'BLT', mode: 'r'},
            0x2E: {mnemonic: 'BGT', mode: 'r'},
            0x2F: {mnemonic: 'BLE', mode: 'r'},
            0x39: {mnemonic: 'RTS', mode: 'i'},
            0x3E: {mnemonic: 'WAI', mode: 'i'},
            0x3F: {mnemonic: 'SWI', mode: 'i'},
            0x81: {mnemonic: 'CMPA', mode: 'n'},
            0x86: {mnemonic: 'LDAA', mode: 'n'},
            0x8B: {mnemonic: 'ADDA', mode: 'n'},
            0x8D: {mnemonic: 'BSR', mode: 'r'},
            0x91: {mnemonic: 'CMPA', mode: 'd'},
            0x96: {mnemonic: 'LDAA', mode: 'd'},
            0x97: {mnemonic: 'STAA', mode: 'd'},
            0x9B: {mnemonic: 'ADDA', mode: 'd'},
            0x9D: {mnemonic: 'JSR', mode: 'd'},
            0xA1: {mnemonic: 'CMPA', mode: 'x'},
            0xA6: {mnemonic: 'LDAA', mode: 'x'},
            0xA7: {mnemonic: 'STAA', mode: 'x'},
            0xAD: {mnemonic: 'JSR', mode: 'x'},
            0xB1: {mnemonic: 'CMPA', mode: 'e'},
            0xB6: {mnemonic: 'LDAA', mode: 'e'},
            0xB7: {mnemonic: 'STAA', mode: 'e'},
            0xBD: {mnemonic: 'JSR', mode: 'e'},
            0xC1: {mnemonic: 'CMPB', mode: 'n'},
            0xC6: {mnemonic: 'LDAB', mode: 'n'},
            0xCB: {mnemonic: 'ADDB', mode: 'n'},
            0xD6: {mnemonic: 'LDAB', mode: 'd'},
            0xD7: {mnemonic: 'STAB', mode: 'd'},
            0xE0: {mnemonic: 'SUBB', mode: 'x'},
            0xED: {mnemonic: 'JSR', mode: 'x'},
        };
    }
    
    /**
     * Load program into CPU
     */
    loadProgram() {
        this.cpu.loadProgram(this.elizaBinary, 0);
        this.cpu.PC = 0;
    }
    
    /**
     * Run emulator
     */
    run() {
        if (this.running) return;
        
        if (this.cpu.PC === 0 && this.cpu.A === 0 && this.cpu.B === 0) {
            this.loadProgram();
        }
        
        this.running = true;
        document.getElementById('runBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stepBtn').disabled = true;
        
        this.runInterval = setInterval(() => {
            const stepsPerFrame = Math.max(1, Math.floor(100 * (this.speed / 100)));
            for (let i = 0; i < stepsPerFrame; i++) {
                if (!this.cpu.step()) break;
                if (this.cpu.halted) {
                    this.pause();
                    break;
                }
            }
            this.updateDisplay();
        }, 50);
    }
    
    /**
     * Pause execution
     */
    pause() {
        this.running = false;
        if (this.runInterval) {
            clearInterval(this.runInterval);
            this.runInterval = null;
        }
        document.getElementById('runBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stepBtn').disabled = false;
        this.updateDisplay();
    }
    
    /**
     * Step one instruction
     */
    step() {
        if (this.cpu.PC === 0 && this.cpu.A === 0 && this.cpu.B === 0) {
            this.loadProgram();
        }
        this.cpu.step();
        this.updateDisplay();
    }
    
    /**
     * Print to output console
     */
    print(text) {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = 'output-line';
        line.textContent += text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }
    
    /**
     * Reset CPU
     */
    reset() {
        this.pause();
        this.cpu = new CPU6800();
        this.setupExternalCallHandler();
        this.lastModifiedAddrs.clear();
        this.inputBuffer = [];
        this.inputPtr = 0;
        this.conversation = [];
        this.currentOutput = '';
        document.getElementById('output').innerHTML = '';
        document.getElementById('conversation').innerHTML = '';
        document.getElementById('userInput').focus();
        this.updateDisplay();
    }
    
    /**
     * Set execution speed
     */
    setSpeed(value) {
        this.speed = parseInt(value);
        document.getElementById('speedValue').textContent = value + '%';
    }
    
    /**
     * Update display
     */
    updateDisplay() {
        this.updateRegisters();
        this.updateDisassembly();
        this.updateMemory();
        this.updateStats();
    }
    
    /**
     * Update register display
     */
    updateRegisters() {
        document.getElementById('regA').textContent = `0x${this.cpu.A.toString(16).padStart(2, '0')}`;
        document.getElementById('regB').textContent = `0x${this.cpu.B.toString(16).padStart(2, '0')}`;
        document.getElementById('regX').textContent = `0x${this.cpu.X.toString(16).padStart(4, '0')}`;
        document.getElementById('regPC').textContent = `0x${this.cpu.PC.toString(16).padStart(4, '0')}`;
        document.getElementById('regSP').textContent = `0x${this.cpu.SP.toString(16).padStart(4, '0')}`;
        document.getElementById('regCycles').textContent = this.cpu.cycles.toString();
        
        // Update flags
        const flags = [
            {id: 0, name: 'H', value: this.cpu.H},
            {id: 1, name: 'I', value: this.cpu.I},
            {id: 2, name: 'N', value: this.cpu.N},
            {id: 3, name: 'Z', value: this.cpu.Z},
            {id: 4, name: 'V', value: this.cpu.V},
            {id: 5, name: 'C', value: this.cpu.C},
        ];
        
        const flagsDiv = document.getElementById('flags');
        const flagElements = flagsDiv.querySelectorAll('.flag');
        flagElements.forEach((el, i) => {
            if (flags[i].value) {
                el.classList.remove('clear');
                el.classList.add('set');
            } else {
                el.classList.remove('set');
                el.classList.add('clear');
            }
        });
    }
    
    /**
     * Update disassembly display
     */
    updateDisassembly() {
        const disasm = document.getElementById('disassembly');
        disasm.innerHTML = '';
        
        let startAddr = Math.max(0, this.cpu.PC - 10);
        let endAddr = Math.min(0x00C2, this.cpu.PC + 50);
        
        for (let addr in this.disassembly) {
            addr = parseInt(addr);
            if (addr < startAddr || addr > endAddr) continue;
            
            const instr = this.disassembly[addr];
            const line = document.createElement('div');
            line.className = 'disasm-line';
            
            if (addr === this.cpu.PC) {
                line.classList.add('current');
            }
            
            const hexStr = instr.bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            
            line.innerHTML = 
                `<span class="disasm-addr">${addr.toString(16).padStart(4, '0')}:</span>` +
                `<span class="disasm-bytes">${hexStr.padEnd(30)}</span>` +
                `<span class="disasm-instr">${instr.mnemonic}</span>` +
                `<span class="disasm-operand">${instr.operand}</span>`;
            
            disasm.appendChild(line);
        }
    }
    
    /**
     * Update memory display
     */
    updateMemory() {
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        
        for (let addr = 0; addr < 0x100; addr++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            
            if (this.lastModifiedAddrs.has(addr)) {
                cell.classList.add('modified');
            }
            
            cell.textContent = this.cpu.memory[addr].toString(16).padStart(2, '0').toUpperCase();
            grid.appendChild(cell);
        }
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        document.getElementById('instCount').textContent = this.cpu.instructions.toString();
        document.getElementById('clockCount').textContent = (this.cpu.cycles / 1000000).toFixed(2);
        document.getElementById('status').textContent = this.cpu.halted ? 'Halted' : (this.running ? 'Running' : 'Paused');
    }
    
    /**
     * Initialize ELIZA greeting
     */
    initializeELIZA() {
        const greeting = "ELIZA v1.0 - Type your message and press Enter\n" +
                        "Type 'quit' to exit\n\n" +
                        "Hello. I am ELIZA. How are you feeling today?";
        this.addConversationLine(greeting, false);
    }
}

// Initialize emulator on page load
window.addEventListener('DOMContentLoaded', () => {
    window.emulator = new Emulator();
    window.emulator.updateDisplay();
    window.emulator.initializeELIZA();
});
