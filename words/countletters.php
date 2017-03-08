#!/usr/bin/php
<?php
	$words = file("all6.txt");

	$out = array();

	while ($word = array_shift($words)) {
		$word = trim($word);
		$letters = preg_split("//", $word);
		foreach ($letters as $letter) {
			if ($letter && empty($out[$letter])) {
				$out[$letter] = 1;
			} else if (!empty($letter)) {
				$out[$letter]++;
			}
		}
	}
	natsort($out);
	$out = array_reverse($out);
	$keys = array_keys($out);
	print "var letterFreq = " . json_encode($keys) . ";\n";
?>
