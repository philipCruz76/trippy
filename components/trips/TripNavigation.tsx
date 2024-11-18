type TripNavigationProps = {
  onNavigate: (section: string) => void;
  activeSection: string;
};

const TripNavigation = ({ onNavigate, activeSection }: TripNavigationProps) => {
  const sections = ["Overview", "Itinerary", "Locations"];
  
  return (
    <div className="sticky z-50 overflow-hidden h-[48px] top-[64px] bg-white/80 backdrop-blur-md ">
      <div className="scrollbar-hide flex h-full overflow-x-scroll bg-transparent scroll-smooth">
        <ul className="flex shrink-0 grow items-end gap-1.5 border-b border-separator sm:gap-2.5 font-normal">
          {sections.map((section) => (
            <li key={section}>
              <button
                onClick={() => onNavigate(section)}
                className={`-mb-px block border-b-2 px-2 py-1.5 hover:text-foreground ${
                  activeSection === section
                    ? "border-current text-foreground"
                    : "text-zinc-400 border-transparent"
                }`}
              >
                <span>{section}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TripNavigation; 