import { Experience, Question } from '../models/index.js';

// Predefined list of popular tech companies for detection fallback
const standardCompanies = [
  'google', 'amazon', 'microsoft', 'meta', 'netflix', 'apple', 'uber', 
  'tcs', 'infosys', 'wipro', 'adobe', 'goldman sachs', 'flipkart', 
  'atlassian', 'stripe', 'intel', 'nvidia', 'salesforce', 'oracle', 
  'paypal', 'walmart', 'cred', 'meesho', 'zepto', 'blinkit', 'yupptv'
];

export const getAIChatResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message prompt is required.' });
    }

    // 1. Gather all unique company names in the database
    let experiences = [];
    try {
      experiences = await Experience.find({});
    } catch (dbErr) {
      console.warn('Failed to fetch experiences for company detection:', dbErr.message);
    }

    const dbCompanies = experiences.map(e => e.companyName.toLowerCase().trim()).filter(Boolean);
    const allCompanies = [...new Set([...standardCompanies, ...dbCompanies])];

    // 2. Detect which company is mentioned in the user message
    let detectedCompany = null;
    for (const company of allCompanies) {
      const regex = new RegExp(`\\b${company}\\b`, 'i');
      if (regex.test(message)) {
        detectedCompany = company;
        break;
      }
    }

    // 3. Fetch details from the database for the detected company
    let companyExperiences = [];
    let companyQuestions = [];
    if (detectedCompany) {
      try {
        companyExperiences = await Experience.find({
          companyName: { $regex: detectedCompany, $options: 'i' }
        });
        companyQuestions = await Question.find({
          companyName: { $regex: detectedCompany, $options: 'i' }
        });
      } catch (err) {
        console.error('Error querying company records:', err);
      }
    }

    const totalExperiences = companyExperiences.length;
    const selectedCount = companyExperiences.filter(e => e.status === 'Selected').length;
    
    // Group questions by topic
    const topicCounts = {};
    companyQuestions.forEach(q => {
      if (q.topic) {
        topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
      }
    });

    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // 4. Call Google Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        let contextText = '';
        if (detectedCompany) {
          contextText = `
You are the InterviewHub AI Assistant, a helpful and knowledgeable guide for SDE interview preparation.
The student is asking: "${message}".

Here is the real data from our portal's database for the company "${detectedCompany.toUpperCase()}":
- Total interview experiences shared: ${totalExperiences}
- Selected candidates: ${selectedCount} out of ${totalExperiences}
- Most common topics asked: ${topTopics.slice(0, 5).join(', ') || 'No topics recorded'}
- Specific questions recorded: ${companyQuestions.slice(0, 10).map(q => `- "${q.title}" (Topic: ${q.topic}, Difficulty: ${q.difficulty})`).join('\n')}
- Combined preparation tips: ${companyExperiences.slice(0, 5).map(e => e.preparationTips).filter(Boolean).join('; ')}

Please analyze this data and answer the student's question directly.
- Respond in a friendly, conversational Hinglish (Hindi + English mix) or simple English tone.
- If we have data, base your findings on this data first (e.g. "Last experiences ke basis par...").
- If we have no experiences or questions for "${detectedCompany}" in our database, clearly state: "Humare database me abhi ${detectedCompany.toUpperCase()} ke experiences nahi hain, par general preparation ke liye..." and then provide general guidelines for that company.
`;
        } else {
          contextText = `
You are the InterviewHub AI Assistant. The student is asking: "${message}".
Please answer their general SDE/DSA placement preparation questions in a friendly, motivational Hinglish or English tone.
Suggest that they ask about specific companies (like Google, Amazon, Microsoft) to see detailed database stats.
`;
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: contextText }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          const aiResponse = geminiData.contents?.[0]?.parts?.[0]?.text;
          if (aiResponse) {
            return res.status(200).json({ response: aiResponse });
          }
        }
        console.warn('Gemini API call returned non-ok status or empty body, falling back to local aggregator.');
      } catch (aiErr) {
        console.error('Failed to query Gemini API:', aiErr.message);
      }
    }

    // 5. Local Resilient Fallback (Mock AI Aggregation)
    let fallbackText = '';
    if (detectedCompany) {
      const companyUpper = detectedCompany.toUpperCase();
      if (totalExperiences > 0) {
        const selectionRate = Math.round((selectedCount / totalExperiences) * 100);
        const popularTopics = topTopics.length > 0 ? topTopics.slice(0, 3).join(', ') : 'Data Structures & Algorithms';
        
        fallbackText = `Humare portal ke **${totalExperiences} ${companyUpper} experiences** ke analysis ke mutabik:

1. **Sabse common topics:** **${popularTopics}** se sabse zyada sawal puche jate hain.
2. **Selection rate:** Shared experiences me selection rate lagbhag **${selectionRate}%** hai.
3. **Important Questions:**
${companyQuestions.slice(0, 3).map(q => `- **${q.title}** (${q.topic} - ${q.difficulty})`).join('\n') || '- LeetCode Medium/Hard graphs and tree questions.'}

💡 **Quick Tip:** ${companyUpper} interviews ke liye basics, time complexity verification aur code simulation par focus karein.`;
      } else {
        fallbackText = `Humare database me abhi **${companyUpper}** ka koi experience ya question recorded nahi hai. 

Par general records ke mutabik:
- **${companyUpper}** ke DSA rounds me **Arrays, Dynamic Programming, Trees aur Graphs** ke questions standard hote hain.
- Coding ke sath code complexity explain karna aur dry-run karna zaroori hai.

Aap portal par naya experience add karke community ki help kar sakte hain!`;
      }
    } else {
      fallbackText = `Hello! Main InterviewHub AI Bot hoon. Main portal ke experiences analyze karke batata hoon kis company me kya pucha jata hai.

Aap mujhse aise sawaal pooch sakte hain:
- *"Amazon me DSA round me kya puchte hain?"*
- *"Google interview ke liye important topics?"*
- *"What is asked in YuppTV interviews?"*

Please company ka naam mention karein taaki main database search kar sakoon!`;
    }

    res.status(200).json({ response: fallbackText });
  } catch (error) {
    console.error('AIChat Error:', error);
    res.status(500).json({ message: 'Server error generating AI response.' });
  }
};
