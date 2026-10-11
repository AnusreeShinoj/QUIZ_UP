import { Quiz } from '../types/quiz';

export const INITIAL_SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-dsa-01',
    title: 'Data Structures & Algorithms: Trees, Graphs & Complexity',
    description: 'Comprehensive college assessment covering binary search trees, asymptotic analysis, graph traversals, and dynamic programming fundamentals.',
    subject: 'Computer Science & Engineering',
    topic: 'Data Structures',
    difficulty: 'Intermediate',
    examCategory: 'GATE CS',
    visibility: 'public',
    shareCode: 'DSA101',
    creatorId: 'prof-aditi-sharma',
    creatorName: 'Prof. Aditi Sharma',
    creatorEmail: 'aditi.sharma@college.edu',
    isPublished: true,
    timeLimitMinutes: 10,
    totalQuestions: 6,
    totalPoints: 6,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    attemptCount: 142,
    questions: [
      {
        id: 'dsa-q1',
        text: 'What is the worst-case time complexity of searching an element in a Binary Search Tree (BST) of n elements without self-balancing?',
        topic: 'Binary Search Trees',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctOptionIndex: 2,
        explanation: 'In a skewed binary search tree (essentially a linked list), the search operation inspects each node linearly, resulting in O(n) worst-case time complexity.',
        points: 1
      },
      {
        id: 'dsa-q2',
        text: 'Which data structure is primarily utilized to implement Breadth-First Search (BFS) in a directed graph?',
        topic: 'Graph Traversals',
        options: ['Stack', 'Queue', 'Priority Queue', 'Hash Map'],
        correctOptionIndex: 1,
        explanation: 'BFS explores the graph level-by-level using a FIFO (First-In, First-Out) Queue data structure.',
        points: 1
      },
      {
        id: 'dsa-q3',
        text: 'Which traversal of a Binary Search Tree produces values in strictly sorted ascending order?',
        topic: 'Binary Search Trees',
        options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
        correctOptionIndex: 2,
        explanation: 'An in-order traversal (Left, Root, Right) of a Binary Search Tree always visits elements in non-decreasing sorted order.',
        points: 1
      },
      {
        id: 'dsa-q4',
        text: 'Dijkstra’s algorithm for finding shortest paths in a weighted graph fails when the graph contains which feature?',
        topic: 'Graph Traversals',
        options: ['Cycles', 'Negative weight edges', 'Disconnected components', 'Self-loops'],
        correctOptionIndex: 1,
        explanation: 'Dijkstra assumes greedily that adding an edge to a known shortest path will not decrease total path distance, so negative weight edges cause incorrect evaluations (Bellman-Ford is needed instead).',
        points: 1
      },
      {
        id: 'dsa-q5',
        text: 'What is the amortized insertion time complexity for a Hash Table utilizing separate chaining, assuming a uniform hash distribution?',
        topic: 'Hashing',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(sqrt(n))'],
        correctOptionIndex: 0,
        explanation: 'Under simple uniform hashing with constant load factor, hashing takes O(1) expected time, and inserting at the head of a collision chain is O(1).',
        points: 1
      },
      {
        id: 'dsa-q6',
        text: 'What is the minimum number of edges in a connected undirected graph with V vertices?',
        topic: 'Graph Traversals',
        options: ['V', 'V - 1', 'V * (V - 1) / 2', '2V - 1'],
        correctOptionIndex: 1,
        explanation: 'A minimally connected undirected graph with V vertices is a tree, which contains exactly V - 1 edges.',
        points: 1
      }
    ]
  },
  {
    id: 'quiz-os-02',
    title: 'Operating Systems: Paging, Virtual Memory & Deadlocks',
    description: 'Test your understanding of core OS internals including thrashing, page replacement, Banker’s algorithm, and process synchronization.',
    subject: 'Information Technology',
    topic: 'Operating Systems',
    difficulty: 'Intermediate',
    examCategory: 'University IT Exams',
    visibility: 'public',
    shareCode: 'OS202',
    creatorId: 'prof-rajesh-kumar',
    creatorName: 'Dr. Rajesh Kumar',
    creatorEmail: 'rajesh.kumar@college.edu',
    isPublished: true,
    timeLimitMinutes: 8,
    totalQuestions: 5,
    totalPoints: 5,
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z',
    attemptCount: 98,
    questions: [
      {
        id: 'os-q1',
        text: 'Which condition is NOT one of the four Coffman conditions necessary for a system deadlock to occur?',
        topic: 'Deadlocks',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        correctOptionIndex: 2,
        explanation: 'No Preemption (resources cannot be forcibly taken away) is the necessary condition. If preemption is allowed, deadlocks cannot occur.',
        points: 1
      },
      {
        id: 'os-q2',
        text: 'What phenomenon occurs when increasing the number of page frames results in an increase in page faults under FIFO page replacement?',
        topic: 'Virtual Memory',
        options: ['Thrashing', 'Bélády’s Anomaly', 'Aging', 'Starvation'],
        correctOptionIndex: 1,
        explanation: 'Bélády’s anomaly demonstrates that under FIFO, allocating more memory frames to a process can counter-intuitively trigger more page faults.',
        points: 1
      },
      {
        id: 'os-q3',
        text: 'What primary role does the Translation Lookaside Buffer (TLB) perform in memory management hardware?',
        topic: 'Virtual Memory',
        options: [
          'High-speed hardware cache for virtual-to-physical address translations',
          'Primary disk storage for swap space',
          'Interrupt vector table for system calls',
          'Cache memory for CPU registers'
        ],
        correctOptionIndex: 0,
        explanation: 'The TLB is an associative memory cache that stores recent virtual-to-physical page mappings to avoid multiple DRAM lookups during address translation.',
        points: 1
      },
      {
        id: 'os-q4',
        text: 'What state is reached when a computer’s CPU spends significantly more time swapping pages into and out of memory than executing actual instructions?',
        topic: 'Virtual Memory',
        options: ['Deadlock', 'Thrashing', 'Context Switch Storm', 'Livelock'],
        correctOptionIndex: 1,
        explanation: 'Thrashing occurs when the collective working set size of active processes exceeds available physical memory, forcing continuous page faults and disk I/O.',
        points: 1
      },
      {
        id: 'os-q5',
        text: 'Which algorithm is famous for avoiding deadlocks by testing safe states before granting resource requests?',
        topic: 'Deadlocks',
        options: ["Dijkstra’s Banker’s Algorithm", 'Round Robin Scheduling', 'Peterson’s Solution', 'SJF Scheduling'],
        correctOptionIndex: 0,
        explanation: "Banker's Algorithm simulates resource allocation for each request to verify that at least one safe execution sequence remains before allowing allocation.",
        points: 1
      }
    ]
  },
  {
    id: 'quiz-cn-03',
    title: 'Computer Networks: TCP/IP Protocol Stack & Subnetting',
    description: 'Master OSI layers, IPv4 CIDR subnetting, three-way handshakes, routing protocols, and socket architecture.',
    subject: 'Computer Science & Engineering',
    topic: 'Computer Networks',
    difficulty: 'Advanced',
    examCategory: 'Technical Placements',
    visibility: 'public',
    shareCode: 'NET303',
    creatorId: 'prof-aditi-sharma',
    creatorName: 'Prof. Aditi Sharma',
    creatorEmail: 'aditi.sharma@college.edu',
    isPublished: true,
    timeLimitMinutes: 10,
    totalQuestions: 5,
    totalPoints: 5,
    createdAt: '2026-03-08T15:30:00.000Z',
    updatedAt: '2026-03-08T15:30:00.000Z',
    attemptCount: 110,
    questions: [
      {
        id: 'cn-q1',
        text: 'How many usable host IP addresses are available in a subnet with CIDR notation /28?',
        topic: 'Subnetting',
        options: ['16', '14', '30', '12'],
        correctOptionIndex: 1,
        explanation: 'A /28 mask leaves 32 - 28 = 4 host bits. 2^4 = 16 total IPs. Subtracting 2 (network address and broadcast address) yields 14 usable host IPs.',
        points: 1
      },
      {
        id: 'cn-q2',
        text: 'What is the exact sequence of flags exchanged during standard TCP connection establishment?',
        topic: 'Transport Layer',
        options: ['SYN -> ACK -> SYN-ACK', 'SYN -> SYN-ACK -> ACK', 'FIN -> ACK -> FIN-ACK', 'RST -> SYN -> ACK'],
        correctOptionIndex: 1,
        explanation: 'TCP 3-way handshake begins with client SYN, followed by server SYN-ACK, followed by client ACK.',
        points: 1
      },
      {
        id: 'cn-q3',
        text: 'Which transport layer protocol is connectionless, offers no delivery guarantees, and is favored for real-time video streaming?',
        topic: 'Transport Layer',
        options: ['TCP', 'UDP', 'SCTP', 'ICMP'],
        correctOptionIndex: 1,
        explanation: 'UDP provides minimal protocol overhead without retransmission delay or handshake overhead, making it ideal for low-latency live media.',
        points: 1
      },
      {
        id: 'cn-q4',
        text: 'Which layer of the OSI 7-layer reference model is responsible for logical IP addressing and path determination across subnets?',
        topic: 'Subnetting',
        options: ['Data Link Layer', 'Transport Layer', 'Network Layer', 'Session Layer'],
        correctOptionIndex: 2,
        explanation: 'Layer 3 (Network Layer) handles packet routing, forwarding, and logical addressing (IPv4/IPv6).',
        points: 1
      },
      {
        id: 'cn-q5',
        text: 'What protocol translates human-readable domain names (such as quizup.edu) into IP addresses?',
        topic: 'Application Layer',
        options: ['ARP', 'DHCP', 'DNS', 'NAT'],
        correctOptionIndex: 2,
        explanation: 'DNS (Domain Name System) operates at the application layer to resolve domain names to corresponding numerical IP addresses.',
        points: 1
      }
    ]
  },
  {
    id: 'quiz-db-04',
    title: 'Database Management Systems: SQL, Normalization & ACID',
    description: 'Test essential DBMS concepts including B+ Trees, 1NF to BCNF normalization, relational algebra, and concurrency control.',
    subject: 'Information Technology',
    topic: 'Database Management',
    difficulty: 'Intermediate',
    examCategory: 'University IT Exams',
    visibility: 'public',
    shareCode: 'DBMS04',
    creatorId: 'prof-rajesh-kumar',
    creatorName: 'Dr. Rajesh Kumar',
    creatorEmail: 'rajesh.kumar@college.edu',
    isPublished: true,
    timeLimitMinutes: 10,
    totalQuestions: 5,
    totalPoints: 5,
    createdAt: '2026-03-10T09:00:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
    attemptCount: 85,
    questions: [
      {
        id: 'db-q1',
        text: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y, what condition holds?',
        topic: 'Normalization',
        options: [
          'Y is a prime attribute',
          'X is a super key',
          'X is a candidate key and Y is atomic',
          'Relation must not exceed 3 attributes'
        ],
        correctOptionIndex: 1,
        explanation: 'BCNF requires that for every non-trivial functional dependency X -> Y, the determinant X must strictly be a super key.',
        points: 1
      },
      {
        id: 'db-q2',
        text: 'Which ACID property guarantees that all transactions execute in isolation without interfering with concurrent transactions?',
        topic: 'ACID Properties',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctOptionIndex: 2,
        explanation: 'Isolation ensures that concurrent execution of transactions leaves the database in the same state as if transactions executed serially.',
        points: 1
      },
      {
        id: 'db-q3',
        text: 'Why do relational database engines predominantly use B+ Trees rather than standard Binary Search Trees for disk-based indexing?',
        topic: 'Database Indexing',
        options: [
          'Binary search trees require no RAM',
          'B+ Trees have high fan-out, reducing disk I/O seek operations significantly',
          'B+ Trees do not require balanced height',
          'B+ Trees only store integers'
        ],
        correctOptionIndex: 1,
        explanation: 'Because B+ Trees have a high branching factor (fan-out), the tree depth is small (typically 3-4 levels), minimizing costly disk head seeks.',
        points: 1
      },
      {
        id: 'db-q4',
        text: 'In SQL, what type of JOIN returns all records from the left table and matched records from the right table, filling nulls where unmatched?',
        topic: 'SQL Queries',
        options: ['INNER JOIN', 'FULL OUTER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN'],
        correctOptionIndex: 2,
        explanation: 'LEFT OUTER JOIN (or LEFT JOIN) keeps every record from the left table regardless of whether there is a match in the right table.',
        points: 1
      },
      {
        id: 'db-q5',
        text: 'Which normal form eliminates transitive functional dependencies on the primary key?',
        topic: 'Normalization',
        options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Fifth Normal Form (5NF)'],
        correctOptionIndex: 2,
        explanation: 'Third Normal Form (3NF) requires a relation to be in 2NF and have no transitive dependencies (non-key attributes depending on non-key attributes).',
        points: 1
      }
    ]
  },
  {
    id: 'quiz-web-05',
    title: 'Modern Web Engineering: HTTP, DOM, REST & Async JS',
    description: 'Essential web development concepts for full-stack engineering, frontend performance, and API design.',
    subject: 'Information Technology',
    topic: 'Web Development',
    difficulty: 'Beginner',
    examCategory: 'Technical Placements',
    visibility: 'public',
    shareCode: 'WEB505',
    creatorId: 'prof-aditi-sharma',
    creatorName: 'Prof. Aditi Sharma',
    creatorEmail: 'aditi.sharma@college.edu',
    isPublished: true,
    timeLimitMinutes: 6,
    totalQuestions: 4,
    totalPoints: 4,
    createdAt: '2026-03-12T14:00:00.000Z',
    updatedAt: '2026-03-12T14:00:00.000Z',
    attemptCount: 76,
    questions: [
      {
        id: 'web-q1',
        text: 'Which HTTP status code signifies that a requested resource was created successfully following a POST request?',
        topic: 'REST APIs & HTTP',
        options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
        correctOptionIndex: 1,
        explanation: 'HTTP 201 Created indicates the request succeeded and led to the creation of one or more new resources on the server.',
        points: 1
      },
      {
        id: 'web-q2',
        text: 'What is the primary difference between localStorage and sessionStorage in browser Web Storage API?',
        topic: 'Browser APIs',
        options: [
          'localStorage stores only strings, sessionStorage stores objects',
          'sessionStorage expires when the browser tab/session is closed, whereas localStorage persists until cleared',
          'sessionStorage is encrypted automatically, localStorage is not',
          'localStorage has a 10KB quota limit'
        ],
        correctOptionIndex: 1,
        explanation: 'sessionStorage data is scoped to the current browser tab and lifetime of the browsing session, whereas localStorage persists across restarts.',
        points: 1
      },
      {
        id: 'web-q3',
        text: 'In RESTful API design, which HTTP method is canonically idempotent and used to replace or update an existing resource completely?',
        topic: 'REST APIs & HTTP',
        options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
        correctOptionIndex: 1,
        explanation: 'PUT is idempotent, meaning making multiple identical PUT requests has the exact same side-effect as a single request.',
        points: 1
      },
      {
        id: 'web-q4',
        text: 'What mechanism prevents a web page from making XMLHttpRequests or fetch requests to a different domain without explicit server permission?',
        topic: 'Web Security',
        options: ['Same-Origin Policy (SOP)', 'Content Security Policy (CSP)', 'Cross-Site Scripting (XSS)', 'DNS Spoofing'],
        correctOptionIndex: 0,
        explanation: 'The Same-Origin Policy is a fundamental security model that isolates untrusted scripts by restricting resource access across differing origins unless CORS headers permit it.',
        points: 1
      }
    ]
  }
];
