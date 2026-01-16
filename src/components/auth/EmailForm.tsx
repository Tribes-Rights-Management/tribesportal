interface EmailFormProps {
  email: string;
  onChange: (email: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * EmailForm - Email input form for auth surface
 * Premium institutional styling, light mode only
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
          className="text-[14px] font-medium block text-black/85"
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
          className="w-full h-[44px] px-3.5 text-[15px] rounded-[10px] bg-white border border-black/10 text-black/90 placeholder:text-black/35 outline-none transition-shadow duration-150 focus:ring-1 focus:ring-black/20"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || !email.trim()}
        className="w-full h-[44px] inline-flex items-center justify-center text-center px-4 rounded-[12px] bg-[#111111] text-white text-[15px] font-semibold leading-[20px] tracking-[-0.01em] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
      >
        <span className="text-center">{isSubmitting ? "Sending..." : "Continue"}</span>
      </button>
    </form>
  );
}
