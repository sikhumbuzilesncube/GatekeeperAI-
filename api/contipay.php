<?php
// Enable CORS for your frontend
header('Access-Control-Allow-Origin: https://gatekeeperai.co.zw');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request data
$input = json_decode(file_get_contents('php://input'), true);

// ContiPay credentials
$merchantId = '952';
$apiKey = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09';
$apiSecret = '764cc5e8-3d34-45ea-b9f0-66df7fff19fe';

// Use the correct ContiPay URL
$contipayUrl = 'https://api-uat.contipay.net/v1/payments/initiate';

// If that doesn't work, try this endpoint
// $contipayUrl = 'https://api-uat.contipay.net/initialize';

// Prepare the payload
$payload = [
    'merchant_id' => $merchantId,
    'amount' => $input['amount'] ?? '1.00',
    'currency' => 'USD',
    'phone' => $input['phone'] ?? '0771111111',
    'reference' => $input['reference'] ?? 'TEST-' . time(),
    'description' => 'Gatekeeper AI Test Payment',
    'return_url' => 'https://gatekeeperai.co.zw/payment_success.html',
    'cancel_url' => 'https://gatekeeperai.co.zw/payment_cancel.html',
    'webhook_url' => 'https://gatekeeperai.co.zw/api/webhook'
];

// Create Basic Auth
$authString = $apiKey . ':' . $apiSecret;
$authBase64 = base64_encode($authString);

// Initialize cURL
$ch = curl_init($contipayUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $authBase64,
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Return the response
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'cURL Error: ' . $curlError
    ]);
} else {
    http_response_code($httpCode);
    echo $response;
}
?>
