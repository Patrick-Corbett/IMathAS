<?php
//IMathAS:  IMathAS question interpreter.  Defines how the IMathAS question
//language works.
//(c) 2006 David Lippman

//TODO:  handle for ($i=0..2) { to handle expressions, array var, etc. for 0 and 2
//require_once("mathphp.php");
array_push($allowedmacros,"loadlibrary","importcodefrom","includecodefrom","array","off","true","false","e","pi","null","setseed","if","for","where");
$disallowedvar = array('$link','$qidx','$qnidx','$seed','$qdata','$toevalqtxt','$la','$laarr','$shanspt','$GLOBALS','$laparts','$anstype','$kidx','$iidx','$tips','$options','$partla','$partnum','$score','$disallowedvar','$allowedmacros','$wherecount','$countcnt');

//main interpreter function.  Returns PHP code string, or HTML if blockname==qtext
function interpret($blockname,$anstype,$str,$countcnt=1)
{
	if ($blockname=="qtext") {
		$str = preg_replace_callback('/(include|import)qtextfrom\((\d+)\)/','getquestionqtext',$str);
		$str = str_replace('"','\"',$str);
		$str = str_replace("\r\n","\n",$str);
		$str = str_replace("\n\n","<br/><br/>\n",$str);
		return $str;
	} else {
		$str = str_replace(array('\\frac','\\tan','\\root','\\vec'),array('\\\\frac','\\\\tan','\\\\root','\\\\vec'),$str);
		$str .= ' ';
		$str = str_replace("\r\n","\n",$str);
		$str = str_replace("&&\n","<br/>",$str);
		$str = str_replace("&\n"," ",$str);
		$r =  interpretline($str.';',$anstype,$countcnt).';';
		return $r;
	}
}

