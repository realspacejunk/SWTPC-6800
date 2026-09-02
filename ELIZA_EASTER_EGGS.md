# SWTPC-6800 ELIZA - Easter Eggs & Interesting Interactions

This document covers the quirks, easter eggs, and interesting interaction patterns you can discover in the authentic 1970s ELIZA program running from your cassette tape.

## What Makes This ELIZA Special

This is **authentic 1970s machine code**, not a modern implementation. That means:
- ✅ Real pattern matching and transformation rules from the original
- ✅ Authentic memory limitations and buffer sizes
- ✅ Period-accurate response generation logic
- ✅ 1970s-style string handling and character limits
- ✅ Quirky behavior patterns of the era

---

## Known Interaction Patterns

### 1. **The Classic Therapy Session**
Try these phrases that ELIZA was designed to recognize:

```
You: "I feel depressed"
ELIZA: (Likely probes about what's causing the depression)

You: "My mother"
ELIZA: (Therapeutic angle on family relationships - core topic!)

You: "I think therefore I am"
ELIZA: (Philosophical reflection)

You: "I want to be happy"
ELIZA: (Questions about your desires)
```

### 2. **Reflection & Pronoun Transformation**
ELIZA flips pronouns to reflect statements back:

```
You: "You think I'm crazy"
ELIZA: "Why do YOU think YOU'RE crazy?" (pronouns flipped)

You: "I believe you understand me"
ELIZA: (Transforms to probe what YOU understand)
```

### 3. **Keyword-Triggered Deep Dives**
Certain keywords trigger specific response patterns:

- **"MOTHER/FATHER"** → Family dynamics exploration
- **"DREAM"** → Freudian analysis (if implemented)
- **"LOVE/HATE"** → Emotional intensity questions
- **"COMPUTER/MACHINE"** → Meta-commentary about ELIZA itself
- **"NAME"** → Identity exploration
- **"SORRY"** → Therapeutic reassurance patterns

### 4. **Response Cycling**
When ELIZA encounters the same topic repeatedly, it may:
- Rotate through different response templates
- Return to stored previous statements
- Ask follow-up questions based on conversation history
- Show different emotional tones

Try saying the same thing twice and listen for variation!

---

## Easter Eggs to Discover

### 🎯 The Meta-Question (If Implemented)

```
You: "Are you real?"
You: "What are you?"
You: "Are you a computer?"
```

Some ELIZA versions include responses about their own nature as programs.

### 🎯 Negation Handling

```
You: "I don't feel sad"
ELIZA: (Handles negation - either ignores it or probes the positive)

You: "I am not happy"
ELIZA: (May respond to "happy" or note the negation)
```

The 1970s version might have quirky negation handling!

### 🎯 Punctuation Sensitivity

Try these variations:

```
"I feel sad."      (with period)
"I feel sad!"      (with exclamation)
"I feel sad"       (no punctuation)
"I feel sad?"      (as question)
```

Original ELIZA might process punctuation specially.

### 🎯 Case Sensitivity

```
"i feel sad"       (lowercase)
"I FEEL SAD"       (uppercase)
"I Feel Sad"       (mixed case)
```

The cassette version might expect uppercase input!

### 🎯 The Buffer Limit Test

Try increasingly long inputs to find the maximum string length:

```
You: "This is a test"                           (works)
You: "This is a longer test message"            (works)
You: "This is a very long test message that..."  (truncated?)
```

1970s programs had small memory - find the limit!

### 🎯 Nonsense & Fallback Responses

```
You: "Xyzzy"       (random gibberish)
You: "Qwerty"      (keyboard mash)
You: "123456"      (numbers only)
```

When ELIZA doesn't recognize keywords, it enters fallback mode. Responses might be generic or repetitive.

### 🎯 Double Meaning Words

```
You: "I'm feeling blue"
ELIZA: (Does it recognize idiom or just "feeling"?)

You: "I have a problem"
ELIZA: (Problem = psychological issue?)

You: "I'm running"
ELIZA: (Fleeing? Or just moving?)
```

### 🎯 The Repetition Loop

Send the exact same message three times:

```
You: "I feel anxious"
ELIZA: (first response)

You: "I feel anxious"
ELIZA: (second response - same or different?)

You: "I feel anxious"
ELIZA: (third response - pattern emerges?)
```

Check if responses cycle or show memory of previous statements.

### 🎯 Interruption Handling

Try this rapid-fire sequence:

