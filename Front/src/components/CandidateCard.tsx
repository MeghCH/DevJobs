type CandidateCardProps = {
  name: string;
  title: string;
  experience: string;
  tags: string[];
  availability: string;
  location: string;
  appliedTo: string;
  sentAt: string;
  onDelete?: () => void;
};

export default function CandidateCard({
  name,
  title,
  experience,
  tags,
  availability,
  location,
  appliedTo,
  sentAt,
  onDelete,
}: CandidateCardProps) {
  return (
    <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 border border-indigo-100 bg-indigo-50/40 rounded-xl px-4 sm:px-6 py-4 sm:py-5 hover:border-indigo-300 transition-colors cursor-pointer">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">
          {title} · {experience}
        </p>

        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-indigo-500 text-white px-2.5 py-1 rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-xs text-gray-500">
          {availability} · {location}
        </p>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 sm:ml-6 flex-wrap">
        <span className="text-xs bg-green-700 text-white px-3 py-1 rounded-full font-medium">
          Disponible
        </span>
        <span className="text-xs text-indigo-600">Envoyé le {sentAt}</span>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer la candidature"
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3 h-3"
          >
            <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
