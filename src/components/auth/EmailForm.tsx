interface EmailFormProps {
  email: string;
  onChange: (email: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * EmailForm - Email input form for auth surface
 * 
 * LOCKED DESIGN TOKENS:
 * - Field label: 14px, font-medium, color #111
 * - Input: height 48px, radius 10px, px-4, border #D1D1D6, focus ring black/20
 * - Primary button: height 48px, radius 10px, bg #111111, text white, font-medium, 15px, px-6, centered
 */
export function EmailForm({ email, onChange, onSubmit, isSubmitting }: EmailFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="text-[14px] font-medium block text-[#111]"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          className="w-full h-[48px] px-4 text-[15px] rounded-[10px] bg-white border border-[#D1D1D6] text-[#111] placeholder:text-[#9CA3AF] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-black/20 focus:border-transparent"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-[48px] flex items-center justify-center px-6 rounded-[10px] bg-[#111111] text-white text-[15px] font-medium transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Continue"}
      </button>
    </form>
  );
}
