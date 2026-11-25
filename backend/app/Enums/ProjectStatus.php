<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Active = 'active';
    case Wip = 'wip';
    case Archived = 'archived';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
