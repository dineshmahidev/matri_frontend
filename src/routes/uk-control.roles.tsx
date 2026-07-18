import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Users, Key, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute('/uk-control/roles')({
  component: RolesPage,
});

function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get<any[]>('/admin/roles');
      setRoles(response);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="font-display text-2xl font-bold text-slate-800">Roles & Permissions</h1>
          
          <Link to="/uk-control/role-edit">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 rounded-md">
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {roles.map((role) => {
              const isSystem = ['super-admin', 'admin', 'manager', 'staff'].includes(role.name);
              const isSuper = role.name === 'super-admin';
              return (
                <div 
                  key={role.id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{role.name.replace('-', ' ')}</h3>
                  
                  <div className="flex items-center gap-2">
                    {isSuper ? (
                      <span className="text-sm text-slate-500 font-medium">
                        Super Admin permissions cannot be changed
                      </span>
                    ) : (
                      <Link to="/uk-control/role-edit" search={{ id: role.id }}>
                        <Button 
                          variant="outline" 
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 rounded-md"
                        >
                          <Key className="w-4 h-4" />
                          Permissions
                        </Button>
                      </Link>
                    )}
                    
                    {!isSystem && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the {role.name} role? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await api.delete(`/admin/roles/${role.id}`);
                                  toast.success('Role deleted');
                                  fetchRoles();
                                } catch (error) {
                                  toast.error('Failed to delete role');
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
