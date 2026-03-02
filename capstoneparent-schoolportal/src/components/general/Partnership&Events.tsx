import { Navbar } from "../general/Navbar";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  year: number;
  imageUrl: string;
}

const eventData: EventItem[] = [
  {
    id: 1,
    title: "United Nations Day",
    subtitle: "#G1 Science Class",
    description:
      "On United Nations Day, learners explored books that celebrate global culture and community.",
    year: 2025,
    imageUrl:
      "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Reading Month Celebration",
    subtitle: "Library Activity",
    description:
      "A month-long reading drive that encouraged storytelling, book sharing, and joyful literacy moments.",
    year: 2025,
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Science Magic PH",
    subtitle: "Interactive Science Show",
    description:
      "Students experienced hands-on demonstrations that made science engaging, fun, and memorable.",
    year: 2025,
    imageUrl:
      "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Career Day",
    subtitle: "Future Community Helpers",
    description:
      "Young learners visited the library in costume and discovered books connected to their dream careers.",
    year: 2024,
    imageUrl:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Area VI BSP Camp",
    subtitle: "School Partnership Event",
    description:
      "A collaborative scouting and values-driven activity that promoted teamwork and leadership.",
    year: 2024,
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Division Recognition",
    subtitle: "School Achievement",
    description:
      "Recognition of school and teacher accomplishments through division-level partnership programs.",
    year: 2023,
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Community Reading Outreach",
    subtitle: "Barangay Program",
    description:
      "A reading outreach initiative that brought books and learning activities closer to families.",
    year: 2022,
    imageUrl:
      "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Book Donation Drive",
    subtitle: "Partner Organization",
    description:
      "Community and partner organizations donated books to strengthen learner access to resources.",
    year: 2021,
    imageUrl:
      "https://images.unsplash.com/photo-1455885666463-9a95b5f7c509?q=80&w=1887&auto=format&fit=crop",
  },
];

export const PartnershipAndEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const years = useMemo(
    () => Array.from(new Set(eventData.map((event) => event.year))).sort((a, b) => b - a),
    [],
  );

  const filteredEvents = useMemo(() => {
    return eventData.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = selectedYear === "all" || event.year === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [searchQuery, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  return (
    <div className="min-h-screen bg-(--div-bg)">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Partnerships & Events
            </h1>
            <p className="text-gray-600 mt-2">
              Explore school highlights, community programs, and partner activities.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-(--button-green)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
          <section>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedEvents.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
                >
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-40 w-full object-cover"
                  />
                  <div className="bg-(--button-green) p-4 text-white min-h-44">
                    <h2 className="text-2xl font-bold leading-tight line-clamp-1">
                      {event.title}
                    </h2>
                    <p className="mt-2 text-lg leading-snug line-clamp-4">
                      {event.description}
                    </p>
                    <p className="mt-3 text-base font-semibold text-(--tab-subtext)">
                      {event.subtitle}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {paginatedEvents.length === 0 && (
              <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm ring-1 ring-black/5">
                No events found.
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md px-3 py-1.5 font-semibold text-white bg-(--button-green) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isActive = page === currentPage;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-3 py-1.5 font-semibold ${
                      isActive
                        ? "bg-(--button-green) text-white"
                        : "bg-white text-gray-700 ring-1 ring-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md px-3 py-1.5 font-semibold text-white bg-(--button-green) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </section>

          <aside className="h-fit rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">By Year</h3>
            <div className="space-y-2 text-3xl leading-none">
              <button
                type="button"
                onClick={() => setSelectedYear("all")}
                className={`block w-full text-left rounded-md px-2 py-1 transition-colors ${
                  selectedYear === "all"
                    ? "bg-(--button-green) text-white font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`block w-full text-left rounded-md px-2 py-1 transition-colors ${
                    selectedYear === year
                      ? "bg-(--button-green) text-white font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};