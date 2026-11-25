<?php

namespace App\Http\Resources\Admin;

use App\Models\Media;
use App\Services\Storage\CloudinaryStorageService;
use App\Services\Storage\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Media */
class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $data['url'] = $this->resolveUrl();

        if ($this->relationLoaded('uploader') && $this->uploader) {
            $data['uploader'] = [
                'id' => $this->uploader->id,
                'name' => $this->uploader->name,
            ];
        }

        return $data;
    }

    private function resolveUrl(): string
    {
        if ($this->disk === 'cloudinary') {
            return app(CloudinaryStorageService::class)->url($this->path) ?? '';
        }

        return app(SupabaseStorageService::class)->url($this->path) ?? '';
    }
}