function getquestionqtext($m) {
	$query = "SELECT qtext FROM imas_questionset WHERE id='{$m[2]}'";
	$result = mysql_query($query) or die("Query failed : " . mysql_error());
	if (mysql_num_rows($result)==0) {
		echo "bad question id in includeqtextfrom";
		return "";
	} else {
		return mysql_result($result,0,0);
	}
}
//interpreter some code text.  Returns a PHP code string.
function interpretline($str,$anstype,$countcnt) {
	$str .= ';';
	$bits = array();
	$lines = array();
	$len = strlen($str);
	$cnt = 0;
	$ifloc = -1;
	$elseloc = array();
	$forloc = -1;
	$whereloc = -1;
	$lastsym = '';
	$lasttype = -1;
	$closeparens = 0;
	$symcnt = 0;
	//get tokens from tokenizer
	$syms = tokenize($str,$anstype,$countcnt);
	$k = 0;
	$symlen = count($syms);
	//$lines holds lines of code; $bits holds symbols for the current line. 
	while ($k<$symlen) {
		list($sym,$type) = $syms[$k];
		//first handle stuff that would use last symbol; add it if not needed
		if ($sym=='^' && $lastsym!='') { //found a ^: convert a^b to safepow(a,b)
			$bits[] = 'safepow(';
			$bits[] = $lastsym;
			$bits[] = ',';
			$k++;
			list($sym,$type) = $syms[$k];
			$closeparens++;  //triggers to close safepow after next token
			$lastsym='^';
			$lasttype = 0;
		} else if ($sym=='!' && $lasttype!=0 && $lastsym!='' && $syms[$k+1]{0}!='=') { 
			//convert a! to factorial(a), avoiding if(!a) and a!=b
			$bits[] = 'factorial(';
			$bits[] = $lastsym;
			$bits[] = ')';
			$sym = '';
		} else if ($lasttype==2 && $type==4 && substr($lastsym,0,5)=='root(') {
			$bits[] = substr($lastsym,0,-1).',';
			$sym = substr($sym,1);
			$lasttype = 0;
		} else {
			//add last symbol to stack
			if ($lasttype!=7 && $lasttype!=-1) {
				$bits[] = $lastsym;
			}
		}
		if ($closeparens>0 && $lastsym!='^' && $lasttype!=0) {
			//close safepow.  lasttype!=0 to get a^-2 to include -
			while ($closeparens>0) {
				$bits[] = ')';
				$closeparens--;
			}
			//$closeparens = false;
		}
		
		
		if ($sym=='=' && $ifloc==-1 && $whereloc==-1 && $lastsym!='<' && $lastsym!='>' && $lastsym!='!' && $lastsym!='=' && $syms[$k+1]{0}!='=') {
			//if equality equal (not comparison), and before if/where.
			//check for commas to the left, convert $a,$b =  to list($a,$b) = 
			$j = count($bits)-1;
			$hascomma = false;
			while ($j>=0) {
				if ($bits[$j]==',') {
					$hascomma = true;
					break;
				}
				$j--;
			}
			if ($hascomma) {
				array_unshift($bits,"list(");
				array_push($bits,')');
				$hascomma = false;
			}
		} else if ($type==7) {//end of line
			if ($lasttype=='7' || $lasttype==-1) {
				//nothing exciting, so just continue
				$k++;
				continue;
			}
			//check for for, if, where and rearrange bits if needed
			if ($forloc>-1) {
				//convert for($i=a..b) {todo}
				$j = $forloc; 
				while ($bits[$j]{0}!='{' && $j<count($bits)) {
					$j++;
				}
				$cond = implode('',array_slice($bits,$forloc+1,$j-$forloc-1));
				$todo = implode('',array_slice($bits,$j));
				//might be $a..$b or 3.*.4  (remnant of implicit handling)
				if (preg_match('/^\s*\(\s*(\$\w+)\s*\=\s*(-?\d+|\$[\w\[\]]+)\s*\.\s?\.\s*(-?\d+|\$[\w\[\]]+)\s*\)\s*$/',$cond,$matches)) {
					$forcond = array_slice($matches,1,3);
					$bits = array( "for ({$forcond[0]}=intval({$forcond[1]});{$forcond[0]}<=round(floatval({$forcond[2]}),0);{$forcond[0]}++) ".$todo."");
				} else {
					echo 'error with for code.. must be "for ($var=a..b) {todo}" where a and b are whole numbers or variables only';
					return 'error';
				}
			} else if ($ifloc == 0) {
				//this is if at beginning of line, form:  if ($a==3) {todo}
				$j = 0; 
				while ($bits[$j]{0}!='{' && $j<count($bits)) {
					$j++;
				}
				if ($j==count($bits)) {
					echo "need curlys for if statement at beginning of line";
					return 'error';
				}
				$cond = implode('',array_slice($bits,1,$j-1));
				if (count($elseloc)==0) {
					$todo = implode('',array_slice($bits,$j));
				} else {
					$todo = implode('',array_slice($bits,$j,$elseloc[0][0]-$j));
				}
				$out = "if ($cond) $todo";
				for ($i=0; $i<count($elseloc); $i++) {
					$j = $elseloc[$i][0];
					while ($bits[$j]{0}!='{' && $j<count($bits)) {
						$j++;
					}
					if ($j==count($bits)) {
						echo "need curlys for else statement";
						return 'error';
					}
					if ($i==count($elseloc)-1) {
						$todo = implode('',array_slice($bits,$j));
					} else {
						$todo = implode('',array_slice($bits,$j,$elseloc[$i+1][0]-$j));
					}
					if ($j-$elseloc[$i][0]==1) { //no condition
						if ($elseloc[$i][1]=='elseif') {
							echo 'need condition for elseif';
							return 'error';
						}
						$out .= " else $todo";
					} else { //has condition
						$cond = implode('',array_slice($bits,$elseloc[$i][0]+1,$j-$elseloc[$i][0]-1));
						$out .= " else if ($cond) $todo";
					}
				}
				$bits = array($out);
					
			} else if (count($elseloc)>0) {
				echo 'else used without leading if statement';
				return 'error';
			}
			if ($whereloc>0) {
				//handle $a = rand() where ($a==b)
				if ($ifloc>-1 && $ifloc<$whereloc) {
					echo 'line of type $a=b if $c==0 where $d==0 is invalid';
					return 'error';
				} 
				$wheretodo = implode('',array_slice($bits,0,$whereloc));
				
				if ($ifloc>-1) {
					//handle $a = rand() where ($a==b) if ($c==0)
					$wherecond = implode('',array_slice($bits,$whereloc+1,$ifloc-$whereloc-1));
					$ifcond = implode('',array_slice($bits,$ifloc+1));
					if ($countcnt==1) { //if outermost 
						$bits = array('if ('.$ifcond.') {$wherecount[0]=0;$wherecount['.$countcnt.']=0;do{'.$wheretodo.';$wherecount['.$countcnt.']++;$wherecount[0]++;} while (!('.$wherecond.') && $wherecount['.$countcnt.']<200 && $wherecount[0]<1000); if ($wherecount['.$countcnt.']==200) {echo "where not met in 200 iterations";}; if ($wherecount[0]>=1000 && $wherecount[0]<2000) {echo "nested where not met in 1000 iterations";}}');
					} else {
						$bits = array('if ('.$ifcond.') {$wherecount['.$countcnt.']=0;do{'.$wheretodo.';$wherecount['.$countcnt.']++;$wherecount[0]++;} while (!('.$wherecond.') && $wherecount['.$countcnt.']<200 && $wherecount[0]<1000); if ($wherecount['.$countcnt.']==200) {echo "where not met in 200 iterations";$wherecount[0]=5000;} }');
					}
				} else {
					$wherecond = implode('',array_slice($bits,$whereloc+1));
					if ($countcnt==1) {
						$bits = array('$wherecount[0]=0;$wherecount['.$countcnt.']=0;do{'.$wheretodo.';$wherecount['.$countcnt.']++;$wherecount[0]++;} while (!('.$wherecond.') && $wherecount['.$countcnt.']<200 && $wherecount[0]<1000); if ($wherecount['.$countcnt.']==200) {echo "where not met in 200 iterations";}; if ($wherecount[0]>=1000 && $wherecount[0]<2000 ) {echo "nested where not met in 1000 iterations";}');
					} else {
						$bits = array('$wherecount['.$countcnt.']=0;do{'.$wheretodo.';$wherecount['.$countcnt.']++;$wherecount[0]++;} while (!('.$wherecond.') && $wherecount['.$countcnt.']<200 && $wherecount[0]<1000); if ($wherecount['.$countcnt.']==200) {echo "where not met in 200 iterations";$wherecount[0]=5000;}; ');
					}
				}
				
			} else if ($ifloc > 0) {
				//handle $a = b if ($c==0)
				$todo = implode('',array_slice($bits,0,$ifloc));
				$cond = implode('',array_slice($bits,$ifloc+1));
				
				
				$bits = array("if ($cond) { $todo ; }");	
			}
			
			$forloc = -1;
			$ifloc = -1;
			$whereloc = -1;
			$elseloc = array();
			//collapse bits to a line, add to lines array
			$lines[] = implode('',$bits);
			$bits = array();
		} else if ($type==1) { //is var
			//implict 3$a and $a $b and (3-4)$a
			if ($lasttype==3 || $lasttype==1 || $lasttype==4) {
				$bits[] = '*';
			}
		} else if ($type==2) { //is func
			//implicit $v sqrt(2) and 3 sqrt(3) and (2-3)sqrt(4) and sqrt(2)sqrt(3)
			if ($lasttype==3 || $lasttype==1 || $lasttype==4 || $lasttype==2 ) {
				$bits[] = '*';
			}
		} else if ($type==3) { //is num
			//implicit 2 pi and $var pi
			if ($lasttype==3 || $lasttype == 1) {
				$bits[] = '*';
			}
			
		} else if ($type==4) { //is parens
			//implicit 3(4) (5)(3)  $v(2)
			if ($lasttype==3 || $lasttype==4 || $lasttype==1) {
				$bits[] = '*';
			}
		} else if ($type==8) { //is control
			//mark location of control symbol
			if ($sym=='if') {
				$ifloc = count($bits);
			} else if ($sym=='where') {
				$whereloc = count($bits);
			} else if ($sym=='for') {
				$forloc = count($bits);
			} else if ($sym=='else' || $sym=='elseif') {
				$elseloc[] = array(count($bits),$sym);
			}
		} else if ($type==9) {//is error
			//tokenizer returned an error token - exit current loop with error
			return 'error';
		} else if ($sym=='-' && $lastsym=='/') {
			//paren 1/-2 to 1/(-2)
			//avoid bug in PHP 4 where 1/-2*5 = -0.1 but 1/(-2)*5 = -2.5
			$bits[] = '(';
			$closeparens++;
		}
			
		
		$lastsym = $sym;
		$lasttype = $type;
		$cnt++;
		$k++;
	}
	//if no explicit end-of-line at end of bits
	if (count($bits)>0) {
		$lines[] = implode('',$bits);
	}
	//collapse to string
	return implode(";\n",$lines);
}

