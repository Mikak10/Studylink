import React, { useState, useRef, useEffect } from 'react';
import { useStudyLinkData } from '../../context/DataContext';
import { TutorProfile, Campus } from '../../types';
import { X, CheckCircle2, Settings, Camera, Upload, Trash2, Sparkles } from 'lucide-react';

interface TutorProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TUTOR_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
];

export const TutorProfileEditorModal: React.FC<TutorProfileEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tutors, activePersona, updateTutorProfile } = useStudyLinkData();

  const tutor =
    tutors.find(t => t.id === activePersona.tutorProfileId) ||
    tutors.find(t => t.id === 'tutor-nour') ||
    tutors[0];

  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(15);
  const [campus, setCampus] = useState<Campus>('Beirut');
  const [academicYear, setAcademicYear] = useState<any>('Senior');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (tutor) {
      setBio(tutor.bio || '');
      setHourlyRate(tutor.hourlyRate || 15);
      setCampus(tutor.campus || 'Beirut');
      setAcademicYear(tutor.academicYear || 'Senior');
      setAvatarUrl(tutor.avatarUrl || '');
    }
  }, [tutor, isOpen]);

  if (!isOpen || !tutor) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTutorProfile(tutor.id, {
      bio: bio.trim(),
      hourlyRate: Number(hourlyRate),
      campus,
      academicYear: academicYear as any,
      avatarUrl: avatarUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Edit Tutor Profile & Picture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Avatar Photo Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-800 mb-2">Tutor Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 bg-emerald-700 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={tutor.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{tutor.fullName[0]}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1 bg-emerald-700 text-white rounded-full shadow hover:bg-emerald-800 cursor-pointer"
                  title="Upload picture"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
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
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Photo
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-2 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="text-[10px] text-slate-500 font-medium">Quick presets:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {PRESET_TUTOR_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`w-6 h-6 rounded-full overflow-hidden border cursor-pointer shrink-0 ${
                          avatarUrl === url ? 'ring-2 ring-emerald-600 border-white' : 'border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tutor Name</label>
            <input
              type="text"
              value={tutor.fullName}
              disabled
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus</label>
              <select
                value={campus}
                onChange={e => setCampus(e.target.value as Campus)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Beirut">Beirut</option>
                <option value="Byblos">Byblos</option>
                <option value="Both">Both Campuses</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hourly Rate (USD)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                required
              />
              <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-[11px]">
                {hourlyRate === 0 ? 'Free Volunteer' : 'USD/hr'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bio & Teaching Overview</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-normal focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
