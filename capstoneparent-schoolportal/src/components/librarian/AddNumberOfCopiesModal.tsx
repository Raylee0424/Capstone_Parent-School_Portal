import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

interface AddNumberOfCopiesModalProps {
	onClose: () => void;
	onAdd?: (numberOfCopies: number) => void;
}

const AddNumberOfCopiesModal: React.FC<AddNumberOfCopiesModalProps> = ({ onClose, onAdd }) => {
	const [numberOfCopies, setNumberOfCopies] = React.useState<string>('');

	const handleAdd = () => {
		const parsedNumber = Number(numberOfCopies);
		if (!Number.isNaN(parsedNumber) && parsedNumber > 0) {
			onAdd?.(parsedNumber);
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
			<div className="relative w-full max-w-6xl rounded-[34px] bg-gradient-to-br from-[#f8f5cb] via-[#f6f1b7] to-[#f9f6cb] px-6 pb-8 pt-14 sm:px-12 sm:pb-12 sm:pt-16 shadow-2xl">
				<h2 className="text-center text-5xl font-semibold tracking-wide text-black sm:text-7xl">ADD COPIES</h2>

				<div className="mt-12 sm:mt-16">
					<input
						type="number"
						min={1}
						value={numberOfCopies}
						onChange={(event) => setNumberOfCopies(event.target.value)}
						placeholder="Input Number of Copies"
						className="h-20 w-full rounded-2xl bg-[#ececec] px-6 text-4xl text-[#7a7a7a] shadow-md outline-none placeholder:text-[#7a7a7a] sm:h-24 sm:px-7 sm:text-5xl"
					/>
				</div>

				<div className="pointer-events-none mt-6 flex justify-center sm:mt-10">
					<BookOpen size={310} strokeWidth={1.35} className="text-[#5f5845] sm:hidden" />
					<BookOpen size={420} strokeWidth={1.35} className="hidden text-[#5f5845] sm:block" />
				</div>

				<div className="-mt-3 flex items-center justify-center gap-6 sm:-mt-6 sm:gap-12">
					<button
						type="button"
						onClick={onClose}
						className="h-20 w-full max-w-[360px] rounded-[30px] bg-gradient-to-r from-[#ef4f4f] to-[#de4747] text-4xl font-semibold text-[#f6f6f6] shadow-lg transition hover:brightness-95 sm:h-24 sm:text-6xl"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={handleAdd}
						className="h-20 w-full max-w-[360px] rounded-[30px] bg-gradient-to-r from-[#74b889] to-[#63ad7d] text-4xl font-semibold text-[#f2f6f2] shadow-lg transition hover:brightness-95 sm:h-24 sm:text-6xl"
					>
						Add
					</button>
				</div>

				<div className="pointer-events-none absolute bottom-6 right-6 opacity-65 sm:bottom-8 sm:right-8">
					<Sparkles size={34} className="text-white" />
				</div>
			</div>
		</div>
	);
};

export default AddNumberOfCopiesModal;
