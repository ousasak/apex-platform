<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            // Drop the existing CHECK constraint on the resource column
            DB::statement('ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_resource_check');

            // Re-add with all 6 resource values
            DB::statement("ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_resource_check CHECK (resource::text = ANY (ARRAY['projects'::text, 'categories'::text, 'tags'::text, 'team_members'::text, 'blog_posts'::text, 'media'::text]))");
        } elseif ($driver === 'sqlite') {
            // SQLite enforces enum via a table-level CHECK constraint that cannot be altered in place
            $existing = DB::table('user_permissions')->get();
            Schema::dropIfExists('user_permissions');
            Schema::create('user_permissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->enum('resource', ['projects', 'categories', 'tags', 'team_members', 'blog_posts', 'media']);
                $table->boolean('can_create')->default(false);
                $table->boolean('can_update')->default(false);
                $table->boolean('can_delete')->default(false);
                $table->timestamps();

                $table->unique(['user_id', 'resource']);
            });
            foreach ($existing as $row) {
                DB::table('user_permissions')->insert((array) $row);
            }
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_resource_check');
            DB::statement("ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_resource_check CHECK (resource::text = ANY (ARRAY['projects'::text, 'categories'::text, 'tags'::text]))");
        }
    }
};
