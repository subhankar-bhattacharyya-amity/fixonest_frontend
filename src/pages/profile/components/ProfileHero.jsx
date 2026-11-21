import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Calendar, Camera, ShieldCheck } from "lucide-react";
import { useAuth, updateProfilePhoto, buildProfileImageUrl, initialsOf } from "@/features/auth/index.js";
import { formatDate } from "@/utils/formatDate.js";

// Mirrors backend/app/middleware/multer.js's uploadProfileImage constraints
// (ALLOWED_MIMETYPES, DEFAULT_FILE_SIZE_LIMIT) so a bad file is rejected
// instantly instead of round-tripping to the server first.
const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

// Cover-photo-style summary card at the top of the profile page: gradient
// banner, an overlapping avatar with a click-to-upload camera button, name,
// email, and a couple of identity badges.
export default function ProfileHero() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [failedSrc, setFailedSrc] = useState(null);

  if (!user) return null;

  const avatarSrc = buildProfileImageUrl(user);
  const showImage = Boolean(avatarSrc) && avatarSrc !== failedSrc;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    try {
      const result = await dispatch(updateProfilePhoto(formData)).unwrap();
      setFailedSrc(null);
      toast.success(result.message);
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30">
      <div className="h-24 bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 sm:h-32" />

      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex flex-col items-center sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
          <div className="relative shrink-0">
            <span className="block h-24 w-24 overflow-hidden rounded-full ring-4 ring-white dark:ring-(--surface-1) sm:h-28 sm:w-28">
              {showImage ? (
                <img
                  src={avatarSrc}
                  onError={() => setFailedSrc(avatarSrc)}
                  alt={user.fullName ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-semibold text-slate-600 dark:bg-(--surface-2) dark:text-(--text-primary) sm:text-3xl">
                  {initialsOf(user.fullName)}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg ring-4 ring-white transition hover:brightness-110 disabled:opacity-60 dark:ring-(--surface-1) sm:h-9 sm:w-9"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              </span>
            )}
          </div>

          <div className="mt-4 min-w-0 text-center sm:mt-0 sm:flex-1 sm:pb-1 sm:text-left">
            <h1 className="gradient-text-animate truncate text-xl font-bold tracking-tight sm:text-2xl">
              {user.fullName}
            </h1>
            <p className="truncate text-sm text-slate-500 dark:text-(--text-muted)">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {user.role_id?.display_name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user.role_id.display_name}
                </span>
              )}
              {user.createdAt && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {formatDate(new Date(user.createdAt))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
