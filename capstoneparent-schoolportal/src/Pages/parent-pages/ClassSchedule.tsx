import { AboutChildNavbar } from "@/components/parent/AboutChildNavbar";
import { NavbarParent } from "@/components/parent/NavbarParent";

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

export const ClassSchedule = () => {
	return (
		<div className="min-h-screen bg-white">
			<NavbarParent />
			<AboutChildNavbar activeTab="class-schedule" />

			<main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
				<section className="grid grid-cols-1 gap-1 md:grid-cols-[2.15fr_1fr]">
					<div className="border border-gray-500 bg-[#efefef] px-4 py-3 text-[1.85rem] md:text-[1.95rem]">
						<div className="grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-8">
							<p>
								<span className="font-bold">Student Name:</span> Angela Reyes
							</p>
							<p>
								<span className="font-bold">Grade Level & Section:</span> Grade 1 - Section A
							</p>
							<p>
								<span className="font-bold">Sex:</span> Female
							</p>
							<p>
								<span className="font-bold">School Year:</span> 2024 - 2025
							</p>
							<p>
								<span className="font-bold">Student LRN:</span> 501142400721
							</p>
						</div>
					</div>

					<aside className="border border-gray-500" style={{ backgroundColor: "var(--button-green)" }}>
						<h2 className="border-b border-gray-200 px-4 py-2 text-center text-[1.85rem] font-bold text-white md:text-[1.95rem]">
							Switch to another child
						</h2>
						<div className="space-y-1 px-4 py-2 text-center text-[1.75rem] md:text-[1.85rem]">
							<button type="button" className="text-white underline transition-opacity hover:opacity-80">
								Miguel Fernandez
							</button>
							<button type="button" className="block w-full text-white underline transition-opacity hover:opacity-80">
								Jasmine Tolentino
							</button>
						</div>
					</aside>
				</section>

				<section className="mt-6 border border-gray-500 bg-[#efefef] p-3">
					<div className="overflow-x-auto">
						<table className="w-full min-w-245 border-collapse border border-gray-600 text-center">
							<thead>
								<tr>
									  <th className="w-32.5 border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold"></th>
									<th className="border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold">Monday</th>
									<th className="border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold">Tuesday</th>
									<th className="border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold">Wednesday</th>
									<th className="border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold">Thursday</th>
									<th className="border border-gray-600 bg-white px-2 py-2 text-[2.15rem] font-semibold">Friday</th>
								</tr>
							</thead>
							<tbody>
								{scheduleRows.map((row) => (
									<tr key={row.time}>
										<td className="border border-gray-600 px-2 py-3 align-top text-[2rem] font-medium">{row.time}</td>
										{[row.monday, row.tuesday, row.wednesday, row.thursday, row.friday].map((dayCell, index) => (
											<td key={`${row.time}-${index}`} className="border border-gray-600 px-2 py-3 text-[2.1rem] leading-tight">
												<p>{dayCell.main}</p>
												{dayCell.sub && (
													<p className="mt-1 text-[1.55rem] font-semibold" style={{ color: "#8b5fbf" }}>
														{dayCell.sub}
													</p>
												)}
											</td>
										))}
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
