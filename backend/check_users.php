<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$emails = App\Models\User::pluck('email');
echo "Total: " . $emails->count() . "\n";
foreach ($emails as $e) {
    echo $e . "\n";
}
