#!/usr/bin/php
<?php
	$words = file("common-words.txt");
	$list = array();

	foreach ($words as $word) {
		$word = strtoupper(trim($word));
		$len = strlen($word);
		if (($len > 1) && ($len < 7)) {
			$newlist[] = $word;
			$list[$len][] = $word;
		}
	}
	print join("\n", $newlist)."\n";

	foreach ($list as $len=>$sublist) {
		$out = array_slice($sublist, count($sublist) / 2);
		file_put_contents("$len.txt", join("\n", $out)."\n");
	}
?>
