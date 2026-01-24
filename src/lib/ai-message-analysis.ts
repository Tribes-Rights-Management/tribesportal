/**
 * AI MESSAGE ANALYSIS — LOVABLE AI GATEWAY
 * 
 * Uses Lovable AI Gateway to analyze support messages and provide:
 * - Priority detection (urgent/high/medium/low)
 * - Category suggestions
 * - Sentiment analysis
 * - Topic extraction
 * - Response drafts
 */

import { supabase } from '@/integrations/supabase/client';

export interface MessageAnalysis {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedCategory: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  topics: string[];
  draftResponse: string;
  reasoning: string;
  confidence: number;
}

interface AnalysisOptions {
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
    companyName = 'Tribes Rights Management',
    responseStyle = 'professional',
  } = options;

  try {
    const { data, error } = await supabase.functions.invoke('analyze-message', {
      body: {
        message,
        senderName,
        subject,
        companyName,
        responseStyle,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze message');
    }

    // Check for error response from the function
    if (data?.error) {
      throw new Error(data.error);
    }

    return data as MessageAnalysis;
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
