<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('number_sequences')->insert([
            ['type' => 'invoice', 'current_number' => 0],
            ['type' => 'receipt', 'current_number' => 0],
        ]);
    }
}
