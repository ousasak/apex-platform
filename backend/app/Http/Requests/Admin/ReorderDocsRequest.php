<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderDocsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:docs,id'],
            'items.*.order_num' => ['required', 'integer', 'min:0'],
            'items.*.doc_menu_id' => ['nullable', 'integer', 'exists:doc_menus,id'],
        ];
    }
}
