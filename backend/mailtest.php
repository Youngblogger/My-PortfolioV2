<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Mail::raw('Test from CODEMAFIA server', function($msg) {
        $msg->to('uthmanabdulwahab2019@gmail.com')
            ->subject('SMTP Test');
    });
    echo "Sent successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
