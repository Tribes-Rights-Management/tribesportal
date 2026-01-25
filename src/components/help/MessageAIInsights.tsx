import { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, MessageSquare, Copy, Check } from 'lucide-react';
import { analyzeMessage } from '@/lib/ai-message-analysis';
import { AppButton, AppCard, AppCardBody } from '@/components/app-ui';

interface MessageAIInsightsProps {
  message: string;
  senderName: string;
  subject: string | null;
}

interface MessageAnalysis {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedCategory: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  topics: string[];
  draftResponse: string;
  reasoning: string;
  confidence: number;
}

export function MessageAIInsights({ message, senderName, subject }: MessageAIInsightsProps) {
  const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    analyzeMessageContent();
  }, [message]);

  async function analyzeMessageContent() {
    setLoading(true);
    try {
      const result = await analyzeMessage(message, senderName, subject);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze message:', error);
    } finally {
      setLoading(false);
    }
  }

  async function copyDraftResponse() {
    if (analysis?.draftResponse) {
      await navigator.clipboard.writeText(analysis.draftResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-[var(--error-text)]';
      case 'high': return 'text-[var(--warning-text)]';
      case 'medium': return 'text-muted-foreground';
      case 'low': return 'text-[var(--success-text)]';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-[var(--success-text)]';
      case 'neutral': return 'text-muted-foreground';
      case 'negative': return 'text-[var(--warning-text)]';
      case 'frustrated': return 'text-[var(--error-text)]';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <AppCard>
        <AppCardBody>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Analyzing message with AI...</span>
          </div>
        </AppCardBody>
      </AppCard>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Insights Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-medium">AI Insights</h3>
        <span className="text-xs text-muted-foreground">
          {analysis.confidence}% confidence
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <AppCard>
          <AppCardBody className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Priority
              </span>
            </div>
            <p className={`text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
              {analysis.priority.charAt(0).toUpperCase() + analysis.priority.slice(1)}
            </p>
          </AppCardBody>
        </AppCard>

        <AppCard>
          <AppCardBody className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Sentiment
              </span>
            </div>
            <p className={`text-sm font-medium ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
            </p>
          </AppCardBody>
        </AppCard>
      </div>

      {/* Category & Topics */}
      <AppCard>
        <AppCardBody className="p-3 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Suggested Category
            </p>
            <p className="text-sm font-medium">{analysis.suggestedCategory}</p>
          </div>
          
          {analysis.topics.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Key Topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: 'hsl(var(--muted))',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </AppCardBody>
      </AppCard>

      {/* AI Reasoning */}
      <AppCard>
        <AppCardBody className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            AI Reasoning
          </p>
          <p className="text-sm">{analysis.reasoning}</p>
        </AppCardBody>
      </AppCard>

      {/* Draft Response */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              AI-Generated Response Draft
            </span>
          </div>
          <AppButton
            intent="ghost"
            size="sm"
            onClick={copyDraftResponse}
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </AppButton>
        </div>
        
        <AppCard>
          <AppCardBody className="p-3">
            <p className="text-sm whitespace-pre-wrap">{analysis.draftResponse}</p>
          </AppCardBody>
        </AppCard>
        
        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Review and edit before sending. AI-generated content should be verified.
        </p>
      </div>
    </div>
  );
}
