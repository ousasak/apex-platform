<?php

namespace App\Services\Storage;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryStorageService
{
    public function isConfigured(): bool
    {
        $cloudUrl = config('cloudinary.cloud_url');

        return is_string($cloudUrl) && trim($cloudUrl) !== '';
    }

    public function client(): Cloudinary
    {
        return new Cloudinary((string) config('cloudinary.cloud_url'));
    }

    /**
     * @return array{path: string, url: string}
     */
    public function upload(UploadedFile $file, string $folder = 'apex/media'): array
    {
        $result = $this->client()->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'auto',
        ]);

        return [
            'path' => (string) $result['public_id'],
            'url' => (string) $result['secure_url'],
        ];
    }

    public function delete(string $publicId): void
    {
        try {
            $this->client()->uploadApi()->destroy($publicId);
        } catch (\Throwable) {
            // Do not block deletion when remote cleanup fails
        }
    }

    public function url(string $publicId): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            return (string) $this->client()->image($publicId)->toUrl();
        } catch (\Throwable) {
            return null;
        }
    }

    public function usage(): array
    {
        return (array) $this->client()->adminApi()->usage();
    }
}
