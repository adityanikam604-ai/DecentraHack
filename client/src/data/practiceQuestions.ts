// ── DecentralLearn Predefined Practice Questions Dataset ──────────────────────
// Undergraduate-standard DSA practice questions covering all 8 core topics
// across Easy, Medium, and Hard difficulty levels.
// Used by the Activity Agent for real-time adaptive practice sessions.

export interface PracticeQuestion {
  id: string
  topicId: string     // slug: 'arrays' | 'strings' | 'linked-lists' | 'stack-queue' | 'trees' | 'graphs' | 'sorting' | 'searching'
  topicName: string   // display name
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correctAnswer: string
  hint: string
  explanation: string
  revisionTip: string
}

export const PREDEFINED_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // 1. ARRAYS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-arr-e1',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'easy',
    question: 'Given an array A starting at memory address 1000 with 4-byte integers, what formula does the hardware use to find the address of element A[i] in O(1) time?',
    options: [
      'Address = 1000 + (i × 4)',
      'Address = 1000 + (i / 4)',
      'Address = 1000 × i + 4',
      'Address = (1000 + i) × 4'
    ],
    correctAnswer: 'Address = 1000 + (i × 4)',
    hint: 'Think of contiguous memory slots laid out side by side. Each index offset jumps forward by the exact size of one element.',
    explanation: 'Because array elements are stored in contiguous memory cells, the hardware calculates the physical address directly using base_address + (index * element_size). This requires a single addition and multiplication, executing in O(1) constant time.',
    revisionTip: 'Contiguous memory allocation is what gives arrays O(1) random access by index.'
  },
  {
    id: 'prac-arr-e2',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'easy',
    question: 'What is the worst-case time complexity of inserting an element at index 0 of an unsorted array of size N?',
    options: [
      'O(N) because all N existing elements must be shifted one position to the right',
      'O(1) because array insertion is always instantaneous',
      'O(log N) due to binary tree rebalancing',
      'O(N²) because of nested memory allocation'
    ],
    correctAnswer: 'O(N) because all N existing elements must be shifted one position to the right',
    hint: 'To create space at the first slot of a fixed array, every subsequent item has to move forward by one position.',
    explanation: 'In a contiguous array, prepending an element at index 0 requires shifting every existing element from index 0 through N-1 one cell to the right, which takes linear O(N) operations.',
    revisionTip: 'Inserting at the front of an array takes O(N) because every existing element must be shifted to the right.'
  },
  {
    id: 'prac-arr-m1',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'medium',
    question: 'You are given a sorted array of N numbers. Which approach finds two numbers that sum to a target value in O(N) time and O(1) extra space?',
    options: [
      'Two-pointer approach (left pointer at 0, right pointer at N-1)',
      'Nested loops comparing every pair in O(N²)',
      'Binary search for every element in O(N log N)',
      'Inserting all elements into a Hash Set in O(N) space'
    ],
    correctAnswer: 'Two-pointer approach (left pointer at 0, right pointer at N-1)',
    hint: 'Since the array is already sorted, if the current sum is too small, which pointer should move? If it is too large, which pointer moves?',
    explanation: 'With a sorted array, placing one pointer at the start and one at the end allows us to either increase the sum by advancing `left++` or decrease the sum by moving `right--`. Each step eliminates at least one candidate element, yielding O(N) time and O(1) auxiliary space.',
    revisionTip: 'For sorted arrays, the two-pointer technique frequently optimizes O(N²) pair problems down to O(N) with zero extra memory.'
  },
  {
    id: 'prac-arr-m2',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'medium',
    question: 'Which technique allows answering multiple sub-array range sum queries [L, R] on a static array in O(1) time per query after O(N) preprocessing?',
    options: [
      'Prefix Sum Array (prefix[R] - prefix[L - 1])',
      'Linear Scan over range [L, R] for every query',
      'Bubble Sorting the query bounds in O(N²)',
      'Bitwise XOR manipulation'
    ],
    correctAnswer: 'Prefix Sum Array (prefix[R] - prefix[L - 1])',
    hint: 'Compute running cumulative sums beforehand so any interval sum is simply the difference between two precomputed values.',
    explanation: 'Precomputing a prefix sum array takes O(N) time. Any subarray sum from index L to R is then computed in O(1) time as prefix[R] - prefix[L - 1].',
    revisionTip: 'Prefix Sums turn repetitive linear range queries into instantaneous O(1) subtractions.'
  },
  {
    id: 'prac-arr-h1',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'hard',
    question: "When applying Kadane's Algorithm to find the maximum subarray sum on an array where all elements are negative (e.g., [-5, -2, -8, -1]), how should the algorithm be initialized to avoid incorrectly returning 0?",
    options: [
      'Initialize maxSoFar and currentMax to the first element (or negative infinity), not 0',
      'Multiply all elements by -1 before running the algorithm',
      'Return 0 because an empty subarray has a sum of 0',
      'Reset currentMax to 0 whenever it drops below -100'
    ],
    correctAnswer: 'Initialize maxSoFar and currentMax to the first element (or negative infinity), not 0',
    hint: 'If you initialize the tracking variable to 0, and all numbers are negative, the algorithm might mistakenly conclude that 0 is the maximum possible sum.',
    explanation: "If an array consists strictly of negative numbers, the maximum subarray sum must be the largest single negative element (e.g., -1). Initializing maxSoFar to 0 will mask negative sums. Initializing with arr[0] ensures correctness even when all numbers are negative.",
    revisionTip: "In Kadane's algorithm, always initialize maxSoFar = arr[0] and currentMax = arr[0] to handle negative-only arrays correctly."
  },
  {
    id: 'prac-arr-h2',
    topicId: 'arrays',
    topicName: 'Arrays',
    difficulty: 'hard',
    question: 'The Dutch National Flag algorithm partitions an array of 0s, 1s, and 2s in a single pass. What are the time and auxiliary space complexities?',
    options: [
      'O(N) time and O(1) auxiliary space (using three pointers: low, mid, high)',
      'O(N log N) time using QuickSort and O(N) space',
      'O(N²) time using insertion sort and O(1) space',
      'O(N) time and O(N) auxiliary space using frequency counting arrays'
    ],
    correctAnswer: 'O(N) time and O(1) auxiliary space (using three pointers: low, mid, high)',
    hint: 'Three pointers maintain three partitions: [0..low-1] for 0s, [low..mid-1] for 1s, and [high+1..N-1] for 2s.',
    explanation: 'Dijkstra’s 3-way partitioning maintains three pointers: `low`, `mid`, and `high`. By swapping elements based on arr[mid] and adjusting pointers, the array is partitioned in a single pass with O(N) time and O(1) auxiliary memory.',
    revisionTip: 'Dutch National Flag partitions 3 distinct groups in O(N) time and O(1) space in a single pass.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. STRINGS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-str-e1',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'easy',
    question: 'What is the optimal time complexity to determine if a string of length N is a palindrome using the two-pointer technique?',
    options: [
      'O(N) time and O(1) auxiliary space',
      'O(N²) time and O(N) auxiliary space',
      'O(log N) time and O(1) auxiliary space',
      'O(N log N) time and O(N) auxiliary space'
    ],
    correctAnswer: 'O(N) time and O(1) auxiliary space',
    hint: 'Compare characters from the outer boundaries moving toward the center until pointers meet.',
    explanation: 'By placing one pointer at index 0 and another at N-1, we perform at most N/2 character comparisons. No additional string copies or memory allocations are required, achieving O(N) time and O(1) auxiliary space.',
    revisionTip: 'Two-pointer palindrome verification checks matching symmetric characters in O(N) without cloning the string.'
  },
  {
    id: 'prac-str-e2',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'easy',
    question: 'Why does repeated string concatenation in a loop (e.g. s += ch) in languages with immutable strings (like Java) result in O(N²) time?',
    options: [
      'Each concatenation creates a brand-new string object and copies all previous characters',
      'String hashing runs in exponential time',
      'Garbage collection freezes thread execution',
      'Characters are sorted on every append'
    ],
    correctAnswer: 'Each concatenation creates a brand-new string object and copies all previous characters',
    hint: 'If strings cannot be modified in place, adding a character requires allocating a new memory buffer and copying 1 + 2 + 3 + ... + N characters.',
    explanation: 'With immutable strings, `s += ch` allocates a new string buffer of length i and copies all existing characters. Summing 1 + 2 + ... + N operations gives O(N²) total work. Using a mutable buffer like StringBuilder or C++ std::string avoids this copying overhead.',
    revisionTip: 'Immutable string concatenation creates a copy on every append, causing O(N²) runtime. Use StringBuilder or mutable strings.'
  },
  {
    id: 'prac-str-m1',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'medium',
    question: 'To solve "Longest Substring Without Repeating Characters" in O(N) time, which algorithmic pattern is most appropriate?',
    options: [
      'Sliding Window with a character index map or hash set',
      'Generate all N² substrings and test each for uniqueness in O(N³)',
      'Sort the characters of the string in O(N log N)',
      'Recursively split the string using Divide and Conquer'
    ],
    correctAnswer: 'Sliding Window with a character index map or hash set',
    hint: 'Maintain a dynamic window [left, right]. Expand `right` to include characters; whenever a duplicate is found, jump `left` forward.',
    explanation: 'The Sliding Window pattern expands the right edge while storing the last seen index of each character. When a duplicate is encountered within the window, the left boundary jumps directly past the previous occurrence. Each character is visited at most twice, resulting in O(N) time.',
    revisionTip: 'Sliding Window maintains a valid contiguous range by expanding the right edge and contracting the left edge when constraints are violated.'
  },
  {
    id: 'prac-str-m2',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'medium',
    question: 'How can you verify if two strings of length N are anagrams in O(N) time and O(1) auxiliary space (assuming lowercase English letters)?',
    options: [
      'Count character frequencies using a fixed 26-element integer array',
      'Sort both strings in O(N log N) time and compare',
      'Use nested loops comparing every character in O(N²) time',
      'Generate all N! permutations of the first string'
    ],
    correctAnswer: 'Count character frequencies using a fixed 26-element integer array',
    hint: 'Since there are only 26 lowercase English letters, a fixed-size frequency table uses constant O(1) auxiliary space.',
    explanation: 'A 26-element integer array tracks character counts. We increment counts for characters in string 1 and decrement for string 2 in a single O(N) pass. If all 26 counts are zero, they are anagrams. The 26-size array is constant space O(1).',
    revisionTip: 'For fixed alphabets, character frequency counting runs in O(N) time and strictly O(1) auxiliary space.'
  },
  {
    id: 'prac-str-h1',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'hard',
    question: 'In the Knuth-Morris-Pratt (KMP) string matching algorithm, what does the prefix function π (or LPS array) represent for a pattern string P of length M?',
    options: [
      'The length of the longest proper prefix of P[0..i] that is also a suffix of P[0..i]',
      'The count of unique vowels present in the prefix P[0..i]',
      'The alphabetical hash code of substring P[0..i]',
      'The number of times character P[i] occurs in the entire pattern'
    ],
    correctAnswer: 'The length of the longest proper prefix of P[0..i] that is also a suffix of P[0..i]',
    hint: 'When a character mismatch occurs during text matching, this array tells us how many characters can be safely skipped without re-checking from scratch.',
    explanation: 'The LPS (Longest Proper Prefix which is also a Suffix) array stores the maximum length of a prefix that matches a suffix for every prefix of the pattern. When a mismatch occurs at index j, KMP resets j = LPS[j - 1], avoiding redundant character comparisons and ensuring O(N + M) total time.',
    revisionTip: 'KMP achieves linear time O(N + M) because the LPS array prevents the text pointer from ever backtracking.'
  },
  {
    id: 'prac-str-h2',
    topicId: 'strings',
    topicName: 'Strings',
    difficulty: 'hard',
    question: 'In the Rabin-Karp string search algorithm, how does rolling hash calculation achieve an expected O(N + M) runtime?',
    options: [
      'By updating the window hash in O(1) using the previous hash, subtracting the outgoing character, and adding the incoming character',
      'By sorting the pattern characters in lexicographical order',
      'By rebuilding the polynomial hash from scratch at every index in O(M)',
      'By encrypting the string with SHA-256'
    ],
    correctAnswer: 'By updating the window hash in O(1) using the previous hash, subtracting the outgoing character, and adding the incoming character',
    hint: 'Rolling hash avoids re-hashing all M characters for each window: new_hash = (old_hash - outgoing) * base + incoming.',
    explanation: 'Rabin-Karp computes a polynomial rolling hash for each sliding window of length M in O(1) time by removing the contribution of the leftmost character and adding the rightmost. Only when hashes match does it perform an explicit O(M) character check to guard against spurious hash collisions.',
    revisionTip: 'Rolling hash updates the window signature in O(1) time, enabling expected linear O(N + M) substring search.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. LINKED LISTS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-ll-e1',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'easy',
    question: 'What is the time complexity to insert a new node at the beginning (head) of a Singly Linked List compared to prepending to an array of size N?',
    options: [
      'Linked List: O(1); Array: O(N)',
      'Linked List: O(N); Array: O(1)',
      'Both take O(1) time',
      'Both take O(N) time'
    ],
    correctAnswer: 'Linked List: O(1); Array: O(N)',
    hint: 'To insert at the front of an array, all existing elements must shift right. A linked list only updates a single pointer.',
    explanation: 'Prepending to a linked list simply requires pointing newNode->next to the current head and updating the head pointer in O(1) time. In contrast, prepending to an array requires shifting all N existing elements one position to the right, taking O(N) time.',
    revisionTip: 'Linked lists excel at O(1) insertions/deletions at known pointer locations because no element shifting is required.'
  },
  {
    id: 'prac-ll-e2',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'easy',
    question: 'What is the primary trade-off of a Doubly Linked List compared to a Singly Linked List?',
    options: [
      'Each node requires extra memory to store a `prev` pointer, but allows bidirectional traversal in O(1)',
      'Doubly linked lists cannot store integers',
      'Singly linked lists have faster random indexing',
      'Doubly linked lists cannot be reversed'
    ],
    correctAnswer: 'Each node requires extra memory to store a `prev` pointer, but allows bidirectional traversal in O(1)',
    hint: 'Two pointers per node (prev and next) take more memory, but allow deleting a given node in O(1) without knowing its predecessor.',
    explanation: 'A Doubly Linked List stores both `next` and `prev` pointers. This doubles the pointer overhead per node but enables bidirectional traversal and O(1) node deletion without needing to traverse from the head to find the predecessor.',
    revisionTip: 'Doubly Linked Lists trade increased pointer memory for O(1) bidirectional navigation and node deletion.'
  },
  {
    id: 'prac-ll-m1',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'medium',
    question: 'When reversing a Singly Linked List iteratively in-place, how many pointer variables are required and what is the auxiliary space complexity?',
    options: [
      '3 pointers (prev, curr, next) with O(1) auxiliary space',
      '1 pointer with O(N) auxiliary space',
      'A stack data structure with O(N) auxiliary space',
      '2 pointers with O(log N) call stack space'
    ],
    correctAnswer: '3 pointers (prev, curr, next) with O(1) auxiliary space',
    hint: 'To reverse each pointer, you must save the next node before breaking the current pointer, and track the previous node to point backwards.',
    explanation: 'Iterative reversal maintains three pointers: `prev` (initialized to null), `curr` (head), and `next` (temporary holder). In each step: next = curr->next; curr->next = prev; prev = curr; curr = next. This operates strictly in-place with O(1) extra memory.',
    revisionTip: 'Reversing a linked list requires caching the next node before reversing the link: next = curr->next; curr->next = prev.'
  },
  {
    id: 'prac-ll-m2',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'medium',
    question: 'How does the Fast and Slow pointer (Tortoise and Hare) approach find the middle node of a linked list in a single pass?',
    options: [
      'Slow moves 1 step while Fast moves 2 steps; when Fast reaches the end, Slow is at the middle',
      'Both pointers move at speed 1 from both ends toward each other',
      'Fast counts total nodes, resets to head, and takes N/2 steps',
      'Slow jumps 4 steps while Fast jumps 1 step'
    ],
    correctAnswer: 'Slow moves 1 step while Fast moves 2 steps; when Fast reaches the end, Slow is at the middle',
    hint: 'Since Fast moves twice as fast as Slow, when Fast travels the full distance N, Slow has traveled exactly N/2.',
    explanation: 'By advancing `slow = slow->next` and `fast = fast->next->next`, when `fast` reaches null or the tail, `slow` is guaranteed to point to the middle node. This completes in a single pass in O(N) time with O(1) auxiliary space.',
    revisionTip: 'Two pointers moving at speeds 1 and 2 locate the middle of a linked list in a single pass with O(1) space.'
  },
  {
    id: 'prac-ll-h1',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'hard',
    question: "Using Floyd's Tortoise and Hare algorithm, once the slow and fast pointers meet inside a cycle, how do you find the exact node where the cycle begins?",
    options: [
      'Reset slow to the head of the list; move both slow and fast at speed 1 until they meet',
      'Keep slow in place and continue running fast at speed 2 for N more steps',
      'Reverse the entire linked list and check which node has two incoming edges',
      'Delete the meeting node and check where the list terminates'
    ],
    correctAnswer: 'Reset slow to the head of the list; move both slow and fast at speed 1 until they meet',
    hint: 'Mathematical proof: if the distance from head to cycle entrance is L, and meeting point is at distance d, the remaining distance to the entrance around the cycle equals L.',
    explanation: 'Let distance from head to cycle entrance be L, and meeting point from entrance be x. Floyd’s mathematical proof shows that the distance from head to entrance equals the distance from the meeting point to the entrance along the loop. Moving both at 1 step per turn causes them to intersect precisely at the entrance node.',
    revisionTip: "Cycle entrance formula: Reset slow to head, keep fast at the meeting node, step both by 1; their collision point is the cycle start."
  },
  {
    id: 'prac-ll-h2',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'hard',
    question: 'What is the optimal time complexity to merge K sorted linked lists containing a total of N nodes using a Min-Heap (Priority Queue)?',
    options: [
      'O(N log K) time and O(K) auxiliary space',
      'O(N × K) time and O(1) auxiliary space',
      'O(N² log K) time and O(N) auxiliary space',
      'O(K log N) time and O(N) auxiliary space'
    ],
    correctAnswer: 'O(N log K) time and O(K) auxiliary space',
    hint: 'The Min-Heap maintains at most K elements at any instant (the current head of each of the K lists). Extracting the minimum takes O(log K).',
    explanation: 'We insert the head node of each of the K lists into a Min-Heap of size K. Each extraction of the minimum node and insertion of its successor takes O(log K) time. Doing this for all N nodes across the lists results in O(N log K) time and O(K) auxiliary space.',
    revisionTip: 'Merging K sorted lists with a min-heap runs in O(N log K) because the heap maintains at most K heads at any time.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 4. STACK & QUEUE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-sq-e1',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'easy',
    question: 'Which fundamental principle defines the operation order of a Queue vs a Stack?',
    options: [
      'Queue is FIFO (First-In, First-Out); Stack is LIFO (Last-In, First-Out)',
      'Queue is LIFO (Last-In, First-Out); Stack is FIFO (First-In, First-Out)',
      'Both Queue and Stack operate strictly as FIFO structures',
      'Both Queue and Stack operate strictly as LIFO structures'
    ],
    correctAnswer: 'Queue is FIFO (First-In, First-Out); Stack is LIFO (Last-In, First-Out)',
    hint: 'Think of people waiting in a ticket counter queue vs a stack of plates on a cafeteria table.',
    explanation: 'A Queue serves the first element entered first (First In, First Out - FIFO), analogous to a ticket line. A Stack removes the most recently added element first (Last In, First Out - LIFO), analogous to a stack of cafeteria trays.',
    revisionTip: 'Remember: Queue = FIFO (First In First Out), Stack = LIFO (Last In First Out).'
  },
  {
    id: 'prac-sq-e2',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'easy',
    question: 'When evaluating a Postfix expression (Reverse Polish Notation, e.g. "5 3 + 2 *") using a Stack, what happens when an operator is encountered?',
    options: [
      'Pop the top two operands, evaluate the operator with them, and push the result back onto the stack',
      'Push the operator directly onto the stack and pop all numbers',
      'Clear the stack and multiply the base address',
      'Reverse the input string'
    ],
    correctAnswer: 'Pop the top two operands, evaluate the operator with them, and push the result back onto the stack',
    hint: 'Operands are pushed as they arrive. When an operator is read, it applies to the two most recently pushed numbers.',
    explanation: 'In postfix notation, an operator applies to the two immediate preceding operands. We pop `op2` and `op1`, calculate `op1 [operator] op2`, and push the result back onto the stack in O(1) time.',
    revisionTip: 'Evaluating postfix: push operands; on operator, pop 2 operands, apply operation, and push result.'
  },
  {
    id: 'prac-sq-m1',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'medium',
    question: 'When implementing a Queue using two Stacks (inStack and outStack), what is the amortized time complexity of the dequeue operation?',
    options: [
      'O(1) amortized time',
      'O(N) strict worst-case for every single operation',
      'O(log N) amortized time',
      'O(N²) amortized time'
    ],
    correctAnswer: 'O(1) amortized time',
    hint: 'Elements are only transferred from inStack to outStack when outStack is empty. Each element is moved between stacks exactly once in its lifetime.',
    explanation: 'While an individual dequeue operation may take O(N) when dumping inStack into an empty outStack, each element is pushed to inStack once, popped once, pushed to outStack once, and popped once. Across N operations, the total work is 4N, making the amortized cost per operation O(1).',
    revisionTip: 'Two-stack queue dequeue is O(1) amortized because each element is transferred between stacks at most once.'
  },
  {
    id: 'prac-sq-m2',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'medium',
    question: 'In the Balanced Parentheses problem (e.g. checking "{[()]}"), which condition indicates an invalid string?',
    options: [
      'Encountering a closing bracket when the stack is empty, or the closing bracket does not match the stack’s top opening bracket',
      'Pushing an opening bracket onto an empty stack',
      'Having an even number of characters in the string',
      'The stack being empty after the entire string is processed'
    ],
    correctAnswer: 'Encountering a closing bracket when the stack is empty, or the closing bracket does not match the stack’s top opening bracket',
    hint: 'Every closing bracket must match the most recently opened bracket on top of the stack.',
    explanation: 'For parentheses to be balanced, every closing bracket must immediately match the corresponding opening bracket at the top of the stack. If the stack is empty when a closer appears, or if the brackets don’t match, the sequence is invalid. Finally, the stack must be empty when parsing ends.',
    revisionTip: 'Balanced brackets require matching the most recent opening symbol: pop on match, and the stack must be empty at the end.'
  },
  {
    id: 'prac-sq-h1',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'hard',
    question: 'In the "Next Greater Element" problem using a Monotonic Decreasing Stack, why is the overall time complexity O(N) even though there is a while loop inside the for loop?',
    options: [
      'Because each element is pushed onto the stack exactly once and popped at most once',
      'Because the stack size is capped at 10 elements',
      'Because the while loop only runs if the array is already sorted',
      'Because the compiler unrolls the inner while loop into constant instructions'
    ],
    correctAnswer: 'Because each element is pushed onto the stack exactly once and popped at most once',
    hint: 'Use aggregate amortized analysis: count how many times any element can physically enter or leave the stack across the entire array traversal.',
    explanation: 'Although the inner while loop may pop multiple elements in a single iteration, every element in the array is pushed onto the stack exactly once and popped at most once across the entire run. Therefore, the total number of stack operations across all iterations is at most 2N, guaranteeing O(N) total time.',
    revisionTip: 'Monotonic stack algorithms achieve linear O(N) runtime because each element enters and exits the stack at most once.'
  },
  {
    id: 'prac-sq-h2',
    topicId: 'stack-queue',
    topicName: 'Stack & Queue',
    difficulty: 'hard',
    question: 'In the "Largest Rectangle in Histogram" problem, how does a Monotonic Increasing Stack compute the area in O(N) time?',
    options: [
      'It tracks the index of previous and next smaller bars, calculating width = (right - left - 1) when a bar is popped',
      'It checks every possible pair of bars in O(N²)',
      'It sorts bar heights in ascending order',
      'It uses dynamic programming with an N × N matrix'
    ],
    correctAnswer: 'It tracks the index of previous and next smaller bars, calculating width = (right - left - 1) when a bar is popped',
    hint: 'When a bar smaller than the stack top is encountered, the stack top cannot extend further right. Its bounding rectangle width is bounded by the new bar on the right and the remaining stack top on the left.',
    explanation: 'A monotonic increasing stack stores indices. When a shorter bar arrives at index i, the popped bar’s height is h, and its boundary extends from the new stack top on the left to i on the right. Area is h * (i - stack.top() - 1), processing all bars in O(N) time.',
    revisionTip: 'Monotonic stack finds the maximum bounding width for each histogram bar in O(N) time by identifying left and right smaller limits.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 5. TREES
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-tree-e1',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'easy',
    question: 'Which depth-first traversal of a Binary Search Tree (BST) visits nodes in strictly non-decreasing (sorted) order?',
    options: [
      'Inorder Traversal (Left, Root, Right)',
      'Preorder Traversal (Root, Left, Right)',
      'Postorder Traversal (Left, Right, Root)',
      'Level Order Traversal (BFS)'
    ],
    correctAnswer: 'Inorder Traversal (Left, Root, Right)',
    hint: 'In a BST, all keys in the left subtree are smaller than the root, and all keys in the right subtree are larger.',
    explanation: 'In a Binary Search Tree, by definition: left < root < right. An Inorder traversal visits the left subtree first, then prints the root, and finally visits the right subtree. This naturally produces ascending sorted order.',
    revisionTip: 'Inorder traversal of a BST always yields keys in sorted ascending order (Left → Root → Right).'
  },
  {
    id: 'prac-tree-e2',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'easy',
    question: 'What is the maximum number of nodes that can exist at depth d (0-indexed, where root is at depth 0) in a standard binary tree?',
    options: [
      '2ᵈ',
      '2 × d',
      'd²',
      '2ᵈ⁺¹ - 1'
    ],
    correctAnswer: '2ᵈ',
    hint: 'Depth 0 has 1 node (2⁰), depth 1 has 2 nodes (2¹), depth 2 has 4 nodes (2²).',
    explanation: 'Since each node in a binary tree can have at most 2 children, the number of nodes doubles at each consecutive depth level: level 0 has 2⁰ = 1, level 1 has 2¹ = 2, level d has 2ᵈ nodes. (The total nodes in a tree of height h is 2ʰ⁺¹ - 1).',
    revisionTip: 'Maximum nodes at depth d in a binary tree is 2ᵈ; total nodes in a full binary tree of height h is 2ʰ⁺¹ - 1.'
  },
  {
    id: 'prac-tree-m1',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'medium',
    question: 'What is the worst-case time complexity to search for a key in an unbalanced (skewed) Binary Search Tree containing N nodes?',
    options: [
      'O(N) because the tree degenerates into a linear linked list',
      'O(log N) because binary trees always split the search space in half',
      'O(1) because root access is constant time',
      'O(N log N) due to recursive overhead'
    ],
    correctAnswer: 'O(N) because the tree degenerates into a linear linked list',
    hint: 'Consider what happens if you insert keys 1, 2, 3, 4, 5 in already sorted order into a standard BST.',
    explanation: 'If elements are inserted in sorted order into an unbalanced BST, every node has only a right child, forming a degenerate tree (essentially a singly linked list). Searching for the leaf requires traversing all N nodes, taking O(N) time. (Self-balancing trees like AVL or Red-Black prevent this).',
    revisionTip: 'An unbalanced BST can degenerate into an O(N) linked list; self-balancing trees (AVL/Red-Black) guarantee O(log N).'
  },
  {
    id: 'prac-tree-m2',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'medium',
    question: 'In a Binary Search Tree (BST), how do you find the Lowest Common Ancestor (LCA) of two nodes p and q in O(H) time?',
    options: [
      'If both p and q are smaller than root, go left; if both are larger, go right; otherwise root is the LCA',
      'Traverse all leaf nodes and compare their depths',
      'Convert the BST into a heap',
      'Perform an exhaustive breadth-first search of all subtrees'
    ],
    correctAnswer: 'If both p and q are smaller than root, go left; if both are larger, go right; otherwise root is the LCA',
    hint: 'Because of the BST ordering property, the first node where the paths to p and q split (one on left, one on right, or one matches root) is the LCA.',
    explanation: 'In a BST: if p->val and q->val are both strictly smaller than root->val, the LCA must reside in the left subtree. If both are strictly larger, it resides in the right subtree. The moment one value lies on each side (or one equals root), the current node is the Lowest Common Ancestor.',
    revisionTip: 'In a BST, LCA is the first node where keys p and q split: min(p,q) <= LCA <= max(p,q).'
  },
  {
    id: 'prac-tree-h1',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'hard',
    question: 'Why is it insufficient to validate a BST by simply checking if node->left->val < node->val and node->right->val > node->val at each node independently?',
    options: [
      'A node in the right subtree could be smaller than an ancestor higher up in the tree',
      'Leaf nodes cannot be evaluated by this rule',
      'It violates the definition of depth-first search',
      'Binary Search Trees do not allow right children'
    ],
    correctAnswer: 'A node in the right subtree could be smaller than an ancestor higher up in the tree',
    hint: 'Consider tree: Root(10), RightChild(15), and LeftGrandchild(6). 6 < 15 is locally valid, but 6 is in the right subtree of 10!',
    explanation: 'Checking only immediate children allows invalid trees to pass. For example: Root = 10; right child = 15; left child of 15 = 6. Locally 6 < 15, but 6 < 10, violating the BST invariant that ALL nodes in the right subtree of 10 must exceed 10. Correct validation requires propagating valid range intervals (min, max).',
    revisionTip: 'To validate a BST correctly, enforce a global valid range (min < node->val < max) recursively down both subtrees.'
  },
  {
    id: 'prac-tree-h2',
    topicId: 'trees',
    topicName: 'Trees',
    difficulty: 'hard',
    question: 'How do you compute the Diameter of a Binary Tree (longest path between any two nodes) in optimal O(N) time?',
    options: [
      'Compute the maximum height of left and right subtrees at each node during a post-order DFS pass, updating diameter = max(diameter, leftH + rightH)',
      'Calculate distance between all N² pairs of nodes using BFS',
      'Count all leaf nodes and multiply by 2',
      'Sort nodes by their in-degree'
    ],
    correctAnswer: 'Compute the maximum height of left and right subtrees at each node during a post-order DFS pass, updating diameter = max(diameter, leftH + rightH)',
    hint: 'The longest path passing through any node equals left_subtree_height + right_subtree_height. You can compute height and update diameter in the same DFS visit.',
    explanation: 'In a single bottom-up post-order DFS pass, the recursive function returns the node’s height: 1 + max(leftH, rightH). Concurrently, it updates the global diameter as max(diameter, leftH + rightH). Each of the N nodes is visited once, achieving O(N) time and O(H) recursion space.',
    revisionTip: 'Diameter of a binary tree is computed in O(N) during height DFS: diameter = max(diameter, leftH + rightH).'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 6. GRAPHS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-graph-e1',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'easy',
    question: 'Why is Breadth-First Search (BFS) using a Queue guaranteed to find the shortest path in an unweighted graph, whereas Depth-First Search (DFS) is not?',
    options: [
      'BFS explores nodes level by level in increasing order of edge distance from the source',
      'BFS uses a priority queue with edge weights',
      'DFS only visits half of the nodes in a graph',
      'BFS rearranges the graph vertices into sorted order before traversing'
    ],
    correctAnswer: 'BFS explores nodes level by level in increasing order of edge distance from the source',
    hint: 'BFS discovers all neighbors at distance 1 before any neighbors at distance 2, and so forth.',
    explanation: 'Because BFS processes vertices via a FIFO queue, all vertices at distance k are visited before any vertex at distance k + 1. The first time the destination node is dequeued, it is guaranteed to have arrived via the minimum number of edges in an unweighted graph.',
    revisionTip: 'In unweighted graphs, BFS always finds the shortest path because it explores vertices in strict order of distance.'
  },
  {
    id: 'prac-graph-e2',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'easy',
    question: 'For a sparse graph with V vertices and E edges (where E << V²), why is an Adjacency List preferred over an Adjacency Matrix?',
    options: [
      'Adjacency List requires O(V + E) memory, whereas Adjacency Matrix wastes O(V²) space mostly on zeroes',
      'Adjacency Matrix cannot represent undirected edges',
      'Adjacency List automatically sorts edges',
      'Adjacency Matrix takes exponential time to create'
    ],
    correctAnswer: 'Adjacency List requires O(V + E) memory, whereas Adjacency Matrix wastes O(V²) space mostly on zeroes',
    hint: 'If a graph has 100,000 nodes but only 200,000 edges, a matrix requires 10 billion integers (40GB), while a list requires under 2MB.',
    explanation: 'An Adjacency Matrix requires V × V space regardless of edge count, which is prohibitively wasteful for sparse graphs. An Adjacency List stores only the actual edges present, requiring O(V + E) memory and enabling O(degree(u)) neighbor iteration.',
    revisionTip: 'Use Adjacency Lists for sparse graphs (O(V + E) memory); use Adjacency Matrices when graphs are dense or O(1) edge existence lookup is critical.'
  },
  {
    id: 'prac-graph-m1',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'medium',
    question: "Why does Dijkstra's algorithm fail to produce correct shortest paths on graphs containing negative edge weights?",
    options: [
      'Its greedy assumption that a visited node’s shortest distance is permanently finalized is broken by negative edges',
      'The priority queue cannot store negative numbers',
      'Dijkstra only works on Directed Acyclic Graphs (DAGs)',
      'Negative edges cause an infinite loop in the queue even without negative cycles'
    ],
    correctAnswer: 'Its greedy assumption that a visited node’s shortest distance is permanently finalized is broken by negative edges',
    hint: 'Once Dijkstra marks a node as visited, it assumes no subsequent path can reduce that distance because all edge weights are assumed non-negative (>= 0).',
    explanation: "Dijkstra's greedy choice property assumes that once the minimum tentative distance node is popped from the priority queue, its shortest distance cannot be improved. A negative edge encountered later could provide a shorter detour, violating this invariant. (The Bellman-Ford algorithm must be used instead).",
    revisionTip: "Dijkstra fails with negative weights because its greedy finalization assumption is violated; use Bellman-Ford instead."
  },
  {
    id: 'prac-graph-m2',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'medium',
    question: 'How does Disjoint Set Union (DSU / Union-Find) with path compression and union by rank achieve nearly O(1) amortized operations?',
    options: [
      'Path compression flattens the tree structure on find(), making root lookups run in inverse Ackermann time α(N)',
      'By sorting elements after every union operation',
      'By converting sets into balanced Red-Black trees',
      'By storing all vertices in a static hash table'
    ],
    correctAnswer: 'Path compression flattens the tree structure on find(), making root lookups run in inverse Ackermann time α(N)',
    hint: 'Path compression points every visited node directly to the representative root during find(x).',
    explanation: 'Combining path compression (which repoints nodes directly to the root on traversal) with union by rank (attaching the shallower tree under the deeper tree) reduces the amortized cost of both find() and union() to O(α(N)), where α is the extremely slow-growing inverse Ackermann function (effectively <= 4 for all practical N).',
    revisionTip: 'DSU with path compression and union by rank operates in near O(1) amortized time O(α(N)).'
  },
  {
    id: 'prac-graph-h1',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'hard',
    question: "In Kahn's Algorithm for Topological Sorting of a Directed Graph, how does the algorithm detect whether the graph contains a directed cycle?",
    options: [
      'If the count of processed nodes removed from the queue is strictly less than V (total vertices)',
      'If the queue size exceeds V at any point',
      'If all vertices have an indegree greater than 1',
      'By checking if the adjacency list contains duplicate edges'
    ],
    correctAnswer: 'If the count of processed nodes removed from the queue is strictly less than V (total vertices)',
    hint: 'Nodes in a directed cycle never reach an indegree of 0, so they can never enter the queue.',
    explanation: "Kahn's algorithm initializes a queue with all vertices having in-degree 0. As vertices are dequeued and removed, their outgoing edges are decremented. If a cycle exists, nodes in the cycle never reach an in-degree of 0 and will never enter the queue. If processedCount < V, a cycle exists.",
    revisionTip: "Kahn's topological sort detects cycles if processedCount < totalVertices, because cycle nodes never reach indegree 0."
  },
  {
    id: 'prac-graph-h2',
    topicId: 'graphs',
    topicName: 'Graphs',
    difficulty: 'hard',
    question: 'How does the Bellman-Ford algorithm detect negative weight cycles in a directed graph of V vertices and E edges?',
    options: [
      'It relaxes all edges V-1 times; if any edge can still be relaxed on the V-th pass, a negative cycle exists',
      'If the distance to the source is ever equal to 0',
      'By running Dijkstra from all vertices simultaneously',
      'By checking if any edge weight is negative'
    ],
    correctAnswer: 'It relaxes all edges V-1 times; if any edge can still be relaxed on the V-th pass, a negative cycle exists',
    hint: 'A simple shortest path in a graph of V vertices can have at most V - 1 edges. Any further improvement indicates a circulating cycle of negative weight.',
    explanation: 'In a graph with no negative cycles, the shortest path between any two vertices contains at most V - 1 edges. Bellman-Ford relaxes all edges V - 1 times. If a further V-th pass can still relax any edge (dist[u] + wt < dist[v]), that edge must be part of or reachable from a negative weight cycle.',
    revisionTip: 'Bellman-Ford detects negative weight cycles if an edge can still be relaxed on the V-th iteration after V-1 passes.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 7. SORTING
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-sort-e1',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'easy',
    question: 'Which of the following comparison-based sorting algorithms has a best-case time complexity of O(N) when the input array is already sorted?',
    options: [
      'Insertion Sort',
      'Selection Sort',
      'Merge Sort',
      'Heap Sort'
    ],
    correctAnswer: 'Insertion Sort',
    hint: 'This algorithm only shifts elements when an inversion is detected. If all elements are in order, the inner loop breaks immediately on each pass.',
    explanation: 'Insertion sort iterates through the array and places each element into its correct position among preceding elements. If the array is already sorted, the condition `arr[j] > key` fails immediately on the first comparison, completing each pass in O(1) and achieving O(N) overall.',
    revisionTip: 'Insertion Sort runs in O(N) time on sorted or nearly-sorted data, making it ideal for small or almost-ordered arrays.'
  },
  {
    id: 'prac-sort-e2',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'easy',
    question: 'What does it mean for a sorting algorithm to be "Stable"?',
    options: [
      'Elements with equal keys preserve their original relative order in the sorted output',
      'The algorithm never crashes due to memory overflow',
      'The time complexity is guaranteed to be strictly O(N log N)',
      'The algorithm does not use extra recursion stack'
    ],
    correctAnswer: 'Elements with equal keys preserve their original relative order in the sorted output',
    hint: 'If student A and student B both have score 85, a stable sort guarantees whichever appeared earlier in the list remains earlier.',
    explanation: 'Stability means that if two elements have identical sorting keys, their relative order in the sorted array matches their relative order in the input array. Merge Sort and Insertion Sort are stable; QuickSort and HeapSort are generally unstable.',
    revisionTip: 'Stable sorting preserves the original relative order of duplicate elements.'
  },
  {
    id: 'prac-sort-m1',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'medium',
    question: 'Why is Merge Sort preferred over Quick Sort for sorting Singly Linked Lists, whereas Quick Sort is typically preferred for contiguous arrays?',
    options: [
      'Merge Sort does not require random access indexing and linked list merge takes O(1) auxiliary space without extra buffers',
      'Quick Sort cannot sort elements in descending order',
      'Merge Sort uses O(1) space on arrays but O(N) on linked lists',
      'Linked lists cannot be partitioned by a pivot'
    ],
    correctAnswer: 'Merge Sort does not require random access indexing and linked list merge takes O(1) auxiliary space without extra buffers',
    hint: 'Arrays have fast cache locality and O(1) index access favoring in-place QuickSort. Linked lists only have sequential pointer traversal.',
    explanation: 'Merge sort on linked lists only requires pointer manipulation: splitting via fast/slow pointers and splicing nodes during the merge step takes O(1) auxiliary space without allocating a second array buffer. In contrast, QuickSort on arrays benefits from contiguous memory cache lines.',
    revisionTip: 'Merge Sort is optimal for linked lists because pointer merging takes O(1) extra space without needing random index access.'
  },
  {
    id: 'prac-sort-m2',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'medium',
    question: 'Heap Sort achieves O(N log N) in all cases (worst, average, best). Why is QuickSort often faster in practice on typical CPU hardware?',
    options: [
      'QuickSort exhibits superior spatial locality and cache friendliness; HeapSort makes random jumps across memory',
      'HeapSort requires O(N²) auxiliary memory',
      'QuickSort is O(N) on average',
      'CPU architectures cannot execute heapify instructions'
    ],
    correctAnswer: 'QuickSort exhibits superior spatial locality and cache friendliness; HeapSort makes random jumps across memory',
    hint: 'In a heap stored as an array, jumping from index i to children 2i and 2i+1 constantly crosses cache lines.',
    explanation: 'While both algorithms have O(N log N) average complexity, QuickSort partitions sequential array ranges, maximizing CPU cache line hits. In HeapSort, jumping between parent i and children 2i + 1 causes frequent cache misses, making QuickSort faster in real hardware benchmarks.',
    revisionTip: 'QuickSort is practically faster than HeapSort on arrays because sequential partitioning leverages CPU cache lines.'
  },
  {
    id: 'prac-sort-h1',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'hard',
    question: 'What pivot selection strategy guarantees that Quick Sort avoids its catastrophic O(N²) worst-case behavior on already-sorted or reverse-sorted inputs?',
    options: [
      'Randomized Pivot or Median-of-Three (first, middle, last)',
      'Always choosing the first element as the pivot',
      'Always choosing the last element as the pivot',
      'Sorting the array using Bubble Sort first before choosing the pivot'
    ],
    correctAnswer: 'Randomized Pivot or Median-of-Three (first, middle, last)',
    hint: 'Choosing the first or last element on sorted input causes maximally unbalanced partitions of sizes 0 and N - 1 at every recursion level.',
    explanation: 'Choosing the first or last element on sorted data produces unbalanced partitions (0 and N-1 elements), degenerating QuickSort into O(N²) comparisons and O(N) recursion stack frames. Using Median-of-Three or selecting a uniform random index prevents deterministic worst-case triggers, maintaining O(N log N) expected time.',
    revisionTip: 'Always use Median-of-Three or Randomized pivot selection to protect QuickSort against O(N²) sorted inputs.'
  },
  {
    id: 'prac-sort-h2',
    topicId: 'sorting',
    topicName: 'Sorting',
    difficulty: 'hard',
    question: 'Why can Counting Sort and Radix Sort achieve O(N + K) time complexity, surpassing the theoretical comparison-based sorting lower bound of Ω(N log N)?',
    options: [
      'They do not compare elements against each other; they map keys directly to memory bucket indices based on their integer representation',
      'They make comparisons using bitwise operations in O(1)',
      'The comparison lower bound applies only to floating point numbers',
      'They use parallel processing cores'
    ],
    correctAnswer: 'They do not compare elements against each other; they map keys directly to memory bucket indices based on their integer representation',
    hint: 'The Ω(N log N) proof relies on a comparison decision tree having N! leaf nodes. Non-comparison sorts exploit numeric value indexing.',
    explanation: 'The Ω(N log N) theoretical limit strictly bounds comparison-based sorts because distinguishing among N! permutations requires a decision tree of height log₂(N!) = Ω(N log N). Non-comparison sorts like Counting Sort exploit key properties directly by mapping values into index buckets without comparing pairs.',
    revisionTip: 'Counting and Radix Sort bypass the Ω(N log N) comparison bound by mapping keys to index buckets without pairwise comparisons.'
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 8. SEARCHING
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'prac-search-e1',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'easy',
    question: 'What is the mandatory prerequisite condition for applying Binary Search on a collection of elements, and what is its time complexity?',
    options: [
      'The collection must be sorted in monotonic order; O(log N) time',
      'The collection must be stored in a Linked List; O(1) time',
      'The collection must have an odd number of elements; O(N) time',
      'The collection must contain no duplicates; O(N log N) time'
    ],
    correctAnswer: 'The collection must be sorted in monotonic order; O(log N) time',
    hint: 'Binary search divides the remaining candidate search space in half at each comparison based on whether target is smaller or larger than the midpoint.',
    explanation: 'Binary Search requires the array to be monotonically sorted so that comparing target against arr[mid] guarantees which half can be safely discarded. By halving the search space on each step, the recurrence T(N) = T(N/2) + O(1) yields O(log N) time.',
    revisionTip: 'Binary Search strictly requires a sorted dataset to eliminate half of the remaining elements at each step in O(log N).'
  },
  {
    id: 'prac-search-e2',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'easy',
    question: 'Why should the midpoint calculation in Binary Search be written as `mid = low + (high - low) / 2` instead of `mid = (low + high) / 2` in languages like C++ and Java?',
    options: [
      'To prevent integer overflow when (low + high) exceeds the maximum 32-bit signed integer value (2³¹ - 1)',
      'Because division by 2 is slower in the second form',
      'Because the compiler cannot optimize (low + high)',
      'To guarantee that mid is always an odd number'
    ],
    correctAnswer: 'To prevent integer overflow when (low + high) exceeds the maximum 32-bit signed integer value (2³¹ - 1)',
    hint: 'If low and high are both large positive integers near 2 billion, adding them together overflows into a negative number.',
    explanation: 'In 32-bit signed integers, max positive value is 2,147,483,647. If `low + high` exceeds this limit, it overflows to a negative integer, causing an array index out of bounds exception. Writing `low + (high - low) / 2` calculates the exact same value without ever exceeding `high`.',
    revisionTip: 'Always calculate midpoint as mid = low + (high - low) / 2 to avoid 32-bit integer overflow.'
  },
  {
    id: 'prac-search-m1',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'medium',
    question: 'When performing Binary Search on a Rotated Sorted Array (e.g., [4, 5, 6, 7, 0, 1, 2]), how do you decide which half of the array to search next?',
    options: [
      'Identify which half [low..mid] or [mid..high] is normally ordered, then check if target falls inside that ordered range',
      'Rotate the array back to sorted order first in O(N) time',
      'Always search the left half first, then backtrack to the right half',
      'Convert the array into a Binary Search Tree'
    ],
    correctAnswer: 'Identify which half [low..mid] or [mid..high] is normally ordered, then check if target falls inside that ordered range',
    hint: 'In any rotated sorted array, splitting at midpoint mid divides the array into at least one half that is guaranteed to be strictly normally sorted.',
    explanation: 'If arr[low] <= arr[mid], the left half is guaranteed to be sorted. We simply check if target lies between arr[low] and arr[mid]. If it does, we set high = mid - 1; otherwise low = mid + 1. If the left half is not sorted, the right half must be sorted, and we apply symmetric logic in O(log N) total time.',
    revisionTip: 'In rotated sorted array search: one half is ALWAYS normally sorted. Check if target lies within that sorted range.'
  },
  {
    id: 'prac-search-m2',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'medium',
    question: 'In a sorted array with duplicate elements, how does `lower_bound` differ from `upper_bound` for a target value X?',
    options: [
      '`lower_bound` returns the first element >= X; `upper_bound` returns the first element strictly > X',
      '`lower_bound` returns the minimum element of the array; `upper_bound` returns the maximum',
      'They return identical indices regardless of duplicates',
      '`lower_bound` uses linear search while `upper_bound` uses binary search'
    ],
    correctAnswer: '`lower_bound` returns the first element >= X; `upper_bound` returns the first element strictly > X',
    hint: 'For array [2, 4, 4, 4, 7] and X = 4, lower_bound returns index 1 (first 4) while upper_bound returns index 4 (value 7).',
    explanation: 'In C++ and standard algorithm libraries: `lower_bound` finds the first position where element is greater than or equal to target (`>= target`). `upper_bound` finds the first position strictly greater than target (`> target`). The count of duplicates is `upper_bound - lower_bound`.',
    revisionTip: 'In binary search: lower_bound finds first element >= X; upper_bound finds first element > X.'
  },
  {
    id: 'prac-search-h1',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'hard',
    question: 'In problems like "Capacity to Ship Packages within D Days" or "Book Allocation", what property of the problem allows us to use "Binary Search on the Answer Space"?',
    options: [
      'The feasibility predicate function is monotonic (e.g., if capacity C can ship in D days, any capacity > C can also ship)',
      'The input package weights must already be sorted in ascending order',
      'The problem requires finding the maximum integer in an array',
      'The answer is guaranteed to be a power of two'
    ],
    correctAnswer: 'The feasibility predicate function is monotonic (e.g., if capacity C can ship in D days, any capacity > C can also ship)',
    hint: 'Think of a boolean function check(value). If check(X) = False for all small values and True for all values >= X*, we can binary search for the transition boundary X*.',
    explanation: 'Binary Search applies whenever the answer space has a monotonic boolean predicate (e.g., False, False, False, True, True, True). We binary search across the possible answer range [minCapacity, maxCapacity]. Evaluating the feasibility of `mid` takes O(N), yielding an optimal O(N log(range)) solution.',
    revisionTip: 'Binary Search on Answer Space requires a monotonic predicate: once a threshold works, all values beyond it also work.'
  },
  {
    id: 'prac-search-h2',
    topicId: 'searching',
    topicName: 'Searching',
    difficulty: 'hard',
    question: 'What is the optimal time complexity to find the median of two sorted arrays of sizes M and N (assuming M <= N) using binary search partitioning?',
    options: [
      'O(log(min(M, N))) time and O(1) space',
      'O(M + N) time by merging into a new array',
      'O(log M × log N) time',
      'O((M + N) log(M + N)) time'
    ],
    correctAnswer: 'O(log(min(M, N))) time and O(1) space',
    hint: 'Binary search for the partition line in the smaller array so that left_partition_size equals right_partition_size.',
    explanation: 'We binary search on the smaller array of size M to find a partition i, which immediately fixes partition j = (M + N + 1)/2 - i in the second array. When maxLeft1 <= minRight2 and maxLeft2 <= minRight1, the median is calculated in O(1). The binary search range is M, giving O(log(min(M, N))) time.',
    revisionTip: 'Median of two sorted arrays binary searches the cut index on the smaller array in O(log(min(M, N))) time.'
  }
]
