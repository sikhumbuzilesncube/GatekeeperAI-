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

// Get parameters from input
$phone = $input['phone'] ?? '0771111111';
$amount = $input['amount'] ?? '1.00';
$reference = $input['reference'] ?? 'TEST-' . time();
$provider = $input['provider'] ?? 'EC';
$currency = $input['currency'] ?? 'USD'; // USD or ZWG

// Correct provider codes from ContiPay documentation
$providerMap = [
    'EC' => ['code' => 'EC', 'name' => 'EcoCash'],
    'TC' => ['code' => 'TC', 'name' => 'TeleCash'],
    'OM' => ['code' => 'OM', 'name' => 'OneMoney'],
    'VA' => ['code' => 'VA', 'name' => 'Visa'],
    'MA' => ['code' => 'MA', 'name' => 'Mastercard'],
    'VE' => ['code' => 'VE', 'name' => 'Verve'],
    'AG' => ['code' => 'AG', 'name' => 'AfriGo'],
    'ZS' => ['code' => 'ZS', 'name' => 'ZimSwitch'],
    'IB' => ['code' => 'IB', 'name' => 'InnBucks'],
    'OC' => ['code' => 'OC', 'name' => 'Omari'],
    'VC' => ['code' => 'VC', 'name' => 'Voucher']
];

$providerInfo = $providerMap[$provider] ?? $providerMap['EC'];

// ContiPay API URL
$contipayUrl = 'https://api-uat.contipay.net/acquire/payment/initiate';

// Build the payload
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
        'providerCode' => $providerInfo['code'],
        'providerName' => $providerInfo['name'],
        'currencyCode' => $currency, // USD or ZWG
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

// Try different authentication methods
$authMethods = [
    // Method 1: Basic Auth with API Key:Secret
    'basic' => base64_encode($apiKey . ':' . $apiSecret),
    // Method 2: Just API Key
    'key_only' => $apiKey,
    // Method 3: Just Secret
    'secret_only' => $apiSecret
];

$lastError = null;
$authMethodUsed = '';

foreach ($authMethods as $method => $authToken) {
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    if ($method === 'basic') {
        $headers[] = 'Authorization: Basic ' . $authToken;
    } elseif ($method === 'key_only') {
        $headers[] = 'Authorization: Bearer ' . $authToken;
    } else {
        $headers[] = 'X-API-Key: ' . $authToken;
    }
    
    // Initialize cURL
    $ch = curl_init($contipayUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_VERBOSE, true);

    // Execute the request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // If success (not 403), return the response
    if ($httpCode !== 403 && $httpCode !== 401) {
        $authMethodUsed = $method;
        break;
    }
    
    $lastError = [
        'method' => $method,
        'http_code' => $httpCode,
        'response' => $response
    ];
}

// If we have a response
if (isset($response) && $httpCode !== 403 && $httpCode !== 401) {
    $responseData = json_decode($response, true);
    
    if ($responseData) {
        // Check for redirect URL
        if (isset($responseData['redirectUrl'])) {
            echo json_encode([
                'status' => 'redirect',
                'message' => 'Redirect to payment page',
                'redirectUrl' => $responseData['redirectUrl'],
                'raw' => $responseData,
                'auth_method' => $authMethodUsed
            ]);
        } else {
            http_response_code($httpCode);
            echo $response;
        }
    } else {
        echo json_encode([
            'status' => 'unknown',
            'raw_response' => $response,
            'auth_method' => $authMethodUsed
        ]);
    }
} else {
    // All auth methods failed
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Authentication failed - all methods tested',
        'debug' => [
            'merchant_id' => $merchantId,
            'api_key' => substr($apiKey, 0, 10) . '...',
            'api_secret' => substr($apiSecret, 0, 10) . '...',
            'auth_methods_tested' => array_keys($authMethods),
            'last_error' => $lastError,
            'troubleshooting' => [
                'Check if merchant account is active',
                'Verify API credentials with ContiPay support',
                'Make sure merchant ID is correct',
                'Check if test environment is enabled'
            ]
        ]
    ]);
}
?>
