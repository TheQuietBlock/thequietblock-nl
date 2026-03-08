<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$allowedOrigins = ['https://thequietblock.nl', 'https://www.thequietblock.nl'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}
header("Access-Control-Allow-Origin: $origin");
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// --- Load environment variables from .env ---
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error.']);
    exit;
}

$envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($envLines as $line) {
    if (str_starts_with(trim($line), '#')) continue;
    [$key, $value] = explode('=', $line, 2);
    $env[trim($key)] = trim($value);
}

// --- Simple rate limiting (file-based, per IP) ---
$rateLimitDir = sys_get_temp_dir() . '/tqb_ratelimit';
if (!is_dir($rateLimitDir)) mkdir($rateLimitDir, 0700, true);

$clientIp      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = $rateLimitDir . '/' . md5($clientIp) . '.txt';
$minInterval   = 60;

if (file_exists($rateLimitFile)) {
    $lastTime = (int) file_get_contents($rateLimitFile);
    if (time() - $lastTime < $minInterval) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please wait a minute.']);
        exit;
    }
}

// --- Parse JSON body ---
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$username   = trim($body['username'] ?? '');
$motivation = trim($body['motivation'] ?? '');

// --- Validate ---
if (!preg_match('/^[a-zA-Z0-9_]{3,16}$/', $username)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid Minecraft username.']);
    exit;
}

if (mb_strlen($motivation) < 10 || mb_strlen($motivation) > 500) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Motivation must be 10–500 characters.']);
    exit;
}

// --- Send email ---
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $env['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $env['SMTP_USER'];
    $mail->Password   = $env['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int) $env['SMTP_PORT'];

    $mail->setFrom($env['MAIL_FROM'], $env['MAIL_FROM_NAME']);
    $mail->addAddress($env['MAIL_TO']);

    $mail->isHTML(false);
    $mail->Subject = "Whitelist Application: $username";
    $mail->Body    = "New whitelist application received.\n\n"
                   . "Username:   $username\n"
                   . "Motivation: $motivation\n\n"
                   . "IP: $clientIp\n"
                   . "Time: " . date('Y-m-d H:i:s T') . "\n";

    $mail->send();

    file_put_contents($rateLimitFile, (string) time());

    echo json_encode(['success' => true, 'message' => 'Application submitted successfully.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send application. Please try again later.']);
}
