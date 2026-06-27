<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NumberSequenceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('number_sequences')->upsert([
            ['type' => 'invoice', 'current_number' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'receipt', 'current_number' => 0, 'created_at' => now(), 'updated_at' => now()],
        ], 'type', ['current_number', 'updated_at']);
    }
}
