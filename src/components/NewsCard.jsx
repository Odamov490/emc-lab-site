// src/components/NewsCard.jsx
import React from "react";

export default function NewsCard({ item }) {
  const dateText = item?.date
    ? new Date(item.date).toLocaleDateString("uz-UZ")
    : "";

  return (
    <a
      href={item.source_url || "#"}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl overflow-hidden border hover:shadow-md transition bg-white"
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title || "news"}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100" />
      )}

      <div className="p-4">
        <div className="text-xs opacity-60">{dateText}</div>
        <div className="font-semibold mt-1 line-clamp-2">
          {item.title || "Yangilik"}
        </div>
        {item.text ? (
          <div className="text-sm opacity-80 mt-2 line-clamp-3">
            {item.text}
          </div>
        ) : null}
        <div className="text-sm font-medium mt-4">Batafsil →</div>
      </div>
    </a>
  );
}
