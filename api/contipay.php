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

// Get phone and amount from input
$phone = $input['phone'] ?? '0771111111';
$amount = $input['amount'] ?? '1.00';
$reference = $input['reference'] ?? 'TEST-' . time();

// Get the endpoint from input or use default
$endpoint = $input['endpoint'] ?? 'initialize';

// ContiPay API URL
$baseUrl = 'https://api-uat.contipay.net';
$contipayUrl = $baseUrl . '/acquire/payment/initiate';

// Build the correct payload structure based on ContiPay docs
$payload = [
    'customer' => [
        'nationalId' => '63-123456Z-' . rand(10, 99),
        'surname' => 'Test',
        'firstName' => 'User',
        'middleName' => '',
        'email' => 'test@gatekeeperai.co.zw',
        'cell' => $phone
    ],
    'transaction' => [
        'providerCode' => 'ecocash',  // Based on documentation
        'providerName' => 'EcoCash',
        'currencyCode' => 'USD',
        'merchantId' => (int)$merchantId,
        'reference' => $reference,
        'description' => 'Gatekeeper AI Subscription',
        'amount' => (float)$amount,
        'webhookUrl' => 'https://gatekeeperai.co.zw/api/webhook',
        'successUrl' => 'https://gatekeeperai.co.zw/payment_success.html',
        'cancelUrl' => 'https://gatekeeperai.co.zw/payment_cancel.html'
    ],
    'accountDetails' => [
        'accountNumber' => $phone,
        'accountName' => 'Test User'
    ]
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
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Log the request for debugging
$debug = [
    'url' => $contipayUrl,
    'payload' => $payload,
    'auth' => $authBase64
];

// Return the response
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'cURL Error: ' . $curlError,
        'debug' => $debug
    ]);
} else {
    // Parse response to check if it's JSON
    $responseData = json_decode($response, true);
    if ($responseData) {
        http_response_code($httpCode);
        echo $response;
    } else {
        // If not JSON, return as is
        http_response_code($httpCode);
        echo json_encode([
            'status' => 'unknown',
            'raw_response' => $response,
            'debug' => $debug
        ]);
    }
}
?>
