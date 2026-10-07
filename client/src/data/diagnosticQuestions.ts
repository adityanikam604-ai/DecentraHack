export interface DiagnosticQuestion {
  id: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export const PREDEFINED_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-q1-arrays',
    topic: 'Arrays',
    difficulty: 'easy',
    question: 'What is the worst-case time complexity to search for an arbitrary element in an unsorted array of size N?',
    options: [
      'O(1)',
      'O(log N)',
      'O(N)',
      'O(N²)',
    ],
    correctAnswer: 'O(N)',
    explanation: 'In an unsorted array, we may need to examine every element sequentially (linear search) in the worst case.',
  },
  {
    id: 'diag-q2-strings',
    topic: 'Strings',
    difficulty: 'easy',
    question: 'Which approach is most time-efficient to verify whether two strings of length N are anagrams of each other?',
    options: [
      'Sorting both strings in O(N log N) time',
      'Using a character frequency map/array in O(N) time',
      'Nested loops comparing characters in O(N²) time',
      'Pushing characters into two Queues',
    ],
    correctAnswer: 'Using a character frequency map/array in O(N) time',
    explanation: 'A character frequency table counts occurrences in a single pass O(N) and uses O(1) auxiliary space for a fixed alphabet.',
  },
  {
    id: 'diag-q3-linked-lists',
    topic: 'Linked Lists',
    difficulty: 'medium',
    question: "In Floyd's Cycle Detection algorithm (Fast & Slow pointers) for a singly linked list, what is the auxiliary space complexity?",
    options: [
      'O(N) to store visited pointers in a hash table',
      'O(log N) call stack memory',
      'O(1) constant auxiliary space',
      'O(N²) pointer traversal space',
    ],
    correctAnswer: 'O(1) constant auxiliary space',
    explanation: "Floyd's algorithm only maintains two pointer references (slow and fast), requiring O(1) extra memory.",
  },
  {
    id: 'diag-q4-stack-queue',
    topic: 'Stack & Queue',
    difficulty: 'medium',
    question: 'Which data structure is fundamentally utilized by compilers to check whether parenthesis pairs ({[]}) in source code are balanced?',
    options: [
      'Queue (FIFO)',
      'Stack (LIFO)',
      'Binary Search Tree',
      'Min-Heap',
    ],
    correctAnswer: 'Stack (LIFO)',
    explanation: 'A Stack matches the most recently opened symbol with the earliest closing symbol following Last-In-First-Out order.',
  },
  {
    id: 'diag-q5-trees',
    topic: 'Trees',
    difficulty: 'medium',
    question: 'Which tree traversal order visits nodes of a Binary Search Tree (BST) in strictly ascending sorted order?',
    options: [
      'Preorder (Root → Left → Right)',
      'Inorder (Left → Root → Right)',
      'Postorder (Left → Right → Root)',
      'Level Order (BFS)',
    ],
    correctAnswer: 'Inorder (Left → Root → Right)',
    explanation: 'An Inorder traversal visits smaller elements in the left subtree first, then the root, then larger elements in the right subtree.',
  },
  {
    id: 'diag-q6-graphs',
    topic: 'Graphs',
    difficulty: 'medium',
    question: 'To find the shortest path (minimum edge count) between two vertices in an unweighted graph, which algorithm should be used?',
    options: [
      'Depth-First Search (DFS)',
      'Breadth-First Search (BFS)',
      'Bellman-Ford Algorithm',
      'Prim’s Algorithm',
    ],
    correctAnswer: 'Breadth-First Search (BFS)',
    explanation: 'BFS explores vertices level by level (by edge distance), guaranteeing the shortest path in unweighted graphs.',
  },
  {
    id: 'diag-q7-sorting',
    topic: 'Sorting',
    difficulty: 'medium',
    question: 'What is the worst-case time complexity of QuickSort, and under what condition does it occur?',
    options: [
      'O(N log N) when the array is randomly shuffled',
      'O(N²) when the selected pivot is repeatedly the smallest or largest element',
      'O(N) when the array contains all identical numbers',
      'O(log N) when using 3-way partitioning',
    ],
    correctAnswer: 'O(N²) when the selected pivot is repeatedly the smallest or largest element',
    explanation: 'When the partition is unbalanced (size 0 and N-1), recurrence T(N) = T(N-1) + O(N) yields O(N²).',
  },
  {
    id: 'diag-q8-searching',
    topic: 'Searching',
    difficulty: 'easy',
    question: 'What fundamental precondition must be met before executing Binary Search on an array?',
    options: [
      'Array elements must be strictly unique',
      'The array must be sorted in monotonic order',
      'The array size must be a power of two',
      'The array must be implemented as a Linked List',
    ],
    correctAnswer: 'The array must be sorted in monotonic order',
    explanation: 'Binary Search depends on ordering to halve the search interval in O(log N) iterations.',
  },
]
