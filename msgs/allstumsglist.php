<?php
	//Displays Message list of students
	//(c) 2008 David Lippman
	
	require("../validate.php");
	if ($cid!=0 && !isset($teacherid) && !isset($tutorid) && !isset($studentid)) {
	   require("../header.php");
	   echo "You are not enrolled in this course.  Please return to the <a href=\"../index.php\">Home Page</a> and enroll\n";
	   require("../footer.php");
	   exit;
	}
	if (isset($teacherid)) {
		$isteacher = true;	
	} else {
	   require("../header.php");
	   echo "You must be a teacher, and access this page from the course page Messages link.\n";
	   require("../footer.php");
	   exit;
	}
	
	$threadsperpage = $listperpage;
	
	$cid = $_GET['cid'];
	if (!isset($_GET['page']) || $_GET['page']=='') {
		$page = 1;
	} else {
		$page = $_GET['page'];
	}
	if (isset($_GET['filterstu'])) {
		$filterstu = $_GET['filterstu'];
	} else {
		$filterstu = 0;
	}
	
	if (isset($_POST['remove'])) {
		$checklist = "'".implode("','",$_POST['checked'])."'";
		$query = "DELETE FROM imas_msgs WHERE id IN ($checklist)";
		mysql_query($query) or die("Query failed : $query " . mysql_error());
	}
	if (isset($_GET['removeid'])) {
		$query = "DELETE FROM imas_msgs WHERE id='{$_GET['removeid']}'";
		mysql_query($query) or die("Query failed : $query " . mysql_error());
	}
	
	$pagetitle = "Student Messages";
	require("../header.php");
	
	echo "<div class=breadcrumb><a href=\"../index.php\">Home</a> ";
	if ($cid>0) {
		echo "&gt; <a href=\"../course/course.php?cid=$cid\">$coursename</a> ";
	}
	echo "&gt; <a href=\"msglist.php?cid=$cid\">Message List</a> &gt; Student Messages</div>";
	echo '<div id="headerallstumsglist" class="pagetitle"><h2>All Student Messages</h2></div>';
	
	$query = "SELECT COUNT(id) FROM imas_msgs WHERE courseid='$cid' AND (isread<2 OR isread>3)";
	if ($filterstu>0) {
		$query .= " AND msgto='$filterstu'";
	}
	$result = mysql_query($query) or die("Query failed : $query " . mysql_error());
	$numpages = ceil(mysql_result($result,0,0)/$threadsperpage);
	
	$prevnext = '';
	if ($numpages > 1) {
		echo "<span class=\"right\" style=\"padding: 5px;\">Page: ";
		if ($page < $numpages/2) {
			$min = max(2,$page-4);
			$max = min($numpages-1,$page+8+$min-$page);
		} else {
			$max = min($numpages-1,$page+4);
			$min = max(2,$page-8+$max-$page);
		}
		if ($page==1) {
			echo "<b>1</b> ";
		} else {
			echo "<a href=\"allstumsglist.php?page=1&cid=$cid&filterstu=$filterstu\">1</a> ";
		}
		if ($min!=2) { echo " ... ";}
		for ($i = $min; $i<=$max; $i++) {
			if ($page == $i) {
				echo "<b>$i</b> ";
			} else {
				echo "<a href=\"allstumsglist.php?page=$i&cid=$cid&filterstu=$filterstu\">$i</a> ";
			}
		}
		if ($max!=$numpages-1) { echo " ... ";}
		if ($page == $numpages) {
			echo "<b>$numpages</b> ";
		} else {
			echo "<a href=\"allstumsglist.php?page=$numpages&cid=$cid&filterstu=$filterstu\">$numpages</a> ";
		}
		echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		if ($page>1) {
			$prevnext .= "<a href=\"allstumsglist.php?page=".($page-1)."&cid=$cid&filterstu=$filterstu\">Previous</a> ";
		} else {
			$prevnext .= "Previous ";
		}
		if ($page < $numpages) {
			$prevnext .= "<a href=\"allstumsglist.php?page=".($page+1)."&cid=$cid&filterstu=$filterstu\">Next</a> ";
		} else {
			$prevnext .= "Next ";
		}
		echo $prevnext;
		echo "</span>\n";
	}
	$address = "http://" . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/\\') . "/allstumsglist.php?cid=$cid&filterstu=";
	
