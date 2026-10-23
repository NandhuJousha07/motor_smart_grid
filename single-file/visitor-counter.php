<?php
/*
 * Motor Smart GRID – visitor counter (for your own website).
 * A visit = one browser on one day (India time). Opening the GRID again the same day
 * doesn't add; coming back on a later day counts again. A cookie remembers the day
 * the browser was last counted; it expires at midnight India time.
 * Returns {"visitors": <total visits>, "today": <visits today>}.
 * Nothing else about the visitor is stored. Totals live in counter-data/count.json:
 *   {"total": N, "days": {"2026-10-13": n, ...}, "updated": "..."}
 * Needs PHP 7.4+ and a writable counter-data/ folder next to this file.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

// Health check for the deployment team: open visitor-counter.php?check=1 in a browser.
if (isset($_GET['check'])) {
    $d = __DIR__ . '/counter-data';
    if (!is_dir($d)) { @mkdir($d, 0750, true); }
    echo json_encode([
        'counter' => 'Motor Smart GRID visitor counter',
        'php' => PHP_VERSION,
        'php_ok' => version_compare(PHP_VERSION, '7.4', '>='),
        'counter_data_folder' => is_dir($d),
        'counter_data_writable' => is_dir($d) && is_writable($d),
        'count_file_exists' => file_exists($d . '/count.json'),
        'result' => (is_dir($d) && is_writable($d)) ? 'OK - the counter can work' : 'FIX - make counter-data/ writable by the web server',
    ], JSON_PRETTY_PRINT);
    exit;
}

$tz = new DateTimeZone('Asia/Kolkata');
$now = new DateTimeImmutable('now', $tz);
$today = $now->format('Y-m-d');

$dir = __DIR__ . '/counter-data';
if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
if (!file_exists($dir . '/.htaccess')) { @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }

$fp = @fopen($dir . '/count.json', 'c+');
if (!$fp) { http_response_code(500); echo '{"visitors":null,"today":null}'; exit; }
flock($fp, LOCK_EX);
$data = json_decode((string)stream_get_contents($fp), true);
if (!is_array($data)) { $data = []; }
// Earlier counter format {"visitors": N}: keep N as the starting total.
$total = (int)($data['total'] ?? $data['visitors'] ?? 0);
$days = (isset($data['days']) && is_array($data['days'])) ? $data['days'] : [];

$counted = ($_COOKIE['sg_day'] ?? '') === $today;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !$counted) {
    $total++;
    $days[$today] = (int)($days[$today] ?? 0) + 1;
    ksort($days);
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode(['total' => $total, 'days' => $days, 'updated' => $now->format('c')]));
    fflush($fp);
    $path = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/') . '/';
    $midnight = $now->setTime(0, 0)->modify('+1 day');
    setcookie('sg_day', $today, [
        'expires' => $midnight->getTimestamp(), 'path' => $path, 'samesite' => 'Lax', 'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
}
flock($fp, LOCK_UN);
fclose($fp);
echo json_encode(['visitors' => $total, 'today' => (int)($days[$today] ?? 0)]);
