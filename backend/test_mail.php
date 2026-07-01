<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('email', 'uthmanabdulwahab2019@gmail.com')->first();
if (!$user) {
    echo "User not found\n";
    $count = App\Models\User::count();
    echo "Total users: $count\n";
    exit(1);
}
echo "User found: " . $user->email . "\n";

$token = app('auth.password.broker')->createToken($user);
echo "Token created: " . substr($token, 0, 20) . "...\n";

try {
    $user->sendPasswordResetNotification($token);
    echo "Notification sent successfully!\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
