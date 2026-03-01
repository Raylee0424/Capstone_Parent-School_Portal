import React from 'react';
import { ChevronDown, Globe, X } from 'lucide-react';

type BorrowCopyStatus = 'BORROWED' | 'AVAILABLE' | 'LOST' | 'GIVEN';

interface BorrowerDetailsModalProps {
	onClose: () => void;
	itemName?: string;
	status?: BorrowCopyStatus;
	onStatusChange?: (status: BorrowCopyStatus) => void;
	borrowedDate?: string;
	borrowedTime?: string;
	dueDate?: string;
	dueTime?: string;
	borrowerName?: string;
	gradeLevel?: string;
	section?: string;
}

const statusOptions: BorrowCopyStatus[] = ['BORROWED', 'AVAILABLE', 'LOST', 'GIVEN'];

const BorrowerDetailsModal: React.FC<BorrowerDetailsModalProps> = ({
	onClose,
	itemName = 'Chess Board 2',
	status = 'BORROWED',
	onStatusChange,
	borrowedDate = '04/02/25',
	borrowedTime = '10:00 AM',
	dueDate = '04/08/25',
	dueTime = '10:00 AM',
	borrowerName = 'Elsa Frost',
	gradeLevel = 'Grade 1',
	section = 'Pearl',
}) => {
	const [selectedStatus, setSelectedStatus] = React.useState<BorrowCopyStatus>(status);

	React.useEffect(() => {
		setSelectedStatus(status);
	}, [status]);

	const handleStatusChange = (nextStatus: BorrowCopyStatus) => {
		setSelectedStatus(nextStatus);
		onStatusChange?.(nextStatus);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm sm:p-4">
			<div className="relative w-full max-w-[1180px] overflow-hidden border border-[#7b7b7b] bg-[#e3e3e3] px-5 pb-8 pt-5 shadow-2xl sm:px-10 sm:pb-10 sm:pt-8">
				<div className="pointer-events-none absolute -bottom-24 right-[-58px] opacity-90">
					<Globe size={430} strokeWidth={1.5} className="text-[#08ba66]" />
				</div>

				<button
					type="button"
					onClick={onClose}
					className="absolute right-6 top-4 text-[#f31212] transition hover:opacity-80"
				>
					<X size={54} strokeWidth={2.2} />
				</button>

				<div className="relative z-10 flex flex-col gap-7">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:pr-16">
						<div className="flex h-[58px] items-center rounded-[2px] bg-[#7f7f7f] px-7 text-[38px] text-[#ececec]">
							<span className="font-semibold">ITEM NAME:</span>
							<span className="ml-2 font-normal">{itemName}</span>
						</div>

						<div className="relative w-full sm:w-[270px]">
							<select
								value={selectedStatus}
								onChange={(event) => handleStatusChange(event.target.value as BorrowCopyStatus)}
								className="h-[58px] w-full appearance-none rounded-[2px] border-none bg-[#e8f00d] px-7 pr-14 text-[36px] font-medium text-[#101010] outline-none"
							>
								{statusOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							<ChevronDown size={34} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black" />
						</div>
					</div>

					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
						<div>
							<h2 className="text-[58px] font-semibold leading-none text-[#121212]">Time Borrowed:</h2>
							<div className="mt-3 flex items-center gap-8 text-[42px] text-[#1b1b1b]">
								<span>{borrowedDate}</span>
								<span>{borrowedTime}</span>
							</div>
						</div>

						<div>
							<h2 className="text-[58px] font-semibold leading-none text-[#121212]">Due:</h2>
							<div className="mt-3 flex items-center gap-8 text-[42px] text-[#1b1b1b]">
								<span>{dueDate}</span>
								<span>{dueTime}</span>
							</div>
						</div>
					</div>

					<div className="mt-8">
						<h2 className="text-[58px] font-semibold leading-none text-[#121212]">Borrower:</h2>
						<div className="mt-4 space-y-1 text-[42px] leading-tight text-[#121212]">
							<p>
								<span className="font-semibold">Name:</span> {borrowerName}
							</p>
							<p>
								<span className="font-semibold">Grade Level:</span> {gradeLevel}
							</p>
							<p>
								<span className="font-semibold">Section:</span> {section}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BorrowerDetailsModal;
