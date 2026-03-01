import React from 'react';
import { BookOpen, X } from 'lucide-react';

interface BorrowerModalProps {
	onClose: () => void;
	onConfirm?: (borrowerName: string) => void;
	title?: string;
	placeholder?: string;
	initialValue?: string;
	confirmLabel?: string;
	cancelLabel?: string;
}

const BorrowerModal: React.FC<BorrowerModalProps> = ({
	onClose,
	onConfirm,
	title = 'Name of Borrower',
	placeholder = 'Input Name',
	initialValue = '',
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
}) => {
	const [borrowerName, setBorrowerName] = React.useState(initialValue);

	const handleConfirm = () => {
		onConfirm?.(borrowerName.trim());
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
			<div className="relative w-full max-w-[920px] overflow-hidden rounded-[44px] border-[3px] border-[#5f5f5f] bg-gradient-to-br from-[#f4f0b9] via-[#f3efbf] to-[#f7f2d4] px-10 pb-14 pt-10 shadow-2xl sm:px-16 sm:pb-16 sm:pt-12">
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<BookOpen size={430} strokeWidth={1.4} className="text-[#8e8e62]/20" />
				</div>

				<button
					type="button"
					onClick={onClose}
					className="absolute right-6 top-6 text-[#595959] transition hover:opacity-80 sm:right-8 sm:top-7"
				>
					<X size={56} strokeWidth={1.8} />
				</button>

				<div className="relative z-10 flex flex-col items-center">
					<h2 className="text-center text-5xl font-medium text-[#181818] sm:text-7xl">{title}</h2>

					<input
						type="text"
						value={borrowerName}
						onChange={(event) => setBorrowerName(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								handleConfirm();
							}
						}}
						placeholder={placeholder}
						className="mt-16 h-[90px] w-full rounded-[18px] border border-[#afafaf] bg-[#e7e7e7] px-6 text-3xl text-[#414141] shadow-[0_3px_10px_rgba(0,0,0,0.18)] outline-none placeholder:text-[#8b8b8b] sm:px-8 sm:text-5xl"
					/>

					<div className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
						<button
							type="button"
							onClick={onClose}
							className="h-[88px] rounded-[14px] bg-gradient-to-r from-[#ec2d32] to-[#d6282e] text-4xl font-bold text-[#f2f2f2] shadow-[0_5px_12px_rgba(0,0,0,0.25)] transition hover:brightness-95 sm:text-6xl"
						>
							{cancelLabel}
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							className="h-[88px] rounded-[14px] bg-gradient-to-r from-[#1f9858] to-[#17874a] text-4xl font-bold text-[#f2f2f2] shadow-[0_5px_12px_rgba(0,0,0,0.25)] transition hover:brightness-95 sm:text-6xl"
						>
							{confirmLabel}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BorrowerModal;
