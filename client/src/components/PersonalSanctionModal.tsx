import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonalSanctionSchema, type InsertPersonalSanction } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PersonalSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

export default function PersonalSanctionModal({ isOpen, onClose }: PersonalSanctionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertPersonalSanction>({
    resolver: zodResolver(insertPersonalSanctionSchema),
    defaultValues: {
      nombrePersona: "",
      dniPersona: "",
      edadPersona: 18,
      deporte: "",
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPersonalSanction) => 
      apiRequest("POST", "/api/personal-sanctions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-sanctions"] });
      toast({
        title: "Sanción creada",
        description: "La sanción personal fue creada exitosamente",
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

  const onSubmit = (data: InsertPersonalSanction) => {
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
            Nueva Sanción Personal - Tribuna Segura
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombrePersona">Nombre y Apellido *</Label>
              <Input
                id="nombrePersona"
                {...form.register("nombrePersona")}
                placeholder="Nombre completo"
                data-testid="input-person-name"
              />
              {form.formState.errors.nombrePersona && (
                <p className="text-red-500 text-sm">{form.formState.errors.nombrePersona.message}</p>
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
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={createMutation.isPending}
              data-testid="button-save-personal-sanction"
            >
              {createMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Guardar Sanción Personal
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
