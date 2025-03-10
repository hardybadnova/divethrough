
import React from "react";
import { useNavigate } from "react-router-dom";

interface MobileNavigationProps {}

const MobileNavigation: React.FC<MobileNavigationProps> = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-3">
          <button
            className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mb-1"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>

          <button
            className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground"
            onClick={() => navigate("/milestones")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mb-1"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span>Milestones</span>
          </button>

          <button className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mb-1"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
