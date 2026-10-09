<?php
/*
 * Motor Smart GRID – visitor counter (for your own website).
 * Counts each browser once (a cookie remembers it was counted) and returns {"visitors": N}.
 * Nothing else about the visitor is stored. The total lives in counter-data/count.json.
 * Needs PHP 7.4+ and a writable counter-data/ folder next to this file.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$dir = __DIR__ . '/counter-data';
if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
if (!file_exists($dir . '/.htaccess')) { @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }

$fp = @fopen($dir . '/count.json', 'c+');
if (!$fp) { http_response_code(500); echo '{"visitors":null}'; exit; }
flock($fp, LOCK_EX);
$data = json_decode((string)stream_get_contents($fp), true);
$n = is_array($data) ? (int)($data['visitors'] ?? 0) : 0;

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && empty($_COOKIE['sg_counted'])) {
    $n++;
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode(['visitors' => $n, 'updated' => date('c')]));
    fflush($fp);
    $path = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/') . '/';
    setcookie('sg_counted', '1', [
        'expires' => time() + 5 * 365 * 86400, 'path' => $path, 'samesite' => 'Lax', 'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
}
flock($fp, LOCK_UN);
fclose($fp);
echo json_encode(['visitors' => $n]);
