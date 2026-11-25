<?php

namespace App\Actions\Docs;

use App\Models\Doc;

class SaveDocSectionsAction
{
    /**
     * Replace a document's sections in order.
     *
     * @param  array<int, array{heading: string, content?: ?string}>  $sections
     */
    public function execute(Doc $doc, array $sections, bool $replaceExisting = true): void
    {
        if ($replaceExisting) {
            $doc->sections()->delete();
        }

        foreach (array_values($sections) as $index => $section) {
            $doc->sections()->create([
                'heading' => $section['heading'],
                'content' => $section['content'] ?? '',
                'order_num' => $index,
            ]);
        }
    }
}
