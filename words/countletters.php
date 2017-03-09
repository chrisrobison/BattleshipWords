#!/usr/bin/php
<?php
	$words = file("all6.txt");

	$out = array();
	$bypos = array();

	while ($word = array_shift($words)) {
		$word = trim($word);
		$letters = preg_split("//", $word);
		foreach ($letters as $idx=>$letter) {
			if ($letter && empty($out[$letter])) {
				$out[$letter] = 1;
				if (empty($bypos[$idx])) { $bypos[$idx] = array(); }
				if (empty($bypos[$idx][$letter])) { $bypos[$idx][$letter] = 1; }
			} else if (!empty($letter)) {
				$out[$letter]++;
				if (empty($bypos[$idx])) { $bypos[$idx] = array(); }
				if (empty($bypos[$idx][$letter])) { $bypos[$idx][$letter] = 1; }
				$bypos[$idx][$letter]++;
			}
		}
	}
	natsort($out);
	$out = array_reverse($out);
	$keys = array_keys($out);
	print "var letterFreq = " . json_encode($keys) . ";\n";

	$out2 = array();
	foreach ($bypos as $pos=>$arr) {
		natsort($bypos[$pos]);
		$bypos[$pos] = array_reverse($bypos[$pos]);
		$keys = array_keys($bypos[$pos]);
		//print_r($keys);
		// $out2[$pos] = array();
		$out2[$pos] = $keys;
	}
	print "var letterFreqByPosition = " . json_encode($out2) . ";\n";
?>
