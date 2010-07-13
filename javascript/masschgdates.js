  //http://lawrence.ecorp.net/inet/samples/js-date-fx.shtml
Date.prototype.DAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
Date.prototype.SHORTDAYS = ["Su","M","Tu","W","Th","F","Sa"];
Date.prototype.MONTHNAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.prototype.msPERMIN = 1000 * 60;
Date.prototype.msPERDAY = 1000 * 60 * 60 * 24;

Date.prototype.addDays = function(d) {
        /* Adds the number of days to the date */
        this.setDate( this.getDate() + d );
    };
Date.prototype.addBizDays = function(d) {
    /* Adds the necessary number of days
     * to the date to include the required
     * weekdays.
     */
    var day = this.getDay();    //weekday number 0 through 6
    var wkEnd = 0;              //number of weekends needed
    var m = d % 5;              //number of weekdays for partial week

    if (d < 0) {
        wkEnd = Math.ceil(d/5);        //Yields a negative number of weekends
        switch (day) {
        case 6:
            //If staring day is Sat. one less weekend needed
            if (m == 0 && wkEnd < 0) wkEnd++;
            break;
        case 0:

            if (m == 0) d++; //decrease - part of weekend
            else d--;    //increase - part of weekend
            break;
        default:
            if (m <= -day) wkEnd--; //add weekend if not enough days to cover
        }
    }
    else if (d > 0) {
        wkEnd = Math.floor(d/5);
        var w = wkEnd;

        switch (day) {
        case 6:
            /* If staring day is Sat. and
             * no partial week one less day needed
             * if partial week one more day needed
             */
            if (m == 0) d--;
            else d++;
            break;
        case 0:
            if (m == 0 && wkEnd > 0) wkEnd--;
            break;
        default:
            if (5 - day < m) wkEnd++;
        }
    }

    d += wkEnd * 2;

    this.addDays(d);
};
Date.prototype.daysBetween = function(d) {
        //Returns number of days between to dates.

        var rtrn = null;

        if (! d instanceof Date) {
            try {
                d = new Date(d);
            }
            catch (e) {
                d = null;
            }
        }

        if (d) {
            /* Save time values */
            var th = this.getHours();
            var tm = this.getMinutes();
            var ts = this.getSeconds();
            var tms = this.getMilliseconds();
            var dth = d.getHours();
            var dtm = d.getMinutes();
            var dts = d.getSeconds();
            var dtms = d.getMilliseconds();

            /* Set times to midnight */
            this.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);

            /* get date value */
            var c = this.getTime();
            var n = d.getTime();

            /* restore times */
            this.setHours(th, tm, ts, tms);
            d.setHours(dth, dtm, dts, dtms);

            c = Math.floor(c/this.msPERDAY);
            n = Math.floor(n/this.msPERDAY);
            rtrn = n - c;
        }
        return rtrn;
    };
