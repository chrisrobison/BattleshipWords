#!/usr/bin/php
<?php
	$alltxt = file_get_contents("all.txt");
	$all6txt = file_get_contents("all6.txt");
	
	$all = preg_split("/\n/", $alltxt);
	$all6 = preg_split("/\n/", $all6txt);

	$valid = array_intersect($all6, $all);
	
	file_put_contents("valid.txt", join("\n", $valid)."\n");
	$out = array();
	foreach ($valid as $word) {
		$word = trim($word);
		$out[strlen($word)][] = $word;
	}
	foreach ($out as $len=>$list) {
		sort($list);
		file_put_contents("$len.txt", join("\n", $list)."\n");
	}

	$out = json_encode($out);

	file_put_contents("common-words.js", "var commonWords = " . $out);
?>
