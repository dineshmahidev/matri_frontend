import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReligions, useCastes, useStates, useCities } from "@/lib/useReferenceData";

type Props = {
  religionId: number | null;
  casteId: number | null;
  stateId: number | null;
  cityId: number | null;
  onReligionChange: (id: number | null) => void;
  onCasteChange: (id: number | null) => void;
  onStateChange: (id: number | null) => void;
  onCityChange: (id: number | null) => void;
  required?: boolean;
};

export function MemberProfileFields({
  religionId,
  casteId,
  stateId,
  cityId,
  onReligionChange,
  onCasteChange,
  onStateChange,
  onCityChange,
  required = false,
}: Props) {
  const { data: religions = [] } = useReligions();
  const { data: castes = [] } = useCastes(religionId);
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities(stateId);

  useEffect(() => {
    if (religionId && !castes.some((c) => c.id === casteId)) {
      onCasteChange(null);
    }
  }, [religionId, castes, casteId, onCasteChange]);

  useEffect(() => {
    if (stateId && !cities.some((c) => c.id === cityId)) {
      onCityChange(null);
    }
  }, [stateId, cities, cityId, onCityChange]);

  return (
    <>
      <div className="space-y-1.5">
        <Label>Religion{required ? " *" : ""}</Label>
        <Select
          value={religionId ? String(religionId) : ""}
          onValueChange={(v) => onReligionChange(v ? Number(v) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select religion" />
          </SelectTrigger>
          <SelectContent>
            {religions.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Caste / Community{required ? " *" : ""}</Label>
        <Select
          value={casteId ? String(casteId) : ""}
          onValueChange={(v) => onCasteChange(v ? Number(v) : null)}
          disabled={!religionId}
        >
          <SelectTrigger>
            <SelectValue placeholder={religionId ? "Select caste" : "Select religion first"} />
          </SelectTrigger>
          <SelectContent>
            {castes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>State{required ? " *" : ""}</Label>
        <Select
          value={stateId ? String(stateId) : ""}
          onValueChange={(v) => onStateChange(v ? Number(v) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>City{required ? " *" : ""}</Label>
        <Select
          value={cityId ? String(cityId) : ""}
          onValueChange={(v) => onCityChange(v ? Number(v) : null)}
          disabled={!stateId}
        >
          <SelectTrigger>
            <SelectValue placeholder={stateId ? "Select city" : "Select state first"} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {cities.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
