import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClubSanctionSchema, type InsertClubSanction, type ClubSanction } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SimpleFileUploader } from "./SimpleFileUploader";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ClubSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSanction?: ClubSanction | null;
}

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
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
const TIPOS_SANCION = [
  'Sanciones económicas',
  'Prohibición de banderas e instrumentos',
  'Encuentros a puertas cerradas',
  'Clausura del estadio',
  'Otras'
];

const MOTIVOS_SANCION = [
  'Peleas en tribunas',
  'Uso de pirotecnia',
  'Cuestiones organizativas',
  'Falta de seguridad en el estadio',
  'Agresiones a árbitros',
  'Incidentes con jugadores visitantes',
  'Falta de control sobre espectadores',
  'Problemas de infraestructura',
  'Incumplimiento de normativas',
  'Comportamiento antideportivo de dirigentes',
  'Venta irregular de entradas',
  'Insuficiente personal de seguridad',
  'Ingreso de objetos prohibidos',
  'Daños a instalaciones',
  'Alteración del orden público',
  'Incumplimiento de protocolos sanitarios',
  'Sobreventa de localidades',
  'Falta de ambulancia médica',
  'Deficiencias en iluminación',
  'Otros motivos organizativos'
];

export default function ClubSanctionModal({ isOpen, onClose, editingSanction }: ClubSanctionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedActa, setUploadedActa] = useState<string | null>(null);

  const form = useForm<InsertClubSanction>({
    resolver: zodResolver(insertClubSanctionSchema),
    defaultValues: {
      nombreSancionado: editingSanction?.nombreSancionado || "",
      deporte: editingSanction?.deporte || "",
      ubicacion: editingSanction?.ubicacion || "",
      tipoSancion: editingSanction?.tipoSancion || "",
      motivoSancion: editingSanction?.motivoSancion || [],
      fechaInicio: editingSanction?.fechaInicio || "",
      fechaFin: editingSanction?.fechaFin || "",
      observaciones: editingSanction?.observaciones || "",
      actaPdf: editingSanction?.actaPdf || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: InsertClubSanction) => {
      if (editingSanction) {
        return apiRequest("PUT", `/api/club-sanctions/${editingSanction.id}`, data);
      } else {
        return apiRequest("POST", "/api/club-sanctions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
      toast({
        title: editingSanction ? "Sanción actualizada" : "Sanción creada",
        description: editingSanction ? "La sanción fue actualizada exitosamente" : "La sanción de club fue creada exitosamente",
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

  const onSubmit = (data: InsertClubSanction) => {
    const finalData = { ...data, actaPdf: uploadedActa || editingSanction?.actaPdf || "" };
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
            {editingSanction ? 'Editar Sanción Club' : 'Nueva Sanción Club'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center text-blue-700">
              <i className="fas fa-info-circle mr-2"></i>
              <span className="font-medium">El número de carga de club se asignará automáticamente al guardar la sanción</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombreSancionado" className="text-gray-700">Nombre del Sancionado *</Label>
              <Input
                id="nombreSancionado"
                {...form.register("nombreSancionado")}
                placeholder="Nombre del club"
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-club-name"
              />
              {form.formState.errors.nombreSancionado && (
                <p className="text-red-400 text-sm">{form.formState.errors.nombreSancionado.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="deporte">Deporte *</Label>
              <Select
                value={form.watch("deporte")}
                onValueChange={(value) => form.setValue("deporte", value)}
              >
                <SelectTrigger data-testid="select-club-sport">
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
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Select
                value={form.watch("ubicacion")}
                onValueChange={(value) => form.setValue("ubicacion", value)}
              >
                <SelectTrigger data-testid="select-club-location">
                  <SelectValue placeholder="Seleccionar ubicación" />
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
              <Label htmlFor="tipoSancion">Tipo de Sanción *</Label>
              <Select
                value={form.watch("tipoSancion")}
                onValueChange={(value) => form.setValue("tipoSancion", value)}
              >
                <SelectTrigger data-testid="select-sanction-type">
                  <SelectValue placeholder="Seleccionar tipo de sanción" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SANCION.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tipoSancion && (
                <p className="text-red-500 text-sm">{form.formState.errors.tipoSancion.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="motivoSancion">Motivos de la Sanción * (Seleccione uno o más)</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MOTIVOS_SANCION.map((motivo) => {
                    const selectedMotivos = form.watch("motivoSancion") || [];
                    const isChecked = selectedMotivos.includes(motivo);
                    return (
                      <div key={motivo} className="flex items-center space-x-2">
                        <Checkbox
                          id={`motivo-${motivo}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentMotivos = form.watch("motivoSancion") || [];
                            if (checked) {
                              form.setValue("motivoSancion", [...currentMotivos, motivo]);
                            } else {
                              form.setValue("motivoSancion", currentMotivos.filter(m => m !== motivo));
                            }
                          }}
                          data-testid={`checkbox-motivo-${motivo.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label 
                          htmlFor={`motivo-${motivo}`} 
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          {motivo}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {form.watch("motivoSancion")?.length || 0} motivo(s) seleccionado(s)
              </div>
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
                data-testid="input-start-date"
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
                data-testid="input-end-date"
              />
              {form.formState.errors.fechaFin && (
                <p className="text-red-500 text-sm">{form.formState.errors.fechaFin.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="observaciones">Observaciones y Detalles</Label>
            <Textarea
              id="observaciones"
              {...form.register("observaciones")}
              placeholder="Descripción detallada de los hechos, circunstancias, medidas adoptadas, etc..."
              rows={4}
              data-testid="textarea-observations"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={saveMutation.isPending}
              data-testid="button-save-club-sanction"
            >
              {saveMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Guardar Sanción
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel-club-sanction"
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
