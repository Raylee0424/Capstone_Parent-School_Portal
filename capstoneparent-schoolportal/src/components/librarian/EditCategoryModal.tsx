import React from "react";
import { X } from "lucide-react";

interface EditCategoryModalProps {
	onClose: () => void;
	onEdit?: (categoryName: string) => void;
	initialCategoryName?: string;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
	onClose,
	onEdit,
	initialCategoryName = "",
}) => {
	const [categoryName, setCategoryName] = React.useState(initialCategoryName);

	const handleEdit = () => {
		const trimmedCategoryName = categoryName.trim();
		if (!trimmedCategoryName) {
			return;
		}

		onEdit?.(trimmedCategoryName);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
			<div className="relative w-full max-w-[1280px] rounded-[38px] bg-gradient-to-br from-[#f6edd2] via-[#f1e6c6] to-[#f7efd3] p-5 shadow-2xl sm:p-8">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ecdca9] to-[#d8c68f] text-[#d5383f] shadow-lg transition hover:brightness-95"
				>
					<X size={54} strokeWidth={2.6} />
				</button>

				<div className="rounded-[36px] bg-gradient-to-br from-[#f7f1df] via-[#f4ebd5] to-[#f8f3e2] px-6 pb-9 pt-10 shadow-inner sm:px-14 sm:pt-12">
					<h2 className="text-left text-5xl font-extrabold tracking-wide text-black sm:text-7xl">Edit Category</h2>

					<div className="mt-10 flex flex-col gap-8 sm:mt-12">
						<div className="flex h-[104px] items-center rounded-[34px] border-2 border-[#c9ccb8] bg-[#ece9d5] px-8 shadow-md">
							<input
								type="text"
								value={categoryName}
								onChange={(event) => setCategoryName(event.target.value)}
								placeholder="Category name"
								className="w-full bg-transparent text-[52px] text-[#777878] outline-none placeholder:text-[#777878]"
							/>
						</div>

						<div className="mt-2 flex justify-end">
							<button
								type="button"
								onClick={handleEdit}
								className="h-[104px] w-full rounded-[30px] bg-gradient-to-r from-[#6cb07d] to-[#5aa570] text-[56px] font-medium text-[#edf4ee] shadow-lg transition hover:brightness-95 sm:w-[470px]"
							>
								Edit
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditCategoryModal;
