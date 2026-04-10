-- ============================================================
-- StudyRev — IGCSE CS 0478 Full Syllabus Seed
-- Run this in Supabase > SQL Editor
-- WARNING: This REPLACES all existing CS data cleanly.
-- ============================================================

-- ── Tables (create if not exist) ──────────────────────────────

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text,
  description text,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  name text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  question_text text not null,
  answer_text text,
  marks integer,
  difficulty text check (difficulty in ('easy','medium','hard')),
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  title text,
  content text not null,
  created_at timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────

alter table subjects enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table notes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='subjects' and policyname='Public read subjects') then
    create policy "Public read subjects" on subjects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='topics' and policyname='Public read topics') then
    create policy "Public read topics" on topics for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='questions' and policyname='Public read questions') then
    create policy "Public read questions" on questions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='notes' and policyname='Public read notes') then
    create policy "Public read notes" on notes for select using (true);
  end if;
end $$;

-- ── Clean existing CS data ─────────────────────────────────────

delete from notes where topic_id in (select id from topics where subject_id = (select id from subjects where name = 'cs'));
delete from questions where topic_id in (select id from topics where subject_id = (select id from subjects where name = 'cs'));
delete from topics where subject_id = (select id from subjects where name = 'cs');
delete from subjects where name = 'cs';

-- ── Subject ────────────────────────────────────────────────────

insert into subjects (id, name, display_name, description, icon, color) values
  ('00000000-0000-0000-0000-000000000001', 'cs', 'Computer Science (0478)', 'IGCSE Cambridge CS — Paper 1 (Topics 1–6) & Paper 2 (Topics 7–10)', '💻', '#00d4ff');

-- ── Topics ────────────────────────────────────────────────────

insert into topics (id, subject_id, name, order_index) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '1 · Data Representation', 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2 · Data Transmission', 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '3 · Hardware', 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '4 · Software', 4),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '5 · The Internet & Its Uses', 5),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '6 · Automated & Emerging Technologies', 6),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '7 · Algorithm Design & Problem-Solving', 7),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '8 · Programming', 8),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '9 · Databases', 9),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10 · Boolean Logic', 10);


-- ════════════════════════════════════════════════════════════
-- TOPIC 1: DATA REPRESENTATION
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000001', '1.1 Number Systems', '
## Why Binary?

Computers use **binary (base 2)** because electronic circuits have two states: ON (1) and OFF (0). All data — numbers, text, images, sound — must be converted to binary before a CPU can process it.

| System | Base | Digits used |
|--------|------|-------------|
| Denary | 10 | 0–9 |
| Binary | 2 | 0, 1 |
| Hexadecimal | 16 | 0–9, A–F |

## Converting Denary → Binary

Divide repeatedly by 2, read remainders **bottom to top**.

**Example: 45**
```
45 ÷ 2 = 22 r 1
22 ÷ 2 = 11 r 0
11 ÷ 2 =  5 r 1
 5 ÷ 2 =  2 r 1
 2 ÷ 2 =  1 r 0
 1 ÷ 2 =  0 r 1
```
Result: **101101**

Or use place values: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1

## Converting Binary → Denary

Add up the place values where there is a 1.

`10110100` = 128+32+16+4 = **180**

## Hexadecimal

One hex digit = 4 binary bits. Used because it is far more compact than binary and easier for humans to read.

| Denary | Binary | Hex |
|--------|--------|-----|
| 10 | 1010 | A |
| 11 | 1011 | B |
| 12 | 1100 | C |
| 13 | 1101 | D |
| 14 | 1110 | E |
| 15 | 1111 | F |

**Binary → Hex:** Group bits into nibbles (4) from right, convert each.
`1010 1111` → `A` `F` → **AF**

**Hex → Binary:** Expand each digit to 4 bits.
`3C` → `0011 1100`

## Binary Addition

Add column by column, right to left:
- 0+0 = 0
- 0+1 = 1
- 1+1 = 10 (write 0, carry 1)
- 1+1+1 = 11 (write 1, carry 1)

**Overflow:** If the result needs more bits than the register can hold (e.g. >255 for 8-bit), an **overflow error** occurs and the extra bit is lost.

## Binary Shifts

A **logical shift** moves all bits left or right by a given number of positions. Zeros fill in from the opposite end.

- **Left shift by 1** = multiply by 2
- **Right shift by 1** = divide by 2 (integer)
- Bits shifted **off the end are lost**

**Example:** `00001010` (10) left shift by 2 → `00101000` (40)

## Two''s Complement

Used to represent **negative numbers** in binary.

**To convert –n to two''s complement:**
1. Write the positive value in binary
2. Flip all bits (NOT)
3. Add 1

**Example: –5 in 8-bit two''s complement**
1. 5 = `00000101`
2. Flip: `11111010`
3. Add 1: `11111011`

The **MSB (most significant bit)** = 1 means negative in two''s complement.
'),

