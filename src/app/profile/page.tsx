"use client";

export default function ProfilePage() {
  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-sm text-gray-500 mt-1">Your account</p>

      <div className="mt-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 mt-4">Sign in to manage your profile</p>
        <button className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium">
          Sign in
        </button>
      </div>
    </div>
  );
}
