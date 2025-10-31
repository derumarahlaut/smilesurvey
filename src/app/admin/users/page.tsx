"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, User, Shield } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

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
  const { user } = useAuth();
  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CustomAccount | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator' as 'admin' | 'operator'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('Semua field harus diisi');
      return;
    }

    // Check if username already exists
    const allAccounts = [...DEFAULT_ACCOUNTS, ...customAccounts];
    const existingAccount = allAccounts.find(acc => 
      acc.username === formData.username && acc.id !== editingAccount?.id
    );

    if (existingAccount) {
      setError('Username sudah digunakan');
      return;
    }

    if (editingAccount) {
      // Update existing account
      const updatedAccounts = customAccounts.map(acc =>
        acc.id === editingAccount.id
          ? { ...acc, ...formData }
          : acc
      );
      saveCustomAccounts(updatedAccounts);
      setSuccess('Akun berhasil diperbarui');
    } else {
      // Create new account
      const newAccount: CustomAccount = {
        id: `custom_${Date.now()}`,
        ...formData
      };
      saveCustomAccounts([...customAccounts, newAccount]);
      setSuccess('Akun berhasil dibuat');
    }

    setFormData({ username: '', password: '', name: '', role: 'operator' });
    setEditingAccount(null);
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (account: CustomAccount) => {
    setFormData({
      username: account.username,
      password: account.password,
      name: account.name,
      role: account.role
    });
    setEditingAccount(account);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      const updatedAccounts = customAccounts.filter(acc => acc.id !== accountId);
      saveCustomAccounts(updatedAccounts);
      setSuccess('Akun berhasil dihapus');
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', role: 'operator' });
    setEditingAccount(null);
    setError('');
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
            <p className="text-gray-600">Kelola akun operator dan administrator</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingAccount ? 'Perbarui informasi akun' : 'Buat akun operator atau admin baru'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Masukkan username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Masukkan password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'operator'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingAccount ? 'Perbarui' : 'Buat Akun'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Default Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Akun Default</CardTitle>
              <CardDescription>Akun bawaan sistem yang tidak dapat dihapus</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEFAULT_ACCOUNTS.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant={account.role === 'admin' ? 'default' : 'secondary'}>
                          {account.role === 'admin' ? (
                            <><Shield className="w-3 h-3 mr-1" /> Admin</>
                          ) : (
                            <><User className="w-3 h-3 mr-1" /> Operator</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Default</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Custom Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Akun Custom</CardTitle>
              <CardDescription>Akun yang dibuat oleh administrator</CardDescription>
            </CardHeader>
            <CardContent>
              {customAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada akun custom yang dibuat</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.username}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          <Badge variant={account.role === 'admin' ? 'default' : 'secondary'}>
                            {account.role === 'admin' ? (
                              <><Shield className="w-3 h-3 mr-1" /> Admin</>
                            ) : (
                              <><User className="w-3 h-3 mr-1" /> Operator</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(account)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(account.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}