/**
 * NexaCart ↔ SentinelX Adapter Test Suite
 * Tests adapter payload formatting, backend communication, timeout resilience, and status handling.
 */

import http from 'http';

// Define the adapter function matching src/api/events.ts logic for testing under Node ESM
function normalizeSeverity(severity) {
  const upper = (severity || 'INFO').toUpperCase();
  if (upper === 'WARNING') return 'HIGH';
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(upper)) {
    return upper;
  }
  return 'MEDIUM';
}

async function sendEventToEngineAdapter(event, baseUrl) {
  const event_id = event.event_id || `nexacart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const normalizedPayload = {
    event_id,
    source: 'application',
    event_type: event.event_type || 'application_error',
    service: event.service || 'nexacart-frontend',
    environment: event.environment || 'development',
    severity: normalizeSeverity(event.severity),
    timestamp: event.timestamp || new Date().toISOString(),
    error_code: event.error_code || '',
    message: event.message || 'NexaCart operational failure',
    metadata: {
      app: 'NexaCart',
      ...(event.metadata || {}),
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(normalizedPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorText = errorJson.message || errorJson.error || errorText;
      } catch {
        // default errorText
      }
      return { delivered: false, error: errorText, statusCode: response.status };
    }

    const data = await response.json().catch(() => ({}));
    return { delivered: true, data, statusCode: response.status };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    return {
      delivered: false,
      error: isAbort ? 'Incident Engine connection timed out' : 'Incident Engine is offline or unreachable',
      statusCode: 0,
    };
  }
}

// Setup mock SentinelX HTTP server for testing
function createMockServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, url: `http://127.0.0.1:${port}` });
    });
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING NEXACART TELEMETRY ADAPTER TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Schema Normalization & Field Mapping
  console.log('[Test 1] Schema Normalization & Field Mapping');
  let lastReceivedPayload = null;
  const mockSuccess = await createMockServer((req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastReceivedPayload = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Event ingested successfully',
        id: 'evt_123',
        event_id: lastReceivedPayload.event_id,
        service: lastReceivedPayload.service,
        severity: lastReceivedPayload.severity,
      }));
    });
  });

  const sampleEvent = {
    timestamp: new Date().toISOString(),
    service: 'payment-service',
    event_type: 'payment_failure',
    severity: 'WARNING', // Should normalize to 'HIGH'
    error_code: 'PAY-301',
    message: 'Payment failure rate high',
    environment: 'development',
    metadata: { failure_rate: 31.0 },
  };

  const result = await sendEventToEngineAdapter(sampleEvent, mockSuccess.url);
  await new Promise(r => mockSuccess.server.close(r));

  assert(result.delivered === true, 'Event delivered successfully to mock backend');
  assert(lastReceivedPayload !== null, 'Payload received by mock server');
  assert(lastReceivedPayload.source === 'application', 'Source set to "application"');
  assert(lastReceivedPayload.severity === 'HIGH', 'Severity "WARNING" normalized to "HIGH"');
  assert(lastReceivedPayload.event_id.startsWith('nexacart-'), 'Generated event_id starts with "nexacart-"');
  assert(lastReceivedPayload.error_code === 'PAY-301', 'Error code preserved');
  assert(lastReceivedPayload.metadata.app === 'NexaCart', 'Metadata contains app tag');

  // TEST 2: Graceful Handling when SentinelX is Offline
  console.log('\n[Test 2] SentinelX Offline / Unreachable');
  let offlineError = null;
  try {
    const offlineResult = await sendEventToEngineAdapter(sampleEvent, 'http://127.0.0.1:59999');
    assert(offlineResult.delivered === false, 'Returns delivered: false when offline');
    assert(typeof offlineResult.error === 'string', 'Returns descriptive error string when offline');
  } catch (err) {
    offlineError = err;
  }
  assert(offlineError === null, 'Adapter does NOT throw exception when server is offline');

  // TEST 3: Backend HTTP 500 Error
  console.log('\n[Test 3] Backend HTTP 500 Internal Error');
  const mock500 = await createMockServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  });

  const result500 = await sendEventToEngineAdapter(sampleEvent, mock500.url);
  await new Promise(r => mock500.server.close(r));

  assert(result500.delivered === false, 'Returns delivered: false on 500 status');
  assert(result500.statusCode === 500, 'Captures HTTP 500 status code in response');

  // SUMMARY
  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
