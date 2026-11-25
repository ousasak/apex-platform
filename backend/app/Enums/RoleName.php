<?php

namespace App\Enums;

enum RoleName: string
{
    case SuperAdmin = 'superadmin';
    case Admin = 'admin';
    case Member = 'member';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** @return list<string> */
    public static function adminRoles(): array
    {
        return [self::Admin->value, self::SuperAdmin->value];
    }

    /** @return list<string> */
    public static function memberRoles(): array
    {
        return [self::Member->value, self::Admin->value, self::SuperAdmin->value];
    }
}
