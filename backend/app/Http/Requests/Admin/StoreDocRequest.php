<?php

namespace App\Http\Requests\Admin;

use App\Enums\PublishStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:docs,slug'],
            'content' => ['nullable', 'string'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:100'],
            'doc_menu_id' => ['nullable', 'integer', 'exists:doc_menus,id'],
            'order_num' => ['integer', 'min:0'],
            'status' => [Rule::in(PublishStatus::docValues())],
            'parent_id' => ['nullable', 'integer', 'exists:docs,id'],
            'sections' => ['nullable', 'array'],
            'sections.*.heading' => ['required', 'string', 'max:255'],
            'sections.*.content' => ['nullable', 'string'],
        ];
    }
}