?>
<script type="text/javascript">
function chgfilter() {
	var filterstu = document.getElementById("filterstu").value;
	window.location = "<?php echo $address;?>"+filterstu;
}
</script>	
	<form id="qform" method=post action="allstumsglist.php?page=<?php echo $page;?>&cid=<?php echo $cid;?>">
	<p>Filter by student: <select id="filterstu" onchange="chgfilter()">
<?php
	echo "<option value=\"0\" ";
	if ($filtercid==0) {
		echo "selected=1 ";
	}
	echo ">All students</option>";
	$query = "SELECT imas_users.id,imas_users.LastName,imas_users.FirstName FROM imas_users,imas_students WHERE ";
	$query .= "imas_students.userid=imas_users.id AND imas_students.courseid='$cid'";
	$result = mysql_query($query) or die("Query failed : $query " . mysql_error());
	$stulist = array();
	while ($row = mysql_fetch_row($result)) {
		$stulist[$row[0]] = "{$row[1]}, {$row[2]}";
		echo "<option value=\"{$row[0]}\" ";
		if ($filterstu==$row[0]) {
			echo 'selected=1';
		}
		echo " >{$row[1]}, {$row[2]}</option>";
	}
	echo "</select></p>";
	
	$query = "SELECT imas_users.id,imas_users.LastName,imas_users.FirstName FROM imas_users,imas_teachers WHERE ";
	$query .= "imas_teachers.userid=imas_users.id AND imas_teachers.courseid='$cid'";
	$result = mysql_query($query) or die("Query failed : $query " . mysql_error());
	while ($row = mysql_fetch_row($result)) {
		$stulist[$row[0]] = "{$row[1]}, {$row[2]}";
	}
	
?>
	Check: <a href="#" onclick="return chkAllNone('qform','checked[]',true)">All</a> <a href="#" onclick="return chkAllNone('qform','checked[]',false)">None</a>
	With Selected: 	<input type=submit name="remove" value="Delete">
			
	<table class=gb>
	<thead>
	<tr><th></th><th>Message</th><th>From</th><th>To</th><th>Sent</th></tr>
	</thead>
	<tbody>
<?php
	$query = "SELECT imas_msgs.id,imas_msgs.title,imas_msgs.senddate,imas_msgs.replied,imas_msgs.msgto,imas_msgs.msgfrom,imas_msgs.isread,imas_courses.name ";
	$query .= "FROM imas_msgs,imas_courses WHERE imas_courses.id=imas_msgs.courseid AND ";
	$query .= "(imas_msgs.isread<2 OR imas_msgs.isread>3) AND imas_msgs.courseid='$cid' ";
	if ($filterstu>0) {
		$query .= "AND imas_msgs.msgto='$filterstu'";
	}
	$query .= "ORDER BY senddate DESC ";
	$offset = ($page-1)*$threadsperpage;
	$query .= "LIMIT $offset,$threadsperpage";// OFFSET $offset"; 
	$result = mysql_query($query) or die("Query failed : $query " . mysql_error());
	if (mysql_num_rows($result)==0) {
		echo "<tr><td></td><td>No messages</td><td></td></tr>";
	}
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
		if (trim($line['title'])=='') {
			$line['title'] = '[No Subject]';
		}
		$n = 0;
		while (strpos($line['title'],'Re: ')===0) {
			$line['title'] = substr($line['title'],4);
			$n++;
		}
		if ($n==1) {
			$line['title'] = 'Re: '.$line['title'];
		} else if ($n>1) {
			$line['title'] = "Re<sup>$n</sup>: ".$line['title'];
		}
		echo "<tr><td><input type=checkbox name=\"checked[]\" value=\"{$line['id']}\"/></td><td>";
		echo "<a href=\"viewmsg.php?page$page&cid=$cid&filterstu=$filterstu&type=msg&msgid={$line['id']}&type=allstu\">";
		echo $line['title'];
		echo "</a></td><td>";
		echo $stulist[$line['msgfrom']];
		echo "</td><td>{$stulist[$line['msgto']]}</td>";
		$senddate = tzdate("F j, Y, g:i a",$line['senddate']);
		echo "<td>$senddate</td></tr>";
	}
?>
	</tbody>
	</table>
	</form>
<?php
	if ($prevnext != '') {
		echo "<p>$prevnext</p>";
	}
	echo "<p><a href=\"msglist.php?cid=$cid\">Back to My Messages</a></p>";
	
	require("../footer.php");
?>
		
	
