-- ============================================================
-- StudyRev — Supabase Seed SQL
-- Run this in Supabase > SQL Editor
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────

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

-- ── RLS: allow public read ─────────────────────────────────────

alter table subjects enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table notes enable row level security;

create policy "Public read subjects" on subjects for select using (true);
create policy "Public read topics" on topics for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public read notes" on notes for select using (true);

-- ── Seed: Computer Science (IGCSE 0478) ───────────────────────

insert into subjects (id, name, display_name, description, icon, color) values
  ('00000000-0000-0000-0000-000000000001', 'cs', 'Computer Science (0478)', 'IGCSE Computer Science — data, algorithms, hardware, and more', '💻', '#00d4ff');

-- Topics
insert into topics (id, subject_id, name, order_index) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Data Representation', 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Data Transmission', 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Hardware', 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Internet & Networking', 4),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Algorithm Design', 5);

-- ── Notes: Data Representation ────────────────────────────────

insert into notes (topic_id, title, content) values
('10000000-0000-0000-0000-000000000001', 'Binary & Number Systems', '
## Binary Number System

Computers use **binary (base 2)** — only digits 0 and 1, called **bits**.

- A **nibble** = 4 bits
- A **byte** = 8 bits
- A **kilobyte (KB)** = 1024 bytes

## Converting Denary to Binary

Use repeated division by 2, reading remainders bottom-up.

**Example: 45 in binary**

| Division | Quotient | Remainder |
|---|---|---|
| 45 ÷ 2 | 22 | **1** |
| 22 ÷ 2 | 11 | **0** |
| 11 ÷ 2 | 5  | **1** |
| 5 ÷ 2  | 2  | **1** |
| 2 ÷ 2  | 1  | **0** |
| 1 ÷ 2  | 0  | **1** |

Result: **101101**

## Hexadecimal (Base 16)

Uses digits **0–9** and letters **A–F** (A=10, B=11 ... F=15).

> Hex is used in memory addresses and colour codes because it is compact — 1 hex digit = 4 bits.

**Convert binary to hex:** Group bits in 4s from the right, then convert each group.

`1010 1111` → `A` `F` → **0xAF**
'),
('10000000-0000-0000-0000-000000000001', 'Text, Images & Sound', '
## Character Encoding

Text is stored using **character sets** — a lookup table mapping characters to binary codes.

- **ASCII** — 7-bit, 128 characters (English letters, digits, symbols)
- **Extended ASCII** — 8-bit, 256 characters
- **Unicode** — up to 32-bit, covers all world languages and emoji

## Images

Images are stored as a grid of **pixels**. Each pixel has a colour value in binary.

Key terms:
- **Resolution** — number of pixels (width × height)
- **Colour depth** — number of bits per pixel
- **File size** = pixels × colour depth (in bits)

**Example:** 800×600 image, 24-bit colour  
File size = 800 × 600 × 24 = **11,520,000 bits = 1.37 MB** (uncompressed)

## Sound

Sound is **analogue** — it must be converted to digital using **ADC (Analogue-to-Digital Converter)**.

- **Sample rate** — how many samples per second (Hz). Higher = better quality.
- **Sample resolution (bit depth)** — bits per sample. Higher = more detail.
- **File size** = sample rate × bit depth × duration (seconds)
');

-- ── Notes: Algorithm Design ────────────────────────────────────

insert into notes (topic_id, title, content) values
('10000000-0000-0000-0000-000000000005', 'Algorithms & Pseudocode', '
## What is an Algorithm?

A **step-by-step set of instructions** that solves a problem. A good algorithm is:
- **Correct** — gives the right output
- **Efficient** — uses minimal time and memory
- **Clear** — unambiguous steps

## Pseudocode Basics

Pseudocode is not a real language — it is a structured way to write algorithms.

```
INPUT name
OUTPUT "Hello, " + name

FOR i ← 1 TO 10
  OUTPUT i
NEXT i

WHILE x > 0
  x ← x - 1
ENDWHILE

IF score >= 50 THEN
  OUTPUT "Pass"
ELSE
  OUTPUT "Fail"
ENDIF
```

## Searching Algorithms

### Linear Search
Check each element one by one until found.
- **Best case:** O(1) — found first
- **Worst case:** O(n) — found last or not found

### Binary Search
Only works on a **sorted list**. Compare middle element, eliminate half each time.
- **Worst case:** O(log n) — much faster for large datasets

## Sorting Algorithms

### Bubble Sort
Repeatedly compare adjacent pairs and swap if out of order.
- Simple but slow — **O(n²)**

### Merge Sort
Divide list in half recursively, then merge sorted halves.
- Efficient — **O(n log n)**
');

-- ── Notes: Hardware ───────────────────────────────────────────

insert into notes (topic_id, title, content) values
('10000000-0000-0000-0000-000000000003', 'CPU & Memory', '
## The CPU

The **Central Processing Unit** is the brain of the computer. It executes program instructions using the **Fetch-Decode-Execute cycle**.

### Key CPU Components

| Component | Function |
|---|---|
| **ALU** (Arithmetic Logic Unit) | Performs maths and logic operations |
| **CU** (Control Unit) | Directs data flow and coordinates components |
| **Registers** | Tiny, ultra-fast storage inside the CPU |
| **Cache** | Very fast memory between CPU and RAM |

### CPU Performance Factors
- **Clock speed** (GHz) — how many cycles per second
- **Number of cores** — more cores = more parallel tasks
- **Cache size** — more cache reduces RAM access time

## Types of Memory

| Memory | Volatile? | Speed | Use |
|---|---|---|---|
| **RAM** | Yes (loses data when powered off) | Fast | Running programs |
| **ROM** | No (permanent) | Medium | BIOS / boot firmware |
| **Cache** | Yes | Very fast | CPU buffer |
| **Virtual Memory** | Yes | Slow (uses HDD) | Overflow when RAM full |
');

-- ── Questions: Data Representation ────────────────────────────

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values
('10000000-0000-0000-0000-000000000001',
 'Convert the denary number 75 to binary. Show your working.',
 'Divide 75 repeatedly by 2:
75 ÷ 2 = 37 r **1**
37 ÷ 2 = 18 r **1**
18 ÷ 2 = 9 r **0**
9 ÷ 2 = 4 r **1**
4 ÷ 2 = 2 r **0**
2 ÷ 2 = 1 r **0**
1 ÷ 2 = 0 r **1**

Reading remainders bottom to top: **1001011**',
 3, 'medium'),

('10000000-0000-0000-0000-000000000001',
 'Explain why hexadecimal is used instead of binary when representing memory addresses.',
 'Hexadecimal is more **compact** — one hex digit represents 4 binary bits, so a long binary number like 11110000 can be written as F0. This makes it much easier for humans to read, write, and check for errors. It is also easier to convert between hex and binary than between denary and binary.',
 3, 'medium'),

('10000000-0000-0000-0000-000000000001',
 'A bitmap image has a resolution of 1024 × 768 pixels and uses a colour depth of 16 bits. Calculate the file size in megabytes.',
 'File size = width × height × colour depth
= 1024 × 768 × 16 bits
= 12,582,912 bits
= 12,582,912 ÷ 8 = **1,572,864 bytes**
= 1,572,864 ÷ 1024 = 1,536 KB
= 1,536 ÷ 1024 = **1.5 MB**',
 4, 'hard'),

('10000000-0000-0000-0000-000000000001',
 'State two differences between ASCII and Unicode.',
 '1. ASCII uses **7 bits** per character (128 characters), while Unicode uses up to **32 bits** (over 1 million characters).
2. ASCII can only represent **English/Latin characters**, while Unicode supports **all world languages**, symbols, and emoji.',
 2, 'easy'),

('10000000-0000-0000-0000-000000000001',
 'Describe how sound is stored digitally and explain the effect of increasing the sample rate.',
 'Sound is analogue. An **ADC (Analogue-to-Digital Converter)** takes measurements (samples) of the sound wave at regular intervals. Each sample is stored as a binary number.

**Increasing the sample rate** means more samples are taken per second. This produces a more accurate digital representation of the original sound wave. However, it also **increases the file size**.',
 4, 'medium');

-- ── Questions: Algorithm Design ───────────────────────────────

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values
('10000000-0000-0000-0000-000000000005',
 'Describe the steps of a binary search on the sorted list: [3, 7, 12, 19, 25, 31, 44]. Show how you would find the value 25.',
 '1. Find the middle element: index 3 → value **19**
2. 25 > 19, so discard the left half. Remaining: [25, 31, 44]
3. New middle: index 1 → value **31**
4. 25 < 31, so discard right. Remaining: [25]
5. Middle = **25** ✓ Found!

**3 comparisons** needed.',
 4, 'medium'),

('10000000-0000-0000-0000-000000000005',
 'Write pseudocode for a program that inputs 10 numbers and outputs their total and average.',
 '```
total ← 0
FOR i ← 1 TO 10
  INPUT number
  total ← total + number
NEXT i
average ← total / 10
OUTPUT "Total: ", total
OUTPUT "Average: ", average
```',
 5, 'medium'),

('10000000-0000-0000-0000-000000000005',
 'State one advantage of a merge sort over a bubble sort.',
 'Merge sort has a better time complexity of **O(n log n)** compared to bubble sort''s **O(n²)**, so it is significantly faster on large datasets.',
 2, 'easy');

-- ── Questions: Hardware ───────────────────────────────────────

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values
('10000000-0000-0000-0000-000000000003',
 'Describe the role of the ALU and the Control Unit in the CPU.',
 '**ALU (Arithmetic Logic Unit):** Performs arithmetic operations (addition, subtraction) and logical comparisons (AND, OR, NOT, greater than, etc.).

**Control Unit:** Coordinates the activities of the CPU. It fetches instructions from memory, decodes them, and then directs the ALU and other components to execute them. It controls the flow of data between the CPU, memory, and I/O devices.',
 4, 'medium'),

('10000000-0000-0000-0000-000000000003',
 'Explain why RAM is described as volatile memory.',
 'RAM is volatile because it **only retains data while the computer is powered on**. When the power is switched off, all data stored in RAM is lost. This is why programs and documents must be saved to non-volatile storage (e.g. SSD or HDD) before shutting down.',
 2, 'easy'),

('10000000-0000-0000-0000-000000000003',
 'State three factors that affect the performance of a CPU.',
 '1. **Clock speed** — a higher clock speed (measured in GHz) means more instruction cycles per second.
2. **Number of cores** — more cores allow multiple tasks to be processed simultaneously.
3. **Cache size** — a larger cache means the CPU can store more frequently used data close by, reducing slow RAM accesses.',
 3, 'medium');

-- ── Questions: Networking ──────────────────────────────────────

insert into questions (topic_id, question_text, answer_text, marks, difficulty) values
('10000000-0000-0000-0000-000000000004',
 'Describe the difference between a LAN and a WAN.',
 '**LAN (Local Area Network):** Covers a small geographical area such as a single building or campus. Usually owned and managed by one organisation. Uses Ethernet cables or Wi-Fi.

**WAN (Wide Area Network):** Spans a large geographical area — can be nationwide or worldwide. Uses infrastructure leased from telecom providers. The internet is the largest example of a WAN.',
 4, 'easy'),

('10000000-0000-0000-0000-000000000004',
 'Explain the role of a router in a network.',
 'A router connects different networks together and directs (**routes**) data packets between them. It reads the destination IP address of each packet and forwards it along the most efficient path toward its destination. Home routers connect a LAN to the internet (a WAN).',
 3, 'medium'),

('10000000-0000-0000-0000-000000000004',
 'What is the purpose of the TCP/IP protocol suite? Name the two protocols and explain one role each.',
 '**TCP (Transmission Control Protocol):** Breaks data into packets, numbers them, and ensures they are all received correctly — requesting retransmission of any lost packets. It ensures **reliable, ordered delivery**.

**IP (Internet Protocol):** Handles the **addressing and routing** of packets across networks, ensuring each packet is sent from source IP to destination IP address.

Together they ensure data is sent reliably across the internet.',
 4, 'hard');
