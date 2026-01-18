-- Create user_preferences table for storing user settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'auto',
  date_format TEXT NOT NULL DEFAULT 'iso8601' CHECK (date_format IN ('iso8601', 'us', 'eu')),
  time_format TEXT NOT NULL DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  inactivity_timeout_minutes INTEGER NOT NULL DEFAULT 30 CHECK (inactivity_timeout_minutes IN (15, 30, 60, 120)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.user_preferences IS 'User-level preferences for display, regional settings, and session behavior';

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read their own preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();