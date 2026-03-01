import React from 'react';
import { X, Plus, Trash2, Sparkles, BookOpen } from 'lucide-react';
import AddNumberOfCopiesModal from './AddNumberOfCopiesModal';

interface AddBookCopyModalProps {
	onClose: () => void;
}

interface BookCopyItem {
	id: number;
	title: string;
}

const AddBookCopyModal: React.FC<AddBookCopyModalProps> = ({ onClose }) => {
	const [copies, setCopies] = React.useState<BookCopyItem[]>([
		{ id: 1, title: 'The New Science Links 1' },
		{ id: 2, title: 'The New Science Links 2' },
		{ id: 3, title: 'The New Science Links 3' },
	]);
	const [isAddNumberModalOpen, setIsAddNumberModalOpen] = React.useState(false);

	const handleAddCopies = (numberOfCopies: number) => {
		setCopies((previousCopies) => {
			const nextNumber = previousCopies.length + 1;
			const newCopies = Array.from({ length: numberOfCopies }, (_, index) => ({
				id: Date.now() + index,
				title: `The New Science Links ${nextNumber + index}`,
			}));

			return [...previousCopies, ...newCopies];
		});
	};

	const handleRemoveCopy = (id: number) => {
		setCopies((previousCopies) => previousCopies.filter((copy) => copy.id !== id));
	};

	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-3 sm:p-5">
				<div className="relative w-full max-w-7xl rounded-[22px] bg-gradient-to-br from-[#f8f5c9] via-[#f5efb5] to-[#f8f5c9] p-4 sm:p-8 shadow-2xl">
				<button
					onClick={onClose}
					className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ef1111] text-white shadow-lg transition hover:bg-[#d30d0d]"
				>
					<X size={34} strokeWidth={2.5} />
				</button>

				<div className="pr-20">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="rounded-xl bg-gradient-to-r from-[#3fa363] to-[#42b56f] px-5 py-3 text-[20px] font-medium text-[#dff4e7] shadow-sm">
							Name: The New Science Links
						</div>

						<button
							onClick={() => setIsAddNumberModalOpen(true)}
							className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#eac31c] to-[#d8ad08] px-7 py-3 text-[38px] font-semibold tracking-tight text-[#1f2528] shadow-lg transition hover:brightness-95"
						>
							<span className="text-[34px] leading-none">ADD COPY</span>
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d2a005] text-[#8e7007]">
								<Plus size={28} strokeWidth={2.6} />
							</span>
						</button>
					</div>

					<div className="relative mt-6 rounded-3xl bg-[#efefef] p-4 sm:p-7 shadow-xl">
						<div className="flex flex-col gap-5 pr-0 sm:pr-20">
							{copies.map((copy) => (
								<div key={copy.id} className="flex items-center gap-3 sm:gap-5">
									<div className="w-full rounded-2xl bg-gradient-to-r from-[#3fa563] to-[#49b875] px-4 py-4 text-[20px] font-medium text-[#d8efe2] shadow-sm sm:px-9">
										{copy.title}
									</div>

									<button
										onClick={() => handleRemoveCopy(copy.id)}
										className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ef1111] text-white shadow-lg transition hover:bg-[#d30d0d]"
										aria-label={`Remove ${copy.title}`}
									>
										<Trash2 size={29} strokeWidth={2.6} />
									</button>
								</div>
							))}
						</div>

						<div className="pointer-events-none absolute -bottom-10 -right-10 hidden opacity-70 sm:block">
							<BookOpen size={420} strokeWidth={1.2} className="text-[#3ea769]" />
						</div>
					</div>
				</div>

				<div className="pointer-events-none absolute bottom-8 right-10 opacity-55">
					<Sparkles size={34} className="text-white" />
				</div>
				</div>
			</div>

			{isAddNumberModalOpen && (
				<AddNumberOfCopiesModal
					onClose={() => setIsAddNumberModalOpen(false)}
					onAdd={handleAddCopies}
				/>
			)}
		</>
	);
};

export default AddBookCopyModal;
