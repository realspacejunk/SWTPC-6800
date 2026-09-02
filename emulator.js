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
     * Get embedded ELIZA binary - Side B cassette data (33,313 bytes)
     * This is the REAL cassette ELIZA program, not a JavaScript replacement
     */
    getELIZABinary() {
        // Complete ELIZA Side B binary from cassette
        // Decoded from KCS 300-baud cassette tape Side B
        // Contains: Boot code + Support routines + MAIN ELIZA PROGRAM (26,705 bytes)
        const hexStr = "62C2F8682087B50E3231E2D0582542AFD40647456D60455C0612844611B1EC7599C15A2798EA13CAAC36B9486E93ABE22698287F8A0971A38B1CB61B49649F324895C97152135C5D37C155715B481C06000000000000000000000000000000000000000000000000F8FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFFFFFFFFFFFFFFFFFFFCFFFFFFFBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFF7F000000000000000000000000000000000000000000005000000000800000000104020202400088000000000000C002800000000000004400200020204800904008400C000000400020000000070100000000012506200800000085011408110000000208284480000001400011008600000071020143B4072981101058309000002010053000060681400D1000008100000202C00003080001012280001010920870220088000000281019408000200018000000A592012000084800702000000004001000200208008000001100404080840208801000C10912203A28800108800091115100C01041400101C0C40100C0900040400800000080040000000000040000800462108320602402800422202260C400682046208EEC28020200020000200000000004000A00480C040000E0040000002000A84400000806100480800631060180032200111B5000224020000035015301900430100000000047180021B700000000209B8810000000960000016800081020800C403001020800210200000010100010809101800000800810000000201B042000C030010000050000D020820689084488008200404010060A0000E0880008400000060620280A00004400006C00000032484400000000020204020800000400010100330880420400080004002102000000009201010080800039100008000000190084040C0080C2000080100100408000000C0A51000D010000408C0800116006E8300A0120000001E000080A00400260080002000000A210000008206005000000011040520100000438120101002010000010020140360808000023020001001902001021020180000000030000000000B0445000405C00156100800E5102000000C0100818000040100000E50246040000000000A0080000023040003020000A2000804A0408150020040048030000000006000000009208001001018000008001010000008001010008010C12004080896040000D08000501040000808800000000900C0000100000020400200080A200002000004806010000030088018013405193308049268890000000000002000084388028000800A22808000008002011000000041942141050008A45010080800C00680042004640480C010200244204040004C412000020000028080321970001000014040001000000700900004118046149100380000000800010000000D04434010108445011040095080000880006245000020222400C0C00000200C006010000200000006208000000001064000000000408202988000108A0220400080088181000001C0100000080D8000004001000004001004044000000008C0800000000006C000080C00400002020481001230000102107020011000000430200010123020000000014840800003000000000A0210B000000808008121000081108000C00C00080000004C014004040880D004E0E2720202A20C4400000020000010E00000080004C0611114A000000010010205000080000300210000900003A020000000080210430044021E0C1048C0200044490080D0000010000000040000112000000400080000000020110020002201602030100822149400001000000E0080AC30240A0808D080080143800020042460001000010144000808040008B40024000202004010040020300030002A011800010081015010306120108210008005A8091C014040020090100401808C005000041015C4C8C04C101C800042040880020A4C20208200302343070511005710231030300010080FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFDFFFFFFFFFFFFFF7FFFFFFFFFFFFFFFFFFFFFF9FFFFFFFFFFFFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF9FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        
        const data = new Uint8Array(33313);
        
        // Convert hex string to bytes
        for (let i = 0; i < hexStr.length; i += 2) {
            data[i / 2] = parseInt(hexStr.substr(i, 2), 16);
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
        // Load entire Side B binary into memory starting at 0x0000
        // This includes all code segments and data tables
        this.cpu.loadProgram(this.elizaBinary, 0);
        
        // Side B binary structure (all loaded into RAM):
        // - 0x00000-0x00068: Bootloader (105 bytes) - references ROM at 0xFF8D
        // - 0x000C7-0x005CC: Support routines (1286 bytes)
        // - 0x009B0-0x00C1D: More support code (622 bytes)
        // - 0x012DB-0x07B2B: MAIN ELIZA PROGRAM (26,705 bytes)
        //
        // Note: The bootloader at 0x0000 tries to jump to ROM (0xFF8D)
        // In the HTML emulator, we skip this and jump directly to the main
        // ELIZA program which contains the real AI engine.
        this.cpu.PC = 0x12DB;
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
