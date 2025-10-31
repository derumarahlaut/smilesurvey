"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';

interface CustomAccount {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'operator';
  name: string;
}

const DEFAULT_ACCOUNTS = [
  { id: 'admin', username: 'admin', role: 'admin' as const, name: 'Administrator' },
  { id: 'pencatat1', username: 'pencatat1', role: 'operator' as const, name: 'Pencatat 1' },
  { id: 'pencatat2', username: 'pencatat2', role: 'operator' as const, name: 'Pencatat 2' },
  { id: 'pencatat3', username: 'pencatat3', role: 'operator' as const, name: 'Pencatat 3' },
  { id: 'pencatat4', username: 'pencatat4', role: 'operator' as const, name: 'Pencatat 4' },
  { id: 'pencatat5', username: 'pencatat5', role: 'operator' as const, name: 'Pencatat 5' },
];

export default function AdminUsersPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CustomAccount | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator' as 'admin' | 'operator'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication and admin rights
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have admin access.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadCustomAccounts();
  }, []);

  const loadCustomAccounts = () => {
    try {
      const saved = localStorage.getItem('smilesurvey_accounts');
      if (saved) {
        setCustomAccounts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom accounts:', error);
    }
  };

  const saveCustomAccounts = (accounts: CustomAccount[]) => {
    localStorage.setItem('smilesurvey_accounts', JSON.stringify(accounts));
    setCustomAccounts(accounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password || !formData.name) {
      setError('All fields are required');
      return;
    }

    // Check if username already exists
    const allAccounts = [...DEFAULT_ACCOUNTS, ...customAccounts];
    const existingAccount = allAccounts.find(acc => 
      acc.username === formData.username && acc.id !== editingAccount?.id
    );

    if (existingAccount) {
      setError('Username already exists');
      return;
    }

    if (editingAccount) {
      // Update existing account
      const updatedAccounts = customAccounts.map(acc =>
        acc.id === editingAccount.id ? { ...acc, ...formData } : acc
      );
      saveCustomAccounts(updatedAccounts);
      setSuccess('Account updated successfully');
    } else {
      // Create new account
      const newAccount: CustomAccount = {
        id: `custom_${Date.now()}`,
        ...formData
      };
      saveCustomAccounts([...customAccounts, newAccount]);
      setSuccess('Account created successfully');
    }

    setFormData({ username: '', password: '', name: '', role: 'operator' });
    setEditingAccount(null);
    setIsCreateFormOpen(false);
  };

  const handleEdit = (account: CustomAccount) => {
    setFormData({
      username: account.username,
      password: account.password,
      name: account.name,
      role: account.role
    });
    setEditingAccount(account);
    setIsCreateFormOpen(true);
  };

  const handleDelete = (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = customAccounts.filter(acc => acc.id !== accountId);
      saveCustomAccounts(updatedAccounts);
      setSuccess('Account deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', role: 'operator' });
    setEditingAccount(null);
    setError('');
    setIsCreateFormOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage operator and administrator accounts</p>
          </div>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Account
          </button>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreateFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'operator'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingAccount ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Default Accounts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Default Accounts</h2>
              <p className="text-gray-600">Built-in system accounts that cannot be deleted</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Username</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_ACCOUNTS.map((account) => (
                      <tr key={account.id} className="border-b">
                        <td className="py-2 font-medium">{account.username}</td>
                        <td className="py-2">{account.name}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            account.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {account.role}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                            Default
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Custom Accounts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Custom Accounts</h2>
              <p className="text-gray-600">Accounts created by administrators</p>
            </div>
            <div className="p-6">
              {customAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No custom accounts created yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Username</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customAccounts.map((account) => (
                        <tr key={account.id} className="border-b">
                          <td className="py-2 font-medium">{account.username}</td>
                          <td className="py-2">{account.name}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              account.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.role}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(account)}
                                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(account.id)}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}