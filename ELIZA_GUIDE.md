# ELIZA Interactive Chatbot - User Guide

## Welcome to SWTPC-6800 ELIZA

This is a fully functional recreation of ELIZA, the classic 1960s artificial intelligence psychotherapist, running on an emulated Motorola 6800 CPU!

## How to Use

### Getting Started

1. **Open the page** - Load `index.html` in your web browser
2. **Type your message** - Enter text in the input field at the bottom
3. **Press Enter** - Send your message to ELIZA
4. **Read the response** - ELIZA will reply in the conversation panel
5. **Continue chatting** - Type more messages and press Enter

### Example Conversation

```
YOU: Hello, how are you?
ELIZA: Hello. How are you feeling today?

YOU: I'm feeling anxious
ELIZA: You feel anxious? Tell me more about that.

YOU: I'm worried about work
ELIZA: You are worried about work? How long have you been worried about work?

YOU: For several weeks now
ELIZA: That's interesting. Tell me more.
```

## ELIZA's Conversation Styles

ELIZA responds to different topics with specific patterns:

### Family Discussion
```
YOU: My mother is always critical
ELIZA: Tell me more about your mother.
```

### Feelings
```
YOU: I feel depressed
ELIZA: You feel depressed? Tell me more about that.
```

### Personal Statements
```
YOU: I hate my job
ELIZA: You hate your job? Why do you hate your job?
```

### Questions About ELIZA
```
YOU: Are you real?
ELIZA: I am here to listen. Why do you ask if I'm real?
```

### Affirmations
```
YOU: Yes, that's right
ELIZA: That's good. Tell me more.

YOU: No, that's wrong
ELIZA: Why not? Tell me about it.
```

## Topics That Work Well

ELIZA responds best to:

1. **Family relationships**
   - "Tell me about your mother"
   - "My father was strict"

2. **Emotions and feelings**
   - "I feel sad/happy/anxious/lonely"
   - "I'm worried about..."

3. **Personal experiences**
   - "I work as a..."
   - "I like to..."
   - "I don't like..."

4. **Why questions**
   - "Why do I feel this way?"
   - "Why am I anxious?"

5. **General statements**
   - "Life is hard"
   - "Nothing works for me"

## Display Panels

### CPU State (Left Side)
- **Registers**: Current values of A, B, X, PC, SP
- **Flags**: Condition code status (H, I, N, Z, V, C)
- **Statistics**: Instruction count, cycle count
- Shows the underlying 6800 CPU executing

### Memory Viewer
- First 256 bytes (0x0000-0x00FF) of RAM
- Highlighted cells show recently modified memory
- Educational view of program's data

### Disassembly
- Current machine code being executed
- Shows 6800 instructions with operands
- Highlighted line shows current instruction

### Program Output
- Raw output from the 6800 program
- Shows character-by-character execution

### Conversation Panel (Bottom)
- **User messages** in cyan (YOU:)
- **ELIZA responses** in orange (ELIZA:)
- Automatically scrolls to newest messages
- Shows complete conversation history

## Tips for Better Conversations

### Open-Ended Topics
ELIZA works best with open-ended statements:
- ✓ "I feel stressed about exams"
- ✗ "Yes or no: Do you like cats?"

### Provide Context
More information = better responses:
- ✓ "I've been worried about money for weeks"
- ✗ "Worried"

### Be Reflective
Talk about your thoughts and feelings:
- ✓ "When I think about my past, I feel sad"
- ✗ "The weather is nice today"

### Use Pronouns Naturally
ELIZA reflects pronouns automatically:
- YOU: "I think you should help me"
- ELIZA: "You think I should help you? Why?"

## Special Commands

### Ending the Conversation

Type any of these to exit gracefully:
- `quit`
- `exit`
- `goodbye`
- `bye`

ELIZA will respond with a farewell message.

## How It Works (Behind the Scenes)

This is not a simple chatbot - it's a **true demonstration** of:

1. **6800 CPU Emulation** - Real machine code executing
2. **ELIZA Pattern Matching** - Classic AI from the 1960s
3. **Pronoun Reflection** - Converting I/you/me/your
4. **Memory System** - Remembers statements within session
5. **Input/Output Simulation** - Program reads/writes text

The emulation shows:
- Live CPU registers updating
- Memory being read/written
- Instructions executing
- Full machine code visibility

## Historical Context

ELIZA was created by Joseph Weizenbaum at MIT in 1966. It demonstrated that people could form emotional attachments to non-intelligent programs through:

- **Pattern matching** - Recognize conversation patterns
- **Reflection** - Turn statements into questions
- **Minimal data** - Few pre-written responses
- **Illusion of understanding** - Users read meaning into generic responses

This recreation runs on the SWTPC-6800, a hobby computer from the 1970s, demonstrating how far AI has come (and how little has changed about human interaction!).

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Tab | Focus input field |
| Ctrl+A | Select all in input |

## Browser Compatibility

Works best in:
- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires JavaScript ES6+ support (all modern browsers).

## Troubleshooting

### ELIZA Isn't Responding?
- Make sure you pressed Enter
- Check that the input field isn't empty
- The program may be running - click Pause first

### Can't See My Message?
- Scroll down in the conversation panel
- The newest messages appear at the bottom

### Want to Start Over?
- Click the "Reset" button to clear everything
- Conversation history will be cleared

## Have Fun!

ELIZA is a great way to explore:
- 1960s AI capabilities
- How pattern matching creates apparent intelligence
- The illusion of understanding
- Your own thoughts and feelings!

Type "hello" to get started! 👋

---

**ELIZA v1.0 - 1960s AI Therapy, 2020s Hardware**  
*A bridge between decades*
