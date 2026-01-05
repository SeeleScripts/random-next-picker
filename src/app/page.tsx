"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import RaffleBox from "@/components/RaffleBox";
import Sidebar from "@/components/Sidebar";

// ============================================
// CONFIGURATION - Change these values as needed
// ============================================
const ANIMATION_DURATION_SECONDS = 10;

// Background image - Uses /bg.png as the background
const BACKGROUND_CLASS = "bg-cover bg-center bg-no-repeat";
const BACKGROUND_STYLE = { backgroundImage: "url('/bg.png')" };
// ============================================

export default function Home() {
	const [names, setNames] = useState<string[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const [winner, setWinner] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [removeWinner, setRemoveWinner] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Fisher-Yates shuffle algorithm
	const shuffleArray = useCallback((array: string[]): string[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}, []);

	const handleStartRaffle = useCallback(() => {
		if (names.length === 0) {
			setSidebarOpen(true);
			return;
		}

		// Shuffle the names before starting
		setNames(shuffleArray(names));
		setIsAnimating(true);
		setWinner(null);
	}, [names, shuffleArray]);

	const handleAnimationEnd = useCallback(
		(selectedWinner: string) => {
			setIsAnimating(false);
			setWinner(selectedWinner);

			if (removeWinner) {
				setNames((prev) =>
					prev.filter((name) => name !== selectedWinner)
				);
			}
		},
		[removeWinner]
	);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}, []);

	const handleNamesChange = useCallback((newNames: string[]) => {
		setNames(newNames);
	}, []);

	return (
		<div
			ref={containerRef}
			style={BACKGROUND_STYLE}
			className={`min-h-screen ${BACKGROUND_CLASS} flex flex-col items-center justify-center relative overflow-hidden`}
		>
			{/* Top right controls */}
			<div className="absolute top-6 right-6 flex gap-3 z-10">
				<button
					onClick={toggleFullscreen}
					className="glass-button px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
					title="Pantalla completa"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
						/>
					</svg>
				</button>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="glass-button px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
					title="Configuración"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</button>
			</div>

			{/* Main content */}
			<div className="flex flex-col items-center gap-8 opacity-80">
				{/* Title */}
				<h1 className="raffle-title-outline">
					Sakura Store - Rifa Diciembre
				</h1>

				{/* Raffle Box */}
				<RaffleBox
					names={names}
					isAnimating={isAnimating}
					winner={winner}
					animationDuration={ANIMATION_DURATION_SECONDS}
					onAnimationEnd={handleAnimationEnd}
				/>

				{/* Start Button */}
				<button
					onClick={handleStartRaffle}
					disabled={isAnimating}
					className="primary-button px-12 py-4 rounded-2xl text-white text-xl font-bold uppercase tracking-wider"
				>
					{isAnimating ? "Sorteando..." : "Iniciar"}
				</button>
			</div>

			{/* Sidebar */}
			<Sidebar
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				names={names}
				onNamesChange={handleNamesChange}
				removeWinner={removeWinner}
				onRemoveWinnerChange={setRemoveWinner}
			/>
		</div>
	);
}