Date.prototype.getWeekDays = function(d) {
        //Returns number of weekdays between to dates

        var wkEnds = 0, days = 0;
        var s = 0, e = 0;

        days = Math.abs(this.daysBetween(d));

        if (days) {

            wkEnds = Math.floor(days/7);

            s = (d < this) ? d.getDay() : this.getDay() ;
            e = (d < this) ? this.getDay() : d.getDay();

            if (s != 6 && s > e) wkEnds++;
            if (s != e && (s == 6 || e == 6) ) days--;

            days -= (wkEnds * 2);
	    if (d<this) {days *= -1;}
        }
        return days;
    };



  function leadingZero(nr) {
	  if (nr < 10) nr = "0" + nr;
	  return nr;
  }
  function makenicetime(d) {
	var Hours = d.getHours();
	var ampm = "am";
	if (Hours > 11)
		ampm = "pm";
	if (Hours == 0) Hours = 12;
	if (Hours > 12)
		Hours -= 12;
	return (Hours + ':' + leadingZero(d.getMinutes()) + ' ' + ampm);
	  
  }
  var globd = new Date();
  function ob(el) {
	 globd.setTime(Date.parse(el.value));
	 document.getElementById(el.id.substring(0,2)+el.id.substring(5)).innerHTML = globd.SHORTDAYS[globd.getDay()];
  }
  function senddownsub(type,basearr,st,usebusdays,usecb) {  //type: s,e,r
	  var d = new Date();
	  var db = new Date();
	  if (document.getElementById(type+"datetype"+st).value==1) {
		  var newstartdate = document.getElementById(type+"date"+st).value;
		  if (newstartdate!=0 && newstartdate!=2000000000 && basearr[st]!="NA") {
			  var newstarttime = document.getElementById(type+"time"+st).value;
			  d.setTime(Date.parse(newstartdate + ' ' + newstarttime.replace(/^\s*(\d+)\s*(am|pm)/,"$1:00 $2")));
			  db.setTime(basearr[st]*1000); 
			  if (usebusdays) {
				  var daydiff = db.getWeekDays(d); //days
			  } else {
				  var daydiff = db.daysBetween(d); //days
			  }
			  var timediff = (d.getHours()*60+d.getMinutes()) - (db.getHours()*60+db.getMinutes()); //minutes
			  for (var i=st+1;i<basearr.length;i++) {
				  if (usecb && !document.getElementById("cb"+i).checked) {
					  continue;
				  }
				  if (basearr[i]!="NA" && document.getElementById(type+"datetype"+i).value==1) {
					 curdate = document.getElementById(type+"date"+i).value;
					 if (curdate!=0 && curdate!=2000000000) {
						 d.setTime(basearr[i]*1000);
						 d.setTime(d.getTime()+timediff*60000);
						 if (usebusdays) {
							 d.addBizDays(daydiff);
						 } else {
							 d.addDays(daydiff);
						 }
						 nicedate = leadingZero(d.getMonth()+1)+'/'+leadingZero(d.getDate())+'/'+d.getFullYear();
						 document.getElementById(type+"date"+i).value = nicedate;
						 document.getElementById(type+"d"+i).innerHTML = d.SHORTDAYS[d.getDay()];
						 nicetime = makenicetime(d);
						 document.getElementById(type+"time"+i).value = nicetime;
					 }
				  }
			  }
		  }
	  }
  }
  function senddown(st) {
	  var usebusdays = document.getElementById("onlyweekdays").checked;
	  var usecb = false;
	  var cbs = document.getElementsByTagName("input");
	  for (var i=0;i<cbs.length;i++) {
		  if (cbs[i].type=="checkbox" && cbs[i].checked && cbs[i].id.match(/cb/)) {
			  usecb = true;
			  break;
		  }
	  }
	// alert(usecb);
	  senddownsub('s',basesdates,st,usebusdays,usecb);
	  senddownsub('e',baseedates,st,usebusdays,usecb);
	  if (baserdates[st]!="NA") {
		  senddownsub('r',baserdates,st,usebusdays,usecb);
	  }
  }
  function filteritems() {
	  var filtertype = document.getElementById("filter").value;
	  window.location = filteraddr + '&filter=' + filtertype;
  }
  function chgorderby() {
	  var ordertype = document.getElementById("orderby").value;
	  window.location = orderaddr + '&orderby=' + ordertype;
  }
  function calcallback(y,m,d) {
	  globd.setYear(y);
	  globd.setMonth(m-1);
	  globd.setDate(d);
	  var el = window.CP_targetInput;
	  document.getElementById(el.id.substring(0,2)+el.id.substring(5)).innerHTML = globd.SHORTDAYS[globd.getDay()];
	  CP_tmpReturnFunction(y,m,d);
  }
  function datePickerClosed(dateField) {
	  var globd = getFieldDate(dateField.value);
	  document.getElementById(dateField.id.substring(0,2)+dateField.id.substring(5)).innerHTML = globd.SHORTDAYS[globd.getDay()];
  }
	  
  function MCDtoggle(type,cnt) {
	var typeinput = document.getElementById(type+"datetype"+cnt);
	if (typeinput.value==0) { //swap from A/N to date
		document.getElementById(type+"span0"+cnt).className="hide";
		document.getElementById(type+"span1"+cnt).className="show";
		typeinput.value = 1;
	} else { //swap from date to A/N
		document.getElementById(type+"span0"+cnt).className="show";
		document.getElementById(type+"span1"+cnt).className="hide";
		typeinput.value = 0;
	}
	  
  }
  function MCDtoggleselected(form) {
	  var type = document.getElementById("swaptype").value;
	  var to = document.getElementById("swapselected").value;
	  var els = form.getElementsByTagName("input");
	  for (var i=0; i<els.length; i++) {
		  if (els[i].type=='checkbox' && els[i].checked && els[i].id!='ca') {
			var cnt = els[i].value;
			try {
				if (to=="dates") { //swap from A/N to date
					document.getElementById(type+"span0"+cnt).className="hide";
					document.getElementById(type+"span1"+cnt).className="show";
					document.getElementById(type+"datetype"+cnt).value = 1;
				} else { //swap from date to A/N
					document.getElementById(type+"span0"+cnt).className="show";
					document.getElementById(type+"span1"+cnt).className="hide";
					document.getElementById(type+"datetype"+cnt).value = 0;
				}
			} catch (e) { };
			els[i].checked = false;
		  }
	  }
  }
  function chkAll(frm, mark) {  
  	var els = frm.getElementsByTagName("input");
	  for (var i=0; i<els.length; i++) {
		  if (els[i].type=='checkbox' && els[i].id!='ca') {   
			  try{     
				  if(els[i].type == "checkbox" && els[i].id != 'ca') {  
					  els[i].checked = mark;     
				  }   
  			  } catch(er) {}
		  }
  	}
  }
  
  	//TODO: separately calculate day difference (using daysBetween and getWeekDays) and time difference separately
	//can use getHours()*60+getMinutes() to get minutes into day, then multiply to get ms for timediff
	//then use date object, set to basesdate, use addDays or addBizDays to add the days, and setTime(getTime()+d) for time diff.
 /* function senddown(st) {
	  var d = new Date();
	  var newstartdate = document.getElementById("sdate"+st).value;
	  if (newstartdate!=0 && newstartdate!=2000000000) {
		timeel = document.getElementById("stime"+st);
		if (timeel==null) {
			curdate = Date.parse(newstartdate)/1000;
		} else {
			newstarttime = timeel.value;
			var curdate = Date.parse(newstartdate + ' ' + newstarttime.replace(/^\s*(\d+)\s*(am|pm)/,"$1:00 $2"))/1000;
		}
		var timediff = curdate - basesdates[st];
		basesdates[st] = curdate;
		for (var i=st+1;i<basesdates.length;i++) {
			curdate = document.getElementById("sdate"+i).value;
			if (curdate!=0 && curdate!=2000000000) {
				curdate = basesdates[i] + timediff;
				basesdates[i] = curdate;
				d.setTime(curdate*1000);
				nicedate = leadingZero(d.getMonth()+1)+'/'+leadingZero(d.getDate())+'/'+d.getFullYear();
				document.getElementById("sdate"+i).value = nicedate;
				nicetime = makenicetime(d);
				document.getElementById("stime"+i).value = nicetime;
			}	
		}
	  }
	  var newstartdate = document.getElementById("edate"+st).value;
	  if (newstartdate!=0 && newstartdate!=2000000000) {
		timeel = document.getElementById("etime"+st);
		if (timeel==null) {
			curdate = Date.parse(newstartdate)/1000;
		} else {
			newstarttime = timeel.value;
			var curdate = Date.parse(newstartdate + ' ' + newstarttime.replace(/^\s*(\d+)\s*(am|pm)/,"$1:00 $2"))/1000;
		}
		
		var timediff = curdate - baseedates[st];
		baseedates[st] = curdate;
		for (var i=st+1;i<baseedates.length;i++) {
			curdate = document.getElementById("edate"+i).value;
			if (curdate!=0 && curdate!=2000000000) {
				curdate = baseedates[i] + timediff;
				baseedates[i] = curdate;
				d.setTime(curdate*1000);
				nicedate = leadingZero(d.getMonth()+1)+'/'+leadingZero(d.getDate())+'/'+d.getFullYear();
				document.getElementById("edate"+i).value = nicedate;
				nicetime = makenicetime(d);
				document.getElementById("etime"+i).value = nicetime;
			}	
		}
	  }
	 var newstartdate = document.getElementById("rdate"+st).value;
	  if (newstartdate!=0 && newstartdate!=2000000000) {
		timeel = document.getElementById("rtime"+st);
		if (timeel==null) {
			curdate = Date.parse(newstartdate);
		} else {
			newstarttime = timeel.value;
			var curdate = Date.parse(newstartdate + ' ' + newstarttime.replace(/^\s*(\d+)\s*(am|pm)/,"$1:00 $2"))/1000;
		}
		var timediff = curdate - baserdates[st];
		baserdates[st] = curdate;
		for (var i=st+1;i<baserdates.length;i++) {
			curdate = document.getElementById("rdate"+i).value;
			if (curdate!=0 && curdate!=2000000000) {
				curdate = baserdates[i] + timediff;
				baserdates[i] = curdate;
				d.setTime(curdate*1000);
				nicedate = leadingZero(d.getMonth()+1)+'/'+leadingZero(d.getDate())+'/'+d.getFullYear();
				document.getElementById("rdate"+i).value = nicedate;
				nicetime = makenicetime(d);
				document.getElementById("rtime"+i).value = nicetime;
			}	
		}
	  }
  }
  */

