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

// ContiPay API URL - using the correct endpoint from docs
$contipayUrl = 'https://api-uat.contipay.net/acquire/payment/initiate';

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
        'providerCode' => $providerInfo['code'],
        'providerName' => $providerInfo['name'],
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

// Log for debugging
$debug = [
    'url' => $contipayUrl,
    'payload' => $payload,
    'http_code' => $httpCode
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
    // Parse response
    $responseData = json_decode($response, true);
    
    if ($responseData) {
        // Check for redirect URL (integration tip from docs)
        if (isset($responseData['redirectUrl']) && !empty($responseData['redirectUrl'])) {
            http_response_code(200);
            echo json_encode([
                'status' => 'redirect',
                'message' => 'Redirect to payment page',
                'redirectUrl' => $responseData['redirectUrl'],
                'raw' => $responseData
            ]);
        }
        // Check for success based on ContiPay response format
        elseif (isset($responseData['status']) && $responseData['status'] === 'Success') {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $responseData['message'] ?? 'Payment initiated successfully',
                'data' => $responseData,
                'raw' => $responseData
            ]);
        }
        elseif (isset($responseData['status']) && $responseData['status'] === 'Paid') {
            http_response_code(200);
            echo json_encode([
                'status' => 'paid',
                'message' => $responseData['message'] ?? 'Payment completed',
                'transaction' => $responseData['transaction'] ?? null,
                'raw' => $responseData
            ]);
        }
        elseif (isset($responseData['statusCode']) && $responseData['statusCode'] === 1) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $responseData['message'] ?? 'Payment processed',
                'data' => $responseData,
                'raw' => $responseData
            ]);
        }
        elseif ($httpCode === 200 || $httpCode === 201) {
            // HTTP success but check if there's an error in response
            if (isset($responseData['status']) && $responseData['status'] === 'error') {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => $responseData['message'] ?? 'API returned error',
                    'raw' => $responseData
                ]);
            } else {
                // Assume success
                http_response_code($httpCode);
                echo json_encode([
                    'status' => 'pending',
                    'message' => 'Payment initiated',
                    'data' => $responseData
                ]);
            }
        } else {
            // Error response
            http_response_code($httpCode);
            echo json_encode([
                'status' => 'error',
                'message' => $responseData['message'] ?? $responseData['status'] ?? 'Payment failed',
                'raw' => $responseData,
                'debug' => $debug
            ]);
        }
    } else {
        // Not JSON response
        http_response_code($httpCode);
        echo json_encode([
            'status' => 'unknown',
            'message' => 'Non-JSON response from API',
            'raw_response' => $response,
            'debug' => $debug
        ]);
    }
}
?>
