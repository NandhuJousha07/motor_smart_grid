<?php
/* EG Smart GRID – visitor counter for PHP hosting (Apache / IIS with PHP).
 * POST visitor-counter.php -> {"visitors": N, "today": N};  GET visitor-counter.php?check=1 -> status.
 * A visit = one browser on one day (India time), via an anonymous random cookie (sg_vid).
 * Counts are kept in visitor-counter-data/ next to this file (the web server must be able to write there). */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$dir = __DIR__ . '/visitor-counter-data';
if (!is_dir($dir)) @mkdir($dir, 0770, true);
@file_put_contents($dir . '/.htaccess', "Require all denied\n");
$file = $dir . '/counter.json';
$day = gmdate('Y-m-d', time() + 19800);
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check'])) {
  $ok = is_dir($dir) && is_writable($dir);
  echo json_encode(['ok' => $ok, 'store' => $ok ? 'writable' : 'folder not writable: visitor-counter-data']); exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'POST only']); exit; }
$vid = isset($_COOKIE['sg_vid']) && preg_match('/^[A-Za-z0-9-]{8,64}$/', $_COOKIE['sg_vid']) ? $_COOKIE['sg_vid'] : null;
if (!$vid) {
  $vid = bin2hex(random_bytes(16));
  setcookie('sg_vid', $vid, ['expires' => time() + 34560000, 'path' => '/', 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true]);
}
$fh = @fopen($file, 'c+');
if (!$fh) { http_response_code(500); echo json_encode(['error' => 'cannot open store']); exit; }
flock($fh, LOCK_EX);
$raw = stream_get_contents($fh);
$d = $raw ? json_decode($raw, true) : null;
if (!is_array($d)) $d = ['total' => 0, 'day' => $day, 'today' => 0, 'seen' => []];
if ($d['day'] !== $day) { $d['day'] = $day; $d['today'] = 0; $d['seen'] = []; }
$h = substr(hash('sha256', $vid), 0, 16);
if (!isset($d['seen'][$h])) { $d['seen'][$h] = 1; $d['total']++; $d['today']++; }
ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($d)); fflush($fh);
flock($fh, LOCK_UN); fclose($fh);
echo json_encode(['visitors' => $d['total'], 'today' => $d['today']]);
