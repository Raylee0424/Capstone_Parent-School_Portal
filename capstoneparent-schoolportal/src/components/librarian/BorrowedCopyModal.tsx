import React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import BorrowerDetailsModal from './BorrowerDetailsModal';

type CopyStatus = 'BORROWED' | 'AVAILABLE' | 'LOST' | 'GIVEN';

interface BorrowedCopyItem {
	id: number;
	title: string;
	borrower: string;
	section: string;
	subject: string;
	gradeLevel: string;
	status: CopyStatus;
	borrowedDate: string;
	borrowedTime: string;
	dueDate?: string;
	isOverdue?: boolean;
}

const initialItems: BorrowedCopyItem[] = [
	{
		id: 1,
		title: 'Chess Board 2',
		borrower: 'Elsa Frost',
		section: 'Pearl',
		subject: 'Game',
		gradeLevel: 'Grade 1',
		status: 'BORROWED',
		borrowedDate: '04/02/25',
		borrowedTime: '10:00 AM',
		dueDate: '04/09/25 10:00 AM',
	},
	{
		id: 2,
		title: 'Chess Board 3',
		borrower: 'Alexander Santos',
		section: 'Sampaguita',
		subject: 'Game',
		gradeLevel: 'Grade 2',
		status: 'BORROWED',
		borrowedDate: '04/01/25',
		borrowedTime: '09:30 AM',
		dueDate: '04/05/25 10:00 PM',
		isOverdue: true,
	},
	{
		id: 3,
		title: 'The New Science Links 2',
		borrower: 'Pedro Parker',
		section: 'Daisy',
		subject: 'Science',
		gradeLevel: 'Grade 2',
		status: 'BORROWED',
		borrowedDate: '04/02/25',
		borrowedTime: '10:00 AM',
		dueDate: '04/09/25 10:00 AM',
	},
	{
		id: 4,
		title: 'The New Science Links 3',
		borrower: 'Bill Nye',
		section: 'Orchid',
		subject: 'Science',
		gradeLevel: 'Grade 3',
		status: 'BORROWED',
		borrowedDate: '03/31/25',
		borrowedTime: '01:15 PM',
	},
];

const statusOptions: CopyStatus[] = ['BORROWED', 'AVAILABLE', 'LOST', 'GIVEN'];

const statusBgClass = (status: CopyStatus) => {
	if (status === 'AVAILABLE') {
		return 'bg-[#2cc84d] text-[#1e2b1f]';
	}
	if (status === 'LOST') {
		return 'bg-[#e74a15] text-[#2b1c1b]';
	}
	if (status === 'GIVEN') {
		return 'bg-[#f3b41b] text-[#2b241a]';
	}
	return 'bg-[#e8e821] text-[#343434]';
};

