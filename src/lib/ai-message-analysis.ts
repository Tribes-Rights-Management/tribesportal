/**
 * AI MESSAGE ANALYSIS — CLAUDE-POWERED SUPPORT INTELLIGENCE
 * 
 * Uses Claude API to analyze support messages and provide:
 * - Priority detection (urgent/high/medium/low)
 * - Category suggestions
 * - Sentiment analysis
 * - Topic extraction
 * - Response drafts
 */

interface MessageAnalysis {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedCategory: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  topics: string[];
  draftResponse: string;
  reasoning: string;
  confidence: number;
}

interface AnalysisOptions {
  knowledgeBase?: string[]; // Relevant help articles
  companyName?: string;
  responseStyle?: 'formal' | 'friendly' | 'professional';
}

export async function analyzeMessage(
  message: string,
  senderName: string,
  subject: string | null,
  options: AnalysisOptions = {}
): Promise<MessageAnalysis> {
  const {
    knowledgeBase = [],
    companyName = 'Tribes Rights Management',
    responseStyle = 'professional',
  } = options;

  const prompt = `You are analyzing a customer support message for ${companyName}, a music publishing rights management platform.

MESSAGE DETAILS:
From: ${senderName}
Subject: ${subject || 'No subject'}
Message:
${message}

${knowledgeBase.length > 0 ? `AVAILABLE HELP ARTICLES:
${knowledgeBase.join('\n')}
` : ''}

Analyze this message and provide a JSON response with:

1. **priority** (string): One of: "urgent", "high", "medium", "low"
   - urgent: System down, data loss, security issue, angry escalation
   - high: Important feature not working, blocking work, payment issues
   - medium: Questions about features, how-to requests, minor bugs
   - low: General questions, feature requests, feedback

2. **suggestedCategory** (string): Best category for this message
   - Options: "Technical Support", "Billing", "Account", "Feature Request", "Bug Report", "General Question", "Feedback"

3. **sentiment** (string): One of: "positive", "neutral", "negative", "frustrated"

4. **topics** (array of strings): Key topics/themes in the message (max 3)

5. **draftResponse** (string): A ${responseStyle} response draft that:
   - Acknowledges their message
   - Addresses their concern
   - Provides helpful information or next steps
   - Maintains ${companyName}'s institutional, professional tone
   - Is ready for a human to review and send

6. **reasoning** (string): Brief explanation of your priority/category decision

7. **confidence** (number): 0-100, how confident you are in this analysis

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    // Parse JSON response
    const analysis: MessageAnalysis = JSON.parse(content);
    
    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis if AI fails
    return {
      priority: 'medium',
      suggestedCategory: 'General Question',
      sentiment: 'neutral',
      topics: ['Support Request'],
      draftResponse: `Hi ${senderName},\n\nThank you for reaching out to ${companyName}. We've received your message and a team member will review it shortly.\n\nBest regards,\n${companyName} Support Team`,
      reasoning: 'AI analysis unavailable - using default values',
      confidence: 0,
    };
  }
}

/**
 * Get knowledge base articles relevant to a message
 */
export async function getRelevantArticles(
  message: string,
  limit: number = 5
): Promise<string[]> {
  // This would search your help_articles table
  // For now, return empty array - implement with vector search later
  return [];
}
