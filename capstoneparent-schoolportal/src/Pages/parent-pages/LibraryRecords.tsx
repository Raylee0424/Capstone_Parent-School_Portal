import { AboutChildNavbar } from "@/components/parent/AboutChildNavbar";
import { NavbarParent } from "@/components/parent/NavbarParent";

export const LibraryRecords = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavbarParent />
      <AboutChildNavbar activeTab="library-records" />
    </div>
  );
}