require('dotenv').config();
const axios = require('axios');

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const prompt = `You are an expert HR tech analyst. Analyze the following resume and identify the key skills, experiences, and qualifications. Based on this analysis, suggest 5-6 suitable job roles that the person could fit into.
        - **Resume Text**: """Test Resume"""
        - **User's Profile Skills**: Not specified
        Return ONLY a valid JSON object with the structure: { "suitable_roles": ["string"], "improvement_suggestions": ["string"], "job_match_score": number }`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4000',
          'X-Title': 'CareerForge'
        }
      }
    );
    console.log("Success:");
    console.log(response.data.choices[0].message.content);
  } catch (err) {
    console.error("Error:");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
test();