//get tokens
//eat up extra whitespace at end
//return array of arrays: array($symbol,$symtype)
//types: 1 var, 2 funcname (w/ args), 3 num, 4 parens, 5 curlys, 6 string, 7 endofline, 8 control, 9 error, 0 other, 11 array index []
function tokenize($str,$anstype,$countcnt) {
	global $allowedmacros;
	global $mathfuncs;
	global $disallowedwords,$disallowedvar;
	$i = 0;
	$connecttolast = 0;
	$len = strlen($str);
	$syms = array();
	$lastsym = array('',-1);
	while ($i<$len) {
		$intype = 0;
		$out = '';
		$c = $str{$i};
		$len = strlen($str);
		if ($c=='/' && $str{$i+1}=='/') { //comment
			while ($c!="\n" && $i<$len) {
				$i++;
				$c = $str{$i};
			}
			$i++;
			$c = $str{$i};
			$intype = 7;
		} else if ($c=='$') { //is var
			$intype = 1;
			//read to end of var
			do {
				$out .= $c;
				$i++;
				if ($i==$len) {break;}
				$c = $str{$i};
			} while ($c>="a" && $c<="z" || $c>="A" && $c<="Z" || $c>='0' && $c<='9' || $c=='_');
			//if [ then array ref - read and connect as part of variable token
			if ($c=='[') {
				$connecttolast = 1;
			}
			//check if allowed var
			if (in_array($out,$disallowedvar)) {
				echo "Eeek.. unallowed var $out!";
				return array(array('',9));
			}
		
		} else if ($c>="a" && $c<="z" || $c>="A" && $c<="Z") { //is str
			$intype = 2; //string like function name
			do {
				$out .= $c;
				$i++;
				if ($i==$len) {break;}
				$c = $str{$i};
			} while ($c>="a" && $c<="z" || $c>="A" && $c<="Z" || $c>='0' && $c<='9' || $c=='_');
			//check if it's a special word, and set type appropriately if it is
			if ($out=='if' || $out=='where' || $out=='for') {
				$intype = 8;
			} else if ($out=='else' || $out=='elseif') {
				$intype = 8;
				if ($out=='else' && substr($str,$i,3)==' if') {
					$out = 'elseif';
					$i += 3;
				}
				if ($lastsym[1]==7) {
					array_pop($syms);
					$lastsym = $syms[count($syms)-1];
				}
			} else if ($out=='e') {
				$out = "exp(1)";
				$intype = 3;
			} else if ($out=='pi') {
				$out = "(M_PI)";
				$intype = 3;
			} else if ($out=='userid') {
				$out = '"userid"';
				$intype = 6;
			} else {
				//eat whitespace
				while ($c==' ') {
					$i++;
					$c = $str{$i};
				}    
				//could be sin^-1 or sin^(-1) - check for them and rewrite if needed
				if ($c=='^' && substr($str,$i+1,2)=='-1') {
					$i += 3;
					$out = 'arc'.$out;
					$c = $str{$i};
					while ($c==' ') {
						$i++;
						$c = $str{$i};
					}
				} else if ($c=='^' && substr($str,$i+1,4)=='(-1)') {
					$i += 3;
					$out = 'arc'.$out;
					$c = $str{$i};
					while ($c==' ') {
						$i++;
						$c = $str{$i};
					}
				}
				//if there's a ( then it's a function
				if ($c=='(' && $out!='e' && $out!='pi') {
					//rewrite logs
					if ($out=='log') {
						$out = 'log10';
					} else if ($out=='ln') {
						$out = 'log';
					} else {
						//check it's and OK function
						if (!in_array($out,$allowedmacros)) {
							echo "Eeek.. unallowed macro {$out}";
							return array(array('',9));
						}
					}
					//rewrite arctrig into atrig for PHP
					$out = str_replace(array("arcsin","arccos","arctan","arcsinh","arccosh","arctanh"),array("asin","acos","atan","asinh","acosh","atanh"),$out);
	  
					//connect upcoming parens to function
					$connecttolast = 2;
				} else {
					//not a function, so what is it?
					if ($out=='true' || $out=='false' || $out=='null') {
						//we like this - it's an acceptable unquoted string
					} else {//
						//an unquoted string!  give a warning to instructor, 
						//but treat as a quoted string.
						if (isset($GLOBALS['teacherid'])) {
							echo "Warning... unquoted string $out.. treating as string";
						}
						$out = "'$out'";
						$intype = 6;
					}
					
				}
			}
		} else if (($c>='0' && $c<='9') || ($c=='.'  && ($str{$i+1}>='0' && $str{$i+1}<='9')) ) { //is num
			$intype = 3; //number
			$cont = true;
			//handle . 3 which needs to act as concat
			if ($lastsym[0]=='.') {
				$syms[count($syms)-1][0] .= ' ';
			}
			do {
				$out .= $c;
				$lastc = $c;
				$i++;
				if ($i==$len) {break;}
				$c= $str{$i};
				if (($c>='0' && $c<='9') || ($c=='.' && $str{$i+1}!='.' && $lastc!='.')) {
					//is still num
				} else if ($c=='e' || $c=='E') {
					//might be scientific notation:  5e6 or 3e-6 
					$d = $str{$i+1};
					if ($d>='0' && $d<='9') {
						$out .= $c;
						$i++;
						if ($i==$len) {break;}
						$c= $str{$i};
					} else if (($d=='-'||$d=='+') && ($str{$i+2}>='0' && $str{$i+2}<='9')) {
						$out .= $c.$d;
						$i+= 2;
						if ($i>=$len) {break;}
						$c= $str{$i};
					} else {
						$cont = false;
					}	
				} else {
					$cont = false;
				}	
			} while ($cont);
		} else if ($c=='(' || $c=='{' || $c=='[') { //parens or curlys
			if ($c=='(') {
				$intype = 4; //parens
				$leftb = '(';
				$rightb = ')';
			} else if ($c=='{') {
				$intype = 5; //curlys
				$leftb = '{';
				$rightb = '}';
			} else if ($c=='[') {
				$intype = 11; //array index brackets
				$leftb = '[';
				$rightb = ']';
			}
			$thisn = 1;
			$inq = false;
			$j = $i+1;
			$len = strlen($str);
			while ($j<$len) {
				//read terms until we get to right bracket at same nesting level
				//we have to avoid strings, as they might contain unmatched brackets
				$d = $str{$j};
				if ($inq) {  //if inquote, leave if same marker (not escaped)
					if ($d==$qtype && $str{$j-1}!='\\') {
						$inq = false;
					}
				} else {
					if ($d=='"' || $d=="'") {
						$inq = true; //entering quotes
						$qtype = $d;
					} else if ($d==$leftb) {
						$thisn++;  //increase nesting depth
					} else if ($d==$rightb) {
						$thisn--; //decrease nesting depth
						if ($thisn==0) {
							//read inside of brackets, send recursively to interpreter
							$inside = interpretline(substr($str,$i+1,$j-$i-1),$anstype,$countcnt+1);
							if ($inside=='error') {
								//was an error, return error token
								return array(array('',9));
							}
							//if curly, make sure we have a ;, unless preceeded by a $ which
							//would be a variable variable
							if ($rightb=='}' && $lastsym[0]!='$') {
								$out .= $leftb.$inside.';'.$rightb;
							} else {
								$out .= $leftb.$inside.$rightb;
							}
							$i= $j+1;
							break;
						}
					} else if ($d=="\n") {
						//echo "unmatched parens/brackets - likely will cause an error";
					}
				}
				$j++;
			}
			if ($j==$len) {
				$i = $j;
				echo "unmatched parens/brackets - likely will cause an error";
			} else {
				$c = $str{$i};
			}
		} else if ($c=='"' || $c=="'") { //string
			$intype = 6;
			$qtype = $c;
			do {
				$out .= $c;
				$i++;
				if ($i==$len) {break;}
				$lastc = $c;
				$c = $str{$i};
			} while (!($c==$qtype && $lastc!='\\'));	
			$out .= $c;
			$i++;
			$c = $str{$i};
		} else if ($c=="\n") {
			//end of line
			$intype = 7;
			$i++;
			if ($i<$len) {
				$c = $str{$i};
			}
		} else if ($c==';') {
			//end of line
			$intype = 7;
			$i++;
			if ($i<$len) {
				$c = $str{$i};
			}
		} else {
			//no type - just append string.  Could be operators
			$out .= $c;
			$i++;
			if ($i<$len) {
				$c = $str{$i};
			}
		}
		while ($c==' ') { //eat up extra whitespace
			$i++;
			if ($i==$len) {break;}
			$c = $str{$i};
			if ($c=='.' && $intype==3) {//if 3 . needs space to act like concat
				$out .= ' ';
			}
		}
		//if parens or array index needs to be connected to func/var, do it
		if ($connecttolast>0 && $intype!=$connecttolast) {
			//if func is loadlibrary, need to do so now so allowedmacros
			//will be expanded before reading the rest of the code
			if ($lastsym[0] == "loadlibrary") {
				loadlibrary(substr($out,1,strlen($out)-2));
				array_pop($syms);
				$connecttolast = 0;
			} else if ($lastsym[0] == 'importcodefrom' || $lastsym[0] == 'includecodefrom') {
				$out = intval(substr($out,1,strlen($out)-2));
				$query = "SELECT control,qtype FROM imas_questionset WHERE id='$out'";
				$result = mysql_query($query) or die("Query failed : " . mysql_error());
				if (mysql_num_rows($result)==0) {
					//was an error, return error token
					return array(array('',9));
				} else {
					//$inside = interpretline(mysql_result($result,0,0),$anstype);
					$inside = interpret('control',$anstype,mysql_result($result,0,0),$countcnt+1);
					if (mysql_result($result,0,1)!=$anstype) {
						//echo 'Imported code question type does not match current question answer type';
					}
				}
				if ($inside=='error') {
					//was an error, return error token
					return array(array('',9));
				} else {
					array_pop($syms);
					$connecttolast = 0;
					$syms[] = array('{$included=true;'.$inside.';$included=false;}',5); //type: curly
					$syms[] = array('',7); //end of line;
					$lastsym = array('',7);
				}
			} else {
				$syms[count($syms)-1][0] .= $out;
				$connecttolast = 0;
				if ($c=='[') {// multidim array ref?
					$connecttolast = 1;
				}
			}
		} else {
			//add to symbol list, avoid repeat end-of-lines.
			if ($intype!=7 || $lastsym[1]!=7) {
				$lastsym = array($out,$intype);
				$syms[] =  array($out,$intype);
			}
		}
		
	}
	return $syms;
}

//loads a macro library	
function loadlibrary($str) {
	$str = str_replace(array("/",".",'"'),"",$str);
	$libs = explode(",",$str);
	$libdir = rtrim(dirname(__FILE__), '/\\') .'/libs/';
	foreach ($libs as $lib) {
		if (is_file($libdir . $lib.".php")) {
			include_once($libdir.$lib.".php");
		} else {
			echo "Error loading library $lib\n";	
		}
	}
}

//sets question seed
function setseed($ns) {
	if ($ns=="userid") {
		if (isset($GLOBALS['teacherid']) && isset($GLOBALS['teacherreview'])) { //reviewing in gradebook
			srand($GLOBALS['teacherreview']);	
		} else { //in assessment
			srand($GLOBALS['userid']); 
		}
	} else {
		srand($ns);
	}	
}


?>
