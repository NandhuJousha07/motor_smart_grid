<?php
/**
 * Motor Smart GRID – visitor counter
 *
 * The GRID page POSTs here once per page open and shows
 * "Today's visitors: N · Total visitors: N" in its footer.
 *
 * A visit = one browser on one day (India time). Opening the GRID again the
 * same day does not add; coming back the next day does. A short cookie
 * (sg_visit_day, holding only today's date) is the only thing used to tell
 * a repeat open from a new visit. No IP address, name or device detail is stored.
 *
 * Counts are kept in counter-data/visitors.json (this folder must be writable
 * by the web server). Health check: open visitor-counter.php?check=1
 * See DEPLOYMENT_GUIDE.md section 9.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

date_default_timezone_set('Asia/Kolkata');

$dir    = __DIR__ . DIRECTORY_SEPARATOR . 'counter-data';
$file   = $dir . DIRECTORY_SEPARATOR . 'visitors.json';
$today  = date('Y-m-d');
$cookie = 'sg_visit_day';
$keepDays = 400;   // daily history kept in the file

function out(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function readCounts(string $file): array {
    if (!is_file($file)) return ['total' => 0, 'days' => []];
    $d = json_decode((string)@file_get_contents($file), true);
    return is_array($d) ? $d + ['total' => 0, 'days' => []] : ['total' => 0, 'days' => []];
}

// ---- Health check: visitor-counter.php?check=1 -----------------------------
if (isset($_GET['check'])) {
    $exists   = is_dir($dir);
    $writable = $exists && is_writable($dir);
    $c = readCounts($file);
    out([
        'ok'                    => $writable,
        'php_version'           => PHP_VERSION,
        'counter_data_exists'   => $exists,
        'counter_data_writable' => $writable,
        'visitors'              => (int)($c['total'] ?? 0),
        'today'                 => (int)($c['days'][$today] ?? 0),
        'date_ist'              => $today,
        'hint'                  => $writable ? 'Counter is working.'
                                  : 'Create the counter-data folder next to this file and make it writable by the web server (e.g. chmod 775 and owned by the web-server user).',
    ], $writable ? 200 : 500);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    out(['error' => 'Use POST (the GRID page does this automatically). For a health check open ?check=1'], 405);
}

// ---- Count the visit -------------------------------------------------------
if (!is_dir($dir) && !@mkdir($dir, 0775, true)) {
    out(['error' => 'counter-data folder missing and could not be created'], 500);
}
$fh = @fopen($file, 'c+');
if (!$fh) out(['error' => 'counter-data/visitors.json is not writable'], 500);

$isNewVisit = (($_COOKIE[$cookie] ?? '') !== $today);

flock($fh, LOCK_EX);
$raw  = stream_get_contents($fh);
$data = json_decode($raw === false ? '' : $raw, true);
if (!is_array($data)) $data = [];
$data['total'] = (int)($data['total'] ?? 0);
$data['days']  = is_array($data['days'] ?? null) ? $data['days'] : [];

if ($isNewVisit) {
    $data['total']++;
    $data['days'][$today] = (int)($data['days'][$today] ?? 0) + 1;
    if (count($data['days']) > $keepDays) {
        ksort($data['days']);
        $data['days'] = array_slice($data['days'], -$keepDays, null, true);
    }
    $data['updated'] = date('c');
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    fflush($fh);
}
flock($fh, LOCK_UN);
fclose($fh);

if ($isNewVisit) {
    $path = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    setcookie($cookie, $today, [
        'expires'  => strtotime('tomorrow 00:00:00') + 60,   // next IST midnight
        'path'     => $path,
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

out([
    'visitors' => $data['total'],
    'today'    => (int)($data['days'][$today] ?? 0),
]);
