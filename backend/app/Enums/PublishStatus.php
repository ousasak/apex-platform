<?php

namespace App\Enums;

enum PublishStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** @return list<string> */
    public static function docValues(): array
    {
        return [self::Draft->value, self::Published->value];
    }
}