```
You: "Hello"
ELIZA: (response)

You: "Goodbye"
ELIZA: (immediate termination or continues?)
```

Some ELIZA versions have a "goodbye" keyword that ends sessions.

### 🎯 The Question Mark Test

```
You: "Why?"                    (single word question)
You: "What?"                   (open-ended)
You: "How are you?"            (direct question about ELIZA)
```

Meta-questions about ELIZA itself might trigger special responses.

---

## Interesting Technical Behaviors

### 📊 Response Variability

The cassette ELIZA likely has:
- Multiple response templates for the same keyword
- Randomly selected responses (or pseudo-random)
- Counter-based response rotation

**Test:** Send the same input 5 times and count unique responses.

### 📊 Memory Persistence

Check if ELIZA remembers:
- Previous statements from you
- Mentioned names or topics
- Earlier conversation context

```
You: "My name is Alice"
ELIZA: (stores this?)

Later...

You: "Who am I?"
ELIZA: (recalls "Alice" or asks generically?)
```

### 📊 String Transformation

Watch for these transformations:
- "I" → "YOU" (reflection)
- "me" → "you"
- "my" → "your"
- Pluralization handling

```
You: "I have dreams"
ELIZA: "Tell me about YOUR dreams" (or "dream"?)
```

### 📊 CPU Execution Quirks

Since this is running real 6800 code, look for:
- Timing variations (responses might take different times)
- State-dependent behavior (order of interactions matters)
- Memory side-effects (early inputs might affect later responses)

---

## The Real Easter Egg: Historical Authenticity

The biggest "easter egg" isn't a clever response - **it's that you're running real 1970s code**.

- The code was literally written on an SWTPC-6800 computer
- It was encoded onto magnetic cassette tape
- It survived 40+ years of physical decay
- You've successfully decoded and revived it

**Try this:** While chatting with ELIZA, periodically look at the CPU State panel. Watch the Program Counter (PC) jump around memory, see the registers change, observe actual 6800 machine instructions executing. **That's not simulated - that's the real cassette code running.**

---

## Conversation Starters for Discovery

Use these to probe the ELIZA implementation:

### Emotional Keywords
- "I feel happy"
- "I feel sad"
- "I feel worried"
- "I feel confused"

### Relationship Keywords
- "My mother"
- "My father"
- "My friend"
- "My family"

### Existential Questions
- "What am I?"
- "Who are you?"
- "Why do I exist?"
- "Am I real?"

### Impossible Scenarios
- "I can fly"
- "I can read minds"
- "I am invisible"
- "I am a robot"

### Logical Paradoxes
- "This statement is false"
- "I am lying"
- "You are not a therapist"
- "Everything you say is wrong"

---

## How to Report Discoveries

If you find interesting ELIZA behaviors:

1. **Document the input** - Exactly what you typed
2. **Screenshot the response** - What ELIZA said
3. **Note the context** - What happened before
4. **Check for patterns** - Reproducible or random?
5. **Share findings** - File an issue or PR with your discovery!

---

## Technical Notes for Developers

The ELIZA implementation in the cassette:

- **Location:** 0x12DB - 0x07B2B (26,705 bytes)
- **Pattern Storage:** Likely stored in data tables within the binary
- **Response Generation:** Text transformation and random selection
- **I/O:** Character-by-character via SWTPC monitor calls (0x0216)
- **Memory Constraints:** 32KB total system memory in period-accurate emulation

### Reverse-Engineering ELIZA

To understand the exact response patterns, analyze:
1. Text patterns in the binary (look for keywords and responses)
2. Jump table structures (pattern matching dispatch)
3. Random number generation (response selection)
4. String transformation algorithms (pronoun flipping, etc.)

See `CASSETTE_EMULATION_SUCCESS.md` for memory map and binary structure.

---

## Fun Challenges

### Challenge 1: Find All Keywords
Try to identify every keyword that ELIZA recognizes.

### Challenge 2: Get a Non-Standard Response
Find an input that produces unexpected output (not a template response).

### Challenge 3: Confuse ELIZA
Create a statement that makes ELIZA unable to generate a response.

### Challenge 4: Response Cycling
Determine exactly how many unique responses ELIZA has for a single keyword.

### Challenge 5: Memory Limits
Find the maximum input length and response length.

---

**Happy exploring! You're having a therapeutic session with authentic 1970s artificial intelligence.** 🎉

*Brought to you by your SWTPC-6800 cassette tape, 1970s AI, and JavaScript emulation magic.*
