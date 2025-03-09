
import { cn } from "@/lib/utils";

interface BetsterLogoProps {
  className?: string;
}

const BetsterLogo = ({ className }: BetsterLogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-betster-300 to-betster-600 bg-clip-text text-transparent">
        NUMBET
      </span>
    </div>
  );
};

export default BetsterLogo;
