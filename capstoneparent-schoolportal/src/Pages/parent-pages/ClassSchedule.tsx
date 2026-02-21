import { AboutChildNavbar } from "@/components/parent/AboutChildNavbar";
import { NavbarParent } from "@/components/parent/NavbarParent";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Child {
	id: string;
	name: string;
	status: "VERIFIED" | "PENDING" | "DENIED";
	lrn?: string;
	gradeLevel?: string;
	section?: string;
	schoolYear?: string;
	sex?: string;
}

interface ScheduleRow {
	time: string;
	monday: { main: string; sub?: string };
	tuesday: { main: string; sub?: string };
	wednesday: { main: string; sub?: string };
	thursday: { main: string; sub?: string };
	friday: { main: string; sub?: string };
}

const scheduleRows: ScheduleRow[] = [
	{
		time: "8:00-8:20",
		monday: { main: "Morning Work" },
		tuesday: { main: "Morning Work" },
		wednesday: { main: "Morning Work" },
		thursday: { main: "Morning Work" },
		friday: { main: "Morning Work" },
	},
	{
		time: "8:20-10:10",
		monday: { main: "Math", sub: "PE (9:05-9:55)" },
		tuesday: { main: "Math", sub: "Band (9:15-10:00)" },
		wednesday: { main: "Math", sub: "Media Center (9:10-10:10)" },
		thursday: { main: "Math", sub: "PE (9:05-9:55)" },
		friday: { main: "Math" },
	},
	{
		time: "10:10-10:25",
		monday: { main: "SNACK" },
		tuesday: { main: "SNACK" },
		wednesday: { main: "SNACK" },
		thursday: { main: "SNACK" },
		friday: { main: "SNACK" },
	},
	{
		time: "10:25-12:10",
		monday: { main: "Language Arts", sub: "*Centers* 11:30-12:05" },
		tuesday: { main: "Language Arts" },
		wednesday: { main: "Language Arts" },
		thursday: { main: "Language Arts" },
		friday: { main: "Language Arts" },
	},
	{
		time: "12:10-12:50",
		monday: { main: "LUNCH" },
		tuesday: { main: "LUNCH" },
		wednesday: { main: "LUNCH" },
		thursday: { main: "LUNCH" },
		friday: { main: "LUNCH" },
	},
	{
		time: "12:50-2:00",
		monday: { main: "Science Social" },
		tuesday: { main: "Science Social" },
		wednesday: { main: "Finish Language" },
		thursday: { main: "Science Social" },
		friday: { main: "Science Social" },
	},
];

const childrenData: Child[] = [
	{
		id: "1",
		name: "Angela Reyes",
		status: "VERIFIED",
		lrn: "501142400721",
		gradeLevel: "Grade 1",
		section: "Section A",
		schoolYear: "2024 - 2025",
		sex: "Female",
	},
	{
		id: "2",
		name: "Miguel Fernandez",
		status: "VERIFIED",
		lrn: "501142400722",
		gradeLevel: "Grade 2",
		section: "Section B",
		schoolYear: "2024 - 2025",
		sex: "Male",
	},
	{
		id: "3",
		name: "Jasmine Tolentino",
		status: "VERIFIED",
		lrn: "501142400723",
		gradeLevel: "Grade 3",
		section: "Section C",
		schoolYear: "2024 - 2025",
		sex: "Female",
	},
];

export const ClassSchedule = () => {
	const [selectedChild, setSelectedChild] = useState<Child>(childrenData[0]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const otherChildren = childrenData.filter(
		(child) => child.id !== selectedChild.id && child.status === "VERIFIED"
	);

	const handleSelectChild = (child: Child) => {
		setSelectedChild(child);
		setIsDropdownOpen(false);
	};

	return (
		<div className="min-h-screen bg-white">
			<NavbarParent />
			<AboutChildNavbar activeTab="class-schedule" />

			<main className="mx-auto max-w-7xl px-6 pb-12 pt-6">
				{/* Student Information */}
				<section className="mb-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm">
					<h2 className="mb-4 text-2xl font-bold">Student Information</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
						<div className="space-y-2">
							<p className="text-lg">
								<span className="font-semibold">Student Name:</span> {selectedChild.name}
							</p>
							<p className="text-lg">
								<span className="font-semibold">Sex:</span> {selectedChild.sex}
							</p>
							<p className="text-lg">
								<span className="font-semibold">LRN:</span> {selectedChild.lrn}
							</p>
						</div>
						<div className="space-y-2">
							<p className="text-lg">
								<span className="font-semibold">Grade Level & Section:</span>{" "}
								{selectedChild.gradeLevel} - {selectedChild.section}
							</p>
							<p className="text-lg">
								<span className="font-semibold">School Year:</span> {selectedChild.schoolYear}
							</p>
						</div>
					</div>
					<div className="mt-4 flex justify-end">
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-4 py-2 text-lg font-medium transition-colors hover:bg-gray-50"
							>
								Switch to another child
								<ChevronDown
									className={`h-5 w-5 transition-transform ${
										isDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
							{isDropdownOpen && otherChildren.length > 0 && (
								<div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
									{otherChildren.map((child) => (
										<button
											key={child.id}
											type="button"
											onClick={() => handleSelectChild(child)}
											className="block w-full px-4 py-3 text-left text-lg transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100"
										>
											{child.name}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Class Schedule */}
				<section className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm">
					<h2 className="mb-4 text-2xl font-bold">Weekly Class Schedule</h2>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-center text-sm">
							<thead>
								<tr className="bg-gray-100">
									<th className="w-28 border border-gray-400 px-3 py-3 text-base font-semibold">
										Time
									</th>
									<th className="border border-gray-400 px-3 py-3 text-base font-semibold">
										Monday
									</th>
									<th className="border border-gray-400 px-3 py-3 text-base font-semibold">
										Tuesday
									</th>
									<th className="border border-gray-400 px-3 py-3 text-base font-semibold">
										Wednesday
									</th>
									<th className="border border-gray-400 px-3 py-3 text-base font-semibold">
										Thursday
									</th>
									<th className="border border-gray-400 px-3 py-3 text-base font-semibold">
										Friday
									</th>
								</tr>
							</thead>
							<tbody>
								{scheduleRows.map((row) => (
									<tr key={row.time} className="hover:bg-gray-50">
										<td className="border border-gray-400 px-3 py-3 align-top font-medium">
											{row.time}
										</td>
										{[row.monday, row.tuesday, row.wednesday, row.thursday, row.friday].map(
											(dayCell, index) => (
												<td
													key={`${row.time}-${index}`}
													className="border border-gray-400 px-3 py-3 align-top"
												>
													<p className="font-medium">{dayCell.main}</p>
													{dayCell.sub && (
														<p className="mt-1 text-xs italic text-purple-600">
															{dayCell.sub}
														</p>
													)}
												</td>
											)
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	);
};
