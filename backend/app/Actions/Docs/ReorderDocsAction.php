<?php

namespace App\Actions\Docs;

use App\Models\ActivityLog;
use App\Models\Doc;
use App\Support\PublicApiCache;
use Illuminate\Support\Facades\DB;

class ReorderDocsAction
{
    /**
     * @param  array<int, array{id: int, order_num: int, doc_menu_id?: ?int}>  $items
     */
    public function execute(array $items): void
    {
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                Doc::where('id', $item['id'])->update([
                    'order_num' => $item['order_num'],
                    'doc_menu_id' => $item['doc_menu_id'] ?? null,
                ]);
            }
        });

        PublicApiCache::forgetDocs();
        ActivityLog::log('updated', 'Reordered docs', null);
    }
}
