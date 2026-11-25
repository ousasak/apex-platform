<?php

namespace App\Actions\Media;

use App\Models\ActivityLog;
use App\Models\Media;
use App\Services\Storage\CloudinaryStorageService;
use App\Services\Storage\SupabaseStorageService;

class DeleteMediaAction
{
    public function __construct(
        private readonly SupabaseStorageService $supabase,
        private readonly CloudinaryStorageService $cloudinary,
    ) {}

    public function execute(Media $media): void
    {
        $originalName = $media->original_name;
        $disk = $media->disk;
        $path = $media->path;

        $media->delete();

        if ($disk === 'cloudinary') {
            $this->cloudinary->delete($path);
        } elseif ($disk === 'supabase') {
            $this->supabase->delete($path);
        }

        ActivityLog::log('deleted', "Deleted media: {$originalName}");
    }
}
