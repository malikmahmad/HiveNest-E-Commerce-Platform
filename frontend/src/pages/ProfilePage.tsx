import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, MapPin, Package, Plus, Trash2, Loader2 } from 'lucide-react';
import { authAPI, api } from '../services/api';
import { useAuthStore } from '../store';
import { useAuth } from '../hooks';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'addresses'>('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: '' });
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'Pakistan' });
  const [addingAddr, setAddingAddr] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getMe().then((r) => r.data.data),
  });

  const { updateProfile } = useAuth();

  const addAddressMutation = useMutation({
    mutationFn: (data: object) => api.post('/auth/addresses', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setAddingAddr(false); toast.success('Address added'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add address'),
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  return (
    <>
      <Helmet><title>My Profile — HiveNest</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Link to="/orders" className="ml-auto flex items-center gap-2 text-sm text-primary font-medium border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">
            <Package size={16} /> My Orders
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {[{ key: 'profile', label: 'Profile', icon: User }, { key: 'addresses', label: 'Addresses', icon: MapPin }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+92 300 0000000" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={user?.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400" />
              </div>
              <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">Save Changes</button>
            </form>
          </div>
        )}

        {tab === 'addresses' && (
          <div>
            <div className="space-y-3 mb-4">
              {profile?.addresses?.map((addr: any) => (
                <div key={addr.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-start">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{addr.name} · {addr.phone}</p>
                    <p className="text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-gray-500">{addr.country}</p>
                    {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">Default</span>}
                  </div>
                </div>
              ))}
            </div>
            {!addingAddr ? (
              <button onClick={() => setAddingAddr(true)} className="flex items-center gap-2 text-sm text-primary font-medium border border-dashed border-primary/40 rounded-2xl px-5 py-3 hover:bg-primary/5 transition-colors w-full justify-center">
                <Plus size={16} /> Add New Address
              </button>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">New Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[{ k: 'name', l: 'Full Name', col: 2 }, { k: 'phone', l: 'Phone', col: 2 }, { k: 'street', l: 'Street', col: 2 }, { k: 'city', l: 'City', col: 1 }, { k: 'state', l: 'State', col: 1 }, { k: 'zip', l: 'ZIP', col: 1 }, { k: 'country', l: 'Country', col: 1 }].map(({ k, l, col }) => (
                    <div key={k} className={col === 2 ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                      <input type="text" value={(newAddr as any)[k]} onChange={(e) => setNewAddr({ ...newAddr, [k]: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => addAddressMutation.mutate(newAddr)} disabled={addAddressMutation.isPending} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60">
                    {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                  </button>
                  <button onClick={() => setAddingAddr(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
