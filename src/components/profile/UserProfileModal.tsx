import React, { useState, useRef, useEffect } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { LAU_MAJORS_BY_SCHOOL } from '../../data/lauMajors';
import { Campus } from '../../types';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  User,
  GraduationCap,
  MapPin,
  Mail,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'p1',
    label: 'Student 1',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p2',
    label: 'Student 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p3',
    label: 'Student 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p4',
    label: 'Student 4',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p5',
    label: 'Student 5',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p6',
    label: 'Student 6',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useStudyLinkData();

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [campus, setCampus] = useState<Campus>('Beirut');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setMajor(currentUser.major || '');
      setCampus(currentUser.campus || 'Beirut');
      setAvatarUrl(currentUser.avatarUrl || '');
      setUrlInput('');
      setShowUrlField(false);
      setUploadError(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Handle local image file upload (converts to base64 data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit to reasonable size (~4MB)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Please choose an image under 4MB for fast loading.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setAvatarUrl(urlInput.trim());
      setUrlInput('');
      setShowUrlField(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      major: major.trim(),
      campus: campus as 'Beirut' | 'Byblos',
      avatarUrl: avatarUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Profile & Picture Settings
              </h3>
              <p className="text-[11px] text-slate-500">
                Update your student or tutor photo, degree, and campus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs flex-1">
          {/* Section 1: Picture Customization */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-800 mb-3">
              Profile Picture
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Picture Preview */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md bg-emerald-700 flex items-center justify-center text-white text-2xl font-bold">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name || 'User profile'}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setUploadError('Failed to load image from URL. Restoring fallback.');
                        setAvatarUrl('');
                      }}
                    />
                  ) : (
                    <span>{(name || currentUser.name || 'U')[0].toUpperCase()}</span>
                  )}
                </div>

                {/* Quick Camera Action Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-emerald-700 text-white rounded-full shadow-md hover:bg-emerald-800 transition-colors cursor-pointer"
                  title="Upload image from computer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo Actions */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload from Device
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlField(prev => !prev)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    Paste Link
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Remove custom picture and use name initial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upload a photo from your PC (JPG, PNG, WebP) or pick an avatar preset below.
                </p>

                {uploadError && (
                  <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                    {uploadError}
                  </p>
                )}

                {/* Paste URL Input Drawer */}
                {showUrlField && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-100">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="mt-4 pt-3 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Or select a ready-made academic avatar:</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map(preset => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setUploadError(null);
                      }}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-400 ring-offset-1 scale-105'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Academic Details */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* LAU Major Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Program / Major (LAU)
              </label>
              <select
                value={major}
                onChange={e => setMajor(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
                {major && !LAU_MAJORS_BY_SCHOOL.some(g => g.majors.includes(major)) && (
                  <option value={major}>{major}</option>
                )}
                {LAU_MAJORS_BY_SCHOOL.map(group => (
                  <optgroup key={group.school} label={group.schoolName}>
                    {group.majors.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Campus Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Campus
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCampus('Beirut')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    campus === 'Beirut'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="block font-bold">Beirut Campus</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Hamra / Koraytem</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCampus('Byblos')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    campus === 'Byblos'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="block font-bold">Byblos Campus</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Blat / Jbeil</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Read-Only Account Info */}
            <div className="p-3 bg-slate-100/70 rounded-lg border border-slate-200 text-slate-600 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3 h-3" /> LAU Email:
                </span>
                <span className="font-mono font-medium text-slate-800">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <GraduationCap className="w-3 h-3" /> Account Role:
                </span>
                <span className="font-semibold text-emerald-800 uppercase text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                  {currentUser.role}
                </span>
              </div>
              {currentUser.tutorProfileId && (
                <p className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-slate-200/80">
                  ✓ As an active tutor, your new photo and degree will be reflected in the public Tutor Directory and Booking system.
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Profile & Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
