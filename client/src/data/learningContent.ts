// ── DecentralLearn Predefined Learning Content Dataset ────────────────────────
// DSA Topics calibrated according to the PRD specification with
// multi-domain relatable analogies, personalized explanation styles,
// and undergraduate-standard C++ and Java implementations.

export interface TopicAnalogy {
  title: string
  narrative: string
  mapping: { term: string; dsaConcept: string; meaning: string }[]
}

export interface StyleExplanation {
  headline: string
  body: string
  visualDiagram?: string
}

export interface CodeSnippet {
  language: 'C++' | 'Java'
  title: string
  code: string
  explanation: string
}

export interface LearningTopic {
  id: string
  name: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedMinutes: number
  prerequisites: string[]
  overview: string
  corePrinciples: string[]
  timeComplexity: { operation: string; complexity: string; note: string }[]
  spaceComplexity: string
  interestAnalogies: Record<string, TopicAnalogy>
  styleExplanations: {
    'real-world examples': StyleExplanation
    'step-by-step': StyleExplanation
    'visual': StyleExplanation
    'theoretical': StyleExplanation
  }
  codeExamples: {
    cpp: CodeSnippet
    java: CodeSnippet
  }
  summaryTakeaways: string[]
}

export const PREDEFINED_LEARNING_TOPICS: LearningTopic[] = [
  // ── 1. Arrays ──────────────────────────────────────────────────────────────
  {
    id: 'arrays',
    name: 'Arrays',
    category: 'Linear Structures',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    prerequisites: ['Basic Variable Types', 'Memory Foundations'],
    overview:
      'An Array is a contiguous block of memory allocated to store elements of the same data type. Because memory cells are directly adjacent, the computer calculates the exact address of any element in O(1) time using its index: Address = Base_Address + (Index × Element_Size).',
    corePrinciples: [
      'Contiguous Memory Allocation ensures lightning-fast sequential access and CPU cache locality.',
      'Constant-Time Indexing O(1) via arithmetic offset from the base memory pointer.',
      'Linear Insertion and Deletion O(N) when shifting subsequent elements is required.',
      'Fixed Capacity in static arrays; dynamic arrays automatically double capacity when full with amortized O(1) append time.',
    ],
    timeComplexity: [
      { operation: 'Access by Index', complexity: 'O(1)', note: 'Direct memory address computation' },
      { operation: 'Search by Value', complexity: 'O(N)', note: 'Linear scan unless sorted' },
      { operation: 'Insert at End', complexity: 'O(1)', note: 'Amortized for dynamic resizing' },
      { operation: 'Insert at Beginning / Middle', complexity: 'O(N)', note: 'Requires shifting remaining elements' },
      { operation: 'Deletion', complexity: 'O(N)', note: 'Requires shifting remaining elements left' },
    ],
    spaceComplexity: 'O(N) auxiliary space where N is the total capacity allocated.',
    interestAnalogies: {
      railway: {
        title: 'Railway Platform Coaches',
        narrative:
          'Think of an Express Train at a railway junction. Each coach has a reserved number painted on the platform (Coach 0, Coach 1, Coach 2...). Because coaches are strictly linked end-to-end in continuous physical order, a station manager can walk directly to Coach 4 without inspecting the coaches in between. Adding a coach in the middle requires uncoupling and shifting all trailing coaches back by one slot.',
        mapping: [
          { term: 'Coach Index (e.g. S4)', dsaConcept: 'Array Index', meaning: 'Exact numerical position relative to the train head.' },
          { term: 'Physical Track Alignment', dsaConcept: 'Contiguous Memory', meaning: 'Elements occupy consecutive slots without gaps.' },
          { term: 'Uncoupling & Shifting Cars', dsaConcept: 'Array Shift O(N)', meaning: 'Inserting or deleting a middle coach forces repositioning.' },
        ],
      },
      gaming: {
        title: 'Player Inventory Hotbar',
        narrative:
          'In game engines like Minecraft or RPGs, your quick-slot hotbar is an array of size 9. Pressing key 3 instantaneously equips item slot 3 with zero latency because the engine indexes directly into the hotbar array buffer. Reordering inventory requires moving item slots around.',
        mapping: [
          { term: 'Hotbar Key (1-9)', dsaConcept: 'Index Lookup', meaning: 'Direct O(1) item retrieval.' },
          { term: 'Inventory Slot Limit', dsaConcept: 'Fixed Array Capacity', meaning: 'Pre-allocated memory boundary.' },
        ],
      },
      fintech: {
        title: 'Sequential Order Book Tick Records',
        narrative:
          'High-frequency trading engines allocate price history ticks in fixed contiguous arrays to maximize CPU L1 cache line hits, ensuring nanosecond retrieval of trade batches.',
        mapping: [
          { term: 'Tick Sequence Number', dsaConcept: 'Array Index', meaning: 'Zero-latency sequential offset.' },
          { term: 'Cache Line Warmth', dsaConcept: 'Contiguity Locality', meaning: 'Sequential reads prefetch neighboring items.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Physical Storage Lockers',
        body:
          'Picture a numbered locker bank at a transit hub (Lockers 0 through 9). Each locker is identical in width and locked side-by-side. If locker 0 starts at position 100cm, locker 5 is precisely at 100 + (5 × locker_width). You can leap directly to locker 5 without opening lockers 1, 2, 3, or 4.',
      },
      'step-by-step': {
        headline: 'Memory Calculation & Insertion Steps',
        body:
          'Step 1: Compute Target Address = BaseAddress + index * sizeof(element).\nStep 2: To insert at index k in array of size N, loop from i = N-1 down to k, copying arr[i+1] = arr[i].\nStep 3: Place the new value at arr[k].\nStep 4: Increment size counter. Total operations: (N - k) shifts.',
      },
      'visual': {
        headline: 'Contiguous Memory Ribbon',
        body:
          'Memory addresses advance by uniform byte offsets:\n[Index: 0 | Addr: 0x100] -> [Index: 1 | Addr: 0x104] -> [Index: 2 | Addr: 0x108]',
        visualDiagram: `+---------------+---------------+---------------+---------------+
| Index 0: 42   | Index 1: 17   | Index 2: 89   | Index 3: 5   |
| Addr: 0x1000  | Addr: 0x1004  | Addr: 0x1008  | Addr: 0x100C  |
+---------------+---------------+---------------+---------------+
    ^
    |-- Direct O(1) Jump to base + (index * 4 bytes)`,
      },
      'theoretical': {
        headline: 'Random-Access Machine (RAM) Invariant',
        body:
          'Under the RAM model of computation, access to memory location M[i] takes O(1) worst-case time. Dynamic resizing follows the geometric expansion rule (factor α = 2): an array doubling at sizes 1, 2, 4, 8... yields an amortized insertion cost of ∑(2^i)/2^k ≤ 3 = O(1).',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'In-Place Array Reverse (Two Pointers)',
        code: `#include <vector>
#include <algorithm>

// Reverses array in-place using two converging pointers
// Time Complexity: O(N), Space Complexity: O(1)
void reverseArray(std::vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;

    while (left < right) {
        // Swap elements at left and right pointers
        std::swap(arr[left], arr[right]);
        left++;
        right--;
    }
}`,
        explanation: 'Uses std::swap and symmetric pointers to reverse elements in O(N) time with O(1) extra memory.',
      },
      java: {
        language: 'Java',
        title: 'In-Place Array Reverse (Two Pointers)',
        code: `// Reverses array in-place using two converging pointers
// Time Complexity: O(N), Space Complexity: O(1)
public class ArrayOperations {
    public static void reverseArray(int[] arr) {
        int left = 0;
        int right = arr.length - 1;

        while (left < right) {
            // Swap elements at left and right pointers
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
        explanation: 'In-place two-pointer traversal executing in O(N) time and O(1) auxiliary space without extra allocation.',
      },
    },
    summaryTakeaways: [
      'Use arrays when random access by index is frequent.',
      'Avoid frequent inserts/deletes at the front of large arrays due to O(N) shifting overhead.',
      'Leverage CPU cache locality for fast iterations.',
    ],
  },

  // ── 2. Strings ─────────────────────────────────────────────────────────────
  {
    id: 'strings',
    name: 'Strings',
    category: 'Linear Structures',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    prerequisites: ['Arrays', 'Character Encoding / ASCII'],
    overview:
      'A String is an ordered sequence of characters, fundamentally stored as an array of bytes or code units (ASCII / UTF-8 / UTF-16). In many modern languages (Java, Python), strings are immutable, meaning alterations create new string instances.',
    corePrinciples: [
      'Character Indexing behaves like array indexing in O(1) time.',
      'Immutability prevents unexpected side effects but makes repeated concatenation in loops O(N²); use string builders or array buffers instead.',
      'Pattern Matching (Two Pointers, Sliding Window, KMP, Rolling Hash) forms the algorithmic backbone.',
      'Frequency Arrays / Hash Maps enable O(N) anagram verification and substring checks.',
    ],
    timeComplexity: [
      { operation: 'Character Access charAt(i)', complexity: 'O(1)', note: 'Direct byte offset' },
      { operation: 'Substring Extraction', complexity: 'O(K)', note: 'Where K is substring length' },
      { operation: 'Concatenation (immutable)', complexity: 'O(N + M)', note: 'Allocates new combined string buffer' },
      { operation: 'Two-Pointer Palindrome Check', complexity: 'O(N)', note: 'Single pass comparing symmetrical indices' },
    ],
    spaceComplexity: 'O(N) to store characters plus terminating bytes or length headers.',
    interestAnalogies: {
      railway: {
        title: 'Train Station Announcement Boards',
        narrative:
          'A digital LED display board at an interstate junction displays train codes (e.g. "NDLS-EXP-12004"). Each letter is a flip-tile or character cell. Checking whether two station destination codes match is an exact character-by-character validation.',
        mapping: [
          { term: 'LED Tile Position', dsaConcept: 'Character Index', meaning: 'Slot holding a single ASCII symbol.' },
          { term: 'Rolling Marquee Scroll', dsaConcept: 'Sliding Window', meaning: 'Inspecting fixed-length consecutive substrings.' },
        ],
      },
      gaming: {
        title: 'Dialogue Script Parsing',
        narrative:
          'Game scripts serialize NPC quest dialogues as character strings with special command tokens. Finding keyword commands like "[GIVE_QUEST]" relies on string searching.',
        mapping: [
          { term: 'Quest Token Command', dsaConcept: 'Pattern / Substring', meaning: 'Target pattern to match inside larger script.' },
        ],
      },
      fintech: {
        title: 'Ticker Symbol Normalization',
        narrative:
          'Stock exchange matching engines parse incoming FIX protocol symbol tags ("AAPL.US", "MSFT.NASDAQ") to route buy orders to order books.',
        mapping: [
          { term: 'Symbol Characters', dsaConcept: 'String Tokens', meaning: 'Unique identifier strings.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Beaded Letter Necklaces',
        body:
          'Imagine beads with letters strung on a wire. You can read the 4th bead instantly. But if the wire is permanently welded (immutable), you cannot swap a bead without assembling an entirely new necklace.',
      },
      'step-by-step': {
        headline: 'Valid Palindrome Verification',
        body:
          'Step 1: Set left = 0 and right = string.length - 1.\nStep 2: Compare string[left] and string[right]. If different, return false.\nStep 3: Increment left, decrement right.\nStep 4: Repeat until left >= right. Return true.',
      },
      'visual': {
        headline: 'Two Pointers Converging',
        body:
          'Two pointers start at opposing ends and advance toward the center:\nL -> [r, a, c, e, c, a, r] <- R',
        visualDiagram: `String:  "r   a   c   e   c   a   r"
Index:    0   1   2   3   4   5   6
Pointers: ^                       ^
        left                    right
         -->                     <--`,
      },
      'theoretical': {
        headline: 'Alphabet Cardinality & Prefix Invariants',
        body:
          'For an alphabet Σ with size |Σ| (e.g. 26 lowercase English letters), string frequency vectors can be represented as an array of size |Σ| allowing O(|Σ|) = O(1) isomorphism checks.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Valid Anagram Check via 26-Element Frequency Array',
        code: `#include <string>
#include <vector>

// Checks if string t is an anagram of string s
// Time Complexity: O(N), Space Complexity: O(1) auxiliary
bool isAnagram(const std::string& s, const std::string& t) {
    if (s.length() != t.length()) return false;

    // Fixed 26-element bucket for lowercase English letters 'a' through 'z'
    int freq[26] = {0};

    for (size_t i = 0; i < s.length(); i++) {
        freq[s[i] - 'a']++;
        freq[t[i] - 'a']--;
    }

    // Verify all character frequencies net out to zero
    for (int count : freq) {
        if (count != 0) return false;
    }
    return true;
}`,
        explanation: 'Uses a fixed-size integer array to track frequency balance in O(N) time and O(1) auxiliary space.',
      },
      java: {
        language: 'Java',
        title: 'Valid Anagram Check via 26-Element Frequency Array',
        code: `// Checks if string t is an anagram of string s
// Time Complexity: O(N), Space Complexity: O(1) auxiliary
public class StringAnagram {
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;

        // Fixed 26-element bucket for lowercase English letters 'a' through 'z'
        int[] freq = new int[26];

        for (int i = 0; i < s.length(); i++) {
            freq[s.charAt(i) - 'a']++;
            freq[t.charAt(i) - 'a']--;
        }

        // Verify all character frequencies net out to zero
        for (int count : freq) {
            if (count != 0) return false;
        }
        return true;
    }
}`,
        explanation: 'Processes strings in a single pass using integer subtraction on ASCII character codes.',
      },
    },
    summaryTakeaways: [
      'Strings are indexed like arrays, but beware of immutability in concatenation loops.',
      'Use 26-element integer frequency arrays for fast lowercase character math.',
      'Sliding window and two-pointer techniques solve the vast majority of string interview challenges.',
    ],
  },

  // ── 3. Linked Lists ────────────────────────────────────────────────────────
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    category: 'Linear Structures',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisites: ['Pointers / Object References', 'Memory Allocation'],
    overview:
      'A Linked List is a linear data structure where elements (called nodes) are stored anywhere in memory and connected via pointers. Each node contains data and a pointer reference to the next node (Singly Linked) or both next and previous nodes (Doubly Linked).',
    corePrinciples: [
      'Non-contiguous dynamic memory: nodes are allocated on the heap as needed without resizing the entire structure.',
      'Instant O(1) Insertion & Deletion at known node pointers without shifting trailing elements.',
      'Sequential O(N) Access: No random indexing; traversal must begin from the head node.',
      'Extra memory overhead for pointer storage (4-8 bytes per reference).',
    ],
    timeComplexity: [
      { operation: 'Insert at Head', complexity: 'O(1)', note: 'Update new node next and head pointer' },
      { operation: 'Insert at Tail (with tail ref)', complexity: 'O(1)', note: 'Update tail pointer' },
      { operation: 'Search / Access by Index', complexity: 'O(N)', note: 'Must traverse from head node' },
      { operation: 'Delete Known Node (Singly)', complexity: 'O(N)', note: 'Needs reference to predecessor' },
      { operation: 'Delete Known Node (Doubly)', complexity: 'O(1)', note: 'Directly update prev and next pointers' },
    ],
    spaceComplexity: 'O(N) data plus O(N) pointer references.',
    interestAnalogies: {
      railway: {
        title: 'Coupled Railway Coaches with Coupler Links',
        narrative:
          'Unlike fixed bench seats, think of individual train cars connected by mechanical couplers. Each car holds its cargo and has a hook linking it to the next car behind it. Inserting a new dining car right behind the engine takes just seconds: unhook the coupler, attach the dining car to the engine, and hook the remaining train to the dining car. No cars need to be moved across platforms.',
        mapping: [
          { term: 'Engine Car', dsaConcept: 'Head Pointer', meaning: 'The entry point to traverse the entire train.' },
          { term: 'Mechanical Coupler Hook', dsaConcept: 'Next Node Pointer', meaning: 'Direct address link to the successor car.' },
          { term: 'Caboose / Guard Van', dsaConcept: 'Tail Node -> null', meaning: 'Terminating end with no further link.' },
        ],
      },
      gaming: {
        title: 'Sequential Quest Chains',
        narrative:
          'In an RPG, a questline is a series of objectives where finishing one quest unlocks the clue pointing to the coordinates of the next quest node in the storyline.',
        mapping: [
          { term: 'Current Quest Scroll', dsaConcept: 'Node Data', meaning: 'Information for the current objective.' },
          { term: 'Clue to Next Stage', dsaConcept: 'Next Pointer', meaning: 'Reference leading to the follow-up quest.' },
        ],
      },
      fintech: {
        title: 'Transaction Audit Block Sequence',
        narrative:
          'Financial audit trails chain historical ledger modifications where each entry cryptographically points to the prior entry.',
        mapping: [
          { term: 'Ledger Entry', dsaConcept: 'Node Data', meaning: 'Financial debit/credit payload.' },
          { term: 'Chain Reference', dsaConcept: 'Pointer Link', meaning: 'Direct pointer link between records.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Scavenger Hunt Clues',
        body:
          'In a scavenger hunt, clue #1 tells you the location of clue #2. Clue #2 tells you where clue #3 is hidden. You cannot jump directly to clue #5 without following each intermediate hint.',
      },
      'step-by-step': {
        headline: 'Reversing a Singly Linked List',
        body:
          'Step 1: Initialize prev = null, curr = head, next = null.\nStep 2: Loop while curr !== null:\n  a) next = curr.next (save next node)\n  b) curr.next = prev (reverse the pointer)\n  c) prev = curr (advance prev)\n  d) curr = next (advance curr)\nStep 3: Set head = prev. Return new head.',
      },
      'visual': {
        headline: 'Pointer Rewiring Diagram',
        body:
          'Reversing pointers turns the direction of arrows without moving memory:',
        visualDiagram: `Before:  [Head] -> [A] ----> [B] ----> [C] -> null

During:  null <- [A] <---- [B]       [C] -> null
                           prev      curr

After:   [New Head] -> [C] ----> [B] ----> [A] -> null`,
      },
      'theoretical': {
        headline: 'Pointer Indirection & Cache Locality Tradeoff',
        body:
          'While linked lists achieve O(1) localized mutations, they exhibit poor spatial locality. Each node fetch can cause an L1/L2 CPU cache miss because memory addresses are fragmented throughout the heap.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'In-Place Singly Linked List Reversal',
        code: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// Reverses a singly-linked list iteratively in O(N) time and O(1) space
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr != nullptr) {
        ListNode* nextNode = curr->next; // 1. Save pointer to next node
        curr->next = prev;               // 2. Reverse current pointer
        prev = curr;                     // 3. Move prev pointer forward
        curr = nextNode;                 // 4. Move curr pointer forward
    }

    return prev; // prev is the new head of the reversed list
}`,
        explanation: 'Classic 3-pointer manipulation technique operating in O(N) time and O(1) auxiliary stack space.',
      },
      java: {
        language: 'Java',
        title: 'In-Place Singly Linked List Reversal',
        code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; this.next = null; }
}

public class LinkedListOperations {
    // Reverses a singly-linked list iteratively in O(N) time and O(1) space
    public static ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;

        while (curr != null) {
            ListNode nextNode = curr.next; // 1. Save pointer to next node
            curr.next = prev;              // 2. Reverse current pointer
            prev = curr;                    // 3. Move prev pointer forward
            curr = nextNode;                // 4. Move curr pointer forward
        }

        return prev; // prev is the new head of the reversed list
    }
}`,
        explanation: 'Manipulates references iteratively in O(N) time without allocating any new heap objects.',
      },
    },
    summaryTakeaways: [
      'Choose linked lists when insertions/deletions at the head/tail are frequent and array resizing overhead is unacceptable.',
      'Use the fast & slow pointer (Floyd cycle detection) technique to detect cycles and locate middle elements in O(N) time.',
      'Always handle edge cases: empty list (`head === null`) and single-node list (`head.next === null`).',
    ],
  },

  // ── 4. Stack & Queue ───────────────────────────────────────────────────────
  {
    id: 'stack-queue',
    name: 'Stack & Queue',
    category: 'Abstract Data Types',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisites: ['Arrays', 'Linked Lists'],
    overview:
      'Stacks and Queues are restricted linear data structures. A Stack follows LIFO (Last-In, First-Out), where the most recently added element is removed first. A Queue follows FIFO (First-In, First-Out), where the earliest added element is served first.',
    corePrinciples: [
      'Stack LIFO: Push (insert on top), Pop (remove from top), Peek (inspect top) all in O(1).',
      'Queue FIFO: Enqueue (insert at rear), Dequeue (remove from front), Peek (inspect front) all in O(1).',
      'Call Stack & Undo/Redo mechanisms are powered by stacks.',
      'Task Scheduling, Breadth-First Search (BFS), and message buffers are powered by queues.',
    ],
    timeComplexity: [
      { operation: 'Stack Push / Pop', complexity: 'O(1)', note: 'Operates strictly on stack top' },
      { operation: 'Queue Enqueue / Dequeue', complexity: 'O(1)', note: 'Circular buffer or double-ended pointer' },
      { operation: 'Search / Peek Other Element', complexity: 'O(N)', note: 'Requires popping elements out' },
    ],
    spaceComplexity: 'O(N) to store buffered items.',
    interestAnalogies: {
      railway: {
        title: 'Single-Track Siding (Stack) vs Ticket Queue (Queue)',
        narrative:
          'Stack: A dead-end railway siding track with one buffer bumper. The last locomotive pushed onto the dead-end siding is the first one that must back out (LIFO).\nQueue: Passenger ticket counter line. The first passenger standing in line is served first and departs first (FIFO).',
        mapping: [
          { term: 'Dead-End Train Siding', dsaConcept: 'Stack (LIFO)', meaning: 'Last train in is first train out.' },
          { term: 'Passenger Ticket Line', dsaConcept: 'Queue (FIFO)', meaning: 'First passenger to arrive is served first.' },
        ],
      },
      gaming: {
        title: 'Matchmaking Lobby & Spell History',
        narrative:
          'Stack: An undo stack of player actions or nested inventory menus (pressing ESC pops the most recent sub-menu).\nQueue: The multiplayer matchmaking queue where waiting players are matched in arrival order.',
        mapping: [
          { term: 'Escape Menu Stacking', dsaConcept: 'Stack LIFO', meaning: 'Current screen covers previous screen.' },
          { term: 'Matchmaking Lobby', dsaConcept: 'Queue FIFO', meaning: 'First players to queue join match first.' },
        ],
      },
      fintech: {
        title: 'FIFO Accounting & Order Queues',
        narrative:
          'Stock matching engines process incoming market orders strictly FIFO by timestamp priority.',
        mapping: [
          { term: 'Order Arrival Queue', dsaConcept: 'FIFO Queue', meaning: 'First timestamp receives trade match.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Cafeteria Plate Dispenser & Supermarket Checkout',
        body:
          'Stack: A spring-loaded cafeteria tray dispenser. Clean trays are loaded onto the top; hungry customers take from the top (LIFO).\nQueue: Checkout line at a grocery store. The first customer at the conveyor belt pays first (FIFO).',
      },
      'step-by-step': {
        headline: 'Evaluating Balanced Parentheses with Stack',
        body:
          'Step 1: Create an empty stack.\nStep 2: Traverse character by character.\nStep 3: If opening bracket `(`, `[`, `{`, push onto stack.\nStep 4: If closing bracket, check if stack is empty (invalid). Pop top and verify it matches the closing bracket.\nStep 5: After loop, verify stack is completely empty.',
      },
      'visual': {
        headline: 'Stack vs Queue Movement',
        body:
          'Stack pushes/pops from one side; Queue moves elements through both ends:',
        visualDiagram: `STACK (LIFO):                QUEUE (FIFO):
     Push -> [ Top ] -> Pop       Enqueue -> [ Rear ] ... [ Front ] -> Dequeue
             [ Mid ]
             [ Base]`,
      },
      'theoretical': {
        headline: 'Formal Pushdown Automata Model',
        body:
          'Stacks provide memory for Pushdown Automata to parse context-free grammars (such as nested HTML/JSON or mathematical expressions with operator precedence).',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Valid Parentheses Checker via std::stack',
        code: `#include <string>
#include <stack>

// Validates matching brackets using LIFO stack
// Time Complexity: O(N), Space Complexity: O(N)
bool isValidParentheses(const std::string& s) {
    std::stack<char> st;

    for (char ch : s) {
        // Push opening brackets
        if (ch == '(' || ch == '{' || ch == '[') {
            st.push(ch);
        } else {
            // Unmatched closing bracket
            if (st.empty()) return false;
            char top = st.top();
            st.pop();

            if ((ch == ')' && top != '(') ||
                (ch == '}' && top != '{') ||
                (ch == ']' && top != '[')) {
                return false;
            }
        }
    }

    return st.empty(); // All opened brackets must be matched
}`,
        explanation: 'Enforces proper syntactic nesting in O(N) time and O(N) auxiliary space.',
      },
      java: {
        language: 'Java',
        title: 'Valid Parentheses Checker via Stack',
        code: `import java.util.Stack;

// Validates matching brackets using LIFO stack
// Time Complexity: O(N), Space Complexity: O(N)
public class ParenthesesChecker {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();

        for (char ch : s.toCharArray()) {
            // Push opening brackets
            if (ch == '(' || ch == '{' || ch == '[') {
                stack.push(ch);
            } else {
                // Unmatched closing bracket
                if (stack.isEmpty()) return false;
                char top = stack.pop();

                if ((ch == ')' && top != '(') ||
                    (ch == '}' && top != '{') ||
                    (ch == ']' && top != '[')) {
                    return false;
                }
            }
        }

        return stack.isEmpty(); // All opened brackets must be matched
    }
}`,
        explanation: 'Uses a LIFO stack to verify that inner parentheses are closed before outer parentheses.',
      },
    },
    summaryTakeaways: [
      'Use Stacks for backtracking, undo operations, parenthesis matching, and depth-first exploration (DFS).',
      'Use Queues for breadth-first search (BFS), buffering asynchronous events, and rate-limiting pipelines.',
      'Circular arrays or two-pointer head/tail linked lists implement queues with guaranteed O(1) operations.',
    ],
  },

  // ── 5. Trees ───────────────────────────────────────────────────────────────
  {
    id: 'trees',
    name: 'Trees',
    category: 'Hierarchical Structures',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Linked Lists', 'Recursion'],
    overview:
      'A Tree is a non-linear hierarchical data structure consisting of nodes connected by directed edges. It has a single Root node at the top, and every child node has exactly one parent node (with no cycles). A Binary Tree restricts each node to at most two children: Left and Right.',
    corePrinciples: [
      'Root, Parent, Child, Leaf, Depth, and Height define the anatomical terms.',
      'Binary Search Tree (BST) Invariant: Left child < Current node < Right child.',
      'Inorder Traversal (Left -> Root -> Right) on a BST produces sorted elements in ascending order.',
      'Balanced BSTs (AVL, Red-Black) achieve O(log N) search, insertion, and deletion.',
    ],
    timeComplexity: [
      { operation: 'Search in Balanced BST', complexity: 'O(log N)', note: 'Halves the search space each step' },
      { operation: 'Search in Skewed BST', complexity: 'O(N)', note: 'Degenerates into a linked list' },
      { operation: 'Tree Traversals (Inorder/Pre/Post)', complexity: 'O(N)', note: 'Visits every node exactly once' },
      { operation: 'LCA (Lowest Common Ancestor)', complexity: 'O(log N)', note: 'In balanced BST' },
    ],
    spaceComplexity: 'O(H) recursion call stack where H is the height of the tree (O(log N) balanced, O(N) skewed).',
    interestAnalogies: {
      railway: {
        title: 'Railway Junction Branching Network',
        narrative:
          'Think of a central national railway terminal (the Root). From the central terminal, tracks split into the Northern Trunk Line and Southern Trunk Line (Left and Right children). Each regional hub splits further into local branch lines leading to terminal stations (Leaves). Trains navigate hierarchically down the branches without ever encountering a closed loop.',
        mapping: [
          { term: 'Central Terminal Station', dsaConcept: 'Root Node', meaning: 'The topmost entry point with no parent.' },
          { term: 'Track Fork / Switch Point', dsaConcept: 'Internal Node Branching', meaning: 'Node connecting to left and right subtrees.' },
          { term: 'Terminal Dead-End Depot', dsaConcept: 'Leaf Node', meaning: 'Node with zero children.' },
        ],
      },
      gaming: {
        title: 'Skill Trees & Tech Progression',
        narrative:
          'In RPGs and strategy games, skill trees branch from base combat training into specialized wizardry or archery subclasses.',
        mapping: [
          { term: 'Base Skill', dsaConcept: 'Root Node', meaning: 'Initial starting talent.' },
          { term: 'Sub-Talent Upgrade', dsaConcept: 'Child Node', meaning: 'Prerequisite branch unlocked by parent.' },
        ],
      },
      fintech: {
        title: 'Corporate Holding Structure & Decision Trees',
        narrative:
          'Risk management algorithms evaluate credit worthiness through binary decision trees: If Income > $60k -> Branch Left; else Branch Right.',
        mapping: [
          { term: 'Decision Rule Check', dsaConcept: 'BST Node Comparison', meaning: 'Splitting criteria guiding the search path.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Company Organizational Chart',
        body:
          'CEO sits at the top (Root). Under the CEO are Vice Presidents. Under each VP are Directors, then Managers, and finally Individual Contributors (Leaves). Each person reports to one direct superior.',
      },
      'step-by-step': {
        headline: 'Searching a Value in a BST',
        body:
          'Step 1: Start at root.\nStep 2: If root is null, return null (not found).\nStep 3: If target === root.val, return root (found!).\nStep 4: If target < root.val, recurse on root.left.\nStep 5: If target > root.val, recurse on root.right.\nTime complexity: O(H) where H = height.',
      },
      'visual': {
        headline: 'Binary Search Tree Hierarchy',
        body:
          'Every node maintains Left < Node < Right:',
        visualDiagram: `            [ 8 ]            <-- Root
           /     \\
        [ 3 ]    [ 10 ]      <-- Level 1
        /   \\        \\
     [ 1 ]  [ 6 ]    [ 14 ]  <-- Leaves
            /   \\
          [ 4 ] [ 7 ]`,
      },
      'theoretical': {
        headline: 'Height vs Node Count Relations',
        body:
          'A complete binary tree of height H contains N = 2^(H+1) - 1 nodes. Therefore, height H = ⌊log₂(N)⌋. Searching eliminates half the candidate nodes per comparison, proving the O(log N) lower bound.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Binary Tree Inorder Traversal (L-Root-R)',
        code: `#include <vector>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// Recursive Inorder: yields ascending sorted order on a BST
// Time Complexity: O(N), Space: O(H) call stack
void inorder(TreeNode* root, std::vector<int>& result) {
    if (root == nullptr) return;

    inorder(root->left, result);  // 1. Visit left subtree
    result.push_back(root->val);  // 2. Process current node
    inorder(root->right, result); // 3. Visit right subtree
}

std::vector<int> inorderTraversal(TreeNode* root) {
    std::vector<int> result;
    inorder(root, result);
    return result;
}`,
        explanation: 'Traverses each node in the tree exactly once in O(N) time with O(H) recursion memory.',
      },
      java: {
        language: 'Java',
        title: 'Binary Tree Inorder Traversal (L-Root-R)',
        code: `import java.util.ArrayList;
import java.util.List;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

public class TreeTraversal {
    // Recursive Inorder: yields ascending sorted order on a BST
    // Time Complexity: O(N), Space: O(H) call stack
    private static void inorder(TreeNode root, List<Integer> result) {
        if (root == null) return;

        inorder(root.left, result);  // 1. Visit left subtree
        result.add(root.val);        // 2. Process current node
        inorder(root.right, result); // 3. Visit right subtree
    }

    public static List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        inorder(root, result);
        return result;
    }
}`,
        explanation: 'Standard recursive traversal collecting tree nodes into a dynamically expanding array list.',
      },
    },
    summaryTakeaways: [
      'BSTs provide O(log N) search and insertion when balanced.',
      'Remember traversal orders: Inorder (L-Root-R) sorted, Preorder (Root-L-R) serialization, Postorder (L-R-Root) deletion.',
      'Always consider skewed tree edge cases when analyzing algorithmic complexity.',
    ],
  },

  // ── 6. Graphs ──────────────────────────────────────────────────────────────
  {
    id: 'graphs',
    name: 'Graphs',
    category: 'Network Structures',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Trees', 'Queue', 'Recursion / Stack'],
    overview:
      'A Graph G = (V, E) is a non-linear network composed of vertices (nodes) connected by edges (links). Unlike trees, graphs can contain cycles, multiple connected components, and disconnected nodes. Edges can be Directed (one-way) or Undirected (two-way), and Unweighted or Weighted (carrying costs or distances).',
    corePrinciples: [
      'Representations: Adjacency List (memory efficient for sparse graphs O(V + E)) vs Adjacency Matrix (O(1) edge lookup, O(V²) space).',
      'Breadth-First Search (BFS): Uses a Queue; guarantees the shortest path in unweighted graphs.',
      'Depth-First Search (DFS): Uses recursion or a Stack; ideal for topological sort, connected components, and cycle detection.',
      'Dijkstra\'s Algorithm: Uses a Priority Queue to find shortest paths in non-negative weighted graphs.',
      'Visited Set Invariant: Essential to prevent infinite loops caused by cycles.',
    ],
    timeComplexity: [
      { operation: 'BFS / DFS Traversal', complexity: 'O(V + E)', note: 'Visits every vertex and explores every edge' },
      { operation: 'Dijkstra (with min-heap)', complexity: 'O((V + E) log V)', note: 'Optimal for weighted shortest paths' },
      { operation: 'Cycle Detection', complexity: 'O(V + E)', note: 'Using visited state tracking' },
      { operation: 'Adjacency Matrix Edge Query', complexity: 'O(1)', note: 'Direct matrix index lookup' },
    ],
    spaceComplexity: 'O(V + E) for Adjacency List plus O(V) for visited set and traversal queue/stack.',
    interestAnalogies: {
      railway: {
        title: 'National Railway Route Network (PRD Primary Demo)',
        narrative:
          'A railway map is the definitive real-world graph. Stations are Vertices (Nodes). Railway tracks are Edges. If tracks run between City A and City B, you have an edge. In an unweighted metro line, BFS finds the route with the fewest station stops. In an interstate network with track travel times or delays (Weights), Dijkstra\'s algorithm finds the fastest route.',
        mapping: [
          { term: 'Train Station (e.g. Mumbai CST)', dsaConcept: 'Vertex / Node (V)', meaning: 'Location endpoint in the network.' },
          { term: 'Railway Track', dsaConcept: 'Edge (E)', meaning: 'Connection between two stations.' },
          { term: 'Travel Time / Distance / Delay', dsaConcept: 'Edge Weight (W)', meaning: 'Cost metric associated with traversal.' },
          { term: 'Minimum Interchange Route', dsaConcept: 'BFS Shortest Path', meaning: 'Fewest edge traversals in unweighted graph.' },
          { term: 'Fastest Travel Route', dsaConcept: 'Dijkstra Shortest Path', meaning: 'Minimum accumulated edge weights.' },
        ],
      },
      gaming: {
        title: 'Game World Map & Waypoint Navigation',
        narrative:
          'In open-world games, map crossroads are vertices and roads are edges. AI companions use BFS or A* pathfinding to navigate around obstacles to reach the player.',
        mapping: [
          { term: 'Map Crossroad / Waypoint', dsaConcept: 'Vertex / Node', meaning: 'Walkable navigation point.' },
          { term: 'Connecting Trail', dsaConcept: 'Edge', meaning: 'Navigable corridor.' },
          { term: 'Terrain Difficulty', dsaConcept: 'Weight', meaning: 'Stamina or time cost to traverse.' },
        ],
      },
      fintech: {
        title: 'Currency Arbitrage & Transfer Networks',
        narrative:
          'Currencies are vertices and exchange rates are weighted directed edges. Detecting negative cycles with Bellman-Ford reveals risk-free currency arbitrage opportunities.',
        mapping: [
          { term: 'Currency (USD, EUR, INR)', dsaConcept: 'Vertex', meaning: 'Asset node.' },
          { term: 'Exchange Rate', dsaConcept: 'Directed Weighted Edge', meaning: 'Conversion multiplier.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Flight Routes & Air Traffic',
        body:
          'Airports are vertices, non-stop flight paths are edges, and flight duration in hours is the weight. Finding the flight with the minimum layovers is BFS; finding the flight with minimum overall flight time is Dijkstra.',
      },
      'step-by-step': {
        headline: 'Breadth-First Search (BFS) Traversal Steps',
        body:
          'Step 1: Initialize an empty queue and a visited Set.\nStep 2: Enqueue starting node and add to visited.\nStep 3: While queue is not empty:\n  a) Dequeue current node u.\n  b) For each unvisited neighbor v of u:\n     - Mark v as visited.\n     - Enqueue v.\nStep 4: Once queue is exhausted, all reachable vertices are explored.',
      },
      'visual': {
        headline: 'BFS Layer-by-Layer Wavefront',
        body:
          'BFS expands outward in concentric rings like ripples in water:',
        visualDiagram: `Start [Station A] (Distance 0)
    |
    +---> [Station B] (Distance 1) ---> [Station D] (Distance 2)
    |
    +---> [Station C] (Distance 1) ---> [Station E] (Distance 2)
                                       /
                         [Station F] <- (Distance 3)`,
      },
      'theoretical': {
        headline: 'Graph Density & Spectral Properties',
        body:
          'A graph with |V| vertices has between 0 and |V|(|V|-1)/2 edges (undirected). Sparse graphs where |E| ≪ |V|² benefit dramatically from adjacency list representations (O(V + E) space) over adjacency matrices.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Breadth-First Search (BFS) Shortest Path in Unweighted Graph',
        code: `#include <vector>
#include <queue>
#include <unordered_set>

// Finds shortest path (minimum edge hops) in an unweighted graph using BFS
// Time Complexity: O(V + E), Space Complexity: O(V)
std::vector<int> bfsShortestPath(
    const std::vector<std::vector<int>>& adjList,
    int startNode,
    int targetNode
) {
    // Queue stores paths: each element is the sequence of nodes visited
    std::queue<std::vector<int>> q;
    std::unordered_set<int> visited;

    q.push({startNode});
    visited.insert(startNode);

    while (!q.empty()) {
        std::vector<int> path = q.front();
        q.pop();
        int curr = path.back();

        // Target reached: return the optimal path
        if (curr == targetNode) return path;

        // Explore all adjacent unvisited neighbors
        for (int neighbor : adjList[curr]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                std::vector<int> nextPath = path;
                nextPath.push_back(neighbor);
                q.push(nextPath);
            }
        }
    }

    return {}; // No path exists between start and target
}`,
        explanation: 'Guarantees the fewest edge hops in O(V + E) time using queue-based level-order wavefront traversal.',
      },
      java: {
        language: 'Java',
        title: 'Breadth-First Search (BFS) Shortest Path in Unweighted Graph',
        code: `import java.util.*;

// Finds shortest path (minimum edge hops) in an unweighted graph using BFS
// Time Complexity: O(V + E), Space Complexity: O(V)
public class GraphBFS {
    public static List<Integer> bfsShortestPath(
        Map<Integer, List<Integer>> adjList,
        int startNode,
        int targetNode
    ) {
        Queue<List<Integer>> queue = new LinkedList<>();
        Set<Integer> visited = new HashSet<>();

        queue.add(Collections.singletonList(startNode));
        visited.add(startNode);

        while (!queue.isEmpty()) {
            List<Integer> path = queue.poll();
            int curr = path.get(path.size() - 1);

            // Target reached: return the optimal path
            if (curr == targetNode) return path;

            // Explore all adjacent unvisited neighbors
            for (int neighbor : adjList.getOrDefault(curr, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    List<Integer> nextPath = new ArrayList<>(path);
                    nextPath.add(neighbor);
                    queue.add(nextPath);
                }
            }
        }

        return Collections.emptyList(); // No path exists
    }
}`,
        explanation: 'Explores neighbors layer-by-layer, guaranteeing the first path to touch targetNode is minimal.',
      },
    },
    summaryTakeaways: [
      'Always maintain a `visited` set to avoid infinite loops caused by cyclic paths.',
      'Use BFS for shortest path on unweighted graphs; use Dijkstra when edges have weights.',
      'Represent graphs as an Adjacency List for space and iteration efficiency.',
    ],
  },

  // ── 7. Sorting ─────────────────────────────────────────────────────────────
  {
    id: 'sorting',
    name: 'Sorting',
    category: 'Algorithms',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisites: ['Arrays', 'Recursion', 'Time Complexity'],
    overview:
      'Sorting algorithms rearrange elements of a collection into a specific order (ascending or descending). Comparison-based sorts (Merge Sort, Quick Sort, Heap Sort) are mathematically proven to require at least O(N log N) comparisons in the worst case.',
    corePrinciples: [
      'Stability: A sorting algorithm is stable if it preserves the relative order of records with identical keys.',
      'Divide and Conquer: Merge Sort splits into halves, sorts recursively, and merges back in O(N log N) guaranteed time.',
      'Pivot Partitioning: Quick Sort partitions around a pivot; achieves O(N log N) average time and O(log N) in-place stack space.',
      'Comparison Lower Bound: No comparison sort can beat Ω(N log N) worst-case time.',
    ],
    timeComplexity: [
      { operation: 'Merge Sort (Best / Avg / Worst)', complexity: 'O(N log N)', note: 'Guaranteed predictable performance' },
      { operation: 'Quick Sort (Best / Avg)', complexity: 'O(N log N)', note: 'Cache-friendly with low constant factor' },
      { operation: 'Quick Sort (Worst case)', complexity: 'O(N²)', note: 'When pivot is repeatedly minimum/maximum' },
      { operation: 'Bubble / Insertion / Selection', complexity: 'O(N²)', note: 'Elementary quadratic sorts' },
    ],
    spaceComplexity: 'Merge Sort: O(N) auxiliary merge buffer; Quick Sort: O(log N) recursive call stack in-place.',
    interestAnalogies: {
      railway: {
        title: 'Shunting Yard Sorting Tracks',
        narrative:
          'In a railway shunting yard, freight cars arrive in random order. Switch operators divide train sections across auxiliary sidings and merge them back together in train-number sequence, exactly like Merge Sort combining two sorted sub-trains into a single departure line.',
        mapping: [
          { term: 'Unsorted Freight Cars', dsaConcept: 'Unsorted Array', meaning: 'Incoming random elements.' },
          { term: 'Parallel Siding Tracks', dsaConcept: 'Divide and Conquer Sub-Arrays', meaning: 'Splitting into smaller ordered blocks.' },
          { term: 'Switch Point Convergence', dsaConcept: 'Two-Way Merge Step', meaning: 'Comparing front cars and building sorted train.' },
        ],
      },
      gaming: {
        title: 'Leaderboard Ranking Sort',
        narrative:
          'High score leaderboards sort millions of player records. Insertion sort is used when updating a nearly-sorted live score stream, while Quick Sort ranks match results.',
        mapping: [
          { term: 'Player High Score', dsaConcept: 'Sort Key', meaning: 'Numerical criteria being compared.' },
        ],
      },
      fintech: {
        title: 'Order Book Price-Time Sorting',
        narrative:
          'Trading books sort bids from highest to lowest price, maintaining stability so older equal bids maintain priority.',
        mapping: [
          { term: 'Price Priority', dsaConcept: 'Sorting Key', meaning: 'Primary ordering attribute.' },
          { term: 'Equal Price Timestamp', dsaConcept: 'Sorting Stability', meaning: 'Preserving arrival order for equal keys.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Sorting a Hand of Playing Cards',
        body:
          'When you pick up cards one by one and insert each into its proper position among the already-sorted cards in your hand, you are intuitively executing Insertion Sort.',
      },
      'step-by-step': {
        headline: 'Merge Sort Divide and Conquer',
        body:
          'Step 1: If array length <= 1, return array (base case).\nStep 2: Find middle index mid = Math.floor(len / 2).\nStep 3: Recursively sort left half and right half.\nStep 4: Merge the two sorted halves by comparing pointer heads.\nStep 5: Return merged sorted result.',
      },
      'visual': {
        headline: 'Merge Sort Split and Combine Tree',
        body:
          'Splitting down to single elements and merging back up:',
        visualDiagram: `            [38, 27, 43, 3, 9, 82, 10]
                  /             \\
           [38, 27, 43]       [3, 9, 82, 10]
              /      \\           /        \\
           [38]    [27, 43]    [3, 9]   [82, 10]
             \\        /          \\         /
             [27, 38, 43]        [3, 9, 10, 82]
                     \\             /
               [3, 9, 10, 27, 38, 43, 82]`,
      },
      'theoretical': {
        headline: 'Decision Tree Lower Bound Theorem',
        body:
          'Any comparison-based sorting algorithm corresponds to a decision tree with N! leaves (permutations). A binary tree with N! leaves must have height H ≥ log₂(N!) = Ω(N log N) by Stirling\'s approximation.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Merge Sort (Divide and Conquer)',
        code: `#include <vector>

// Merges two sorted subarrays arr[left..mid] and arr[mid+1..right]
void merge(std::vector<int>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;

    std::vector<int> L(n1), R(n2);
    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }

    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

// Divide-and-conquer sorting in guaranteed O(N log N) time
void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left >= right) return;

    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);      // 1. Sort left half
    mergeSort(arr, mid + 1, right);  // 2. Sort right half
    merge(arr, left, mid, right);    // 3. Merge sorted halves
}`,
        explanation: 'Guarantees O(N log N) worst-case time complexity across all input distributions with stable ordering.',
      },
      java: {
        language: 'Java',
        title: 'Merge Sort (Divide and Conquer)',
        code: `public class MergeSort {
    // Merges two sorted subarrays arr[left..mid] and arr[mid+1..right]
    public static void merge(int[] arr, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        int[] L = new int[n1];
        int[] R = new int[n2];

        for (int i = 0; i < n1; i++) L[i] = arr[left + i];
        for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }

        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
    }

    // Divide-and-conquer sorting in guaranteed O(N log N) time
    public static void sort(int[] arr, int left, int right) {
        if (left >= right) return;

        int mid = left + (right - left) / 2;
        sort(arr, left, mid);      // 1. Sort left half
        sort(arr, mid + 1, right);  // 2. Sort right half
        merge(arr, left, mid, right);    // 3. Merge sorted halves
    }
}`,
        explanation: 'Provides predictable O(N log N) runtime with O(N) temporary array allocation during merging.',
      },
    },
    summaryTakeaways: [
      'Merge Sort guarantees O(N log N) worst-case time and is stable, but requires O(N) auxiliary memory.',
      'Quick Sort is faster in practice due to in-place cache locality, but degrades to O(N²) without randomized pivots.',
      'Use TimSort (hybrid Merge + Insertion sort) for real-world partially ordered datasets.',
    ],
  },

  // ── 8. Searching ───────────────────────────────────────────────────────────
  {
    id: 'searching',
    name: 'Searching',
    category: 'Algorithms',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    prerequisites: ['Arrays', 'Sorting'],
    overview:
      'Searching algorithms locate the position of a target key within a dataset. Linear Search scans every element sequentially in O(N) time. Binary Search eliminates half the remaining elements with every step in O(log N) time, but strictly requires the collection to be sorted beforehand.',
    corePrinciples: [
      'Precondition for Binary Search: The input array MUST be sorted, or the search space must have monotonic properties.',
      'Logarithmic Efficiency: In an array of 1,000,000 items, Linear Search takes up to 1,000,000 steps; Binary Search takes at most 20 comparisons.',
      'Midpoint Calculation: Use `mid = left + (right - left) / 2` to prevent 32-bit integer overflow.',
      'Binary Search on Answer Space: Can be applied to find optimal thresholds in optimization problems.',
    ],
    timeComplexity: [
      { operation: 'Linear Search', complexity: 'O(N)', note: 'Works on unsorted arrays' },
      { operation: 'Binary Search (Best case)', complexity: 'O(1)', note: 'When target is exactly at mid' },
      { operation: 'Binary Search (Worst case)', complexity: 'O(log N)', note: 'Halves the search space each iteration' },
    ],
    spaceComplexity: 'O(1) auxiliary space for iterative binary search; O(log N) call stack for recursive.',
    interestAnalogies: {
      railway: {
        title: 'Timetable Station Schedule Lookup',
        narrative:
          'Consider a printed railway timetable with train numbers sorted chronologically (Train 101, 102, ... 999). If you are looking for Train 550, you open directly to the middle page. If you see Train 500, you immediately know Train 550 must be in the right half, completely discarding the left 500 pages.',
        mapping: [
          { term: 'Sorted Train Numbers', dsaConcept: 'Sorted Array Precondition', meaning: 'Elements arranged in monotonic order.' },
          { term: 'Opening to Middle Page', dsaConcept: 'Mid Calculation', meaning: 'Evaluating candidate at the center.' },
          { term: 'Discarding Left Half', dsaConcept: 'Search Space Reduction', meaning: 'Eliminating N/2 unviable candidates.' },
        ],
      },
      gaming: {
        title: 'High/Low Guessing Game',
        narrative:
          'In a guessing mini-game ("Guess a number between 1 and 100"): guessing 50 and hearing "Higher!" eliminates numbers 1 through 50 immediately. Next guess 75.',
        mapping: [
          { term: '"Higher" or "Lower" Clue', dsaConcept: 'Binary Comparison', meaning: 'Determines whether to search left or right.' },
        ],
      },
      fintech: {
        title: 'Price Threshold Search & Limit Orders',
        narrative:
          'Locating the first limit order with price ≥ $150.00 in a sorted bids book uses binary search to find the insertion index in O(log N).',
        mapping: [
          { term: 'Order Price Levels', dsaConcept: 'Sorted Array', meaning: 'Monotonically ordered price steps.' },
        ],
      },
    },
    styleExplanations: {
      'real-world examples': {
        headline: 'Looking up a Word in a Paper Dictionary',
        body:
          'When looking up "Quantum", you don\'t read from page 1 ("A"). You flip to the middle (letter "M"), realize "Q" comes later, and flip to the middle of the remaining half. You reach the word in seconds.',
      },
      'step-by-step': {
        headline: 'Iterative Binary Search Algorithm',
        body:
          'Step 1: Set left = 0, right = arr.length - 1.\nStep 2: While left <= right:\n  a) Calculate mid = left + (right - left) / 2.\n  b) If arr[mid] === target, return mid.\n  c) If arr[mid] < target, set left = mid + 1 (search right half).\n  d) If arr[mid] > target, set right = mid - 1 (search left half).\nStep 3: If loop terminates, return -1 (target not found).',
      },
      'visual': {
        headline: 'Halving the Search Range',
        body:
          'Searching for 23 in a 7-element sorted array:',
        visualDiagram: `Step 1: [2, 5, 8, 12, 16, 23, 38]   Mid = 12 (23 > 12 -> Go Right)
                 L         M           R

