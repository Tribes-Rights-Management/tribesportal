import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface TrackDetailsData {
  track_title: string;
  track_artist: string;
  track_isrc: string;
  runtime: string;
  appears_multiple_times: boolean;
  times_count: number | null;
  additional_track_info: string;
}

interface TrackDetailsStepProps {
  data: TrackDetailsData;
  onUpdate: (field: string, value: string | boolean | number | null) => void;
  errors: Record<string, string>;
}

export function TrackDetailsStep({ data, onUpdate, errors }: TrackDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Track Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the specific track information.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="track_title">Track Title *</Label>
          <Input
            id="track_title"
            value={data.track_title}
            onChange={(e) => onUpdate("track_title", e.target.value)}
            className={errors.track_title ? "border-destructive" : ""}
          />
          {errors.track_title && (
            <p className="text-xs text-destructive">{errors.track_title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="track_artist">Track Artist *</Label>
          <Input
            id="track_artist"
            value={data.track_artist}
            onChange={(e) => onUpdate("track_artist", e.target.value)}
            className={errors.track_artist ? "border-destructive" : ""}
          />
          {errors.track_artist && (
            <p className="text-xs text-destructive">{errors.track_artist}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="track_isrc">ISRC *</Label>
          <Input
            id="track_isrc"
            value={data.track_isrc}
            onChange={(e) => onUpdate("track_isrc", e.target.value)}
            placeholder="e.g., USRC17607839"
            className={errors.track_isrc ? "border-destructive" : ""}
          />
          {errors.track_isrc && (
            <p className="text-xs text-destructive">{errors.track_isrc}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="runtime">Runtime (MM:SS) *</Label>
          <Input
            id="runtime"
            value={data.runtime}
            onChange={(e) => onUpdate("runtime", e.target.value)}
            placeholder="e.g., 3:45"
            className={errors.runtime ? "border-destructive" : ""}
          />
          {errors.runtime && (
            <p className="text-xs text-destructive">{errors.runtime}</p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="appears_multiple_times"
              checked={data.appears_multiple_times}
              onCheckedChange={(checked) => {
                onUpdate("appears_multiple_times", !!checked);
                if (!checked) onUpdate("times_count", null);
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="appears_multiple_times" className="text-sm cursor-pointer">
                Track appears multiple times in the product
              </Label>
              <p className="text-xs text-muted-foreground">
                Check this if the same track appears in multiple places (e.g., different versions)
              </p>
            </div>
          </div>

          {data.appears_multiple_times && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="times_count">Number of times</Label>
              <Input
                id="times_count"
                type="number"
                min={2}
                value={data.times_count || ""}
                onChange={(e) => onUpdate("times_count", e.target.value ? parseInt(e.target.value) : null)}
                className="w-24"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_track_info">Additional Information</Label>
          <Textarea
            id="additional_track_info"
            value={data.additional_track_info}
            onChange={(e) => onUpdate("additional_track_info", e.target.value)}
            placeholder="Any additional track details..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
