import { useState } from "react";

// A provider's profile photo, filling its parent. Falls back to their
// initials on the brand gradient when there's no photo or it fails to load.
export default function WorkerPhoto({ worker, initialsClassName = "text-4xl" }) {
  // Remember which URL failed, so a changed photo gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = Boolean(worker.avatar) && failedSrc !== worker.avatar;

  if (showImage) {
    return (
      <img
        src={worker.avatar}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={() => setFailedSrc(worker.avatar)}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 to-fuchsia-500 font-extrabold text-white ${initialsClassName}`}
    >
      {worker.initials}
    </div>
  );
}
