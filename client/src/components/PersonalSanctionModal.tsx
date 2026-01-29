import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonalSanctionSchema, type InsertPersonalSanction, type PersonalSanction } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SimpleFileUploader } from "./SimpleFileUploader";
import { useState } from "react";

interface PersonalSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSanction?: PersonalSanction | null;
}

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

const MOTIVOS_TRIBUNA_SEGURA = [
  'Pedido de captura',
  'Derecho de admisión',
  'Prohibición de concurrencia',
  'Restricción de concurrencia administrativa'
];

const UBICACIONES = [
  'Capital',
  'Calamuchita',
  'Colón',
  'Cruz del Eje',
  'General Roca',
  'General San Martín',
  'Ischilín',
  'Juárez Celman',
  'Marcos Juárez',
  'Minas',
  'Pocho',
  'Punilla',
  'Río Cuarto',
  'Río Primero',
  'Río Seco',
  'Río Segundo',
  'San Alberto',
  'San Javier',
  'San Justo',
  'Santa María',
  'Sobremonte',
  'Tercero Arriba',
  'Totoral',
  'Tulumba',
  'Unión',
  'Presidente Roque Sáenz Peña'
];

export default function PersonalSanctionModal({ isOpen, onClose, editingSanction }: PersonalSanctionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedActa, setUploadedActa] = useState<string | null>(null);

  const form = useForm<InsertPersonalSanction>({
    resolver: zodResolver(insertPersonalSanctionSchema),
    defaultValues: {
      nombrePersona: editingSanction?.nombrePersona || "",
      dniPersona: editingSanction?.dniPersona || "",
      edadPersona: editingSanction?.edadPersona || 18,
      deporte: editingSanction?.deporte || "",
      ubicacion: editingSanction?.ubicacion || "",
      motivoSancion: editingSanction?.motivoSancion || "",
      fechaInicio: editingSanction?.fechaInicio || "",
      fechaFin: editingSanction?.fechaFin || "",
      observaciones: editingSanction?.observaciones || "",
      actaPdf: editingSanction?.actaPdf || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: InsertPersonalSanction) => {
      if (editingSanction) {
        return apiRequest("PUT", `/api/personal-sanctions/${editingSanction.id}`, data);
      } else {
        return apiRequest("POST", "/api/personal-sanctions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-sanctions"] });
      toast({
        title: editingSanction ? "Sanción actualizada" : "Sanción creada",
        description: editingSanction ? "La sanción fue actualizada exitosamente" : "La sanción personal fue creada exitosamente",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || (editingSanction ? "No se pudo actualizar la sanción" : "No se pudo crear la sanción"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPersonalSanction) => {
    const finalData = { ...data, actaPdf: uploadedActa || "" };
    saveMutation.mutate(finalData);
  };

  const handleFileUploaded = (filePath: string) => {
    setUploadedActa(filePath);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {editingSanction ? 'Editar Sanción Personal' : 'Nueva Sanción Personal'} - Tribuna Segura
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center text-blue-700">
              <i className="fas fa-info-circle mr-2"></i>
              <span className="font-medium">El número de carga de tribuna segura se asignará automáticamente al guardar la sanción</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombrePersona" className="text-gray-700">Nombre y Apellido *</Label>
              <Input
                id="nombrePersona"
                {...form.register("nombrePersona")}
                placeholder="Nombre completo"
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-person-name"
              />
              {form.formState.errors.nombrePersona && (
                <p className="text-red-400 text-sm">{form.formState.errors.nombrePersona.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="dniPersona">DNI *</Label>
              <Input
                id="dniPersona"
                {...form.register("dniPersona")}
                placeholder="12.345.678"
                data-testid="input-person-dni"
              />
              {form.formState.errors.dniPersona && (
                <p className="text-red-500 text-sm">{form.formState.errors.dniPersona.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="edadPersona">Edad *</Label>
              <Input
                id="edadPersona"
                type="number"
                min="16"
                max="99"
                {...form.register("edadPersona", { valueAsNumber: true })}
                data-testid="input-person-age"
              />
              {form.formState.errors.edadPersona && (
                <p className="text-red-500 text-sm">{form.formState.errors.edadPersona.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="deporte">Deporte *</Label>
              <Select
                value={form.watch("deporte")}
                onValueChange={(value) => form.setValue("deporte", value)}
              >
                <SelectTrigger data-testid="select-person-sport">
                  <SelectValue placeholder="Seleccionar deporte" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.deporte && (
                <p className="text-red-500 text-sm">{form.formState.errors.deporte.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="ubicacion">Departamento *</Label>
              <Select
                value={form.watch("ubicacion")}
                onValueChange={(value) => form.setValue("ubicacion", value)}
              >
                <SelectTrigger data-testid="select-person-location">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {UBICACIONES.map((ubicacion) => (
                    <SelectItem key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.ubicacion && (
                <p className="text-red-500 text-sm">{form.formState.errors.ubicacion.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="motivoSancion">Motivo de la Sanción *</Label>
              <Select
                value={form.watch("motivoSancion")}
                onValueChange={(value) => form.setValue("motivoSancion", value)}
              >
                <SelectTrigger data-testid="select-person-sanction-reason">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_TRIBUNA_SEGURA.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.motivoSancion && (
                <p className="text-red-500 text-sm">{form.formState.errors.motivoSancion.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
              <Input
                id="fechaInicio"
                type="date"
                {...form.register("fechaInicio")}
                data-testid="input-person-start-date"
              />
              {form.formState.errors.fechaInicio && (
                <p className="text-red-500 text-sm">{form.formState.errors.fechaInicio.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="fechaFin">Fecha Fin *</Label>
              <Input
                id="fechaFin"
                type="date"
                {...form.register("fechaFin")}
                data-testid="input-person-end-date"
              />
              {form.formState.errors.fechaFin && (
                <p className="text-red-500 text-sm">{form.formState.errors.fechaFin.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="observaciones">Motivo de la Sanción</Label>
            <Textarea
              id="observaciones"
              {...form.register("observaciones")}
              placeholder="Describir el motivo de la sanción..."
              rows={3}
              data-testid="textarea-person-observations"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">Adjuntar Acta (PDF)</Label>
            <div className="flex items-center space-x-4">
              <SimpleFileUploader
                onFileUploaded={handleFileUploaded}
                buttonClassName="gov-button-secondary"
              >
                <i className="fas fa-paperclip mr-2"></i>
                {uploadedActa ? 'Cambiar Acta PDF' : 'Adjuntar Acta PDF'}
              </SimpleFileUploader>
              {uploadedActa && (
                <div className="flex items-center text-green-600">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span className="text-sm">Acta cargada correctamente</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Archivo opcional. Formato PDF, máximo 10MB
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={saveMutation.isPending}
              data-testid="button-save-personal-sanction"
            >
              {saveMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {editingSanction ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {editingSanction ? 'Actualizar Sanción' : 'Guardar Sanción Personal'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel-personal-sanction"
            >
              <i className="fas fa-times mr-2"></i>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
