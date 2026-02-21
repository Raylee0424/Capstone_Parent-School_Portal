import { AboutChildNavbar } from "@/components/parent/AboutChildNavbar";
import { NavbarParent } from "@/components/parent/NavbarParent";

export const QuarterlyGrades = () => {
	return (
    <div className="min-h-screen bg-white">
      <NavbarParent />
      <AboutChildNavbar activeTab="quarterly-grades" />
    </div>
  );
}