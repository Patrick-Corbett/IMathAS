<?php
function parsedatetime($date,$time) {
	global $tzoffset;
	preg_match('/(\d+)\s*\/(\d+)\s*\/(\d+)/',$date,$dmatches);
	preg_match('/(\d+)\s*:(\d+)\s*(\w+)/',$time,$tmatches);
	if (count($tmatches)==0) {
		preg_match('/(\d+)\s*([a-zA-Z]+)/',$time,$tmatches);
		$tmatches[3] = $tmatches[2];
		$tmatches[2] = 0;
	}
	$tmatches[1] = $tmatches[1]%12;
	if($tmatches[3]=="pm") {$tmatches[1]+=12; }
	//$tmatches[2] += $tzoffset;
	//return gmmktime($tmatches[1],$tmatches[2],0,$dmatches[1],$dmatches[2],$dmatches[3]);
	$serveroffset = date('Z')/60 + $tzoffset;
	$tmatches[2] += $serveroffset;
	return mktime($tmatches[1],$tmatches[2],0,$dmatches[1],$dmatches[2],$dmatches[3]);
}
?>
