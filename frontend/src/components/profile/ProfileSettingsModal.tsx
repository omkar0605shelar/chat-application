import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Mail, Shield, Bell, 
  Moon, Sun, Globe, LogOut, Camera, 
  Check, Loader2, Key
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy'>('profile');

  const handleSaveProfile = async () => {
    setLoading(true);
    // Stub for updating profile
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Profile Settings" 
      size="lg"
    >
      <div className="flex flex-col md:flex-row gap-8 min-h-[400px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-48 flex flex-col gap-2">
          <TabButton 
            icon={User} 
            label="Edit Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <TabButton 
            icon={Key} 
            label="Account Security" 
            active={activeTab === 'account'} 
            onClick={() => setActiveTab('account')} 
          />
          <TabButton 
            icon={Shield} 
            label="Privacy & Safety" 
            active={activeTab === 'privacy'} 
            onClick={() => setActiveTab('privacy')} 
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar 
                      src={user?.avatar?.url} 
                      name={user?.name} 
                      size="xl" 
                      className="ring-4 ring-primary/10"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-charcoal text-xl">{user?.name}</h4>
                    <p className="text-text-charcoal/40 font-medium">Personal Account</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full h-12 bg-primary/5 border-0 rounded-2xl px-4 text-sm font-medium text-text-charcoal focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full h-12 bg-primary/5 border-0 rounded-2xl px-4 text-sm font-medium text-text-charcoal opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/5 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="h-12 px-8 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-soft transition-all shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-text-charcoal">Two-Factor Authentication</h4>
                      <p className="text-xs text-text-charcoal/40 mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-primary/20 relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-text-charcoal">Session Management</h4>
                      <p className="text-xs text-text-charcoal/40 mt-1">Manage your active sessions across devices.</p>
                    </div>
                    <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                      Review Sessions
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 p-3 rounded-2xl transition-all
      ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/40 hover:bg-primary/5 hover:text-primary'}
    `}
  >
    <Icon size={20} />
    <span className="text-sm font-bold">{label}</span>
  </button>
);

export default ProfileSettingsModal;