('10000000-0000-0000-0000-000000000001', '1.2 Text, Sound & Images', '
## Text — Character Sets

Text is stored as binary using a **character set** — a table mapping characters to numbers.

| Character Set | Bits | Characters |
|---|---|---|
| ASCII | 7-bit | 128 (English alphabet, digits, symbols) |
| Extended ASCII | 8-bit | 256 |
| Unicode | 16–32 bit | 1M+ (all world languages, emoji) |

> **Key difference:** Unicode uses more bits per character but supports far more symbols than ASCII.

## Sound

Sound is **analogue** — it must be **sampled** (measured at regular intervals) and each sample stored as a binary number.

- **Sample rate** — number of samples per second (Hz). Higher = better quality, larger file.
- **Sample resolution (bit depth)** — bits used per sample. Higher = more detail, larger file.

**File size formula:**
```
File size (bits) = sample rate × bit depth × duration (seconds)
```

**Example:** 44,100 Hz, 16-bit, 3 minutes:
= 44100 × 16 × 180 = 126,720,000 bits = **~15.1 MiB**

## Images

Images are stored as a grid of **pixels**, each pixel having a colour value in binary.

- **Resolution** — total number of pixels (width × height). Higher = sharper, larger file.
- **Colour depth** — bits per pixel. More bits = more colours, larger file.

**File size formula:**
```
File size (bits) = width × height × colour depth
```

**Example:** 1024 × 768, 24-bit colour:
= 1024 × 768 × 24 = 18,874,368 bits = **~2.25 MiB**
'),

('10000000-0000-0000-0000-000000000001', '1.3 Data Storage & Compression', '
## Units of Storage

| Unit | Size |
|------|------|
| Bit | 1 binary digit (0 or 1) |
| Nibble | 4 bits |
| Byte | 8 bits |
| Kibibyte (KiB) | 1024 bytes |
| Mebibyte (MiB) | 1024 KiB |
| Gibibyte (GiB) | 1024 MiB |
| Tebibyte (TiB) | 1024 GiB |

> **Always use 1024**, not 1000, in IGCSE calculations.

## Compression

Compression **reduces file size** so files:
- Use less storage space
- Take less time to transmit
- Require less bandwidth

### Lossless Compression
Reduces file size **without losing any data**. The original file can be perfectly restored.

**Example: Run Length Encoding (RLE)**
Instead of storing `AAAABBBCC`, store `4A3B2C`.

Used for: text files, PNG images, ZIP archives.

### Lossy Compression
Reduces file size by **permanently removing data**. The original cannot be fully restored.

Methods include:
- Reducing image resolution or colour depth
- Reducing audio sample rate or bit depth

Used for: JPEG images, MP3 audio, MP4 video.

> **Exam tip:** Always state whether quality is affected — lossy = quality loss, lossless = no quality loss.
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 2: DATA TRANSMISSION
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000002', '2.1 Packets & Transmission Methods', '
## Packet Switching

Data is broken into **packets** before being sent across a network. Each packet travels independently and may take a different route.

### Packet Structure

| Part | Contents |
|------|----------|
| **Header** | Destination IP, source IP, packet number, protocol |
| **Payload** | The actual data being transmitted |
| **Trailer** | Error checking data (e.g. checksum) |

### How Packet Switching Works
1. Data is split into numbered packets
2. Each packet is routed independently by routers
3. Packets may arrive out of order
4. The destination device **reassembles** packets in the correct order

**Advantage:** Network can route around failures; bandwidth is used efficiently.

## Methods of Data Transmission

| Method | Description |
|--------|-------------|
| **Serial** | Bits sent one at a time down a single wire |
| **Parallel** | Multiple bits sent simultaneously down multiple wires |
| **Simplex** | One direction only (e.g. TV broadcast) |
| **Half-duplex** | Both directions, but not at the same time (e.g. walkie-talkie) |
| **Full-duplex** | Both directions simultaneously (e.g. phone call) |

**Serial vs Parallel:**
- Parallel seems faster but suffers from **skew** (bits arrive at different times) over long distances
- Serial is more reliable over long distances and is used in USB

## USB (Universal Serial Bus)

USB transmits data **serially**. It is a standard interface used to connect peripherals.

**Benefits:** Universal standard, hot-pluggable (no reboot needed), provides power, fast data rates.

**Drawbacks:** Limited cable length, can be a security risk (malware via USB drives).
'),

('10000000-0000-0000-0000-000000000002', '2.2 Error Detection & 2.3 Encryption', '
## Error Detection

Errors can occur during transmission due to **interference** — causing data loss, data gain, or data change.

### Parity Check
A **parity bit** is added to make the total number of 1s either always odd or always even.

- **Even parity:** total 1s must be even
- **Odd parity:** total 1s must be odd

**Parity block/byte check:** applies parity to both rows and columns of a block of data — can detect AND locate 1-bit errors.

### Checksum
A calculated value based on the data. Recalculated at the destination and compared. If different, an error has occurred.

### Echo Check
The receiver **sends the data back** to the sender, who compares it with the original. Simple but doubles bandwidth usage.

### Check Digit
An extra digit calculated from the other digits in a code (e.g. ISBN, barcode). Used to detect errors in **data entry**, not transmission.

### ARQ (Automatic Repeat Query)
1. Receiver sends **positive acknowledgement (ACK)** if data received correctly
2. Receiver sends **negative acknowledgement (NAK)** if error detected
3. Sender **retransmits** if it receives NAK or if a **timeout** occurs (no response received)

## Encryption

Encryption converts data into an unreadable form so it cannot be understood if intercepted.

### Symmetric Encryption
Both sender and receiver use the **same key** to encrypt and decrypt.
- Fast, but the key must be shared securely.

### Asymmetric Encryption
Uses a **public key** (shared openly) and a **private key** (kept secret).
- Data encrypted with the public key can only be decrypted with the private key.
- Used in HTTPS, email security.

> **Exam tip:** Know that asymmetric uses two keys; symmetric uses one shared key.
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 3: HARDWARE
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000003', '3.1 CPU Architecture & FDE Cycle', '
## The CPU

The **Central Processing Unit** processes all instructions. A **microprocessor** is a CPU on a single integrated circuit chip.

## Von Neumann Architecture

| Component | Role |
|-----------|------|
| **ALU** (Arithmetic Logic Unit) | Performs arithmetic (+, –, ×, ÷) and logical operations (AND, OR, NOT, comparisons) |
| **CU** (Control Unit) | Fetches, decodes and coordinates execution of instructions; controls data flow |
| **PC** (Program Counter) | Holds the address of the next instruction to fetch |
| **MAR** (Memory Address Register) | Holds the address of memory being read/written |
| **MDR** (Memory Data Register) | Temporarily holds data read from or written to memory |
| **CIR** (Current Instruction Register) | Holds the current instruction being decoded/executed |
| **ACC** (Accumulator) | Stores results of ALU operations |

### Buses

| Bus | Purpose |
|-----|---------|
| **Data bus** | Carries data between CPU, memory and I/O |
| **Address bus** | Carries memory addresses (one direction only) |
| **Control bus** | Carries control signals (read/write, clock, interrupt) |

## Fetch–Decode–Execute (FDE) Cycle

**Fetch:**
1. PC → MAR (address of next instruction copied to MAR)
2. Instruction fetched from RAM via data bus → MDR
3. MDR → CIR (instruction stored in CIR)
4. PC incremented to point to next instruction

**Decode:** CU interprets the instruction in CIR

**Execute:** ALU or other component carries out the instruction; result may be stored in ACC

## CPU Performance Factors

| Factor | Effect |
|--------|--------|
| **Clock speed (GHz)** | More cycles per second → faster execution |
| **Number of cores** | More cores → more instructions processed in parallel |
| **Cache size** | Larger cache → fewer slow RAM accesses |

## Embedded Systems

A computer **dedicated to a single task**, built into a device. Examples: washing machines, car engine control, traffic lights, pacemakers.

**Vs general-purpose computer:** A PC can run many different programs; an embedded system runs fixed firmware.
'),

('10000000-0000-0000-0000-000000000003', '3.2 Input/Output Devices & 3.3–3.4 Storage & Network Hardware', '
## Input Devices

| Device | Notes |
|--------|-------|
| Keyboard | Generates scan codes for each key |
| Optical mouse | LED + sensor tracks movement on surface |
| Touchscreen | Resistive (pressure), Capacitive (charge), Infrared (beam interruption) |
| Barcode scanner | Reads parallel lines of varying width |
| QR code scanner | Reads 2D matrix codes |
| Digital camera | CCD/CMOS sensor captures light as pixels |
| Microphone | Converts sound waves to electrical signals (ADC) |
| 2D/3D scanner | Captures shape/colour of physical objects |

## Sensors

Sensors capture **physical data** and convert it to electrical signals for processing.

acoustic · accelerometer · flow · gas · humidity · infrared · level · light · magnetic field · moisture · pH · pressure · proximity · temperature

## Output Devices

| Device | Notes |
|--------|-------|
| LED/LCD screen | Display pixels; LCD needs backlight, LED is self-lit |
| Inkjet printer | Sprays ink droplets; good for photos |
| Laser printer | Uses toner + heat; fast for documents |
| 3D printer | Builds objects layer by layer from filament |
| Actuator | Converts electrical signal to physical movement |
| Speaker | Converts electrical signals to sound waves (DAC) |
| DLP/LCD projector | Projects magnified image onto a screen |

## Primary & Secondary Storage

**Primary storage** — directly accessed by CPU:
- **RAM** — volatile, holds running programs and data
- **ROM** — non-volatile, holds firmware (BIOS/bootloader)

**Secondary storage** — not directly accessed, for permanent storage:

| Type | How it works | Examples |
|------|-------------|---------|
| **Magnetic** | Electromagnet reads/writes to spinning platters (tracks & sectors) | HDD |
| **Optical** | Laser reads/writes pits and lands | CD, DVD, Blu-ray |
| **Solid-state** | NAND/NOR transistors as floating gates; no moving parts | SSD, USB flash drive |

## Virtual Memory
When RAM is full, the OS moves inactive **pages** to a section of the HDD/SSD called virtual memory. Slower than RAM but prevents crashes.

## Cloud Storage
Data stored on remote servers accessed via the internet.

**Advantages:** Access from anywhere, automatic backups, scalable storage.
**Disadvantages:** Requires internet connection, security/privacy risks, ongoing cost, dependent on third party.

## Network Hardware — NIC, MAC & IP

- **NIC (Network Interface Card):** Hardware that connects a device to a network; assigned a MAC address at manufacture.
- **MAC address:** Unique hardware address in hex, e.g. `A4:C3:F0:85:AC:2D`. Made of manufacturer code + serial number.
- **IP address:** Logical address assigned by the network. Can be static (fixed) or dynamic (assigned each session).
  - **IPv4:** 32-bit, written as 4 decimal octets, e.g. `192.168.1.1` — ~4.3 billion addresses
  - **IPv6:** 128-bit, written in hex, e.g. `2001:0db8::1` — virtually unlimited addresses
- **Router:** Directs packets between networks; assigns IP addresses via DHCP; connects LAN to internet.
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 4: SOFTWARE
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000004', '4.1–4.2 Software, OS, Languages & Translators', '
## Types of Software

| Type | Purpose | Examples |
|------|---------|---------|
| **System software** | Provides services the computer needs to run | OS, utility software, device drivers |
| **Application software** | Provides services the user needs | Word processor, browser, games |

## Operating System Functions

The OS manages hardware and provides a platform for applications:
- Managing files and folders
- Handling interrupts
- Providing a user interface (GUI or CLI)
- Managing peripherals and device drivers
- Managing memory allocation
- Managing multitasking (scheduling)
- Providing system security
- Managing user accounts

## Software Layers

```
Application software
      ↓
Operating system
      ↓
Firmware (bootloader)
      ↓
Hardware
```

## Interrupts

An **interrupt** is a signal to the CPU that something needs immediate attention.

**How interrupts work:**
1. Device or software generates an interrupt signal
2. CPU finishes current instruction, saves its state
3. **ISR (Interrupt Service Routine)** is executed to handle the interrupt
4. CPU restores its state and resumes previous task

**Hardware interrupts:** keyboard keypress, mouse click, printer ready
**Software interrupts:** division by zero, two processes accessing same memory

## Programming Languages

| Type | Description | Example |
|------|-------------|---------|
| **High-level** | Human-readable, uses English-like syntax, portable, easier to write/debug | Python, Java |
| **Low-level** | Closer to machine code, hardware-specific, harder to read | Assembly, machine code |

### High-level advantages: Easier to write/debug, portable, readable
### Low-level advantages: Faster execution, direct hardware control, smaller file size

## Assembly Language
Uses **mnemonics** (short codes) instead of binary: `LDA`, `ADD`, `STO`. Requires an **assembler** to convert to machine code. One mnemonic = one machine code instruction.

## Translators

| Translator | Converts | Works by |
|-----------|---------|---------|
| **Compiler** | High-level → machine code | Translates entire program at once; produces standalone executable |
| **Interpreter** | High-level → machine code | Translates and executes line by line; no executable produced |
| **Assembler** | Assembly → machine code | Translates assembly mnemonics to binary |

**Compiler advantages:** Faster to run, code is hidden (compiled binary)
**Interpreter advantages:** Easier to debug (shows line-by-line errors), no compilation step needed

## IDEs (Integrated Development Environments)

Tools built into IDEs to help programmers:
- **Code editor** with syntax highlighting and auto-complete
- **Debugger** — set breakpoints, step through code, inspect variables
- **Run/build** tool
- **Error diagnostics** — highlights syntax errors
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 5: THE INTERNET & ITS USES
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000005', '5.1 The Internet, WWW & Communication', '
## Internet vs World Wide Web

| | Internet | World Wide Web (WWW) |
|--|---------|---------------------|
| **What is it?** | Global network of interconnected networks | Collection of web pages/resources accessed via the internet |
| **How accessed** | Via ISP, using TCP/IP | Via a web browser using HTTP/HTTPS |

## Key Networking Concepts

- **LAN (Local Area Network):** Small area (e.g. school, office). Usually owned by one organisation.
- **WAN (Wide Area Network):** Large geographic area. Uses leased telecoms infrastructure. The internet is the largest WAN.

## Protocols

A **protocol** is an agreed set of rules for communication between devices.

| Protocol | Purpose |
|----------|---------|
| **HTTP** | Transfer web pages (unsecured) |
| **HTTPS** | HTTP with TLS/SSL encryption (secure) |
| **FTP** | Transfer files between systems |
| **TCP/IP** | Core internet protocol suite |
| **DNS** | Translates domain names to IP addresses |

## DNS (Domain Name System)

Humans use domain names (e.g. `google.com`), computers use IP addresses. DNS acts like a phone book:
1. Browser asks DNS server for IP of `google.com`
2. DNS responds with e.g. `142.250.72.14`
3. Browser connects to that IP

## URLs

`https://www.example.com/page`
- `https` — protocol
- `www.example.com` — domain name
- `/page` — file path

## Cookies

Small text files stored by a browser. Used to:
- Remember login sessions
- Store shopping basket contents
- Track user behaviour (analytics/advertising)

**Security concern:** Third-party cookies can track browsing across sites.

## Cybersecurity Threats

| Threat | Description |
|--------|-------------|
| **Malware** | Malicious software — includes viruses, worms, trojans, ransomware |
| **Phishing** | Fraudulent emails/sites to steal credentials |
| **Pharming** | Redirects users to fake websites by corrupting DNS |
| **Brute force attack** | Tries all possible passwords until correct one found |
| **DoS/DDoS** | Floods server with requests to make it unavailable |
| **SQL injection** | Malicious SQL code inserted through input fields |
| **Man-in-the-middle** | Attacker intercepts and possibly alters communication |

## Protection Methods

- Strong passwords + two-factor authentication (2FA)
- Firewall — monitors and filters network traffic
- Anti-malware software
- HTTPS / encryption
- Regular software updates/patches
- User education and awareness

## Digital Currency & Blockchain

**Digital currency (e.g. Bitcoin):** Currency that exists only digitally, not physical.
**Blockchain:** A decentralised, distributed, tamper-resistant ledger. Each block contains transaction data + hash of previous block. Altering one block invalidates all subsequent blocks.
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 6: AUTOMATED & EMERGING TECHNOLOGIES
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000006', '6.1–6.2 Automated Systems & Emerging Technologies', '
## Automated Systems

An **automated system** uses sensors and actuators to control a process with minimal human intervention.

### Components of an Automated System
1. **Sensors** — collect data from the environment
2. **Processor** — analyses data and makes decisions
3. **Actuators** — perform physical actions based on decisions
4. **Feedback loop** — output is fed back as input to maintain a target state

### Example: Automatic Greenhouse
- Temperature sensor reads temperature
- Processor compares to target
- If too hot → actuator opens vents / turns on cooling
- Feedback ensures temperature stays stable

### Benefits of Automation
- 24/7 operation without fatigue
- More consistent/precise than humans
- Safer in hazardous environments
- Reduces long-term labour costs

### Drawbacks
- High initial setup cost
- Job losses
- Requires maintenance
- Cannot adapt to unexpected situations as well as humans

## Robotics

Robots are programmable machines used in:
- Manufacturing (car assembly lines)
- Surgery (precision robotic surgery)
- Exploration (Mars rovers)
- Warehousing (Amazon fulfillment)

## Artificial Intelligence (AI)

AI systems can perform tasks that normally require human intelligence.

### Machine Learning
A type of AI where the system **learns from data** without being explicitly programmed.
- Training data → model learns patterns → model makes predictions

### Examples of AI in use:
- Voice assistants (Siri, Alexa)
- Image recognition
- Spam filters
- Recommendation systems (Netflix, YouTube)
- Self-driving vehicles

## Emerging Technologies

### Internet of Things (IoT)
Everyday objects connected to the internet and each other — smart speakers, thermostats, wearables, smart appliances.

**Benefits:** Convenience, automation, energy efficiency.
**Risks:** Security vulnerabilities, privacy concerns, data collection.

### Cloud Computing
Using remote servers (the cloud) to process, store and manage data instead of local hardware.

**Benefits:** Scalable, accessible anywhere, lower hardware costs.
**Risks:** Internet dependency, data privacy, vendor lock-in.

### Quantum Computing
Uses quantum bits (qubits) that can be 0, 1, or both simultaneously (superposition). Far more powerful for certain tasks (cryptography, simulations) than classical computers.

### Big Data
Extremely large datasets that traditional software cannot process efficiently.
- Used in healthcare, finance, marketing, scientific research.
- Raises privacy and ethical concerns.

### Autonomous Vehicles
Self-driving cars use sensors, AI and GPS. Benefits: fewer accidents, accessibility. Concerns: legal liability, security, job losses.
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 7: ALGORITHM DESIGN & PROBLEM-SOLVING
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000007', '7.1 Algorithms, Pseudocode & Flowcharts', '
## What is an Algorithm?

A precise, **step-by-step** set of instructions that solves a problem. Good algorithms are:
- **Correct** — always gives the right output
- **Efficient** — minimal time and memory
- **Unambiguous** — each step has exactly one interpretation

## Computational Thinking

Four key skills:
- **Decomposition** — breaking a problem into smaller sub-problems
- **Abstraction** — removing irrelevant detail, focusing on what matters
- **Pattern recognition** — identifying similarities/patterns
- **Algorithm design** — creating step-by-step solutions

## Pseudocode

IGCSE pseudocode key constructs:

```
// Input / Output
INPUT name
OUTPUT "Hello, " & name
PRINT value

// Assignment
x ← 5
total ← total + x

// Selection
IF score >= 50 THEN
  OUTPUT "Pass"
ELSE
  OUTPUT "Fail"
ENDIF

// Iteration — counted
FOR i ← 1 TO 10
  OUTPUT i
NEXT i

// Iteration — condition
WHILE x > 0 DO
  x ← x - 1
ENDWHILE

// Repeat-until
REPEAT
  INPUT x
UNTIL x > 0

// Arrays
DECLARE scores[10] : INTEGER
scores[1] ← 95
```

## Flowchart Symbols

| Shape | Meaning |
|-------|---------|
| Oval | Start / Stop (terminator) |
| Rectangle | Process (assignment, calculation) |
| Diamond | Decision (yes/no question) |
| Parallelogram | Input / Output |
| Arrow | Flow of control |

## Trace Tables

Used to trace through an algorithm manually, recording variable values at each step. Useful for testing and finding logic errors.
'),

('10000000-0000-0000-0000-000000000007', '7.2 Searching & Sorting Algorithms', '
## Linear Search

Check each element **one by one** until the target is found or the list ends.

```
found ← FALSE
i ← 1
WHILE i <= length AND found = FALSE DO
  IF list[i] = target THEN
    found ← TRUE
  ELSE
    i ← i + 1
  ENDIF
ENDWHILE
```

- Works on **unsorted or sorted** lists
- Best case: O(1) — first element
- Worst case: O(n) — last element or not found

## Binary Search

Only works on a **sorted list**. Repeatedly halve the search space.

```
low ← 1
high ← length
found ← FALSE
WHILE low <= high AND found = FALSE DO
  mid ← (low + high) DIV 2
  IF list[mid] = target THEN
    found ← TRUE
  ELSEIF list[mid] < target THEN
    low ← mid + 1
  ELSE
    high ← mid - 1
  ENDIF
ENDWHILE
```

- Much faster for large sorted lists
- Worst case: O(log₂ n)

## Bubble Sort

Repeatedly **compare adjacent pairs** and swap if out of order. Repeat until no swaps occur.

```
FOR i ← 1 TO n-1
  FOR j ← 1 TO n-i
    IF list[j] > list[j+1] THEN
      temp ← list[j]
      list[j] ← list[j+1]
      list[j+1] ← temp
    ENDIF
  NEXT j
NEXT i
```

- Simple to understand and implement
- Inefficient for large lists: O(n²)

## Merge Sort

**Divide and conquer:** split the list in half recursively, then merge sorted halves.

1. Split list into two halves
2. Recursively sort each half
3. Merge the two sorted halves

- Much more efficient: O(n log n)
- More complex to implement

## Insertion Sort

Build a sorted section one element at a time by inserting each element into its correct position.

- O(n²) worst case, but efficient for nearly-sorted data
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 8: PROGRAMMING
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000008', '8.1 Programming Concepts', '
## Data Types

| Type | Description | Example |
|------|-------------|---------|
| INTEGER | Whole number | `42` |
| REAL/FLOAT | Decimal number | `3.14` |
| CHAR | Single character | `''A''` |
| STRING | Sequence of characters | `"Hello"` |
| BOOLEAN | True or False | `TRUE` |

## Variables & Constants

```
DECLARE age : INTEGER       // variable
CONSTANT PI ← 3.14159       // constant — cannot change
age ← 17
```

## Arithmetic Operators

| Operator | Meaning |
|----------|---------|
| `+` `-` `*` `/` | Standard arithmetic |
| `DIV` | Integer division (no remainder) |
| `MOD` | Remainder after division |

## Comparison & Logic Operators

`=` `<` `>` `<=` `>=` `<>`(not equal)

`AND` `OR` `NOT`

## String Operations

```
length ← LENGTH("Hello")      // 5
sub ← SUBSTRING("Hello", 2, 3) // "ell"
upper ← UCASE("hello")         // "HELLO"
combined ← "Hi" & " " & "there"
```

## Arrays

A fixed-size collection of elements of the **same data type**.

```
DECLARE scores[1:5] : INTEGER
scores[1] ← 90
scores[2] ← 75

// Iterate
FOR i ← 1 TO 5
  OUTPUT scores[i]
NEXT i
```

## Procedures & Functions

```
// Procedure — no return value
PROCEDURE greet(name : STRING)
  OUTPUT "Hello, " & name
ENDPROCEDURE

CALL greet("Alice")

// Function — returns a value
FUNCTION square(n : INTEGER) RETURNS INTEGER
  RETURN n * n
ENDFUNCTION

result ← square(5)  // result = 25
```

**Parameters:** Values passed into a procedure/function.
**Local variables:** Exist only within the procedure/function.
'),

('10000000-0000-0000-0000-000000000008', '8.2 File Handling, Testing & Validation', '
## File Handling

```
OPENFILE "data.txt" FOR READ
OPENFILE "output.txt" FOR WRITE

READFILE "data.txt", line
WRITEFILE "output.txt", "Hello"

CLOSEFILE "data.txt"

// Check end of file
WHILE NOT EOF("data.txt") DO
  READFILE "data.txt", line
  OUTPUT line
ENDWHILE
```

## Validation vs Verification

| | Validation | Verification |
|--|-----------|-------------|
| **Purpose** | Checks data is **reasonable/acceptable** | Checks data was **entered correctly** |
| **When** | During input | During input or transfer |
| **Example** | Age must be between 0–120 | Double entry (type password twice) |

### Types of Validation

| Check | Description | Example |
|-------|-------------|---------|
| **Range check** | Value within acceptable range | Age 0–120 |
| **Length check** | Correct number of characters | Password 8–16 chars |
| **Type check** | Correct data type | Age must be integer |
| **Presence check** | Field not left empty | Name cannot be blank |
| **Format check** | Matches required pattern | Date DD/MM/YYYY |

## Testing

| Type | Description |
|------|-------------|
| **Normal data** | Valid, expected input — should be accepted |
| **Boundary data** | Values at the exact edge of acceptable range |
| **Erroneous data** | Invalid input — should be rejected with an error |

**Example for age 1–100:**
- Normal: 25
- Boundary: 1, 100
- Erroneous: -1, 101, "abc"

## Types of Errors

| Error | When it occurs | Example |
|-------|---------------|---------|
| **Syntax error** | Code breaks the rules of the language | Missing bracket, misspelt keyword |
| **Logic error** | Program runs but gives wrong result | Using `>` instead of `>=` |
| **Runtime error** | Occurs during execution | Division by zero, index out of bounds |
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 9: DATABASES
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000009', '9.1 Databases & SQL', '
## What is a Database?

An organised collection of structured data, stored so it can be easily accessed, managed and updated.

**Database Management System (DBMS):** Software that manages databases (e.g. MySQL, PostgreSQL, SQLite).

## Relational Database Concepts

| Term | Definition |
|------|-----------|
| **Table (entity)** | A collection of related records |
| **Record (row)** | One complete set of data about one item |
| **Field (column/attribute)** | One piece of information |
| **Primary key** | A field that **uniquely identifies** each record |
| **Foreign key** | A field in one table that references the primary key of another |

**Example:**

| StudentID | Name | CourseID |
|-----------|------|---------|
| 001 | Alice | C01 |
| 002 | Bob | C02 |

`StudentID` = primary key. `CourseID` = foreign key referencing a Courses table.

## SQL

**SQL (Structured Query Language)** is used to interact with relational databases.

### SELECT — retrieve data
```sql
SELECT field1, field2
FROM tablename
WHERE condition
ORDER BY field1 ASC/DESC;
```

### Example:
```sql
SELECT Name, Grade
FROM Students
WHERE Grade >= 70
ORDER BY Name ASC;
```

### Wildcards in SQL
`*` = all fields: `SELECT * FROM Students;`
`LIKE` with `%` wildcard: `WHERE Name LIKE ''A%''` (names starting with A)

### INSERT
```sql
INSERT INTO Students (StudentID, Name, Grade)
VALUES (003, ''Charlie'', 85);
```

### UPDATE
```sql
UPDATE Students
SET Grade = 90
WHERE StudentID = 001;
```

### DELETE
```sql
DELETE FROM Students
WHERE StudentID = 003;
```

## Database vs Flat File

| Feature | Flat file | Relational database |
|---------|-----------|-------------------|
| **Structure** | Single table | Multiple linked tables |
| **Data redundancy** | High | Minimal |
| **Relationships** | None | Links between tables |
| **Data integrity** | Harder to maintain | Enforced by constraints |
');

-- ════════════════════════════════════════════════════════════
-- TOPIC 10: BOOLEAN LOGIC
-- ════════════════════════════════════════════════════════════

insert into notes (topic_id, title, content) values

('10000000-0000-0000-0000-000000000010', '10.1 Logic Gates & Boolean Expressions', '
## Logic Gates

| Gate | Symbol | Operation | Output is 1 when... |
|------|--------|-----------|---------------------|
| **NOT** | Triangle + circle | ¬A | Input is 0 |
| **AND** | D-shape | A ∧ B | Both inputs are 1 |
| **OR** | Curved shape | A ∨ B | At least one input is 1 |
| **NAND** | AND + circle | ¬(A ∧ B) | NOT both inputs are 1 |
| **NOR** | OR + circle | ¬(A ∨ B) | Neither input is 1 |
| **XOR** | OR + extra curve | A ⊕ B | Inputs are DIFFERENT |

## Truth Tables

### NOT gate (1 input)
| A | NOT A |
|---|-------|
| 0 | 1 |
| 1 | 0 |

### AND gate (2 inputs)
| A | B | A AND B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

### OR gate (2 inputs)
| A | B | A OR B |
|---|---|--------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

### XOR gate
| A | B | A XOR B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

## Boolean Expressions from Logic Circuits

To write a Boolean expression from a circuit, trace the output of each gate.

**Example:**
- A and B → AND gate → output X
- X and NOT C → AND gate → output Z
- Expression: `Z = (A AND B) AND (NOT C)`

## Simplifying with Boolean Laws

| Law | Expression |
|-----|-----------|
| Identity | `A AND 1 = A`, `A OR 0 = A` |
| Null | `A AND 0 = 0`, `A OR 1 = 1` |
| Complement | `A AND NOT A = 0`, `A OR NOT A = 1` |
| Idempotent | `A AND A = A`, `A OR A = A` |
| De Morgan''s | `NOT(A AND B) = NOT A OR NOT B` |

## Half Adder

A circuit that adds two 1-bit numbers.

| A | B | Sum (XOR) | Carry (AND) |
|---|---|-----------|-------------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

`Sum = A XOR B`
`Carry = A AND B`
');


-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 1: DATA REPRESENTATION
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000001',
'Convert the denary number 156 to binary. Show your working.',
'Using place values (128|64|32|16|8|4|2|1):
156 = 128 + 16 + 8 + 4 = **10011100**

Or by repeated division:
156÷2=78 r0, 78÷2=39 r0, 39÷2=19 r1, 19÷2=9 r1, 9÷2=4 r1, 4÷2=2 r0, 2÷2=1 r0, 1÷2=0 r1 → **10011100**', 3, 'easy'),

('10000000-0000-0000-0000-000000000001',
'Convert the binary number 10110111 to denary.',
'Place values: 128+0+32+16+0+4+2+1 = **183**', 2, 'easy'),

('10000000-0000-0000-0000-000000000001',
'Convert the hexadecimal number B4 to binary.',
'B = 1011, 4 = 0100 → **10110100**', 2, 'easy'),

('10000000-0000-0000-0000-000000000001',
'Add the binary numbers 01101101 and 00110110. Show your working and state whether an overflow occurs.',
'  01101101
+ 00110110
----------
  10100011

Result: **10100011** (163 in denary). No overflow — the result fits in 8 bits (≤ 255).', 3, 'medium'),

('10000000-0000-0000-0000-000000000001',
'Represent –23 in 8-bit two''s complement.',
'1. 23 in binary: 00010111
2. Flip all bits: 11101000
3. Add 1: **11101001**

Check: 11101001 = –128+64+32+8+1 = –128+105 = –23 ✓', 3, 'hard'),

('10000000-0000-0000-0000-000000000001',
'A binary number 00011010 is logically left-shifted by 2 places. Write the result and state the effect on the value.',
'Original: 00011010 (26)
After left shift by 2: **01101000** (104)

Effect: the value is multiplied by 2² = 4. 26 × 4 = 104 ✓

Note: if a 1 bit is shifted off the left end of the register, an overflow occurs and precision is lost.', 3, 'medium'),

('10000000-0000-0000-0000-000000000001',
'An image has a resolution of 2048 × 1536 pixels and a colour depth of 24 bits. Calculate the uncompressed file size in MiB.',
'File size = 2048 × 1536 × 24 = **75,497,472 bits**
÷ 8 = 9,437,184 bytes
÷ 1024 = 9,216 KiB
÷ 1024 = **9 MiB**', 4, 'medium'),

('10000000-0000-0000-0000-000000000001',
'A sound file is recorded at 44,100 Hz with a bit depth of 16 bits for 2 minutes. Calculate the file size in MiB.',
'Duration = 2 × 60 = 120 seconds
File size = 44100 × 16 × 120 = **84,672,000 bits**
÷ 8 = 10,584,000 bytes
÷ 1024 = 10,335.9 KiB
÷ 1024 ≈ **10.1 MiB**', 4, 'medium'),

('10000000-0000-0000-0000-000000000001',
'Explain the difference between lossy and lossless compression. Give one example of each.',
'**Lossless compression** reduces file size without losing any data. The original file can be perfectly recreated. Example: Run Length Encoding (RLE), PNG, ZIP.

**Lossy compression** permanently removes data to achieve a smaller file size. The original cannot be fully recovered. Example: JPEG (reduces colour depth), MP3 (removes inaudible frequencies).', 4, 'medium'),

('10000000-0000-0000-0000-000000000001',
'State two differences between ASCII and Unicode.',
'1. ASCII uses 7 bits per character (128 characters); Unicode uses up to 32 bits (over 1 million characters).
2. ASCII only represents English/Latin characters; Unicode supports all world languages, symbols and emoji.', 2, 'easy');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 2: DATA TRANSMISSION
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000002',
'Describe the structure of a data packet and explain the role of each part.',
'A packet has three parts:
1. **Header** — contains the destination IP address, source IP address, and packet number so packets can be reassembled in order.
2. **Payload** — the actual data being transmitted.
3. **Trailer** — contains error-checking data (e.g. checksum) to verify the packet arrived without errors.', 4, 'medium'),

('10000000-0000-0000-0000-000000000002',
'Explain how packet switching works when sending a file across the internet.',
'1. The file is broken into small, numbered packets.
2. Each packet is sent independently across the network.
3. Routers direct each packet along the most efficient route — different packets may take different routes.
4. Packets may arrive at the destination out of order.
5. Once all packets have arrived, they are reassembled in the correct order using packet numbers.', 5, 'medium'),

('10000000-0000-0000-0000-000000000002',
'Compare serial and parallel data transmission. State one advantage of each.',
'**Serial:** Bits are sent one at a time over a single wire.
Advantage: More reliable over long distances — no synchronisation/skew issues between bits.

**Parallel:** Multiple bits sent simultaneously over multiple wires.
Advantage: Can transfer more bits per clock cycle, so potentially faster over short distances.', 4, 'medium'),

('10000000-0000-0000-0000-000000000002',
'Describe how even parity checking detects errors in transmitted data.',
'A parity bit is added to each group of bits so the total number of 1s is always even.
The receiver counts the 1s in each received group. If the count is odd, an error has been detected.
However, parity checking cannot detect errors where an even number of bits are corrupted, and it cannot identify which bit is wrong.', 3, 'medium'),

('10000000-0000-0000-0000-000000000002',
'Explain the difference between symmetric and asymmetric encryption.',
'**Symmetric encryption:** Uses a single shared key to both encrypt and decrypt data. Both sender and receiver must have the same key. Fast, but the key must be shared securely beforehand.

**Asymmetric encryption:** Uses a pair of mathematically linked keys — a public key (shared openly) and a private key (kept secret). Data encrypted with the public key can only be decrypted with the private key. Slower but more secure for key exchange.', 4, 'hard'),

('10000000-0000-0000-0000-000000000002',
'Describe how ARQ (Automatic Repeat Query) ensures reliable data transmission.',
'1. The receiver checks each received packet for errors.
2. If the data is correct, the receiver sends a positive acknowledgement (ACK) to the sender.
3. If an error is detected, the receiver sends a negative acknowledgement (NAK) and the sender retransmits the packet.
4. If no acknowledgement is received within a timeout period, the sender automatically retransmits the packet.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 3: HARDWARE
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000003',
'Describe the fetch stage of the Fetch–Decode–Execute cycle.',
'1. The Program Counter (PC) contains the address of the next instruction.
2. This address is copied to the Memory Address Register (MAR) via the address bus.
3. The instruction at that memory address is fetched from RAM and placed in the Memory Data Register (MDR) via the data bus.
4. The instruction is copied from the MDR to the Current Instruction Register (CIR).
5. The PC is incremented to point to the next instruction.', 5, 'hard'),

('10000000-0000-0000-0000-000000000003',
'State the role of the ALU and the Control Unit in the CPU.',
'**ALU (Arithmetic Logic Unit):** Performs all arithmetic operations (addition, subtraction, multiplication, division) and logical operations (AND, OR, NOT, comparisons).

**Control Unit (CU):** Directs and coordinates the activities of the CPU. It fetches instructions from memory, decodes them, and controls the flow of data between the CPU components, memory and I/O devices.', 4, 'medium'),

('10000000-0000-0000-0000-000000000003',
'Explain three ways the performance of a CPU can be improved.',
'1. **Increasing clock speed:** A higher clock speed (measured in GHz) means more fetch-decode-execute cycles per second, so instructions are processed faster.
2. **Increasing the number of cores:** Multiple cores allow instructions to be processed in parallel simultaneously, increasing throughput.
3. **Increasing cache size:** A larger cache stores more frequently used data/instructions close to the CPU, reducing the number of slower RAM accesses.', 6, 'medium'),

('10000000-0000-0000-0000-000000000003',
'Compare magnetic, optical and solid-state storage. Give one example of each.',
'**Magnetic:** Uses spinning platters divided into tracks and sectors. Electromagnets read/write data. Slow but high capacity and cheap. Example: HDD.

**Optical:** Uses a laser to read pits (dips) and lands (flat areas) on a disc surface. Read-only or writable. Example: DVD.

**Solid-state:** Uses NAND/NOR flash memory with transistors as floating gates. No moving parts — fast, silent, durable, but more expensive per GB. Example: SSD, USB drive.', 6, 'medium'),

('10000000-0000-0000-0000-000000000003',
'Explain the difference between IPv4 and IPv6 addresses. Why is IPv6 needed?',
'**IPv4:** 32-bit address written as 4 decimal octets, e.g. `192.168.1.1`. Supports ~4.3 billion unique addresses.
**IPv6:** 128-bit address written in hexadecimal, e.g. `2001:0db8:85a3::8a2e:0370:7334`. Supports a virtually unlimited number of addresses.

IPv6 is needed because the rapid growth of internet-connected devices means IPv4 addresses are being exhausted. IPv6 provides enough addresses for every device on Earth.', 4, 'medium'),

('10000000-0000-0000-0000-000000000003',
'Describe what virtual memory is and explain why it is used.',
'Virtual memory is a section of secondary storage (HDD/SSD) that is used as an extension of RAM when RAM is full.
When RAM runs out, the OS moves inactive pages of data from RAM to virtual memory. When those pages are needed again, they are swapped back into RAM.
It allows the computer to run more programs simultaneously than the physical RAM alone would allow, preventing crashes. However, accessing virtual memory is much slower than RAM, reducing performance.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 4: SOFTWARE
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000004',
'State four functions of an operating system.',
'Any four from:
- Managing files and directories
- Handling interrupts
- Providing a user interface (GUI or CLI)
- Managing memory allocation
- Managing multitasking/scheduling
- Managing peripherals and device drivers
- Providing system security
- Managing user accounts', 4, 'easy'),

('10000000-0000-0000-0000-000000000004',
'Describe how an interrupt is handled by the CPU.',
'1. A device or software generates an interrupt signal.
2. The CPU finishes executing its current instruction.
3. The CPU saves its current state (registers, program counter) so it can resume later.
4. The CPU checks the interrupt — higher priority interrupts are handled first.
5. The relevant ISR (Interrupt Service Routine) is loaded and executed.
6. After the ISR finishes, the CPU restores its saved state and resumes the previous task from where it left off.', 5, 'hard'),

('10000000-0000-0000-0000-000000000004',
'Compare compilers and interpreters. State one advantage of each.',
'**Compiler:** Translates the entire source code into machine code at once, producing an executable file.
Advantage: The compiled program runs faster because no translation is needed at run-time.

**Interpreter:** Translates and executes the source code line by line without producing a file.
Advantage: Easier to debug as errors are reported on the specific line being executed.', 4, 'medium'),

('10000000-0000-0000-0000-000000000004',
'Explain the difference between high-level and low-level programming languages.',
'**High-level languages** (e.g. Python, Java) use English-like syntax and are easy for humans to read, write and debug. They are portable — the same code runs on different hardware. They must be compiled or interpreted.

**Low-level languages** (e.g. machine code, assembly) are closer to the hardware. Machine code uses binary; assembly uses mnemonics like LDA and ADD. They are faster to execute, use less memory, and give direct hardware control, but are harder to write and hardware-specific.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 5: INTERNET & ITS USES
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000005',
'Explain the difference between the internet and the World Wide Web.',
'The **internet** is the global physical network of interconnected computers and devices, connected via routers and communication links using the TCP/IP protocol.

The **World Wide Web (WWW)** is a collection of web pages and digital resources (HTML, images, video) stored on web servers and accessed through the internet using a web browser via HTTP/HTTPS.

The internet is the infrastructure; the WWW is a service that runs on it.', 3, 'easy'),

('10000000-0000-0000-0000-000000000005',
'Describe how DNS is used when a user types a URL into a browser.',
'1. The user types the URL (e.g. `www.bbc.co.uk`) into the browser.
2. The browser sends a query to a DNS (Domain Name System) server asking for the IP address of that domain.
3. The DNS server looks up the domain and returns the corresponding IP address (e.g. `151.101.0.81`).
4. The browser uses this IP address to connect to the web server hosting the website.
5. The web server responds by sending the requested web page back to the browser.', 4, 'medium'),

('10000000-0000-0000-0000-000000000005',
'Describe two cybersecurity threats and explain how each can be prevented.',
'**Phishing:** Fraudulent emails or websites trick users into revealing passwords or personal information.
Prevention: User education, spam filters, two-factor authentication.

**Malware:** Malicious software (virus, worm, ransomware) that damages or gains unauthorised access to a system.
Prevention: Anti-malware software, regular OS updates/patches, not opening unknown email attachments.', 6, 'medium'),

('10000000-0000-0000-0000-000000000005',
'Explain what a firewall does and how it protects a network.',
'A firewall monitors all incoming and outgoing network traffic and applies rules to decide whether to allow or block each packet.

It can filter by IP address (blocking known malicious sources), port number (blocking unused services), or protocol.

It protects a network by preventing unauthorised access from outside, blocking suspicious traffic, and stopping malware from communicating with external servers.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 6: AUTOMATED & EMERGING TECHNOLOGIES
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000006',
'Describe the components of an automated system. Use a greenhouse heating system as an example.',
'An automated system has four key components:
1. **Sensor** — measures data from the environment (e.g. temperature sensor reads greenhouse temperature).
2. **Processor** — compares sensor data to the target value and decides what action to take.
3. **Actuator** — carries out a physical action (e.g. turns on heater if temperature drops below target).
4. **Feedback loop** — the output (temperature change) becomes new input to the sensor, allowing continuous monitoring and control.', 5, 'medium'),

('10000000-0000-0000-0000-000000000006',
'Give two benefits and two drawbacks of using robots in manufacturing.',
'**Benefits:**
1. Robots can work 24/7 without fatigue, increasing productivity.
2. Greater precision and consistency than human workers, reducing defects.

**Drawbacks:**
1. High initial cost of purchasing and installing robotic systems.
2. Job losses — human workers may be displaced, causing unemployment.', 4, 'easy'),

('10000000-0000-0000-0000-000000000006',
'Describe what is meant by machine learning and give one application.',
'Machine learning is a type of AI where a system is trained on large datasets and learns to identify patterns and make predictions or decisions without being explicitly programmed with rules.

The system improves its accuracy as it is exposed to more data.

**Application:** Spam email filters — the system learns from thousands of labelled spam and legitimate emails to classify new emails automatically.', 4, 'medium'),

('10000000-0000-0000-0000-000000000006',
'Explain what the Internet of Things (IoT) is and discuss one benefit and one risk.',
'The **Internet of Things (IoT)** refers to everyday physical objects (appliances, vehicles, wearables, sensors) that are connected to the internet and can communicate with each other and be controlled remotely.

**Benefit:** A smart thermostat learns your routine and automatically adjusts heating, saving energy and increasing convenience.

**Risk:** IoT devices often have weak security and can be compromised by hackers, creating vulnerabilities in home or business networks.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 7: ALGORITHM DESIGN
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000007',
'Write pseudocode for a program that inputs 10 numbers and outputs the largest.',
'```
largest ← -99999
FOR i ← 1 TO 10
  INPUT number
  IF number > largest THEN
    largest ← number
  ENDIF
NEXT i
OUTPUT "Largest: " & largest
```', 5, 'medium'),

('10000000-0000-0000-0000-000000000007',
'Trace through the bubble sort algorithm on the list [5, 2, 8, 1, 9]. Show the list after each pass.',
'Pass 1: Compare adjacent pairs and swap if needed.
[5,2,8,1,9] → [2,5,8,1,9] → [2,5,8,1,9] → [2,5,1,8,9] → [2,5,1,8,9] → **[2,5,1,8,9]**

Pass 2:
[2,5,1,8,9] → [2,1,5,8,9] → **[2,1,5,8,9]**

Pass 3:
[2,1,5,8,9] → **[1,2,5,8,9]**

Pass 4: No swaps needed — sorted: **[1,2,5,8,9]**', 5, 'hard'),

('10000000-0000-0000-0000-000000000007',
'Compare binary search and linear search. State when binary search cannot be used.',
'**Linear search:** Checks each element one by one from the beginning. Works on any list (sorted or unsorted). Worst case O(n).

**Binary search:** Halves the search space each time by comparing with the middle element. Much faster for large datasets — O(log₂ n).

**Binary search cannot be used** when the list is not sorted, because the algorithm relies on knowing which half to eliminate.', 4, 'medium'),

('10000000-0000-0000-0000-000000000007',
'Explain what a trace table is and describe how it is used.',
'A trace table is a manual technique used to track the values of variables as an algorithm executes step by step.

Each column represents a variable (or output), and each row records the values after each step or iteration.

It is used to:
- **Test** whether an algorithm produces the correct output for given inputs
- **Identify logic errors** by comparing expected vs actual values at each step
- **Understand** how an unfamiliar algorithm works', 4, 'medium'),

('10000000-0000-0000-0000-000000000007',
'Write pseudocode for a binary search on a sorted array called list[1:n] to find a target value.',
'```
low ← 1
high ← n
found ← FALSE
WHILE low <= high AND found = FALSE DO
  mid ← (low + high) DIV 2
  IF list[mid] = target THEN
    found ← TRUE
    OUTPUT "Found at position " & mid
  ELSEIF list[mid] < target THEN
    low ← mid + 1
  ELSE
    high ← mid - 1
  ENDIF
ENDWHILE
IF found = FALSE THEN
  OUTPUT "Not found"
ENDIF
```', 6, 'hard');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 8: PROGRAMMING
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000008',
'Write pseudocode for a function that takes an integer and returns whether it is prime.',
'```
FUNCTION isPrime(n : INTEGER) RETURNS BOOLEAN
  IF n < 2 THEN
    RETURN FALSE
  ENDIF
  FOR i ← 2 TO n - 1
    IF n MOD i = 0 THEN
      RETURN FALSE
    ENDIF
  NEXT i
  RETURN TRUE
ENDFUNCTION
```', 6, 'hard'),

('10000000-0000-0000-0000-000000000008',
'Explain the difference between validation and verification. Give one example of each.',
'**Validation** checks that data is reasonable and within acceptable limits before it is accepted.
Example: Checking that an age input is between 0 and 120 (range check).

**Verification** checks that data has been entered correctly and matches the intended value.
Example: Asking a user to type their password twice (double entry) to confirm it was typed correctly.

Validation checks if data is sensible; verification checks if data is accurate.', 4, 'medium'),

('10000000-0000-0000-0000-000000000008',
'State three types of test data and give an example for a field that accepts ages 16–65.',
'**Normal data:** Valid data within range. Example: 25 — should be accepted.
**Boundary data:** Values at the exact limits. Example: 16 and 65 — should be accepted; 15 and 66 — should be rejected.
**Erroneous data:** Invalid data that should be rejected. Example: –1, 200, or "abc" — should all be rejected with an error.', 4, 'medium'),

('10000000-0000-0000-0000-000000000008',
'Describe the difference between a syntax error, a logic error and a runtime error.',
'**Syntax error:** The code breaks the rules of the programming language (e.g. missing bracket, misspelt keyword). Detected by the compiler/interpreter before the program runs.

**Logic error:** The program runs without crashing but produces an incorrect result due to a mistake in the algorithm (e.g. using > instead of >=, wrong formula).

**Runtime error:** Occurs while the program is executing (e.g. division by zero, accessing an array index that doesn''t exist). Causes the program to crash.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 9: DATABASES
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000009',
'A database table called Student has fields: StudentID, Name, Age, CourseID. Write a SQL query to display the Name and Age of all students who are 18 or older, ordered by Name.',
'```sql
SELECT Name, Age
FROM Student
WHERE Age >= 18
ORDER BY Name ASC;
```', 4, 'medium'),

('10000000-0000-0000-0000-000000000009',
'Explain what a primary key is and why it is important in a relational database.',
'A **primary key** is a field (or combination of fields) that uniquely identifies each record in a table. No two records can have the same primary key value, and it cannot be null.

It is important because:
1. It ensures every record can be uniquely retrieved or referenced.
2. It enables tables to be linked — a foreign key in another table references the primary key here, allowing relationships to be formed.
3. It maintains data integrity by preventing duplicate records.', 4, 'medium'),

('10000000-0000-0000-0000-000000000009',
'Write a SQL statement to insert a new student with ID 105, Name "Priya", Age 17 into the Student table.',
'```sql
INSERT INTO Student (StudentID, Name, Age)
VALUES (105, ''Priya'', 17);
```', 3, 'easy'),

('10000000-0000-0000-0000-000000000009',
'Explain the difference between a flat file database and a relational database.',
'**Flat file:** All data is stored in a single table. Data is often repeated (redundancy), which wastes space and can cause inconsistencies when updating.

**Relational database:** Data is split into multiple linked tables. Tables are connected via primary and foreign keys. This reduces redundancy, is easier to maintain, and allows complex queries across multiple tables using JOIN operations.', 4, 'medium');

-- ════════════════════════════════════════════════════════════
-- QUESTIONS — TOPIC 10: BOOLEAN LOGIC
-- ════════════════════════════════════════════════════════════

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values

('10000000-0000-0000-0000-000000000010',
'Complete the truth table for the expression: X = (A AND B) OR (NOT A)',
'| A | B | NOT A | A AND B | X = (A AND B) OR (NOT A) |
|---|---|-------|---------|--------------------------|
| 0 | 0 |  1    |    0    |         **1**            |
| 0 | 1 |  1    |    0    |         **1**            |
| 1 | 0 |  0    |    0    |         **0**            |
| 1 | 1 |  0    |    1    |         **1**            |', 4, 'medium'),

('10000000-0000-0000-0000-000000000010',
'State De Morgan''s laws and verify one with a truth table.',
'**De Morgan''s laws:**
1. NOT(A AND B) = (NOT A) OR (NOT B)
2. NOT(A OR B) = (NOT A) AND (NOT B)

**Verification of Law 1:**
| A | B | NOT(A AND B) | NOT A OR NOT B |
|---|---|-------------|---------------|
| 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 |

Columns match — law is verified.', 5, 'hard'),

('10000000-0000-0000-0000-000000000010',
'A half adder adds two 1-bit numbers. Write the Boolean expressions for the Sum and Carry outputs.',
'**Sum = A XOR B**
The Sum is 1 only when the inputs are different (one 1 and one 0).

**Carry = A AND B**
The Carry is 1 only when both inputs are 1 (1+1 = 10 in binary, Carry = 1, Sum = 0).', 3, 'medium'),

('10000000-0000-0000-0000-000000000010',
'An alarm system uses three sensors: A (motion), B (door), C (window). The alarm triggers when motion is detected AND either the door OR window is open. Write the Boolean expression and produce a truth table.',
'**Expression: Alarm = A AND (B OR C)**

| A | B | C | B OR C | Alarm |
|---|---|---|--------|-------|
| 0 | 0 | 0 |   0    |   0   |
| 0 | 0 | 1 |   1    |   0   |
| 0 | 1 | 0 |   1    |   0   |
| 0 | 1 | 1 |   1    |   0   |
| 1 | 0 | 0 |   0    |   0   |
| 1 | 0 | 1 |   1    |   1   |
| 1 | 1 | 0 |   1    |   1   |
| 1 | 1 | 1 |   1    |   1   |', 5, 'hard');
