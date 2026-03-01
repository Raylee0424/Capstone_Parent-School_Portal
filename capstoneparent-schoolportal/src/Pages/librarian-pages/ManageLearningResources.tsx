import { NavbarLibrarian } from "@/components/librarian/NavbarLibrarian";
import AddLearningResourceModal from "@/components/librarian/AddLearningResourceModal";
import EditLearningResourceModal from "@/components/librarian/EditLearningResourceModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface Resource {
  id: string;
  title: string;
  category: string;
  gradeLevel: string;
}

interface CategoryResponse {
  category_id: number;
  category_name: string;
}

const FALLBACK_CATEGORY_OPTIONS = ["Map", "Game", "Infographic"];
const GRADE_OPTIONS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"];

const resourcesData: Resource[] = [
  { id: "1", title: "World Map", category: "Map", gradeLevel: "Grade 2" },
  { id: "2", title: "Philippine Map", category: "Map", gradeLevel: "Grade 2" },
  { id: "3", title: "Chess Board", category: "Game", gradeLevel: "Grade 1" },
  { id: "4", title: "Scrabble Board", category: "Game", gradeLevel: "Grade 3" },
  { id: "5", title: "Water Cycle Formation", category: "Infographic", gradeLevel: "Grade 2" },
];

export const ManageLearningResources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [isAddLearningResourceModalOpen, setIsAddLearningResourceModalOpen] = useState(false);
  const [isEditLearningResourceModalOpen, setIsEditLearningResourceModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>(resourcesData);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORY_OPTIONS);

  const categories = ["all", ...categoryOptions];
  const grades = ["all", ...GRADE_OPTIONS];

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/library/categories");
        if (!response.ok) {
          return;
        }

        const payload: { data?: CategoryResponse[] } = await response.json();
        const backendCategories = (payload.data ?? [])
          .map((item) => item.category_name?.trim())
          .filter((name): name is string => Boolean(name));

        const uniqueCategories = Array.from(new Set(backendCategories));
        if (isMounted && uniqueCategories.length > 0) {
          setCategoryOptions(uniqueCategories);
        }
      } catch {
        // Keep fallback categories on error.
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || r.category === categoryFilter;
    const matchesGrade =
      gradeFilter === "all" || r.gradeLevel === gradeFilter;
    return matchesSearch && matchesCategory && matchesGrade;
  });

  const handleAddResources = (newResource: Omit<Resource, "id">) => {
    setResources((previousResources) => {
      return [
        ...previousResources,
        {
          id: `${Date.now()}`,
          ...newResource,
        },
      ];
    });
  };

  const selectedResource = resources.find((resource) => resource.id === selectedResourceId);

  const handleOpenEditLearningResourceModal = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setIsEditLearningResourceModalOpen(true);
  };

  const handleCloseEditLearningResourceModal = () => {
    setIsEditLearningResourceModalOpen(false);
    setSelectedResourceId(null);
  };

  const handleSaveEditedResource = (updatedResource: Omit<Resource, "id">) => {
    if (!selectedResourceId) {
      return;
    }

    setResources((previousResources) =>
      previousResources.map((resource) =>
        resource.id === selectedResourceId
          ? {
              ...resource,
              ...updatedResource,
            }
          : resource
      )
    );
  };

  return (
    <>
      <div className="min-h-screen">
        <NavbarLibrarian />
        <main className="max-w-6xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Manage Learning Resources</h1>
              <Button
                className="bg-(--button-green) hover:bg-(--button-hover-green) text-white px-6 py-2"
                onClick={() => setIsAddLearningResourceModalOpen(true)}
              >
                Add Item
              </Button>
            </div>

            <section className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v)}
                >
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "all" ? "All" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={gradeFilter}
                  onValueChange={(v) => setGradeFilter(v)}
                >
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g === "all" ? "All" : g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <span className="text-lg font-medium">{res.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {res.category}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {res.gradeLevel}
                    </span>
                    <Pencil
                      onClick={() => handleOpenEditLearningResourceModal(res.id)}
                      className="cursor-pointer text-(--button-green) hover:text-(--button-hover-green)"
                      size={18}
                    />
                  </div>
                </div>
              ))}
              {filteredResources.length === 0 && (
                <p className="text-center text-gray-500 py-8">No items found.</p>
              )}
            </section>
          </div>
        </main>
      </div>

      {isAddLearningResourceModalOpen && (
        <AddLearningResourceModal
          onClose={() => setIsAddLearningResourceModalOpen(false)}
          onAdd={handleAddResources}
          categoryOptions={categoryOptions}
          gradeOptions={GRADE_OPTIONS}
        />
      )}

      {isEditLearningResourceModalOpen && selectedResource && (
        <EditLearningResourceModal
          onClose={handleCloseEditLearningResourceModal}
          onSave={handleSaveEditedResource}
          initialResource={{
            title: selectedResource.title,
            category: selectedResource.category,
            gradeLevel: selectedResource.gradeLevel,
          }}
          categoryOptions={categoryOptions}
          gradeOptions={GRADE_OPTIONS}
        />
      )}
    </>
  );
};
