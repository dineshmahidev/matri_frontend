import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { api } from '@/lib/api';

export const Route = createFileRoute('/uk-control/role-edit')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | undefined,
    }
  },
  component: RoleEditPage,
});

function RoleEditPage() {
  const search = useSearch({ from: '/uk-control/role-edit' }) as { id?: string };
  const roleId = search.id;
  const navigate = useNavigate();

  const [roleName, setRoleName] = useState("");
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const permsRes = await api.get<any[]>('/admin/permissions');
      setAllPermissions(permsRes);

      if (roleId) {
        const rolesRes = await api.get<any[]>('/admin/roles');
        const role = rolesRes.find((r: any) => r.id === parseInt(roleId));
        if (role) {
          setRoleName(role.name);
          setSelectedPermissions(role.permissions.map((p: any) => p.name));
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permName]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permName));
    }
  };

  const handleSave = async () => {
    if (!roleName) {
      toast.error('Role name is required');
      return;
    }

    try {
      if (roleId) {
        await api.put(`/admin/roles/${roleId}`, {
          name: roleName,
          permissions: selectedPermissions
        });
        toast.success("Role updated successfully!");
      } else {
        await api.post('/admin/roles', {
          name: roleName,
          permissions: selectedPermissions
        });
        toast.success("Role created successfully!");
        navigate({ to: '/uk-control/roles' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  // Group permissions by module (first word, e.g., 'view users' -> 'users')
  const groupedPermissions: Record<string, any[]> = {};
  allPermissions.forEach(p => {
    const parts = p.name.split(' ');
    const moduleName = parts.length > 1 ? parts.slice(1).join(' ') : 'other';
    if (!groupedPermissions[moduleName]) {
      groupedPermissions[moduleName] = [];
    }
    groupedPermissions[moduleName].push(p);
  });

  const isSystemRole = ['super-admin', 'admin', 'manager', 'staff'].includes(roleName.toLowerCase());

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="font-display text-2xl font-bold text-slate-800">
            {roleId ? `Edit Role: ${roleName}` : 'Create New Role'}
          </h1>
          
          <Link to="/uk-control/roles">
            <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 flex items-center gap-2 rounded-md">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4 max-w-3xl">
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={isSystemRole}
                  placeholder="e.g. Sales Associate"
                  className="h-11 rounded-lg border-slate-200 focus-visible:ring-indigo-500"
                />
                {isSystemRole && (
                  <p className="text-xs text-slate-500 mt-1">System role names cannot be changed.</p>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <Label className="text-slate-800 font-semibold text-base">Assign Permissions</Label>
                
                <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <Accordion type="multiple" className="w-full">
                    {Object.keys(groupedPermissions).map((module, idx) => (
                      <AccordionItem 
                        key={module} 
                        value={module} 
                        className={`px-4 ${idx !== Object.keys(groupedPermissions).length - 1 ? 'border-b border-slate-200' : 'border-0'}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-4 text-slate-700 font-medium capitalize">
                          {module}
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <div className="flex flex-col gap-8 pl-2">
                            <div className="flex flex-wrap gap-6">
                              {groupedPermissions[module].map(perm => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`perm-${perm.id}`} 
                                    checked={selectedPermissions.includes(perm.name)}
                                    onCheckedChange={(checked) => handlePermissionChange(perm.name, checked as boolean)}
                                    className="border-slate-300 text-indigo-600 focus-visible:ring-indigo-500" 
                                  />
                                  <Label 
                                    htmlFor={`perm-${perm.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 capitalize"
                                  >
                                    {perm.name.split(' ')[0]}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
              
              <div className="pt-6">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-8 rounded-md h-11">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
