import { useState } from "react";
import { Link } from "react-router-dom";

type AboutChildTab = "class-schedule" | "quarterly-grades" | "library-records";

interface AboutChildNavbarProps {
	activeTab?: AboutChildTab;
	onTabChange?: (tab: AboutChildTab) => void;
}

const tabs: { key: AboutChildTab; label: string; path?: string }[] = [
	{ key: "class-schedule", label: "Class Schedule", path: "/classschedule" },
	{ key: "quarterly-grades", label: "Quarterly Grades", path: "/quarterlygrades" },
	{ key: "library-records", label: "Library Records", path: "/libraryrecords" },
];

export const AboutChildNavbar = ({
	activeTab: controlledActiveTab,
	onTabChange,
}: AboutChildNavbarProps) => {
	const [internalActiveTab, setInternalActiveTab] =
		useState<AboutChildTab>("class-schedule");

	const activeTab = controlledActiveTab ?? internalActiveTab;

	const handleTabClick = (tab: AboutChildTab) => {
		if (!controlledActiveTab) {
			setInternalActiveTab(tab);
		}
		onTabChange?.(tab);
	};

	return (
		<div className="w-full bg-white px-10 py-6">
			<nav className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row md:gap-12">
				{tabs.map((tab) => {
					const isActive = tab.key === activeTab;
					const tabClassName = `rounded-2xl px-6 py-3 text-center text-3xl font-medium transition-colors ${
						isActive ? "font-semibold" : "hover:opacity-80"
					}`;
					const tabStyle = {
						backgroundColor: isActive ? "var(--button-green)" : "transparent",
						color: isActive ? "var(--button-white)" : "#111827",
					};

					if (tab.path) {
						return (
							<Link
								key={tab.key}
								to={tab.path}
								onClick={() => handleTabClick(tab.key)}
								className={tabClassName}
								style={tabStyle}
							>
								{tab.label}
							</Link>
						);
					}

					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => handleTabClick(tab.key)}
							className={tabClassName}
							style={tabStyle}
						>
							{tab.label}
						</button>
					);
				})}
			</nav>
		</div>
	);
};
