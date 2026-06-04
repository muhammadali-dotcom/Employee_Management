'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { getDepartments, saveDepartment, deleteDepartment, getEmployees } from '@/lib/store';
import { Department, Employee } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const DepartmentsPage = () => {
  const { accessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [nameError, setNameError] = useState('');
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const load = async () => {
    const [deptList, empList] = await Promise.all([
      getDepartments(accessToken),
      getEmployees(accessToken),
    ]);
    setDepartments(deptList);
    setEmployees(empList);
  }

  useEffect(() => { load(); }, [accessToken]);

  const getEmpCount = (deptId: string) => {
    return employees.filter((e) => e.departmentId === deptId).length;
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setNameError('Name is required'); return; }
    const exists = departments.some((d) => d.name.toLowerCase() === newName.trim().toLowerCase());
    if (exists) { setNameError('A department with this name already exists'); return; }
    await saveDepartment({ id: generateId(), name: newName.trim(), description: newDesc.trim(), createdAt: new Date().toISOString().split('T')[0] }, accessToken);
    setNewName(''); setNewDesc(''); setNameError('');
    await load();
  }

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editName.trim()) { setEditError('Name is required'); return; }
    const exists = departments.some((d) => d.id !== editTarget.id && d.name.toLowerCase() === editName.trim().toLowerCase());
    if (exists) { setEditError('A department with this name already exists'); return; }
    await saveDepartment({ ...editTarget, name: editName.trim() }, accessToken);
    setEditTarget(null); setEditName(''); setEditError('');
    await load();
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDepartment(deleteTarget.id, accessToken);
    setDeleteTarget(null);
    await load();
  }

  const affectedCount = deleteTarget ? getEmpCount(deleteTarget.id) : 0;

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        {/* Add form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Add Department</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Department name"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                error={nameError}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employees</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">No departments yet.</td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {editTarget?.id === dept.id ? (
                        <form onSubmit={handleRename} className="flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                            error={editError}
                          />
                          <Button type="submit" size="sm">Save</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => setEditTarget(null)}>Cancel</Button>
                        </form>
                      ) : (
                        dept.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{dept.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{getEmpCount(dept.id)}</td>
                    <td className="px-4 py-3">
                      {editTarget?.id !== dept.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditTarget(dept); setEditName(dept.name); setEditError(''); }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(dept)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete Department"
        message={
          affectedCount > 0
            ? `This department has ${affectedCount} employee(s). Deleting it will unassign them. Are you sure?`
            : `Are you sure you want to delete "${deleteTarget?.name}"?`
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </AppShell>
  );
}

export default DepartmentsPage;
