import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClubSanctionSchema, type InsertClubSanction } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ClubSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

const UBICACIONES = ['Capital', 'Interior'];
const TIPOS_SANCION = ['Suspensión', 'Multa', 'Amonestación'];

export default function ClubSanctionModal({ isOpen, onClose }: ClubSanctionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertClubSanction>({
    resolver: zodResolver(insertClubSanctionSchema),
    defaultValues: {
      nombreSancionado: "",
      deporte: "",
      ubicacion: "",
      tipoSancion: "",
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertClubSanction) => 
      apiRequest("POST", "/api/club-sanctions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
      toast({
        title: "Sanción creada",
        description: "La sanción de club fue creada exitosamente",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la sanción",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClubSanction) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Nueva Sanción Club
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombreSancionado">Nombre del Sancionado *</Label>
              <Input
                id="nombreSancionado"
                {...form.register("nombreSancionado")}
                placeholder="Nombre del club"
                data-testid="input-club-name"
              />
              {form.formState.errors.nombreSancionado && (
                <p className="text-red-500 text-sm">{form.formState.errors.nombreSancionado.message}</p>
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
                  <SelectValue placeholder="Seleccionar tipo" />
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
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...form.register("observaciones")}
              placeholder="Detalles adicionales sobre la sanción..."
              rows={3}
              data-testid="textarea-observations"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
              data-testid="button-save-club-sanction"
            >
              {createMutation.isPending ? (
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
