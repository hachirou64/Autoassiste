<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Mailer: " . config('mail.mailer') . "\n";
echo "Host: " . config('mail.host') . "\n";
echo "Port: " . config('mail.port') . "\n";
echo "From: " . config('mail.from.address') . "\n";
echo "\nConfiguration OK!\n";
