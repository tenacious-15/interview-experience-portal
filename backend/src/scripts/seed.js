import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Experience, Question } from '../models/index.js';

const companiesData = [
  {
    companyName: 'Google',
    role: 'Software Engineer Intern',
    status: 'Selected',
    oaExperience: 'The Online Assessment consisted of 2 coding questions on Google Coding Challenge platform. Time allowed was 60 minutes. The questions were medium-hard level, focused on graphs and dynamic programming.',
    technicalRoundExperience: 'There were 3 technical interview rounds. Round 1 focused on data structures (specifically Heaps and Linked Lists). I was asked to merge K sorted lists. Round 2 was graph-based, finding the longest path in a DAG. Round 3 was a system design and fitment round focusing on API rate limiting.',
    hrRoundExperience: 'Brief call discussing team matching, graduation timeline, and background check details. Very smooth and welcoming conversation.',
    overallExperience: 'Google\'s interview process is highly technical and deep. The interviewers were extremely smart and helped by giving subtle hints when I was stuck. Focus on clean code and time complexity analysis.',
    preparationTips: 'Focus heavily on LeetCode Medium/Hard questions. Practice explaining your thoughts out loud while writing code. Standard topics like Trees, Graphs, and DP are extremely important.',
    questions: [
      {
        title: 'Merge k Sorted Lists',
        description: 'Merge k sorted linked lists and return it as one sorted list. Analyze and describe its complexity.',
        link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
        topic: 'Heaps',
        difficulty: 'Hard'
      },
      {
        title: 'Longest Path with Different Adjacent Characters',
        description: 'Find the length of the longest path in the tree such that no two adjacent nodes have the same character.',
        link: 'https://leetcode.com/problems/longest-path-with-different-adjacent-characters/',
        topic: 'Graphs',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Microsoft',
    role: 'Software Engineer SDE-1',
    status: 'Selected',
    oaExperience: 'Codility platform test with 3 tasks in 110 minutes. Tasks were related to array manipulation, binary search, and dynamic programming.',
    technicalRoundExperience: '2 technical rounds. Round 1 was on linked lists, specifically reversing nodes in K-groups. Round 2 was binary search on a rotated sorted array. The interviewers placed emphasis on edge cases and code readability.',
    hrRoundExperience: 'Discussed behavioral questions based on Microsoft\'s culture, leadership principles, and past projects.',
    overallExperience: 'The interviews were collaborative. The focus was on clear communication, writing clean structured code, and testing edge cases.',
    preparationTips: 'Study linked lists, arrays, binary search, and basic system design. Practice writing clean code without an IDE.',
    questions: [
      {
        title: 'Reverse Nodes in k-Group',
        description: 'Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.',
        link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/',
        topic: 'Linked List',
        difficulty: 'Hard'
      },
      {
        title: 'Find Minimum in Rotated Sorted Array',
        description: 'Given the sorted rotated array nums of unique elements, return the minimum element of this array.',
        link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
        topic: 'Binary Search',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Amazon',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'The OA had 2 parts: 2 coding questions (70 mins) and a work style simulation (behavioral assessment). Questions were on sliding window and BFS.',
    technicalRoundExperience: '3 rounds (1 virtual onsite). Round 1 was an LRU Cache design. Round 2 was Rotting Oranges (BFS on Grid). Round 3 was purely behavioral based on Amazon Leadership Principles.',
    hrRoundExperience: 'Brief salary discussion, relocation preferences, and onboarding formalities.',
    overallExperience: 'Amazon places 50% weight on Leadership Principles. Make sure you prepare STAR-format answers for every leadership principle.',
    preparationTips: 'Practice standard BFS/DFS questions, design patterns (LRU Cache, Trie), and write leadership principle stories.',
    questions: [
      {
        title: 'LRU Cache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        link: 'https://leetcode.com/problems/lru-cache/',
        topic: 'Stacks',
        difficulty: 'Medium'
      },
      {
        title: 'Rotting Oranges',
        description: 'Find the minimum time required to rot all oranges in a grid using Breadth-First Search (BFS).',
        link: 'https://leetcode.com/problems/rotting-oranges/',
        topic: 'Graphs',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Meta',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'Automated screening test on CodeSignal. 4 questions, 70 minutes. Mostly array, hash map, and matrix-based questions.',
    technicalRoundExperience: '2 coding rounds. Round 1: Subarray Sum Equals K. Round 2: Lowest Common Ancestor in a Binary Tree. Quick 45-minute rounds where speed and bug-free code are crucial.',
    hrRoundExperience: 'Standard call discussing benefits, bootcamp training, and team placement.',
    overallExperience: 'Meta has a highly standardized process. You must be fast and explain your logic clearly within the 45-minute limit.',
    preparationTips: 'Do Meta-tagged LeetCode questions. Focus on speed, optimal space-time complexity, and speaking while typing.',
    questions: [
      {
        title: 'Subarray Sum Equals K',
        description: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
        link: 'https://leetcode.com/problems/subarray-sum-equals-k/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Lowest Common Ancestor of a Binary Tree',
        description: 'Given a binary tree, find the lowest common ancestor (LCA) node of two given nodes in the tree.',
        link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
        topic: 'Trees',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Apple',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'No traditional OA. Directly received a hacker rank link with 2 questions for resume validation.',
    technicalRoundExperience: '3 rounds. Round 1: Product of Array Except Self. Round 2: Validate BST. Round 3: Low-Level System Design of a Parking Lot.',
    hrRoundExperience: 'Cultural fitment interview. Discussed hardware-software integration interest and team alignment.',
    overallExperience: 'Apple values attention to detail and clean architecture. They test depth of knowledge rather than LeetCode speed.',
    preparationTips: 'Focus on System Design (LLD), Object-Oriented Programming (OOPs), and standard tree traversal algorithms.',
    questions: [
      {
        title: 'Product of Array Except Self',
        description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
        link: 'https://leetcode.com/problems/product-of-array-except-self/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Validate Binary Search Tree',
        description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
        link: 'https://leetcode.com/problems/validate-binary-search-tree/',
        topic: 'Trees',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Netflix',
    role: 'Senior SDE',
    status: 'Selected',
    oaExperience: 'No OA. Standard phone screening followed by system design round.',
    technicalRoundExperience: '4 onsite rounds. Round 1 was System Design: Design Twitter. Round 2 was Coding: Median of Two Sorted Arrays. Round 3 was architectural scaling and databases.',
    hrRoundExperience: 'Intense culture memo discussion. Netflix has a famous freedom & responsibility culture that they test thoroughly.',
    overallExperience: ' Netflix looks for senior talent with massive scale experience. They verify if you can design highly decoupled distributed microservices.',
    preparationTips: 'Master System Design, scaling architectures, distributed caching, and study the Netflix culture deck.',
    questions: [
      {
        title: 'Design Twitter',
        description: 'Design a simplified version of Twitter where users can post tweets, follow/unfollow other users and see feed.',
        link: 'https://leetcode.com/problems/design-twitter/',
        topic: 'System Design',
        difficulty: 'Medium'
      },
      {
        title: 'Median of Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
        link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
        topic: 'Binary Search',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'Uber',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 coding questions, 90 mins. Extremely competitive. Questions on graphs and heaps.',
    technicalRoundExperience: '3 rounds. Round 1: Sliding Window Maximum. Round 2: Word Ladder (graph BFS). Round 3: LLD of a ride-sharing dispatch system.',
    hrRoundExperience: 'Discussion about interest in mobility, core values, and compensation expectations.',
    overallExperience: 'Uber tests high-concurrency designs, low latency operations, and strong algorithms. Focus on graphs and queues.',
    preparationTips: 'Practice advanced graph algorithms (Dijkstra, BFS/DFS, Topological Sort) and queue data structures.',
    questions: [
      {
        title: 'Sliding Window Maximum',
        description: 'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.',
        link: 'https://leetcode.com/problems/sliding-window-maximum/',
        topic: 'Stacks',
        difficulty: 'Hard'
      },
      {
        title: 'Word Ladder',
        description: 'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence.',
        link: 'https://leetcode.com/problems/word-ladder/',
        topic: 'Graphs',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'Lyft',
    role: 'Software Engineer Intern',
    status: 'Selected',
    oaExperience: 'Resume shortlisting followed by HackerRank assessment of 3 questions.',
    technicalRoundExperience: '2 coding rounds. Round 1: Asteroid Collision using Stacks. Round 2: Container With Most Water using Two Pointers. Focus is on optimization and clean structure.',
    hrRoundExperience: 'Standard behavior screening, project review, and internship expectations.',
    overallExperience: 'Very friendly interview experience. Interviewers were helpful and prioritized code maintainability.',
    preparationTips: 'Practice stack-based algorithms, two-pointer approach, and write clean unit tests.',
    questions: [
      {
        title: 'Asteroid Collision',
        description: 'We are given an array asteroids of integers representing asteroids in a row. Find the state of the asteroids after all collisions.',
        link: 'https://leetcode.com/problems/asteroid-collision/',
        topic: 'Stacks',
        difficulty: 'Medium'
      },
      {
        title: 'Container With Most Water',
        description: 'Given n non-negative integers representing an elevation map, find two lines that together with the x-axis forms a container containing the most water.',
        link: 'https://leetcode.com/problems/container-with-most-water/',
        topic: 'Arrays',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Airbnb',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'CodeSignal OA with 4 questions. Standard matrix, array, and string transformations.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Flatten Nested List Iterator. Round 2: Palindrome Partitioning. Round 3: System Design: Design a booking notification system.',
    hrRoundExperience: 'Deep dive into behavioral situations, travel affinity, and cultural values.',
    overallExperience: 'Airbnb values creativity, elegance in problem solving, and building custom components. Excellent process.',
    preparationTips: 'Study backtracking, tree traversal, recursion, and learn how to build modular software models.',
    questions: [
      {
        title: 'Flatten Nested List Iterator',
        description: 'You are given a nested list of integers. Implement an iterator to flatten it.',
        link: 'https://leetcode.com/problems/flatten-nested-list-iterator/',
        topic: 'Recursion',
        difficulty: 'Medium'
      },
      {
        title: 'Palindrome Partitioning',
        description: 'Given a string s, partition s such that every substring of the partition is a palindrome.',
        link: 'https://leetcode.com/problems/palindrome-partitioning/',
        topic: 'Backtracking',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Stripe',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'No traditional OA. A take-home code integration test simulating building a billing parser.',
    technicalRoundExperience: '3 rounds. Round 1: Design Hit Counter (Rate Limiter). Round 2: Encode and Decode Strings. Round 3: Live coding session building API endpoints.',
    hrRoundExperience: 'Discussed work styles, detail-oriented engineering, and product focus.',
    overallExperience: 'Stripe\'s interview is highly realistic. They do not test abstract puzzles; instead, they focus on writing production-ready code with testing.',
    preparationTips: 'Practice writing clean APIs, modular design, design hit counters, and study basic cryptography/hashing.',
    questions: [
      {
        title: 'Design Hit Counter',
        description: 'Design a hit counter which counts the number of hits received in the past 5 minutes.',
        link: 'https://leetcode.com/problems/design-hit-counter/',
        topic: 'System Design',
        difficulty: 'Medium'
      },
      {
        title: 'Encode and Decode Strings',
        description: 'Design an algorithm to encode a list of strings to a string. The encoded string is then decoded back.',
        link: 'https://leetcode.com/problems/encode-and-decode-strings/',
        topic: 'Strings',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Atlassian',
    role: 'Graduate SDE',
    status: 'Selected',
    oaExperience: 'Codeility test. 3 questions on recursion, queues, and tree traversal. Time allowed: 90 mins.',
    technicalRoundExperience: '3 rounds. Round 1: Design Snake Game using Deque. Round 2: LRU Cache. Round 3: Values fitment (Don\'t F#@k the Customer, Play as a team).',
    hrRoundExperience: 'Cultural alignment review, salary discussion, and onboarding location preference.',
    overallExperience: 'Atlassian interviews check your code design, choice of data structures, and company values matching.',
    preparationTips: 'Study deque, queues, system designs, and learn to write modular classes.',
    questions: [
      {
        title: 'Design Snake Game',
        description: 'Design a Snake game that is played on a device with a given screen size using Deque data structure.',
        link: 'https://leetcode.com/problems/design-snake-game/',
        topic: 'Stacks',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Adobe',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'Adobe Co-cube assessment. Aptitude (20 Qs) + Coding (2 Qs) on Arrays and Strings.',
    technicalRoundExperience: '2 technical rounds. Round 1: Search in Rotated Sorted Array. Round 2: Longest Palindromic Substring. Mostly focused on basic array manipulation and optimization.',
    hrRoundExperience: 'Behavioral, discussing strengths, weak points, and future aspirations.',
    overallExperience: 'Adobe focuses on solid fundamentals in C++ / Java, OOPs concepts, and basic Data Structures.',
    preparationTips: 'Study binary search, basic dynamic programming, and standard string algorithms.',
    questions: [
      {
        title: 'Search in Rotated Sorted Array',
        description: 'Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums.',
        link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
        topic: 'Binary Search',
        difficulty: 'Medium'
      },
      {
        title: 'Longest Palindromic Substring',
        description: 'Given a string s, return the longest palindromic substring in s.',
        link: 'https://leetcode.com/problems/longest-palindromic-substring/',
        topic: 'Strings',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Salesforce',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 questions, 120 minutes. Medium level DSA.',
    technicalRoundExperience: '2 rounds. Round 1: Meeting Rooms II (sorting intervals). Round 2: Kth Largest Element in an Array (Heaps/Quick Select).',
    hrRoundExperience: 'Discussed past projects, internship work, and cloud technologies interest.',
    overallExperience: 'Fairly standard SDE-1 process. Focused on standard DSA paradigms and basic design rules.',
    preparationTips: 'Practice interval-based problems, heaps, and quick-sort concepts.',
    questions: [
      {
        title: 'Meeting Rooms II',
        description: 'Given an array of meeting time intervals consisting of start and end times, find the minimum number of conference rooms required.',
        link: 'https://leetcode.com/problems/meeting-rooms-ii/',
        topic: 'Sorting',
        difficulty: 'Medium'
      },
      {
        title: 'Kth Largest Element in an Array',
        description: 'Given an integer array nums and an integer k, return the kth largest element in the array.',
        link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
        topic: 'Heaps',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'LinkedIn',
    role: 'SDE Intern',
    status: 'Selected',
    oaExperience: 'HackerRank. 2 coding questions, 60 minutes. Related to arrays and binary search.',
    technicalRoundExperience: '2 technical interviews. Round 1: Merge Intervals. Round 2: Search a 2D Matrix. Code testing is strict, with special emphasis on boundary conditions.',
    hrRoundExperience: 'Brief call discussing resume, tech stacks, and team fitment.',
    overallExperience: 'LinkedIn interviews are highly organized. They test solid understanding of sorting algorithms and search spaces.',
    preparationTips: 'Study search algorithms, interval merging, and complexity analysis.',
    questions: [
      {
        title: 'Merge Intervals',
        description: 'Given an array of intervals, merge all overlapping intervals.',
        link: 'https://leetcode.com/problems/merge-intervals/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Search a 2D Matrix',
        description: 'Write an efficient algorithm that searches for a value target in an m x n integer matrix.',
        link: 'https://leetcode.com/problems/search-a-2d-matrix/',
        topic: 'Binary Search',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Twitter',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'HackerRank challenge. 3 questions on graphs and arrays.',
    technicalRoundExperience: '3 rounds. Round 1: Design Twitter (System Design/API). Round 2: Course Schedule (Graph Cycle Detection). Round 3: Concurrency and Thread Safety.',
    hrRoundExperience: 'Discussed remote work capabilities, scaling public timelines, and open-source contributions.',
    overallExperience: 'Highly technical. Twitter tests concurrency, real-time caching, and network topologies.',
    preparationTips: 'Study topological sorting, graph cycles, and threading concepts in your language.',
    questions: [
      {
        title: 'Course Schedule',
        description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Find if you can finish all courses.',
        link: 'https://leetcode.com/problems/course-schedule/',
        topic: 'Graphs',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Coinbase',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'Take-home assignment simulating a orderbook parser matching trades.',
    technicalRoundExperience: '3 rounds. Round 1: Accounts Merge using Disjoint Set Union (DSU). Round 2: Top K Frequent Elements. Round 3: Blockchain basics and security principles.',
    hrRoundExperience: 'Standard behavioral call matching remote values and crypto interest.',
    overallExperience: 'Coinbase tests modular coding, solid data structures (like DSU and heaps), and clean architecture.',
    preparationTips: 'Study Disjoint Set Union (DSU), Priority Queues, and basic distributed systems.',
    questions: [
      {
        title: 'Accounts Merge',
        description: 'Given a list of accounts where each element accounts[i] is a list of strings, merge these accounts using Disjoint Set Union.',
        link: 'https://leetcode.com/problems/accounts-merge/',
        topic: 'Graphs',
        difficulty: 'Medium'
      },
      {
        title: 'Top K Frequent Elements',
        description: 'Given an integer array nums and an integer k, return the k most frequent elements.',
        link: 'https://leetcode.com/problems/top-k-frequent-elements/',
        topic: 'Heaps',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Snowflake',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 tough questions on segment trees and stacks in 90 minutes.',
    technicalRoundExperience: '3 rounds. Round 1: Trapping Rain Water. Round 2: Daily Temperatures. Round 3: Database query execution concepts and storage indexing.',
    hrRoundExperience: 'Cultural compatibility round focusing on performance and optimization values.',
    overallExperience: 'Snowflake is a high-performance DB company. They test low-level data structures, layout caches, and execution stacks.',
    preparationTips: 'Practice stack-based algorithms, dynamic programming, and study basic database engine internals.',
    questions: [
      {
        title: 'Trapping Rain Water',
        description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        link: 'https://leetcode.com/problems/trapping-rain-water/',
        topic: 'Arrays',
        difficulty: 'Hard'
      },
      {
        title: 'Daily Temperatures',
        description: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait.',
        link: 'https://leetcode.com/problems/daily-temperatures/',
        topic: 'Stacks',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Databricks',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'CodeSignal with 4 questions. Very strict scoring rules.',
    technicalRoundExperience: '4 rounds. Round 1: Design In-Memory File System (Tree design). Round 2: Insert Delete GetRandom O(1). Round 3: High-concurrency design of a distributed queue.',
    hrRoundExperience: 'Behavioral, discussing collaboration with open-source communities (Apache Spark).',
    overallExperience: 'Exceptional technical standard. They look for deep system design skills and optimal amortized time complexities.',
    preparationTips: 'Study design structures (O(1) maps+lists), file systems, tree structures, and distributed caching.',
    questions: [
      {
        title: 'Design In-Memory File System',
        description: 'Design an in-memory file system structure supporting mkdir, addContentToFile, readContentFromFile.',
        link: 'https://leetcode.com/problems/design-in-memory-file-system/',
        topic: 'Trees',
        difficulty: 'Hard'
      },
      {
        title: 'Insert Delete GetRandom O(1)',
        description: 'Implement the RandomizedSet class supporting insert, remove, getRandom in O(1) time.',
        link: 'https://leetcode.com/problems/insert-delete-getrandom-o1/',
        topic: 'Arrays',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Palantir',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 complex data simulation tasks.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Number of Islands (DFS/BFS). Round 2: Word Search (backtracking). Round 3: System Design: Design a log analysis parser.',
    hrRoundExperience: 'Fitment check discussing values, data governance, and analytics projects.',
    overallExperience: 'Focuses heavily on graph traversal and matrix-based backtracking. Expect long, detailed discussions on scalability.',
    preparationTips: 'Learn BFS/DFS on grids, recursive backtracking, and data modeling.',
    questions: [
      {
        title: 'Number of Islands',
        description: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
        link: 'https://leetcode.com/problems/number-of-islands/',
        topic: 'Graphs',
        difficulty: 'Medium'
      },
      {
        title: 'Word Search',
        description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
        link: 'https://leetcode.com/problems/word-search/',
        topic: 'Backtracking',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Oracle',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'Oracle Student Placement Test. Basic MCQ round (Java, SQL, Aptitude) + 2 coding questions.',
    technicalRoundExperience: '2 technical rounds. Round 1: Binary Tree Level Order Traversal. Round 2: Climbing Stairs (basic DP) + SQL Join queries.',
    hrRoundExperience: 'Standard HR discussion, college background check, and team matching.',
    overallExperience: 'Oracle focuses on database principles, networking, OOPs, and basic data structures.',
    preparationTips: 'Study relational databases, basic SQL commands, tree traversals, and simple dynamic programming.',
    questions: [
      {
        title: 'Binary Tree Level Order Traversal',
        description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.',
        link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
        topic: 'Trees',
        difficulty: 'Medium'
      },
      {
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes n steps to reach the top. How many distinct ways can you climb it?',
        link: 'https://leetcode.com/problems/climbing-stairs/',
        topic: 'Dynamic Programming',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'NVIDIA',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'Resume shortlisting followed by a telephone screening on C++ memory layouts.',
    technicalRoundExperience: '3 rounds. Round 1: Maximal Square (DP on matrix). Round 2: Implement Trie. Round 3: Low-level C++ details: Virtual tables, smart pointers, GPU compute concepts.',
    hrRoundExperience: 'Discussion about interest in AI computing, hardware acceleration, and core strengths.',
    overallExperience: 'Strong emphasis on hardware-software boundaries, memory management, and pointers alongside algorithms.',
    preparationTips: 'Study C++ memory architecture, dynamic programming, and standard Trie operations.',
    questions: [
      {
        title: 'Maximal Square',
        description: 'Given an m x n binary matrix filled with 0\'s and 1\'s, find the largest square containing only 1\'s and return its area.',
        link: 'https://leetcode.com/problems/maximal-square/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      },
      {
        title: 'Implement Trie (Prefix Tree)',
        description: 'Implement a trie with insert, search, and startsWith methods.',
        link: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
        topic: 'Trie',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Zoom',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'OA with 2 questions on HackerRank. Medium level arrays and string manipulation.',
    technicalRoundExperience: '2 rounds. Round 1: 3Sum. Round 2: Valid Parentheses. Very conversational rounds, checking approach first.',
    hrRoundExperience: 'Discussed work values, communication tools interest, and expectations.',
    overallExperience: 'Straightforward coding interviews focused on arrays, string formatting, and stack parsing.',
    preparationTips: 'Study two-pointer arrays and basic stack-based parsers.',
    questions: [
      {
        title: '3Sum',
        description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that they sum up to zero.',
        link: 'https://leetcode.com/problems/3sum/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'( \', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        link: 'https://leetcode.com/problems/valid-parentheses/',
        topic: 'Stacks',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'Spotify',
    role: 'Backend Engineer',
    status: 'Selected',
    oaExperience: 'No traditional OA. Directly scheduled a virtual screening call.',
    technicalRoundExperience: '3 rounds. Round 1: Find All Anagrams in a String. Round 2: Merge K Sorted Lists. Round 3: System Design: Design a music streaming playlist creator.',
    hrRoundExperience: 'Deep dive into cultural fitment, passion for media tech, and salary structure.',
    overallExperience: 'Friendly and collaborative. The focus is on clean API design, sorting, and distributed stream processing.',
    preparationTips: 'Study string parsing, priority queues (heaps), and simple load balancing architectures.',
    questions: [
      {
        title: 'Find All Anagrams in a String',
        description: 'Given two strings s and p, return an array of all the start indices of p\'s anagrams in s.',
        link: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/',
        topic: 'Strings',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Shopify',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'No OA. A screening round reviewing past github projects.',
    technicalRoundExperience: '2 rounds. Round 1: House Robber (basic DP). Round 2: Coin Change. Focused on code clean-ness and optimization.',
    hrRoundExperience: 'Standard call focusing on e-commerce interest, flexibility, and remote work values.',
    overallExperience: 'Very developer-friendly. They look for practical engineering expertise rather than competitive coding puzzles.',
    preparationTips: 'Practice basic dynamic programming, arrays, and standard REST API designs.',
    questions: [
      {
        title: 'House Robber',
        description: 'You are a professional robber planning to rob houses along a street. Determine the maximum money you can rob tonight without alerting the police.',
        link: 'https://leetcode.com/problems/house-robber/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      },
      {
        title: 'Coin Change',
        description: 'You are given an integer array coins representing coins of different denominations and an integer amount. Find the fewest number of coins needed.',
        link: 'https://leetcode.com/problems/coin-change/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'ByteDance',
    role: 'Software Engineer Intern',
    status: 'Selected',
    oaExperience: 'HackerRank test. 4 questions in 120 minutes. Advanced dynamic programming and search.',
    technicalRoundExperience: '3 rounds. Round 1: Longest Substring Without Repeating Characters. Round 2: Kth Smallest Element in a Sorted Matrix. Round 3: System Design: Design a real-time message queue.',
    hrRoundExperience: 'Brief call regarding intern duration, start date, and onboarding steps.',
    overallExperience: 'Very fast-paced and intensive. They expect strong analytical abilities and high-performance algorithms.',
    preparationTips: 'Focus on sliding window techniques, matrix search, and caching strategies.',
    questions: [
      {
        title: 'Longest Substring Without Repeating Characters',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        topic: 'Strings',
        difficulty: 'Medium'
      },
      {
        title: 'Kth Smallest Element in a Sorted Matrix',
        description: 'Given an n x n matrix where each of the rows and columns is sorted in ascending order, find the kth smallest element.',
        link: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/',
        topic: 'Heaps',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Pinterest',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'CodeSignal OA with standard medium problems.',
    technicalRoundExperience: '3 rounds. Round 1: Pacific Atlantic Water Flow (DFS/BFS grid). Round 2: Unique Paths (DP). Round 3: High-level database selection discussion.',
    hrRoundExperience: 'Standard behavioral questions matching culture and past experience.',
    overallExperience: 'Friendly environment. Interviewers focus on your design choice and reasoning behind algorithms.',
    preparationTips: 'Study DFS/BFS traversal, matrix problems, and basic dynamic programming.',
    questions: [
      {
        title: 'Pacific Atlantic Water Flow',
        description: 'Return a list of grid coordinates where water can flow to both the Pacific and Atlantic oceans.',
        link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
        topic: 'Graphs',
        difficulty: 'Medium'
      },
      {
        title: 'Unique Paths',
        description: 'There is a robot on an m x n grid. The robot can only move either down or right. Find total paths.',
        link: 'https://leetcode.com/problems/unique-paths/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Snap',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'No OA. Responding directly to recruiters followed by tech interview.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Alien Dictionary (Topological Sort). Round 2: Decode String (Stack parsing). Round 3: Low level graphic engine concepts / camera API designs.',
    hrRoundExperience: 'Cultural compatibility check focusing on camera technology and AR interest.',
    overallExperience: 'High technical bar. Focuses on graph dependencies, topological sorting, and low-latency rendering.',
    preparationTips: 'Study topological sorting, graph cycles, parsing with stacks, and memory optimization.',
    questions: [
      {
        title: 'Alien Dictionary',
        description: 'Given a sorted dictionary of an alien language, find the order of characters using topological sorting.',
        link: 'https://leetcode.com/problems/alien-dictionary/',
        topic: 'Graphs',
        difficulty: 'Hard'
      },
      {
        title: 'Decode String',
        description: 'Given an encoded string, return its decoded string using stacks.',
        link: 'https://leetcode.com/problems/decode-string/',
        topic: 'Stacks',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Slack',
    role: 'SDE Intern',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 medium questions on maps and vectors.',
    technicalRoundExperience: '2 rounds. Round 1: Simplify Path. Round 2: Min Stack. Mostly focused on parsing text and state management.',
    hrRoundExperience: 'Fitment check discussing communication preferences and collaboration styles.',
    overallExperience: 'Excellent and highly organized process. Focuses on writing readable and bug-free stack data structures.',
    preparationTips: 'Master stack data structures, basic string tokenizing, and queue concepts.',
    questions: [
      {
        title: 'Simplify Path',
        description: 'Given an absolute path for a Unix-style file system, simplify it to a canonical path.',
        link: 'https://leetcode.com/problems/simplify-path/',
        topic: 'Stacks',
        difficulty: 'Medium'
      },
      {
        title: 'Min Stack',
        description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
        link: 'https://leetcode.com/problems/min-stack/',
        topic: 'Stacks',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Canva',
    role: 'Backend Engineer',
    status: 'Selected',
    oaExperience: 'CodeSignal OA with 4 questions. Focus on simple data modeling.',
    technicalRoundExperience: '3 rounds. Round 1: Valid Sudoku. Round 2: Group Anagrams. Round 3: Live code design for a image asset management service.',
    hrRoundExperience: 'Discussion on design aesthetics, design tools interest, and remote values.',
    overallExperience: 'Warm and friendly interviewers. Evaluated clean code architecture, modular design, and robust edge cases.',
    preparationTips: 'Study hashing techniques, array validations, and basic object model designs.',
    questions: [
      {
        title: 'Valid Sudoku',
        description: 'Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated.',
        link: 'https://leetcode.com/problems/valid-sudoku/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Group Anagrams',
        description: 'Given an array of strings strs, group the anagrams together.',
        link: 'https://leetcode.com/problems/group-anagrams/',
        topic: 'Strings',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Notion',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'No traditional OA. A take-home code design task implementing a document storage node parser.',
    technicalRoundExperience: '3 rounds. Round 1: Design A Text Editor (Doubly Linked List). Round 2: Edit Distance. Round 3: High-level database architecture for syncing pages.',
    hrRoundExperience: 'Cultural values review. Notion is a detail-oriented product company; they check your passion for quality systems.',
    overallExperience: 'Notion has an interactive and realistic interview structure. They care deeply about document models and efficient operations.',
    preparationTips: 'Practice doubly linked lists, editing distances (DP), and operational transformation logic.',
    questions: [
      {
        title: 'Design A Text Editor',
        description: 'Design a text editor supporting adding text, deleting text, moving cursor, and scrolling.',
        link: 'https://leetcode.com/problems/design-a-text-editor/',
        topic: 'Linked List',
        difficulty: 'Hard'
      },
      {
        title: 'Edit Distance',
        description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
        link: 'https://leetcode.com/problems/edit-distance/',
        topic: 'Dynamic Programming',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'ZoomInfo',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 coding questions on arrays and database matching.',
    technicalRoundExperience: '2 rounds. Round 1: Copy List with Random Pointer. Round 2: Add Two Numbers. Focuses on linked lists, maps, and database indexes.',
    hrRoundExperience: 'Standard behavioral questions, salary discussion, and benefits.',
    overallExperience: 'Standard corporate interviews. Emphasized relational databases, pointers, and memory manipulation.',
    preparationTips: 'Master linked lists (with random pointers), hashing, and index queries.',
    questions: [
      {
        title: 'Copy List with Random Pointer',
        description: 'A linked list of length n is given such that each node contains an additional random pointer. Construct a deep copy.',
        link: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
        topic: 'Linked List',
        difficulty: 'Medium'
      },
      {
        title: 'Add Two Numbers',
        description: 'Given two non-empty linked lists representing two non-negative integers, sum the values.',
        link: 'https://leetcode.com/problems/add-two-numbers/',
        topic: 'Linked List',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Robinhood',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'CodeSignal OA with 4 questions. Heavily focuses on math and matrices.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Stock Spanner using monotonic stacks. Round 2: Best Time to Buy and Sell Stock. Round 3: High concurrency API throttling design.',
    hrRoundExperience: 'Deep dive into security compliance, finance interest, and engineering principles.',
    overallExperience: 'Robinhood has a strong technical team. They evaluate monotonic stacks, array sliding windows, and reliable designs.',
    preparationTips: 'Study monotonic stack patterns, simple greedy array logic, and rate limiting patterns.',
    questions: [
      {
        title: 'Online Stock Spanner',
        description: 'Design a class StockSpanner which collects daily price quotes and returns the span of that quote.',
        link: 'https://leetcode.com/problems/online-stock-spanner/',
        topic: 'Stacks',
        difficulty: 'Medium'
      },
      {
        title: 'Best Time to Buy and Sell Stock',
        description: 'Find the maximum profit you can achieve by buying and selling a stock on different days.',
        link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        topic: 'Arrays',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'Grab',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'Codility OA. 3 coding questions on arrays and greedy scheduling.',
    technicalRoundExperience: '3 rounds. Round 1: Jump Game (greedy). Round 2: Construct Binary Tree from Preorder and Inorder Traversal. Round 3: System Design: Design a taxi dispatch coordinator.',
    hrRoundExperience: 'Cultural alignment review, travel benefits discussion, and salary negotiation.',
    overallExperience: 'Grab\'s interviews test simple greedy approaches, tree reconstructions, and location-based system design.',
    preparationTips: 'Practice trees, greedy approaches, and spatial design databases (like GeoHash).',
    questions: [
      {
        title: 'Jump Game',
        description: 'Given an integer array nums, determine if you are able to reach the last index starting from the first.',
        link: 'https://leetcode.com/problems/jump-game/',
        topic: 'Greedy',
        difficulty: 'Medium'
      },
      {
        title: 'Construct Binary Tree from Preorder and Inorder Traversal',
        description: 'Given two integer arrays preorder and inorder, construct and return the binary tree.',
        link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
        topic: 'Trees',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Razorpay',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 questions: 1 sliding window, 1 DP. Difficulty: Medium.',
    technicalRoundExperience: '2 rounds. Round 1: Longest Increasing Subsequence (DP). Round 2: LCA in a BST + OOP design patterns (Strategy/Factory patterns).',
    hrRoundExperience: 'Standard conversation about fintech interest, engineering values, and compensation.',
    overallExperience: 'Razorpay focuses on solid coding skills, OOP design principles, and standard DP solutions.',
    preparationTips: 'Study standard DP problems (LIS, LCS), BST logic, and learn design patterns.',
    questions: [
      {
        title: 'Longest Increasing Subsequence',
        description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
        link: 'https://leetcode.com/problems/longest-increasing-subsequence/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'CRED',
    role: 'SDE-2',
    status: 'Selected',
    oaExperience: 'No traditional OA. A weekend design assignment creating a scalable billing system.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Maximum Subarray (Kadane\'s). Round 2: Non-overlapping Intervals. Round 3: Machine Coding: Design an in-memory pub-sub messaging system.',
    hrRoundExperience: 'Cultural alignment with high-ownership engineers. Very engaging conversation.',
    overallExperience: 'CRED values clean architecture, low level machine coding, and strong design patterns.',
    preparationTips: 'Focus on machine coding, Kadane\'s algorithms, interval scheduling, and writing test cases.',
    questions: [
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
        link: 'https://leetcode.com/problems/maximum-subarray/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Non-overlapping Intervals',
        description: 'Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.',
        link: 'https://leetcode.com/problems/non-overlapping-intervals/',
        topic: 'Greedy',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Swiggy',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 coding questions on graph BFS, matrix calculations.',
    technicalRoundExperience: '3 rounds. Round 1: Course Schedule II. Round 2: Unique Paths II. Round 3: Low-level design of a food delivery allocation engine.',
    hrRoundExperience: 'Standard HR discussion, career interests, and compensation.',
    overallExperience: 'Strong emphasis on graphs, dynamic programming, and OOP patterns for tracking delivery status.',
    preparationTips: 'Learn topological sorting, grid-based DP, and simple design patterns.',
    questions: [
      {
        title: 'Course Schedule II',
        description: 'Return the ordering of courses you should take to finish all courses using topological sort.',
        link: 'https://leetcode.com/problems/course-schedule-ii/',
        topic: 'Graphs',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Zomato',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank OA. 2 coding questions on recursion and sliding window.',
    technicalRoundExperience: '2 rounds. Round 1: Permutations. Round 2: K Closest Points to Origin. Checked basic recursion tree and heap optimizations.',
    hrRoundExperience: 'Discussed onboarding timeline, company values, and team preferences.',
    overallExperience: 'Straightforward coding interviews. Good focus on heaps, sorting, and recursive search.',
    preparationTips: 'Master sorting algorithms, min/max heaps, and recursion backtracking.',
    questions: [
      {
        title: 'Permutations',
        description: 'Given an array nums of distinct integers, return all the possible permutations.',
        link: 'https://leetcode.com/problems/permutations/',
        topic: 'Backtracking',
        difficulty: 'Medium'
      },
      {
        title: 'K Closest Points to Origin',
        description: 'Given an array of points where points[i] = [xi, yi] and an integer k, return the k closest points to the origin.',
        link: 'https://leetcode.com/problems/k-closest-points-to-origin/',
        topic: 'Heaps',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Flipkart',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 3 questions on advanced DP and string manipulation.',
    technicalRoundExperience: '3 onsite rounds. Round 1: Minimum Window Substring. Round 2: Sliding Window Maximum. Round 3: Machine coding of a catalog system.',
    hrRoundExperience: 'Standard behavioral questions, values compatibility check.',
    overallExperience: 'Flipkart prioritizes machine coding (writing compile-ready object-oriented code) and optimal sliding windows.',
    preparationTips: 'Practice sliding window, string processing, and low-level design templates.',
    questions: [
      {
        title: 'Minimum Window Substring',
        description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s.',
        link: 'https://leetcode.com/problems/minimum-window-substring/',
        topic: 'Strings',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'Paytm',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'Co-cubes online test. Basic MCQ (C, OOPs, SQL) + 2 coding questions.',
    technicalRoundExperience: '2 rounds. Round 1: Linked List Cycle. Round 2: First Missing Positive. Evaluated pointer verification and array indexes.',
    hrRoundExperience: 'Cultural check, location preference, and salary details.',
    overallExperience: 'Straightforward interviews. Prioritized array indexing, cycle validations, and DB indexes.',
    preparationTips: 'Practice Floyd\'s cycle detection, array hashing, and basic indexing.',
    questions: [
      {
        title: 'Linked List Cycle',
        description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
        link: 'https://leetcode.com/problems/linked-list-cycle/',
        topic: 'Linked List',
        difficulty: 'Easy'
      },
      {
        title: 'First Missing Positive',
        description: 'Given an unsorted integer array nums, return the smallest missing positive integer in O(n) time.',
        link: 'https://leetcode.com/problems/first-missing-positive/',
        topic: 'Arrays',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'PhonePe',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank. 3 questions. Monotonic stack and graphs.',
    technicalRoundExperience: '3 rounds. Round 1: Evaluate Reverse Polish Notation using Stacks. Round 2: Implement Queue using Stacks. Round 3: Machine coding of a splitwise-like payment ledger.',
    hrRoundExperience: 'Standard HR check discussing fintech interest and team values.',
    overallExperience: 'Focused on stack parsing, queue management, and modular low-level design structures.',
    preparationTips: 'Practice stack operations, ledger structures, and LLD.',
    questions: [
      {
        title: 'Evaluate Reverse Polish Notation',
        description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.',
        link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
        topic: 'Stacks',
        difficulty: 'Medium'
      },
      {
        title: 'Implement Queue using Stacks',
        description: 'Implement a first in first out (FIFO) queue using only two stacks.',
        link: 'https://leetcode.com/problems/implement-queue-using-stacks/',
        topic: 'Queues',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'Ola',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank OA. 2 questions on arrays and linked lists.',
    technicalRoundExperience: '2 rounds. Round 1: Merge Two Sorted Lists. Round 2: Sort Colors (Dutch National Flag). Checked simple sorting, pointers, and memory layout.',
    hrRoundExperience: 'Standard call focusing on transport tech interest and background.',
    overallExperience: 'Ola focuses on pointer arithmetic, basic array partitioning, and sorting algorithms.',
    preparationTips: 'Study Dutch National Flag, sorting arrays, and simple linked list modifications.',
    questions: [
      {
        title: 'Merge Two Sorted Lists',
        description: 'Merge two sorted linked lists and return it as a sorted list.',
        link: 'https://leetcode.com/problems/merge-two-sorted-lists/',
        topic: 'Linked List',
        difficulty: 'Easy'
      },
      {
        title: 'Sort Colors',
        description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place.',
        link: 'https://leetcode.com/problems/sort-colors/',
        topic: 'Sorting',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Meesho',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'CodeSignal OA with 4 questions. Medium level.',
    technicalRoundExperience: '2 rounds. Round 1: Search Insert Position. Round 2: Maximum Depth of Binary Tree. Conversational rounds testing clean, optimal code.',
    hrRoundExperience: 'Cultural alignment check, team discussion, and salary negotiation.',
    overallExperience: 'Meesho\'s interviews focus on simple searching, sorting, and tree traversal algorithms.',
    preparationTips: 'Practice binary search variations, simple tree recursion, and OOP concepts.',
    questions: [
      {
        title: 'Search Insert Position',
        description: 'Given a sorted array of distinct integers and a target value, return the index if the target is found.',
        link: 'https://leetcode.com/problems/search-insert-position/',
        topic: 'Binary Search',
        difficulty: 'Easy'
      },
      {
        title: 'Maximum Depth of Binary Tree',
        description: 'Given the root of a binary tree, return its maximum depth.',
        link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
        topic: 'Trees',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'Urban Company',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank. 2 coding questions on greedy scheduling.',
    technicalRoundExperience: '2 rounds. Round 1: Gas Station (Greedy). Round 2: Combinations (Backtracking). Evaluated code cleanliness and approach.',
    hrRoundExperience: 'Fitment check discussing marketplace architectures and expectations.',
    overallExperience: 'Clear and well-paced. Checked greedy logic, recursive combinations, and general web fundamentals.',
    preparationTips: 'Learn greedy array traversals, backtracking recursion, and basic APIs.',
    questions: [
      {
        title: 'Gas Station',
        description: 'Given two integer arrays gas and cost, return the starting gas station\'s index if you can travel around the circuit.',
        link: 'https://leetcode.com/problems/gas-station/',
        topic: 'Greedy',
        difficulty: 'Medium'
      },
      {
        title: 'Combinations',
        description: 'Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].',
        link: 'https://leetcode.com/problems/combinations/',
        topic: 'Backtracking',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Groww',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 medium questions on trees and databases.',
    technicalRoundExperience: '2 rounds. Round 1: Binary Tree Zigzag Level Order Traversal. Round 2: Validate BST. Strong focus on binary tree structures and properties.',
    hrRoundExperience: 'Discussed investment platforms interest, timeline, and location details.',
    overallExperience: 'Focused heavily on binary search trees, tree recursion, and database operations.',
    preparationTips: 'Practice zigzag level traversal, validate BST, and simple SQL commands.',
    questions: [
      {
        title: 'Binary Tree Zigzag Level Order Traversal',
        description: 'Given the root of a binary tree, return the zigzag level order traversal of its nodes\' values.',
        link: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/',
        topic: 'Trees',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Zerodha',
    role: 'SDE Intern',
    status: 'Selected',
    oaExperience: 'No traditional OA. Directly reviewed GitHub profile followed by coding challenge.',
    technicalRoundExperience: '2 rounds. Round 1: Maximum Product Subarray. Round 2: Coin Change II. Heavy focus on system scalability, web protocols, and optimization.',
    hrRoundExperience: 'Culture discussion about long-term ownership, bootstrap mentality, and values.',
    overallExperience: 'Exceptional experience. Focused on real-world engineering issues, network protocols, clean code, and basic dynamic programming.',
    preparationTips: 'Practice dynamic programming (coin change, subarrays), HTTP protocols, and build solid GitHub projects.',
    questions: [
      {
        title: 'Maximum Product Subarray',
        description: 'Given an integer array nums, find a subarray that has the largest product and return it.',
        link: 'https://leetcode.com/problems/maximum-product-subarray/',
        topic: 'Arrays',
        difficulty: 'Medium'
      },
      {
        title: 'Coin Change II',
        description: 'Return the number of combinations that make up that amount using the given denominations.',
        link: 'https://leetcode.com/problems/coin-change-ii/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Upstox',
    role: 'Software Engineer',
    status: 'Selected',
    oaExperience: 'Co-cubes online test. MCQs + 2 coding questions.',
    technicalRoundExperience: '2 rounds. Round 1: Pacific Atlantic Water Flow. Round 2: Kth Smallest Element in a BST. Tested graph BFS, tree validations, and database optimization.',
    hrRoundExperience: 'Standard salary discussion, remote policy, and perks.',
    overallExperience: 'Standard trading platform interviews. Evaluated tree searches, graph grids, and database indices.',
    preparationTips: 'Practice DFS/BFS on grids, BST traversal, and SQL queries.',
    questions: [
      {
        title: 'Kth Smallest Element in a BST',
        description: 'Given the root of a binary search tree and an integer k, return the kth smallest value in the BST.',
        link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
        topic: 'Trees',
        difficulty: 'Medium'
      }
    ]
  },
  {
    companyName: 'Nykaa',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 simple coding questions on arrays and trees.',
    technicalRoundExperience: '2 rounds. Round 1: Diameter of Binary Tree. Round 2: Path Sum. Conversational interview checking tree traversals and recursion parameters.',
    hrRoundExperience: 'Standard conversation regarding e-commerce tech interest, relocation, and salary.',
    overallExperience: 'Warm and simple interviews. Emphasized binary tree parameters, recursion trees, and general logic.',
    preparationTips: 'Practice diameter of tree, path sums, tree properties, and simple recursive returns.',
    questions: [
      {
        title: 'Diameter of Binary Tree',
        description: 'Given the root of a binary tree, return the length of the diameter of the tree.',
        link: 'https://leetcode.com/problems/diameter-of-binary-tree/',
        topic: 'Trees',
        difficulty: 'Easy'
      },
      {
        title: 'Path Sum',
        description: 'Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path.',
        link: 'https://leetcode.com/problems/path-sum/',
        topic: 'Trees',
        difficulty: 'Easy'
      }
    ]
  },
  {
    companyName: 'InMobi',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank OA. 3 coding questions on arrays and graphs.',
    technicalRoundExperience: '3 rounds. Round 1: Word Search (backtracking). Round 2: Word Ladder II (DFS/BFS graph). Round 3: LLD of an ad click tracker.',
    hrRoundExperience: 'Standard HR discuss, relocation preferences, and benefits.',
    overallExperience: 'High quality technical interviews. Focuses on matrix backtracking, shortest word transformation pathways, and low latency caching.',
    preparationTips: 'Study backtracking, BFS/DFS transforms, and low latency storage structures.',
    questions: [
      {
        title: 'Word Ladder II',
        description: 'Find all shortest transformation sequences from beginWord to endWord.',
        link: 'https://leetcode.com/problems/word-ladder-ii/',
        topic: 'Graphs',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'Oyo Rooms',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'OA with 2 questions on HackerRank. DP and intervals.',
    technicalRoundExperience: '2 rounds. Round 1: Longest Increasing Path in a Matrix (DP + DFS). Round 2: Merge Intervals. Checked grid search, interval overlap, and OOP design.',
    hrRoundExperience: 'Standard behavioral interview, team expectations, and salary.',
    overallExperience: 'Straightforward. Checked grid traversal DP, sorting overlapping intervals, and memory management.',
    preparationTips: 'Learn DFS on grids with memoization, sorting intervals, and database index.',
    questions: [
      {
        title: 'Longest Increasing Path in a Matrix',
        description: 'Given an m x n integers matrix, return the length of the longest increasing path in the matrix.',
        link: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/',
        topic: 'Dynamic Programming',
        difficulty: 'Hard'
      }
    ]
  },
  {
    companyName: 'ShareChat',
    role: 'SDE-1',
    status: 'Selected',
    oaExperience: 'HackerRank test. 2 medium questions on trees and dynamic programming.',
    technicalRoundExperience: '3 rounds. Round 1: Word Break (DP). Round 2: Serialize and Deserialize Binary Tree. Round 3: High concurrency feed system design.',
    hrRoundExperience: 'Behavioral, discussing scalability interests and compensation.',
    overallExperience: 'High technical bar. Focused on string segmentation DP, serialize trees, and large-scale feed algorithms.',
    preparationTips: 'Practice word break, tree serialization, and caching feed queries.',
    questions: [
      {
        title: 'Word Break',
        description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented.',
        link: 'https://leetcode.com/problems/word-break/',
        topic: 'Dynamic Programming',
        difficulty: 'Medium'
      },
      {
        title: 'Serialize and Deserialize Binary Tree',
        description: 'Design an algorithm to serialize and deserialize a binary tree structure.',
        link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
        topic: 'Trees',
        difficulty: 'Hard'
      }
    ]
  }
];

async function seedDatabase() {
  console.log('🏁 Starting Database Seeding Process...\n');

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in environment variables. Make sure backend/.env is loaded.');
    process.exit(1);
  }

  try {
    // 1. Establish direct Mongoose connection
    console.log(`- Connecting to database...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 2. Fetch or Create standard Seeder User
    const seederEmail = 'seeder@interviewhub.com';
    let seederUser = await mongoose.model('User').findOne({ email: seederEmail });
    
    if (!seederUser) {
      console.log(`- Creating seeder user: ${seederEmail}`);
      const hashedPassword = await bcrypt.hash('SeederPassword123!', 10);
      seederUser = await mongoose.model('User').create({
        name: 'Campus Seeder',
        email: seederEmail,
        password: hashedPassword,
        role: 'student',
        college: 'Indian Institute of Information Technology',
        branch: 'Computer Science',
        graduationYear: 2025,
        isVerified: true
      });
      console.log('✅ Seeder user created.');
    } else {
      console.log('ℹ️ Seeder user already exists.');
    }

    // 3. Clear existing seed data from this specific user
    console.log(`- Purging previous seed experiences and questions...`);
    const existingExperiences = await mongoose.model('Experience').find({ user: seederUser._id });
    const experienceIds = existingExperiences.map(e => e._id);
    
    await mongoose.model('Experience').deleteMany({ user: seederUser._id });
    await mongoose.model('Question').deleteMany({ user: seederUser._id });
    console.log(`✅ Cleared ${existingExperiences.length} old experiences and related questions.`);

    // 4. Inject 50 new Experiences and Questions
    console.log(`- Injecting 50 interview experiences...`);
    let experienceCount = 0;
    let questionCount = 0;

    for (const data of companiesData) {
      const exp = await mongoose.model('Experience').create({
        user: seederUser._id,
        companyName: data.companyName,
        role: data.role,
        interviewDate: new Date('2026-04-15'),
        status: data.status,
        oaExperience: data.oaExperience || '',
        technicalRoundExperience: data.technicalRoundExperience || '',
        hrRoundExperience: data.hrRoundExperience || '',
        overallExperience: data.overallExperience,
        preparationTips: data.preparationTips || '',
        upvotes: []
      });
      experienceCount++;

      if (data.questions && data.questions.length > 0) {
        for (const q of data.questions) {
          await mongoose.model('Question').create({
            experience: exp._id,
            user: seederUser._id,
            title: q.title,
            description: q.description || '',
            link: q.link || '',
            topic: q.topic,
            difficulty: q.difficulty,
            companyName: data.companyName
          });
          questionCount++;
        }
      }
    }

    console.log('\n======================================');
    console.log(`🏆 Database Seeding Completed Successfully!`);
    console.log(`- Experiences Created: ${experienceCount}`);
    console.log(`- Coding Questions Created: ${questionCount}`);
    console.log('======================================');
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedDatabase();
