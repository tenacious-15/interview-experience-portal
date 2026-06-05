import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

// Pre-seeded initial data structure
const getInitialData = () => {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Password123', adminSalt);
  
  const studentSalt = bcrypt.genSaltSync(10);
  const studentPasswordHash = bcrypt.hashSync('Password123', studentSalt);

  const adminId = 'u_admin_99999';
  const studentId1 = 'u_student_11111';
  const studentId2 = 'u_student_22222';
  const expId1 = 'e_google_88888';
  const expId2 = 'e_meta_77777';

  return {
    users: [
      {
        _id: adminId,
        name: 'Admin Moderator',
        email: 'admin@interview.com',
        password: adminPasswordHash,
        role: 'admin',
        college: 'National Institute of Technology',
        branch: 'Information Technology',
        graduationYear: 2025,
        currentCompany: 'Google',
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: studentId1,
        name: 'Rahul Sharma',
        email: 'student@interview.com',
        password: studentPasswordHash,
        role: 'student',
        college: 'Indian Institute of Technology, Delhi',
        branch: 'Computer Science',
        graduationYear: 2026,
        currentCompany: '',
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: studentId2,
        name: 'Ananya Goel',
        email: 'ananya@gmail.com',
        password: studentPasswordHash,
        role: 'student',
        college: 'Delhi Technological University',
        branch: 'Software Engineering',
        graduationYear: 2025,
        currentCompany: 'Microsoft',
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ],
    experiences: [
      {
        _id: expId1,
        user: studentId1,
        companyName: 'Google',
        role: 'Software Engineering Intern',
        interviewDate: '2026-04-10',
        status: 'Selected',
        oaExperience: 'The Online Assessment consisted of 2 coding questions on Codeforces Div2 C/D level. First question was on sliding window (medium) and the second was a tree DP question (hard). Cleared both test cases in 45 minutes.',
        technicalRoundExperience: 'Round 1 (Coding): Focused on graph algorithms. I was asked to find the shortest path with dynamic weights. Solved it using Dijkstra with a priority queue. Interviewer was very helpful and pushed me to optimize space complexity.\n\nRound 2 (Coding): Design a rate limiter system (behavioral + coding). Wrote a token bucket algorithm in Java. We discussed edge cases like multi-threading.',
        hrRoundExperience: 'Googleyness Round: Standard situational questions. They asked how I resolved a conflict in my college project team and a time when I took the lead on a challenging task.',
        overallExperience: 'Highly positive. The interviewers were extremely friendly and cooperative. Make sure to voice your thought process clearly throughout.',
        preparationTips: 'Focus on Graphs, Dynamic Programming, and System Design basics. Codeforces practice really helped build speed. Solve the Google tag questions on LeetCode.',
        upvotes: [adminId, studentId2],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: expId2,
        user: studentId2,
        companyName: 'Meta',
        role: 'Production Engineer SDE-1',
        interviewDate: '2026-05-15',
        status: 'Selected',
        oaExperience: 'Meta does not usually have a standard OA for this role; I was directly contacted by a recruiter and scheduled for a phone screen.',
        technicalRoundExperience: 'Round 1 (Systems + Coding): 20 minutes Linux commands and systems theory, followed by a LeetCode Medium question (Binary Tree Vertical Order Traversal). Solved tree traversal in time.\n\nRound 2 (Networking & OS): Depth discussions on TCP/IP handshake, DNS lookup steps, virtual memory, and process vs threads. Also wrote a bash script to parse access logs.',
        hrRoundExperience: 'Standard behavioral questions. Discussed career goals, alignment with Meta core values, and past internship projects.',
        overallExperience: 'Challenging systems questions, but coding was standard LeetCode. Make sure your OS and networking concepts are rock solid.',
        preparationTips: 'Read "Operating System Concepts" by Galvin. Practice Linux debugging tools like lsof, strace, and tcpdump.',
        upvotes: [studentId1],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    questions: [
      {
        _id: 'q_g1',
        experience: expId1,
        user: studentId1,
        title: 'Evaluate Division',
        description: 'Equations are given in the format A / B = k. Find the answers for queries.',
        link: 'https://leetcode.com/problems/evaluate-division/',
        topic: 'Graphs',
        difficulty: 'Medium',
        companyName: 'Google',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'q_g2',
        experience: expId1,
        user: studentId1,
        title: 'Binary Tree Maximum Path Sum',
        description: 'Find the maximum path sum of any non-empty path in a binary tree.',
        link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
        topic: 'Trees',
        difficulty: 'Hard',
        companyName: 'Google',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'q_m1',
        experience: expId2,
        user: studentId2,
        title: 'Binary Tree Vertical Order Traversal',
        description: 'Given the root of a binary tree, return the vertical order traversal of its nodes values.',
        link: 'https://leetcode.com/problems/binary-tree-vertical-order-traversal/',
        topic: 'Trees',
        difficulty: 'Medium',
        companyName: 'Meta',
        createdAt: new Date().toISOString()
      }
    ],
    tips: [
      {
        _id: 't1',
        user: adminId,
        title: 'Mastering System Design for SDE-1 Roles',
        content: 'Many students ignore system design, but tech majors are starting to ask basic architectural questions. Focus on: load balancers, caching strategies, vertical vs horizontal scaling, SQL vs NoSQL trade-offs, and microservices concepts. Draw clean flowcharts.',
        category: 'System Design',
        upvotes: [studentId1, studentId2],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 't2',
        user: studentId2,
        title: 'How to write a Resume that gets Shortlisted',
        content: 'Use the STAR methodology (Situation, Task, Action, Result) for all project descriptions. Quantify your results (e.g. "reduced latency by 30%", "handled 10k+ requests"). Keep it strictly to 1 page, use clean single-column templates like Deedy or Jake Resume.',
        category: 'Resume',
        upvotes: [studentId1],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    comments: [
      {
        _id: 'c1',
        user: studentId2,
        experience: expId1,
        text: 'Congrats Rahul! This is an awesome achievement. Did you get any follow-up questions in the Rate Limiter design round regarding distributed rate limiting?',
        parentComment: null,
        upvotes: [studentId1],
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c2',
        user: studentId1,
        experience: expId1,
        text: 'Thanks Ananya! Yes, we briefly discussed Redis sorted sets for the sliding window log rate limiting approach in a distributed cluster. It was mostly conceptual though.',
        parentComment: 'c1',
        upvotes: [],
        createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
};

class MockDb {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = getInitialData();
        this.saveSync();
      }
    } catch (error) {
      console.error('Error loading mock database file, using in-memory initialization:', error);
      this.data = getInitialData();
    }
  }

  saveSync() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing to mock database file:', error);
    }
  }

  async save() {
    return new Promise((resolve) => {
      try {
        fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8', (err) => {
          if (err) console.error('Error writing to mock database file asynchronously:', err);
          resolve();
        });
      } catch (error) {
        console.error('Error writing to mock database file:', error);
        resolve();
      }
    });
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  // Mimics a collection's query interface
  collection(name) {
    const self = this;
    const items = this.getCollection(name);

    // Deep clone helper
    const clone = (obj) => {
      if (!obj) return obj;
      return JSON.parse(JSON.stringify(obj));
    };

    // Populate helper
    const applyPopulate = (item, populatePaths) => {
      const itemCopy = clone(item);
      for (const pathOpt of populatePaths) {
        let field = pathOpt;
        let select = null;
        if (typeof pathOpt === 'object') {
          field = pathOpt.path;
          select = pathOpt.select;
        }

        const foreignId = itemCopy[field];
        if (foreignId) {
          let refCol = null;
          if (field === 'user') refCol = 'users';
          else if (field === 'experience') refCol = 'experiences';
          else if (field === 'parentComment') refCol = 'comments';

          if (refCol) {
            const refItems = self.getCollection(refCol);
            const found = refItems.find(x => x._id === foreignId);
            if (found) {
              let foundClone = clone(found);
              if (select) {
                // simple select emulator (e.g. "name email -password")
                const fields = select.split(' ');
                const selection = {};
                const excludes = fields.filter(f => f.startsWith('-')).map(f => f.slice(1));
                const includes = fields.filter(f => !f.startsWith('-') && f !== '');

                if (excludes.length > 0) {
                  for (const key of Object.keys(foundClone)) {
                    if (excludes.includes(key)) {
                      delete foundClone[key];
                    }
                  }
                } else if (includes.length > 0) {
                  const filtered = {};
                  filtered._id = foundClone._id;
                  for (const key of includes) {
                    if (foundClone[key] !== undefined) {
                      filtered[key] = foundClone[key];
                    }
                  }
                  foundClone = filtered;
                }
              }
              itemCopy[field] = foundClone;
            }
          }
        }
      }
      return itemCopy;
    };

    // Query Class to chain methods like Mongoose
    class Query {
      constructor(filteredItems) {
        this.results = filteredItems;
        this.populatePaths = [];
        this.sortFields = null;
        this.skipVal = 0;
        this.limitVal = null;
      }

      populate(pathOption, selectOption) {
        this.populatePaths.push(typeof pathOption === 'object' ? pathOption : { path: pathOption, select: selectOption });
        return this;
      }

      sort(sortObj) {
        this.sortFields = sortObj;
        return this;
      }

      skip(val) {
        this.skipVal = parseInt(val) || 0;
        return this;
      }

      limit(val) {
        this.limitVal = parseInt(val) || null;
        return this;
      }

      // Executes the query and returns a promise
      async exec() {
        let list = clone(this.results);

        // Sorting
        if (this.sortFields) {
          let fields = [];
          let dirs = [];
          if (typeof this.sortFields === 'string') {
            const parts = this.sortFields.split(' ');
            for (const p of parts) {
              if (p.startsWith('-')) {
                fields.push(p.slice(1));
                dirs.push(-1);
              } else {
                fields.push(p);
                dirs.push(1);
              }
            }
          } else {
            for (const [k, v] of Object.entries(this.sortFields)) {
              fields.push(k);
              dirs.push(v === 'desc' || v === -1 ? -1 : 1);
            }
          }

          list.sort((a, b) => {
            for (let i = 0; i < fields.length; i++) {
              const f = fields[i];
              const d = dirs[i];
              let valA = a[f];
              let valB = b[f];
              if (f.includes('.')) {
                // simple nested field sort (e.g. user.name)
                const parts = f.split('.');
                valA = a[parts[0]] ? a[parts[0]][parts[1]] : undefined;
                valB = b[parts[0]] ? b[parts[0]][parts[1]] : undefined;
              }
              
              if (valA === undefined) continue;
              if (valB === undefined) continue;

              if (typeof valA === 'string') {
                const cmp = valA.localeCompare(valB);
                if (cmp !== 0) return cmp * d;
              } else {
                if (valA < valB) return -1 * d;
                if (valA > valB) return 1 * d;
              }
            }
            return 0;
          });
        }

        // Apply populate on results
        if (this.populatePaths.length > 0) {
          list = list.map(item => applyPopulate(item, this.populatePaths));
        }

        // Skip & Limit
        if (this.skipVal > 0) {
          list = list.slice(this.skipVal);
        }
        if (this.limitVal !== null) {
          list = list.slice(0, this.limitVal);
        }

        return list;
      }

      // Supports thenable for direct await
      then(resolve, reject) {
        return this.exec().then(resolve, reject);
      }
    }

    return {
      find(filter = {}) {
        let filtered = items;
        if (filter && Object.keys(filter).length > 0) {
          filtered = items.filter(item => {
            for (const [key, value] of Object.entries(filter)) {
              // Regex search emulation (e.g. for search queries)
              if (value && typeof value === 'object' && value.$regex) {
                const flags = value.$options || 'i';
                const regex = new RegExp(value.$regex, flags);
                if (!regex.test(item[key])) return false;
              } else if (Array.isArray(value)) {
                // check intersection or equality
                if (!item[key] || !Array.isArray(item[key])) return false;
              } else if (value && typeof value === 'object' && value.$in) {
                if (!Array.isArray(value.$in)) return false;
                // check if item[key] is in $in array
                if (!value.$in.includes(item[key])) return false;
              } else {
                if (item[key] !== value) return false;
              }
            }
            return true;
          });
        }
        return new Query(filtered);
      },

      findOne(filter = {}) {
        const results = this.find(filter).results;
        const found = results.length > 0 ? results[0] : null;
        
        class SingleQuery {
          constructor(item) {
            this.item = item;
            this.populatePaths = [];
          }
          populate(pathOption, selectOption) {
            this.populatePaths.push(typeof pathOption === 'object' ? pathOption : { path: pathOption, select: selectOption });
            return this;
          }
          async exec() {
            if (!this.item) return null;
            let itemCopy = clone(this.item);
            if (this.populatePaths.length > 0) {
              itemCopy = applyPopulate(itemCopy, this.populatePaths);
            }
            // Add custom save helper to single object returned
            return self.wrapInstance(name, itemCopy);
          }
          then(resolve, reject) {
            return this.exec().then(resolve, reject);
          }
        }
        return new SingleQuery(found);
      },

      findById(id) {
        return this.findOne({ _id: id });
      },

      async create(data) {
        const newDoc = {
          _id: generateId(),
          ...clone(data),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        items.push(newDoc);
        await self.save();
        return self.wrapInstance(name, newDoc);
      },

      async findByIdAndUpdate(id, updates, options = { new: true }) {
        const index = items.findIndex(x => x._id === id);
        if (index === -1) return null;

        // handle mongoose $push or $pull operators
        const currentItem = items[index];
        const updatedItem = { ...currentItem, updatedAt: new Date().toISOString() };

        if (updates.$push) {
          for (const [k, v] of Object.entries(updates.$push)) {
            if (!Array.isArray(updatedItem[k])) updatedItem[k] = [];
            updatedItem[k].push(v);
          }
          delete updates.$push;
        }

        if (updates.$pull) {
          for (const [k, v] of Object.entries(updates.$pull)) {
            if (Array.isArray(updatedItem[k])) {
              updatedItem[k] = updatedItem[k].filter(x => x !== v);
            }
          }
          delete updates.$pull;
        }

        // Apply regular updates
        Object.assign(updatedItem, clone(updates));

        items[index] = updatedItem;
        await self.save();
        return self.wrapInstance(name, options.new ? updatedItem : currentItem);
      },

      async findByIdAndDelete(id) {
        const index = items.findIndex(x => x._id === id);
        if (index === -1) return null;
        const deleted = items.splice(index, 1)[0];
        await self.save();
        return deleted;
      },

      async countDocuments(filter = {}) {
        const results = this.find(filter).results;
        return results.length;
      }
    };
  }

  // Wrap a raw data object with helper methods (like .save() and .remove())
  wrapInstance(collectionName, rawData) {
    if (!rawData) return null;
    const self = this;
    const items = this.getCollection(collectionName);
    
    // Create an instance-like object
    const instance = { ...rawData };
    
    // Save method
    instance.save = async function() {
      const idx = items.findIndex(x => x._id === this._id);
      const dataToSave = {};
      
      // Filter out functions
      for (const [k, v] of Object.entries(this)) {
        if (typeof v !== 'function') {
          dataToSave[k] = v;
        }
      }
      
      dataToSave.updatedAt = new Date().toISOString();
      
      if (idx !== -1) {
        items[idx] = dataToSave;
      } else {
        items.push(dataToSave);
      }
      await self.save();
      return this;
    };

    return instance;
  }
}

// Singleton database instance
export const mockDbInstance = new MockDb();
