"use client";

import { useCallback, useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  names: string[];
  onNamesChange: (names: string[]) => void;
  removeWinner: boolean;
  onRemoveWinnerChange: (value: boolean) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  names,
  onNamesChange,
  removeWinner,
  onRemoveWinnerChange,
}: SidebarProps) {
  // Local state for the raw textarea value (preserves empty lines while typing)
  const [rawText, setRawText] = useState("");

  // Sync rawText when names change externally (e.g., winner removed)
  useEffect(() => {
    // Only update if the names array doesn't match the current rawText
    const currentNames = rawText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const namesMatch =
      currentNames.length === names.length &&
      currentNames.every((name, i) => name === names[i]);

    if (!namesMatch) {
      setRawText(names.join("\n"));
    }
  }, [names]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setRawText(text);

      // Update the names list (filtered)
      const nameList = text
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      onNamesChange(nameList);
    },
    [onNamesChange]
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar fixed top-0 right-0 h-full w-1/4 min-w-[320px] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500">
              Configuración
            </h2>
            <button
              onClick={onClose}
              className="glass-button p-2 rounded-lg text-white hover:text-pink-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Names input */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="text-lg font-medium text-gray-200">
              Lista de participantes
              <span className="text-pink-400 ml-2 text-sm font-normal">
                (un nombre por línea)
              </span>
            </label>
            <textarea
              value={rawText}
              onChange={handleTextChange}
              placeholder="Juan Pérez&#10;María García&#10;Carlos López&#10;..."
              className="custom-textarea flex-1 w-full rounded-xl p-4 text-white placeholder-gray-500 resize-none font-medium text-lg leading-relaxed"
            />

            {/* Names count */}
            <div className="text-sm text-gray-400">
              Total:{" "}
              <span className="text-pink-400 font-bold">{names.length}</span>{" "}
              participantes
            </div>
          </div>

          {/* Options */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={removeWinner}
                onChange={(e) => onRemoveWinnerChange(e.target.checked)}
                className="custom-checkbox"
              />
              <span className="text-gray-200 group-hover:text-white transition-colors">
                Eliminar ganador de la lista
              </span>
            </label>
          </div>

          {/* Clear button */}
          <button
            onClick={() => onNamesChange([])}
            className="mt-6 glass-button px-6 py-3 rounded-xl text-red-400 font-medium hover:text-red-300 transition-colors"
          >
            Limpiar lista
          </button>
        </div>
      </div>
    </>
  );
}
