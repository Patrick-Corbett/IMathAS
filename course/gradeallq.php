<?php
//IMathAS:  Grade all of one question for an assessment
//(c) 2007 David Lippman
	require("../validate.php");
	
	if (!(isset($teacherid))) {
		require("../header.php");
		echo "You need to log in as a teacher to access this page";
		require("../footer.php");
		exit;
	}


	$cid = $_GET['cid'];
	$stu = $_GET['stu'];
	$gbmode = $_GET['gbmode'];
	$aid = $_GET['aid'];
	$qid = $_GET['qid'];
	if (isset($_GET['ver'])) {
		$ver = $_GET['ver'];
	} else {
		$ver = 'graded';
	}
	
	if (isset($_GET['update'])) {
		$allscores = array();
		$locs = array();
		foreach ($_POST as $k=>$v) {
			if (strpos($k,'-')!==false) {
				$kp = explode('-',$k);
				if ($kp[0]=='ud') {
					//$locs[$kp[1]] = $kp[2];
					if (count($kp)==3) {
						if ($v=='N/A') {
							$allscores[$kp[1]][$kp[2]] = -1;
						} else {
							$allscores[$kp[1]][$kp[2]] = $v;
						}
					} else {
						if ($v=='N/A') {
							$allscores[$kp[1]][$kp[2]][$kp[3]] = -1;
						} else {
							$allscores[$kp[1]][$kp[2]][$kp[3]] = $v;
						}
					}
				}
			}
		}
		if (isset($_POST['onepergroup']) && $_POST['onepergroup']==1) {
			foreach ($_POST['groupasid'] as $grp=>$asid) {
				$grpscores[$grp] = $allscores[$asid];
			}
			$onepergroup = true;
		} else {
			$onepergroup = false;
		}
		
		$query = "SELECT imas_users.LastName,imas_users.FirstName,imas_assessment_sessions.* FROM imas_users,imas_assessment_sessions ";
		$query .= "WHERE imas_assessment_sessions.userid=imas_users.id AND imas_assessment_sessions.assessmentid='$aid' ";
		$query .= "ORDER BY imas_users.LastName,imas_users.FirstName";
		$result = mysql_query($query) or die("Query failed : $query: " . mysql_error());
		$cnt = 0;
		while($line=mysql_fetch_array($result, MYSQL_ASSOC)) {
			if ((!$onepergroup && isset($allscores[$line['id']])) || ($onepergroup && isset($grpscores[$line['agroupid']]))) {//if (isset($locs[$line['id']])) {
				$scores = explode(",",$line['bestscores']);
				if ($onepergroup) {
					if ($line['agroupid']==0) { continue;}
					foreach ($grpscores[$line['agroupid']] as $loc=>$sv) {
						if (is_array($sv)) {
							$scores[$loc] = implode('~',$sv);
						} else {
							$scores[$loc] = $sv;
						}
					}
				} else {
					foreach ($allscores[$line['id']] as $loc=>$sv) {
						if (is_array($sv)) {
							$scores[$loc] = implode('~',$sv);
						} else {
							$scores[$loc] = $sv;
						}
					}
				}
				$scorelist = implode(",",$scores);
				$feedback = $_POST['feedback-'.$line['id']];
				$query = "UPDATE imas_assessment_sessions SET bestscores='$scorelist',feedback='$feedback' WHERE id='{$line['id']}'";
				mysql_query($query) or die("Query failed : $query " . mysql_error());
			}
		}
		header("Location: http://" . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/\\') . "/gb-itemanalysis.php?stu=$stu&cid=$cid&aid=$aid&asid=average");
		exit;
	}
	
	
	require("../assessment/displayq2.php");
	list ($qsetid,$cat) = getqsetid($qid);
	
	$query = "SELECT name,defpoints,isgroup,groupsetid FROM imas_assessments WHERE id='$aid'";
	$result = mysql_query($query) or die("Query failed : $query: " . mysql_error());
	list($aname,$defpoints,$isgroup,$groupsetid) = mysql_fetch_row($result);
	
	if ($isgroup>0) {
		$groupnames = array();
		$query = "SELECT id,name FROM imas_stugroups WHERE groupsetid=$groupsetid";
		$result = mysql_query($query) or die("Query failed : $query: " . mysql_error());
		while ($row = mysql_fetch_row($result)) {
			$groupnames[$row[0]] = $row[1];
		}
	}
	
	$query = "SELECT imas_questions.points,imas_questionset.control FROM imas_questions,imas_questionset ";
	$query .= "WHERE imas_questions.questionsetid=imas_questionset.id AND imas_questions.id='$qid'";
	$result = mysql_query($query) or die("Query failed : $query: " . mysql_error());
	$points = mysql_result($result,0,0);
	$qcontrol = mysql_result($result,0,1);
	if ($points==9999) {
		$points = $defpoints;
	}
	
	$useeditor='review';
	require("../assessment/header.php");
	echo "<style type=\"text/css\">p.tips {	display: none;}\n</style>\n";
	echo "<div class=breadcrumb>$breadcrumbbase <a href=\"course.php?cid={$_GET['cid']}\">$coursename</a> ";
	echo "&gt; <a href=\"gradebook.php?stu=0&cid=$cid\">Gradebook</a> ";
	echo "&gt; <a href=\"gb-itemanalysis.php?stu=$stu&cid=$cid&aid=$aid\">Item Analysis</a> ";
	echo "&gt; Grading a Question</div>";
	echo "<div id=\"headergradeallq\" class=\"pagetitle\"><h2>Grading a Question in $aname</h2></div>";
	echo "<p><b>Warning</b>: This page may not work correctly if the question selected is part of a group of questions</p>";
	echo "<p>Note: Feedback is for whole assessment, not the individual question.</p>";
?>
	<script type="text/javascript">
	function hidecorrect() {
	   var butn = document.getElementById("hctoggle");
	   if (butn.value=="Hide Perfect Score Questions") {
	      butn.value = "Show Perfect Score Questions";
	      var setdispto = "block";
	   } else { 
	      butn.value = "Hide Perfect Score Questions";
	      var setdispto = "none";
	   }
	   var divs = document.getElementsByTagName("div");
	   for (var i=0;i<divs.length;i++) {
	     if (divs[i].className=="iscorrect") { 
	         if (divs[i].style.display=="none") {
	               divs[i].style.display = "block";
	         } else { divs[i].style.display = "none"; }
	     }
	    }
	}
	function hidenonzero() {
	   var butn = document.getElementById("nztoggle");
	   if (butn.value=="Hide Nonzero Score Questions") {
	      butn.value = "Show Nonzero Score Questions";
	      var setdispto = "block";
	   } else { 
	      butn.value = "Hide Nonzero Score Questions";
	      var setdispto = "none";
	   }
	   var divs = document.getElementsByTagName("div");
	   for (var i=0;i<divs.length;i++) {
	     if (divs[i].className=="isnonzero") { 
	         if (divs[i].style.display=="none") {
	               divs[i].style.display = "block";
	         } else { divs[i].style.display = "none"; }
	     }
	    }
	}
	function hideNA() {
	   var butn = document.getElementById("hnatoggle");
	   if (butn.value=="Hide Not Answered Questions") {
	      butn.value = "Show Not Answered Questions";
	      var setdispto = "block";
	   } else { 
	      butn.value = "Hide Not Answered Questions";
	      var setdispto = "none";
	   }
	   var divs = document.getElementsByTagName("div");
	   for (var i=0;i<divs.length;i++) {
	     if (divs[i].className=="notanswered") { 
	         if (divs[i].style.display=="none") {
	               divs[i].style.display = "block";
	         } else { divs[i].style.display = "none"; }
	     }
	    }
	}
	function preprint() {
		var els = document.getElementsByTagName("input");
		for (var i=0; i<els.length; i++) {
			if (els[i].type=='button' && els[i].value=='Preview') {
				els[i].click();
			} else if (els[i].type=='button' && els[i].value=='Show Answer') {
				els[i].click();
				els[i].parentNode.insertBefore(document.createTextNode('Answer: '),els[i]);
				els[i].style.display = 'none';
			}
		}
		document.getElementById("preprint").style.display = "none";
	}
	function hidegroupdup(el) {  //el.checked = one per group
	   var divs = document.getElementsByTagName("div");
	   for (var i=0;i<divs.length;i++) {
	     if (divs[i].className=="groupdup") { 
	         if (el.checked) {
	               divs[i].style.display = "none";
	         } else { divs[i].style.display = "block"; }
	     }
	    }	
	    var hfours = document.getElementsByTagName("h4");
	   for (var i=0;i<hfours.length;i++) {
	     if (hfours[i].className=="person") { 
	     	hfours[i].style.display = el.checked?"none":"";
	     } else if (hfours[i].className=="group") { 
	     	hfours[i].style.display = el.checked?"":"none";
	     }
	    }
	    var spans = document.getElementsByTagName("span");
	   for (var i=0;i<spans.length;i++) {
	     if (spans[i].className=="person") { 
	     	spans[i].style.display = el.checked?"none":"";
	     } else if (spans[i].className=="group") { 
	     	spans[i].style.display = el.checked?"":"none";
	     }
	    }
	}
	</script>
<?php
	echo '<input type=button id="hctoggle" value="Hide Perfect Score Questions" onclick="hidecorrect()" />';
	echo '<input type=button id="nztoggle" value="Hide Nonzero Score Questions" onclick="hidenonzero()" />';
	echo ' <input type=button id="hnatoggle" value="Hide Not Answered Questions" onclick="hideNA()" />';
	echo ' <input type="button" id="preprint" value="Prepare for Printing (Slow)" onclick="preprint()" />';
	
	echo "<form id=\"mainform\" method=post action=\"gradeallq.php?stu=$stu&gbmode=$gbmode&cid=$cid&aid=$aid&qid=$qid&update=true\">\n";
	if ($isgroup>0) {
		echo '<p><input type="checkbox" name="onepergroup" value="1" onclick="hidegroupdup(this)" /> Grade one per group</p>';
	}
	
	echo "<p>";
	if ($ver=='graded') {
		echo "Showing Graded Attempts.  ";
		echo "<a href=\"gradeallq.php?stu=$stu&gbmode=$gbmode&cid=$cid&aid=$aid&qid=$qid&ver=last\">Show Last Attempts</a>";
	} else if ($ver=='last') {
		echo "<a href=\"gradeallq.php?stu=$stu&gbmode=$gbmode&cid=$cid&aid=$aid&qid=$qid&ver=graded\">Show Graded Attempts</a>.  ";
		echo "Showing Last Attempts.  ";
		echo "<br/><b>Note:</b> Grades and number of attempt used are for the Graded Attempt.  Part points might be inaccurate.";
	}
	echo "</p>";
	$query = "SELECT imas_users.LastName,imas_users.FirstName,imas_assessment_sessions.* FROM imas_users,imas_assessment_sessions,imas_students ";
	$query .= "WHERE imas_assessment_sessions.userid=imas_users.id AND imas_students.userid=imas_users.id AND imas_students.courseid='$cid' AND imas_assessment_sessions.assessmentid='$aid' ";
	$query .= "ORDER BY imas_users.LastName,imas_users.FirstName";
	$result = mysql_query($query) or die("Query failed : $query: " . mysql_error());
	$cnt = 0;
	$onepergroup = array();
	require_once("../includes/filehandler.php");
	while($line=mysql_fetch_array($result, MYSQL_ASSOC)) {
		$asid = $line['id'];
		$groupdup = false;
		if ($line['agroupid']>0) {
			$s3asid = 'grp'.$line['agroupid'].'/'.$aid;
			if (isset($onepergroup[$line['agroupid']])) {
				$groupdup = true;
			} else {
				echo "<input type=\"hidden\" name=\"groupasid[{$line['agroupid']}]\" value=\"{$line['id']}\" />";
				$onepergroup[$line['agroupid']] = $line['id'];
			}
		} else {
			if ($isgroup) {
				$groupdup = true;
			}
			$s3asid = $asid;
		}
		$questions = explode(',',$line['questions']);
		$scores = explode(",",$line['bestscores']);
		$attempts = explode(",",$line['bestattempts']);
		if ($ver=='graded') {
			$seeds = explode(",",$line['bestseeds']);
			$la = explode("~",$line['bestlastanswers']);
		} else if ($ver=='last') {
			$seeds = explode(",",$line['seeds']);
			$la = explode("~",$line['lastanswers']);
		}
		//$loc = array_search($qid,$questions);
		$lockeys = array_keys($questions,$qid);
		foreach ($lockeys as $loc) {
			if ($groupdup) {
				echo '<div class="groupdup">';
			}
			echo "<h4 class=\"person\">".$line['LastName'].', '.$line['FirstName']."</h4>";
			if (!$groupdup) {
				echo '<h4 class="group" style="display:none">'.$groupnames[$line['agroupid']].'</h4>';
			}
			echo "<div ";
			if (getpts($scores[$loc])==$points) {
				echo 'class="iscorrect"';	
			} else if ($scores[$loc]>0) {
				echo 'class="isnonzero"';
			} else if ($scores[$loc]==-1) {
				echo 'class="notanswered"';
			} else {
				echo 'class="iswrong"';
			}
			echo '>';
			$lastanswers[$cnt] = $la[$loc];
			$teacherreview = $line['userid'];
			displayq($cnt,$qsetid,$seeds[$loc],true,false,$attempts[$loc]);
			echo '</div>';
			
			echo "<div class=review>";
			echo '<span class="person">'.$line['LastName'].', '.$line['FirstName'].': </span>';
			if (!$groupdup) {
				echo '<span class="group" style="display:none">'.$groupnames[$line['agroupid']].': </span>';
			}
			if ($isgroup) {
				
			}
			list($pt,$parts) = printscore($scores[$loc]);
			if ($parts=='') { 
				if ($pt==-1) {
					$pt = 'N/A';
				}
				echo "<input type=text size=4 name=\"ud-{$line['id']}-$loc\" value=\"$pt\">";
			} 
			if ($parts!='') {
				echo " Parts: ";
				$prts = explode(', ',$parts);
				for ($j=0;$j<count($prts);$j++) {
					if ($prts[$j]==-1) {
						$prts[$j] = 'N/A';
					}
					echo "<input type=text size=2 name=\"ud-{$line['id']}-$loc-$j\" value=\"{$prts[$j]}\"> ";
				}
			}
			echo " out of $points ";
			if ($parts!='') {
				if (($p = strpos($qcontrol,'answeights'))!==false) {
					$p = strpos($qcontrol,"\n",$p);
					$answeights = getansweights($loc,substr($qcontrol,0,$p));
				} else {
					preg_match('/anstypes(.*)/',$qcontrol,$match);
					$n = substr_count($match[1],',')+1;
					if ($n>1) {
						$answeights = array_fill(0,$n-1,round(1/$n,3));
						$answeights[] = 1-array_sum($answeights);
					} else {
						$answeights = array(1);
					}
				}
				for ($i=0; $i<count($answeights)-1; $i++) {
					$answeights[$i] = round($answeights[$i]*$points,2);
				}
				//adjust for rounding
				$diff = $points - array_sum($answeights);
				$answeights[count($answeights)-1] += $diff;
				$answeights = implode(', ',$answeights);
				
				echo "(parts: $answeights) ";
			}
			echo "in {$attempts[$loc]} attempt(s)\n";
			
			$laarr = explode('##',$la[$loc]);
			if (count($laarr)>1) {
				echo "<br/>Previous Attempts:";
				$cntb =1;
				for ($k=0;$k<count($laarr)-1;$k++) {
					if ($laarr[$k]=="ReGen") {
						echo ' ReGen ';
					} else {
						echo "  <b>$cntb:</b> " ;
						if (preg_match('/@FILE:(.+?)@/',$laarr[$k],$match)) {
							$url = getasidfileurl($s3asid,$match[1]);
							echo "<a href=\"$url\" target=\"_new\">{$match[1]}</a>";
						} else {
							echo str_replace(array('&','%nbsp;'),array('; ','&nbsp;'),strip_tags($laarr[$k]));
						}
						$cntb++;
					}
				}
			}
			
			//echo " <a target=\"_blank\" href=\"$imasroot/msgs/msglist.php?cid=$cid&add=new&quoteq=$i-$qsetid-{$seeds[$i]}&to={$_GET['uid']}\">Use in Msg</a>";
			//echo " &nbsp; <a href=\"gradebook.php?stu=$stu&gbmode=$gbmode&cid=$cid&asid={$line['id']}&clearq=$i\">Clear Score</a>";
			echo "<br/>Feedback: <textarea cols=50 rows=1 name=\"feedback-{$line['id']}\">{$line['feedback']}</textarea>";
			echo ' Question #'.($loc+1);
			echo "</div>\n";
			if ($groupdup) {
				echo '</div>';
			}
			$cnt++;
		}
	}
	echo "<input type=submit value=\"Save Changes\"/>";
	echo "</form>";

	

	echo "<p><a href=\"gb-itemanalysis.php?stu=$stu&cid=$cid&aid=$aid&asid=average\">Back to Gradebook Item Analysis</a></p>";

	require("../footer.php");
	function getpts($sc) {
		if (strpos($sc,'~')===false) {
			if ($sc>0) { 
				return $sc;
			} else {
				return 0;
			}
		} else {
			$sc = explode('~',$sc);
			$tot = 0;
			foreach ($sc as $s) {
				if ($s>0) { 
					$tot+=$s;
				}
			}
			return round($tot,1);
		}
	}
	function printscore($sc) {
		if (strpos($sc,'~')===false) {

			return array($sc,'');
		} else {
			$pts = getpts($sc);
			$sc = str_replace('-1','N/A',$sc);
			$sc = str_replace('~',', ',$sc);
			return array($pts,$sc);
		}		
	}
function getansweights($qi,$code) {
	global $seeds,$questions;	
	$i = array_search($qi,$questions);
	return sandboxgetweights($code,$seeds[$i]);
}

function sandboxgetweights($code,$seed) {
	srand($seed);
	eval(interpret('control','multipart',$code));
	if (is_array($answeights)) {
		return $answeights;
	} else {
		return explode(',',$answeights);
	}
}
?>


