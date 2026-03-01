import React from 'react';
import { BookText, UserRound, ChevronDown, X } from 'lucide-react';

interface AddBookModalProps {
	onClose: () => void;
	onAdd?: (numberOfCopies: number) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onAdd }) => {
	const [bookTitle, setBookTitle] = React.useState('');
	const [authorName, setAuthorName] = React.useState('');
	const [subject, setSubject] = React.useState('SUBJECT');
	const [gradeLevel, setGradeLevel] = React.useState('GRADE LEVEL');

	const handleAdd = () => {
		if (!bookTitle.trim()) {
			return;
		}

		onAdd?.(1);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
			<div className="relative w-full max-w-[1160px] rounded-[38px] bg-gradient-to-br from-[#f6edd2] via-[#f1e6c6] to-[#f7efd3] p-5 shadow-2xl sm:p-8">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#e93d45] to-[#c92430] text-white shadow-lg transition hover:brightness-95"
				>
					<X size={54} strokeWidth={2.4} />
				</button>

				<div className="rounded-[36px] bg-gradient-to-br from-[#f7f1df] via-[#f4ebd5] to-[#f8f3e2] px-6 pb-9 pt-14 shadow-inner sm:px-14 sm:pt-16">
					<h2 className="text-center text-5xl font-extrabold tracking-wide text-black sm:text-7xl">ADD BOOK</h2>

					<div className="mt-12 flex flex-col gap-7">
						<div className="flex h-[104px] items-center rounded-[34px] border-2 border-[#c4c6c7] bg-[#ececee] px-7 shadow-md">
							<BookText size={46} className="text-[#8e8f90]" strokeWidth={2.3} />
							<input
								type="text"
								value={bookTitle}
								onChange={(event) => setBookTitle(event.target.value)}
								placeholder="Name of Book"
								className="ml-6 w-full bg-transparent text-[52px] text-[#7f8082] outline-none placeholder:text-[#7f8082]"
							/>
						</div>

						<div className="flex h-[104px] items-center rounded-[34px] border-2 border-[#c4c6c7] bg-[#ececee] px-7 shadow-md">
							<UserRound size={44} className="text-[#8e8f90]" strokeWidth={2.3} />
							<input
								type="text"
								value={authorName}
								onChange={(event) => setAuthorName(event.target.value)}
								placeholder="Name of Author (Optional)"
								className="ml-6 w-full bg-transparent text-[52px] text-[#7f8082] outline-none placeholder:text-[#7f8082]"
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div className="relative h-[104px] rounded-[28px] border-2 border-[#c6c8ca] bg-gradient-to-r from-[#8f9399] to-[#a6aaaf] px-8 shadow-md">
								<select
									value={subject}
									onChange={(event) => setSubject(event.target.value)}
									className="h-full w-full appearance-none bg-transparent pr-16 text-[50px] font-medium text-[#f1f1f1] outline-none"
								>
									<option value="SUBJECT">SUBJECT</option>
									<option value="Science">Science</option>
									<option value="Math">Math</option>
									<option value="English">English</option>
									<option value="Filipino">Filipino</option>
									<option value="Sibika">Sibika</option>
								</select>
								<ChevronDown size={54} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[#f1f1f1]" strokeWidth={2.8} />
							</div>

							<div className="relative h-[104px] rounded-[28px] border-2 border-[#c6c8ca] bg-gradient-to-r from-[#8f9399] to-[#a6aaaf] px-8 shadow-md">
								<select
									value={gradeLevel}
									onChange={(event) => setGradeLevel(event.target.value)}
									className="h-full w-full appearance-none bg-transparent pr-16 text-[50px] font-medium text-[#f1f1f1] outline-none"
								>
									<option value="GRADE LEVEL">GRADE LEVEL</option>
									<option value="Grade 1">Grade 1</option>
									<option value="Grade 2">Grade 2</option>
									<option value="Grade 3">Grade 3</option>
									<option value="Grade 4">Grade 4</option>
								</select>
								<ChevronDown size={54} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[#f1f1f1]" strokeWidth={2.8} />
							</div>
						</div>

						<div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
							<button
								type="button"
								onClick={onClose}
								className="h-[104px] rounded-[30px] bg-gradient-to-r from-[#c52732] to-[#d12f3a] text-[56px] font-bold uppercase tracking-wide text-[#f4f4f4] shadow-lg transition hover:brightness-95"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleAdd}
								className="h-[104px] rounded-[30px] bg-gradient-to-r from-[#7ab88b] to-[#69ad7e] text-[56px] font-bold text-[#edf4ee] shadow-lg transition hover:brightness-95"
							>
								Add
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddBookModal;