const BorrowedCopyModal: React.FC = () => {
	const [searchTerm, setSearchTerm] = React.useState('');
	const [statusFilter, setStatusFilter] = React.useState<string>('All');
	const [subjectFilter, setSubjectFilter] = React.useState<string>('Subject');
	const [gradeFilter, setGradeFilter] = React.useState<string>('Grade Level');
	const [items, setItems] = React.useState<BorrowedCopyItem[]>(initialItems);
	const [openStatusForId, setOpenStatusForId] = React.useState<number | null>(null);
	const [selectedItem, setSelectedItem] = React.useState<BorrowedCopyItem | null>(null);

	const filteredItems = items.filter((item) => {
		const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
		const matchesSubject = subjectFilter === 'Subject' || item.subject === subjectFilter;
		const matchesGrade = gradeFilter === 'Grade Level' || item.gradeLevel === gradeFilter;

		return matchesSearch && matchesStatus && matchesSubject && matchesGrade;
	});

	const updateItemStatus = (id: number, status: CopyStatus) => {
		setItems((previousItems) => previousItems.map((item) => (item.id === id ? { ...item, status } : item)));
		setSelectedItem((currentItem) => (currentItem && currentItem.id === id ? { ...currentItem, status } : currentItem));
		setOpenStatusForId(null);
	};

	const getDateAndTime = (value?: string) => {
		if (!value) {
			return { date: 'N/A', time: 'N/A' };
		}

		const [date, ...timeParts] = value.split(' ');
		return {
			date,
			time: timeParts.join(' ') || 'N/A',
		};
	};

	return (
		<>
			<div className="mx-auto max-w-[1120px] border border-[#d0d0d0] bg-gradient-to-br from-[#ececec] via-[#e8e8e8] to-[#dfdfdf] p-5 shadow-inner sm:p-10">
			<div className="rounded-sm border border-[#d9d9d9] bg-[#e6e6e6] p-4 sm:p-6">
				<div className="flex flex-col gap-3">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
						<input
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search Item"
							className="h-[56px] rounded-sm border border-[#cecece] bg-[#f7f7f7] px-5 text-2xl text-[#3f3f3f] outline-none placeholder:text-[#7f7f7f]"
						/>
						<button
							type="button"
							className="flex h-[56px] w-[86px] items-center justify-center rounded-sm bg-[#53ba62] text-[#111111] shadow-sm transition hover:brightness-95"
						>
							<Search size={38} strokeWidth={2.4} />
						</button>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div className="relative">
							<select
								value={statusFilter}
								onChange={(event) => setStatusFilter(event.target.value)}
								className="h-[50px] w-full appearance-none rounded-sm border border-[#8c8f93] bg-gradient-to-r from-[#8f9399] to-[#7a7e84] px-5 pr-14 text-2xl text-[#efefef] outline-none"
							>
								<option>All</option>
								<option>BORROWED</option>
								<option>AVAILABLE</option>
								<option>LOST</option>
								<option>GIVEN</option>
							</select>
							<ChevronDown size={36} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#f2f2f2]" />
						</div>

						<div className="relative">
							<select
								value={subjectFilter}
								onChange={(event) => setSubjectFilter(event.target.value)}
								className="h-[50px] w-full appearance-none rounded-sm border border-[#8c8f93] bg-gradient-to-r from-[#8f9399] to-[#7a7e84] px-5 pr-14 text-2xl text-[#efefef] outline-none"
							>
								<option>Subject</option>
								<option>Science</option>
								<option>Game</option>
							</select>
							<ChevronDown size={36} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#f2f2f2]" />
						</div>

						<div className="relative">
							<select
								value={gradeFilter}
								onChange={(event) => setGradeFilter(event.target.value)}
								className="h-[50px] w-full appearance-none rounded-sm border border-[#8c8f93] bg-gradient-to-r from-[#8f9399] to-[#7a7e84] px-5 pr-14 text-2xl text-[#efefef] outline-none"
							>
								<option>Grade Level</option>
								<option>Grade 1</option>
								<option>Grade 2</option>
								<option>Grade 3</option>
							</select>
							<ChevronDown size={36} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#f2f2f2]" />
						</div>
					</div>
				</div>
			</div>

				<div className="mt-5 border-t border-[#d0d0d0] pt-5">
					<div className="flex flex-col gap-4">
					{filteredItems.map((item) => (
						<div
							key={item.id}
							className="grid grid-cols-1 items-center gap-4 rounded-[18px] border border-[#5ba870] bg-gradient-to-r from-[#48b668] to-[#55b06d] px-5 py-4 shadow-md sm:grid-cols-[1fr_auto_auto] sm:px-6"
						>
							<button
								type="button"
								onClick={() => setSelectedItem(item)}
								className="text-left"
							>
								<h3 className="text-[46px] font-bold leading-tight text-[#e9f0e8]">{item.title}</h3>
								<p className="mt-2 text-[34px] font-semibold text-[#e0e8aa]">
									Borrower: <span className="font-medium text-[#e6e6d4]">{item.borrower}</span>
								</p>
							</button>

							<div className="hidden items-center justify-center sm:flex">
								<Check size={58} strokeWidth={2.8} className="text-[#4bff76]" />
							</div>

							<div className="relative min-w-[280px]">
								<button
									type="button"
									onClick={() => setOpenStatusForId((current) => (current === item.id ? null : item.id))}
									className={`h-[44px] w-full rounded-[4px] px-4 text-[34px] font-medium shadow-sm ${statusBgClass(item.status)}`}
								>
									{item.status}
								</button>

								{item.dueDate && (
									<p className={`mt-2 border-l border-[#d8d8d8] pl-3 text-[34px] ${item.isOverdue ? 'text-[#cf3a31]' : 'text-[#dce8d8]'}`}>
										Due: {item.dueDate}
									</p>
								)}

								{openStatusForId === item.id && (
									<div className="absolute right-0 top-[48px] z-20 w-full overflow-hidden rounded-b-[4px] border border-[#8a8a8a] shadow-lg">
										{statusOptions.map((status) => (
											<button
												key={status}
												type="button"
												onClick={() => updateItemStatus(item.id, status)}
												className={`h-[36px] w-full text-[30px] font-medium ${statusBgClass(status)}`}
											>
												{status}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					))}
					</div>
				</div>
			</div>

			{selectedItem && (
				<BorrowerDetailsModal
					onClose={() => setSelectedItem(null)}
					itemName={selectedItem.title}
					status={selectedItem.status}
					onStatusChange={(nextStatus) => updateItemStatus(selectedItem.id, nextStatus)}
					borrowedDate={selectedItem.borrowedDate}
					borrowedTime={selectedItem.borrowedTime}
					dueDate={getDateAndTime(selectedItem.dueDate).date}
					dueTime={getDateAndTime(selectedItem.dueDate).time}
					borrowerName={selectedItem.borrower}
					gradeLevel={selectedItem.gradeLevel}
					section={selectedItem.section}
				/>
			)}
		</>
	);
};

export default BorrowedCopyModal;
