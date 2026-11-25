<?php

namespace App\Actions\Media;

use App\Models\ActivityLog;
use App\Models\Media;
use App\Services\Storage\CloudinaryStorageService;
use App\Services\Storage\SupabaseStorageService;
use Illuminate\Http\UploadedFile;

class UploadMediaAction
{
    public function __construct(
        private readonly SupabaseStorageService $supabase,
        private readonly CloudinaryStorageService $cloudinary,
    ) {}

    /**
     * @return array{media: Media, url: ?string}
     */
    public function execute(UploadedFile $file, string $provider, ?int $uploaderId): array
    {
        if ($provider === 'cloudinary') {
            $uploaded = $this->cloudinary->upload($file, 'apex/media');
            $path = $uploaded['path'];
            $url = $uploaded['url'];
        } else {
            $path = (string) $this->supabase->upload($file, 'media');
            $url = $this->supabase->url($path);
        }

        $media = Media::create([
            'filename' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => $provider,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $uploaderId,
        ]);

        ActivityLog::log('created', "Uploaded media: {$media->original_name}", $media);

        return [
            'media' => $media,
            'url' => $url,
        ];
    }
}