Step 2:               [16, 23, 38]   Mid = 23 (Match Found!)
                       L   M   R`,
      },
      'theoretical': {
        headline: 'Recurrence Relation & Information Theory',
        body:
          'The recurrence is T(N) = T(N/2) + O(1). By Master Theorem (Case 2), T(N) = Θ(log N). Each comparison yields 1 bit of information, reducing ambiguity until the log₂(N) bound identifies the unique index.',
      },
    },
    codeExamples: {
      cpp: {
        language: 'C++',
        title: 'Standard Iterative Binary Search',
        code: `#include <vector>

// Searches for target key in a sorted vector
// Time Complexity: O(log N), Auxiliary Space: O(1)
int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;

    while (left <= right) {
        // Prevents integer overflow in 32-bit arithmetic
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid; // Target found at index mid
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }

    return -1; // Target does not exist in array
}`,
        explanation: 'Iterative binary search executing in O(log N) time and O(1) space with overflow-safe index arithmetic.',
      },
      java: {
        language: 'Java',
        title: 'Standard Iterative Binary Search',
        code: `// Searches for target key in a sorted array
// Time Complexity: O(log N), Auxiliary Space: O(1)
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            // Prevents integer overflow in 32-bit arithmetic
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) {
                return mid; // Target found at index mid
            } else if (arr[mid] < target) {
                left = mid + 1; // Search right half
            } else {
                right = mid - 1; // Search left half
            }
        }

        return -1; // Target does not exist in array
    }
}`,
        explanation: 'Halves the search space with every comparison, locating target in at most log₂(N) iterations.',
      },
    },
    summaryTakeaways: [
      'Binary Search strictly requires a sorted or monotonic space.',
      'Always write `mid = left + (right - left) / 2` to safeguard against integer overflow.',
      'Look out for rotated sorted arrays and binary search on continuous answer ranges in advanced problems.',
    ],
  },
]
