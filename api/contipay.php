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

// Try different endpoints - ContiPay might use different ones
$endpoints = [
    'https://api-uat.contipay.net/initialize',
    'https://api-uat.contipay.net/payment/initiate',
    'https://api-uat.contipay.net/v1/payments/initiate',
    'https://api-uat.contipay.net/transaction/initiate'
];

// Use the first endpoint that works, or let the client specify
$contipayUrl = $input['endpoint'] ?? $endpoints[0];

// Try different payload formats
$payloadFormats = [
    // Format 1: Standard
    [
        'merchantId' => $merchantId,
        'amount' => $input['amount'] ?? '1.00',
        'currency' => 'USD',
        'customerPhone' => $input['phone'] ?? '0771111111',
        'customerEmail' => 'test@gatekeeperai.co.zw',
        'reference' => $input['reference'] ?? 'TEST-' . time(),
        'callbackUrl' => 'https://gatekeeperai.co.zw/payment_callback.html',
        'description' => 'Gatekeeper AI Test Payment'
    ],
    // Format 2: Alternative field names
    [
        'merchant_id' => $merchantId,
        'amount' => $input['amount'] ?? '1.00',
        'currency' => 'USD',
        'phone' => $input['phone'] ?? '0771111111',
        'email' => 'test@gatekeeperai.co.zw',
        'reference' => $input['reference'] ?? 'TEST-' . time(),
        'return_url' => 'https://gatekeeperai.co.zw/payment_success.html',
        'description' => 'Gatekeeper AI Test Payment'
    ],
    // Format 3: Minimal
    [
        'merchantId' => $merchantId,
        'amount' => $input['amount'] ?? '1.00',
        'phone' => $input['phone'] ?? '0771111111',
        'reference' => $input['reference'] ?? 'TEST-' . time()
    ]
];

// Try each payload format with the current endpoint
$lastError = null;
foreach ($payloadFormats as $index => $payload) {
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For testing only
    
    // Execute the request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // If successful or not 403, return the response
    if ($curlError) {
        $lastError = 'cURL Error: ' . $curlError;
        continue;
    }
    
    // Try to parse JSON
    $responseData = json_decode($response, true);
    
    // If we got a successful response or not 403, return it
    if ($httpCode !== 403) {
        http_response_code($httpCode);
        echo $response;
        exit();
    }
    
    // Store the last error
    $lastError = $response;
}

// If all formats failed, return the last error with troubleshooting info
http_response_code(403);
echo json_encode([
    'status' => 'error',
    'message' => 'All payment attempts failed',
    'debug' => [
        'endpoint_tried' => $contipayUrl,
        'last_response' => json_decode($lastError, true) ?? $lastError,
        'troubleshooting' => [
            'Check ContiPay documentation for correct endpoint',
            'Verify merchant ID: ' . $merchantId,
            'Verify API credentials are correct',
            'Try different endpoint URL',
            'Check if merchant account is active'
        ]
    ]
]);
?>
