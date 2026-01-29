import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, InsertUser } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Plus, Edit, Trash2, Key, Clock, Shield, UserCheck } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "user"]),
  temporaryAccess: z.boolean().default(false),
  accessExpires: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function AdministrarTab() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
    watch: watchCreate,
    setValue: setValueCreate,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "user",
      temporaryAccess: false,
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    watch: watchEdit,
    setValue: setValueEdit,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema.omit({ password: true }).extend({ password: z.string().optional() })),
  });

  const temporaryAccessCreate = watchCreate("temporaryAccess");
  const temporaryAccessEdit = watchEdit("temporaryAccess");

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return await res.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const payload: InsertUser = {
        ...userData,
        accessExpires: userData.temporaryAccess && userData.accessExpires 
          ? new Date(userData.accessExpires) 
          : undefined,
        createdBy: currentUser?.id,
      };
      const res = await apiRequest("POST", "/api/register", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateModalOpen(false);
      resetCreate();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const payload = {
        ...data,
        accessExpires: data.temporaryAccess && data.accessExpires 
          ? new Date(data.accessExpires) 
          : null,
      };
      // Remove password if empty
      if (payload.password === "") {
        delete payload.password;
      }
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetEdit();
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: UserFormData) => {
    if (!selectedUser) return;
    updateUserMutation.mutate({ id: selectedUser.id, data });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    resetEdit({
      username: user.username,
      role: user.role as "admin" | "user",
      temporaryAccess: user.temporaryAccess,
      accessExpires: user.accessExpires ? new Date(user.accessExpires).toISOString().slice(0, 16) : "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.username}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Sin expiración";
    return new Date(dateString).toLocaleString("es-AR");
  };

  const isUserExpired = (user: User) => {
    if (!user.temporaryAccess || !user.accessExpires) return false;
    return new Date() > new Date(user.accessExpires);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Acceso Restringido</h3>
          <p className="text-gray-500">Solo los administradores pueden acceder a esta sección</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Administración de Usuarios
          </h2>
          <p className="text-gray-600">Gestiona usuarios, permisos y accesos al sistema</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-user">
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Usuario *</Label>
                <Input
                  id="create-username"
                  placeholder="Nombre de usuario"
                  {...registerCreate("username")}
                  className={createErrors.username ? "border-red-500" : ""}
                  data-testid="input-create-username"
                />
                {createErrors.username && (
                  <p className="text-red-500 text-sm">{createErrors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Contraseña *</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Contraseña"
                  {...registerCreate("password")}
                  className={createErrors.password ? "border-red-500" : ""}
                  data-testid="input-create-password"
                />
                {createErrors.password && (
                  <p className="text-red-500 text-sm">{createErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-role">Rol *</Label>
                <Select onValueChange={(value) => setValueCreate("role", value as "admin" | "user")} defaultValue="user">
                  <SelectTrigger data-testid="select-create-role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {createErrors.role && (
                  <p className="text-red-500 text-sm">{createErrors.role.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="create-temporary"
                  checked={temporaryAccessCreate}
                  onCheckedChange={(checked) => setValueCreate("temporaryAccess", checked)}
                  data-testid="switch-create-temporary"
                />
                <Label htmlFor="create-temporary">Acceso temporal</Label>
              </div>

              {temporaryAccessCreate && (
                <div className="space-y-2">
                  <Label htmlFor="create-expires">Fecha de expiración</Label>
                  <Input
                    id="create-expires"
                    type="datetime-local"
                    {...registerCreate("accessExpires")}
                    data-testid="input-create-expires"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className={isUserExpired(user) ? "border-red-200 bg-red-50" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {user.role === "admin" ? (
                      <Shield className="h-8 w-8 text-blue-600" />
                    ) : (
                      <UserCheck className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900" data-testid={`text-username-${user.id}`}>
                      {user.username}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </Badge>
                      <Badge variant={user.isActive ? "secondary" : "destructive"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {user.temporaryAccess && (
                        <Badge variant={isUserExpired(user) ? "destructive" : "outline"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {isUserExpired(user) ? "Expirado" : "Temporal"}
                        </Badge>
                      )}
                    </div>
                    {user.temporaryAccess && (
                      <p className="text-sm text-gray-500 mt-1">
                        Expira: {formatDate(user.accessExpires)}
                      </p>
                    )}
                    {user.lastLogin && (
                      <p className="text-sm text-gray-500 mt-1">
                        Último acceso: {formatDate(user.lastLogin)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    data-testid={`button-edit-${user.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {currentUser?.id !== user.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-delete-${user.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No hay usuarios</h3>
              <p className="text-gray-500">Crea el primer usuario para comenzar</p>
            </div>
          )}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Usuario *</Label>
                <Input
                  id="edit-username"
                  placeholder="Nombre de usuario"
                  {...registerEdit("username")}
                  className={editErrors.username ? "border-red-500" : ""}
                  data-testid="input-edit-username"
                />
                {editErrors.username && (
                  <p className="text-red-500 text-sm">{editErrors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Dejar vacío para mantener la actual"
                  {...registerEdit("password")}
                  data-testid="input-edit-password"
                />
                {editErrors.password && (
                  <p className="text-red-500 text-sm">{editErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol *</Label>
                <Select 
                  onValueChange={(value) => setValueEdit("role", value as "admin" | "user")}
                  defaultValue={selectedUser.role}
                >
                  <SelectTrigger data-testid="select-edit-role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-temporary"
                  checked={temporaryAccessEdit}
                  onCheckedChange={(checked) => setValueEdit("temporaryAccess", checked)}
                  data-testid="switch-edit-temporary"
                />
                <Label htmlFor="edit-temporary">Acceso temporal</Label>
              </div>

              {temporaryAccessEdit && (
                <div className="space-y-2">
                  <Label htmlFor="edit-expires">Fecha de expiración</Label>
                  <Input
                    id="edit-expires"
                    type="datetime-local"
                    {...registerEdit("accessExpires")}
                    data-testid="input-edit-expires"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateUserMutation.isPending ? "Actualizando..." : "Actualizar Usuario"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}