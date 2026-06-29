<?php
/**
 * CODEMAFIA PRODUCTION PROXY — PHP-based reverse proxy
 *
 * Place this file + .htaccess in Apache's DocumentRoot
 * (the directory that serves https://codemafia.ng).
 *
 * Requirements:
 *   - PHP (with curl extension)
 *   - mod_rewrite enabled in Apache
 *   - Next.js running on 127.0.0.1:3000
 *   - Laravel running on 127.0.0.1:8000
 *
 * How it works:
 *   1. Apache rewrites all non-static requests to this file
 *   2. This file proxies API requests to Laravel and frontend requests to Next.js
 *   3. Response is returned to the client
 */

// Configuration
$NEXTJS = 'http://127.0.0.1:3000';
$LARAVEL = 'http://127.0.0.1:8000';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Parse query string
$queryString = $_SERVER['QUERY_STRING'] ?? '';

// Get request body for POST/PUT/PATCH
$requestBody = file_get_contents('php://input');

// Get request headers
$requestHeaders = [];
foreach ($_SERVER as $name => $value) {
    if (str_starts_with($name, 'HTTP_')) {
        $headerName = str_replace('_', '-', substr($name, 5));
        $requestHeaders[$headerName] = $value;
    }
}
// Forward content type
if (isset($_SERVER['CONTENT_TYPE'])) {
    $requestHeaders['Content-Type'] = $_SERVER['CONTENT_TYPE'];
}
if (isset($_SERVER['CONTENT_LENGTH'])) {
    $requestHeaders['Content-Length'] = $_SERVER['CONTENT_LENGTH'];
}

// Route to appropriate backend
if (str_starts_with($requestUri, '/api/v1/')) {
    $target = $LARAVEL . $requestUri;
} else {
    $target = $NEXTJS . $requestUri;
}

// Build curl request
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $target,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CUSTOMREQUEST => $requestMethod,
    CURLOPT_POSTFIELDS => $requestBody,
]);

// Forward headers
$curlHeaders = [];
foreach ($requestHeaders as $name => $value) {
    $curlHeaders[] = "$name: $value";
}
if (!empty($curlHeaders)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);
}

// Execute
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Proxy error: ' . $curlError]);
    exit;
}

// Forward response headers
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

foreach (explode("\r\n", $responseHeaders) as $header) {
    if (!empty($header) && !str_starts_with($header, 'HTTP/') && !str_starts_with(strtolower($header), 'transfer-encoding')) {
        header($header, false);
    }
}

http_response_code($httpCode);
echo $responseBody;
