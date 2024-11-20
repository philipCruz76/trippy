import { cn } from "@/lib/utils";

type TripNavigationProps = {
  onNavigate: (section: string) => void;
  activeSection: string;
};

const TripNavigation = ({ onNavigate, activeSection }: TripNavigationProps) => {
  const sections = ["Overview", "Itinerary", "Locations"];
  
  return (
    <div className="sticky z-50 overflow-hidden h-[48px] top-[64px] bg-white/80 backdrop-blur-md transition-all duration-300 shadow-sm">
      <div className="scrollbar-hide flex h-full overflow-x-scroll bg-transparent scroll-smooth">
        <ul className="flex shrink-0 grow items-end gap-1.5 border-b border-separator sm:gap-2.5 font-normal">
          {sections.map((section) => (
            <li key={section}>
              <button
                onClick={() => {
                  onNavigate(section)
                }}
                className={cn(
                  "-mb-px block border-b-2 px-4 py-2 transition-all duration-200",
                  "hover:text-foreground relative",
                  activeSection === section
                    ? "border-primary text-primary font-medium"
                    : "text-zinc-400 border-transparent hover:text-zinc-600",
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5",
                  activeSection === section
                    ? "after:bg-primary"
                    : "after:bg-transparent"
                )}
              >
                <span className="relative z-10">{section}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TripNavigation; 