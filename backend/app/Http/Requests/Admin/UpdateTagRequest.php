<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('tags', 'slug')->ignore($id)],
            'color' => ['nullable', 'string', 'max:7'],
            'logo' => ['nullable', 'string', 'max:500'],
            'logo_file' => ['nullable', 'file', 'max:2048', 'mimes:svg,png,jpg,jpeg,webp,gif'],
        ];
    }
}
