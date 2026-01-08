import React, { useState, useRef } from 'react'
import { useAuth } from '../../app/providers/AuthProvider'
import { updateProfile, uploadProfilePhoto } from '../../services/profile'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../services/supabaseClient'
import { useCreateAdminRequest, useUserAdminRequestStatus } from '../../hooks/useAdminApproval'
import { Loader, Upload, User, Mail, Building, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [department, setDepartment] = useState(user?.department || '')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(user?.profile_photo_url || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const { data: adminRequestStatus } = useUserAdminRequestStatus()
  const createAdminRequestMutation = useCreateAdminRequest()

  const updateMutation = useMutation({
    mutationFn: async (updates: { name?: string; username?: string; department?: string; profile_photo_url?: string }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return updateProfile(user.id, updates)
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      setSelectedFile(null)
    },
  })

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Image size must be less than 5MB')
      return
    }

    setValidationError('')
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadPhoto = async () => {
    if (!selectedFile || !user?.id) return

    try {
      setValidationError('')
      const url = await uploadProfilePhoto(selectedFile, user.id)
      await updateMutation.mutateAsync({ profile_photo_url: url })
    } catch (error: any) {
      setValidationError(error.message || 'Failed to upload photo')
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    // Validate username
    if (username && username.length < 3) {
      setValidationError('Username must be at least 3 characters')
      return
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      setValidationError('Username can only contain letters, numbers, and underscores')
      return
    }

    setValidationError('')

    try {
      // Check if username is taken (if changed)
      if (username && username !== user.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .neq('id', user.id)
          .single()

        if (existing) {
          setValidationError('This username is already taken')
          return
        }
      }

      await updateMutation.mutateAsync({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        department: department.trim() || undefined,
      })
    } catch (error: any) {
      setValidationError(error.message || 'Failed to update profile')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Please sign in to view settings</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Photo</h2>
        
        <div className="flex items-start gap-6">
          <div className="relative">
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt="Profile"
                className="w-24 h-24 rounded-lg object-cover border-2 border-slate-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-indigo-600 flex items-center justify-center border-2 border-slate-700">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                {selectedFile ? 'Change Photo' : 'Upload Photo'}
              </button>
              {selectedFile && (
                <p className="text-sm text-slate-400 mt-2">{selectedFile.name}</p>
              )}
            </div>

            {selectedFile && (
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                Save Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Profile Information</h2>

        {validationError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {validationError}
          </div>
        )}

        {updateMutation.isSuccess && !updateMutation.isPending && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Profile updated successfully
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="johndoe"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Only letters, numbers, and underscores</p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="Engineering"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Role
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 capitalize">
                {user.role || 'user'}
              </span>
            </div>
            
            {user.role === 'user' && (
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                {adminRequestStatus?.status === 'pending' && (
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Admin request pending approval</span>
                  </div>
                )}
                {adminRequestStatus?.status === 'approved' && (
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Admin request approved! Please refresh to see changes.</span>
                  </div>
                )}
                {adminRequestStatus?.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Admin request was rejected</span>
                  </div>
                )}
                {(!adminRequestStatus || adminRequestStatus.status === 'rejected') && (
                  <button
                    onClick={() => createAdminRequestMutation.mutate()}
                    disabled={createAdminRequestMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {createAdminRequestMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                    {createAdminRequestMutation.isPending ? 'Requesting...' : 'Request Admin Access'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

