var ASnoSVG=false;var checkIfSVGavailable=true;var notifyIfNoSVG=false;var alertIfNoSVG=false;var xunitlength=20;var yunitlength=20;var origin=[0,0];var defaultwidth=300;defaultheight=200;defaultborder=[0,0,0,0];var border=defaultborder;var strokewidth,strokedasharray,stroke,fill;var fontstyle,fontfamily,fontsize,fontweight,fontstroke,fontfill,fontbackground;var fillopacity=0.5;var markerstrokewidth="1";var markerstroke="black";var markerfill="yellow";var marker="none";var arrowfill=stroke;var dotradius=4;var ticklength=4;var axesstroke="black";var gridstroke="grey";var pointerpos=null;var coordinates=null;var above="above";var below="below";var left="left";var right="right";var aboveleft="aboveleft";var aboveright="aboveright";var belowleft="belowleft";var belowright="belowright";var cpi="\u03C0",ctheta="\u03B8";var pi=Math.PI,ln=Math.log,e=Math.E;var arcsin=Math.asin,arccos=Math.acos,arctan=Math.atan;var sec=function(f){return 1/Math.cos(f)};var csc=function(f){return 1/Math.sin(f)};var cot=function(f){return 1/Math.tan(f)};var xmin,xmax,ymin,ymax,xscl,yscl,xgrid,ygrid,xtick,ytick,initialized;var isIE=document.createElementNS==null;var picture,svgpicture,doc,width,height,a,b,c,d,i,n,p,t,x,y;var arcsec=function(f){return arccos(1/f)};var arccsc=function(f){return arcsin(1/f)};var arccot=function(f){return arctan(1/f)};var sinh=function(f){return(Math.exp(f)-Math.exp(-f))/2};var cosh=function(f){return(Math.exp(f)+Math.exp(-f))/2};var tanh=function(f){return(Math.exp(f)-Math.exp(-f))/(Math.exp(f)+Math.exp(-f))};var sech=function(f){return 1/cosh(f)};var csch=function(f){return 1/sinh(f)};var coth=function(f){return 1/tanh(f)};var arcsinh=function(f){return ln(f+Math.sqrt(f*f+1))};var arccosh=function(f){return ln(f+Math.sqrt(f*f-1))};var arctanh=function(f){return ln((1+f)/(1-f))/2};var sech=function(f){return 1/cosh(f)};var csch=function(f){return 1/sinh(f)};var coth=function(f){return 1/tanh(f)};var arcsech=function(f){return arccosh(1/f)};var arccsch=function(f){return arcsinh(1/f)};var arccoth=function(f){return arctanh(1/f)};var sign=function(f){return(f==0?0:(f<0?-1:1))};var logten=function(f){return(Math.LOG10E*Math.log(f))};function factorial(f,h){if(h==null){h=1}for(var g=f-h;g>0;g-=h){f*=g}return(f<0?NaN:(f==0?1:f))}function C(f,g){var j=1;for(var h=0;h<g;h++){j*=(f-h)/(g-h)}return j}function chop(f,g){if(g==null){g=0}return Math.floor(f*Math.pow(10,g))/Math.pow(10,g)}function ran(g,f,h){if(h==null){h=0}return chop((f+Math.pow(10,-h)-g)*Math.random()+g,h)}function myCreateElementXHTML(f){if(isIE){return document.createElement(f)}else{return document.createElementNS("http://www.w3.org/1999/xhtml",f)}}function isSVGavailable(){if(navigator.product&&navigator.product=="Gecko"){var rv=navigator.userAgent.toLowerCase().match(/rv:\s*([\d\.]+)/);if(rv!=null){rv=rv[1].split(".");if(rv.length<3){rv[2]=0}if(rv.length<2){rv[1]=0}}if(rv!=null&&10000*rv[0]+100*rv[1]+1*rv[2]>=10800){return null}else{return 1}}else{if(navigator.appName.slice(0,9)=="Microsoft"){try{var oSVG=eval("new ActiveXObject('Adobe.SVGCtl.3');");return null}catch(e){return 1}}else{return 1}}}function less(f,g){return f<g}function setText(f,h){var g=document.getElementById(h);if(g!=null){if(g.childNodes.length!=0){g.childNodes[0].nodeValue=f}else{g.appendChild(document.createTextNode(f))}}}function myCreateElementSVG(f){if(isIE){return doc.createElement(f)}else{return doc.createElementNS("http://www.w3.org/2000/svg",f)}}function getX(){return(doc.getElementById("pointerpos").getAttribute("cx")-origin[0])/xunitlength}function getY(){return(height-origin[1]-doc.getElementById("pointerpos").getAttribute("cy"))/yunitlength}function mousemove_listener(f){if(svgpicture.getAttribute("xbase")!=null){pointerpos.cx.baseVal.value=f.clientX-svgpicture.getAttribute("xbase")}if(svgpicture.getAttribute("ybase")!=null){pointerpos.cy.baseVal.value=f.clientY-svgpicture.getAttribute("ybase")}}function top_listener(f){svgpicture.setAttribute("ybase",f.clientY)}function bottom_listener(f){svgpicture.setAttribute("ybase",f.clientY-height+1)}function left_listener(f){svgpicture.setAttribute("xbase",f.clientX)}function right_listener(f){svgpicture.setAttribute("xbase",f.clientX-width+1)}function switchTo(f){picture=document.getElementById(f);width=picture.getAttribute("width")-0;height=picture.getAttribute("height")-0;strokewidth="1";stroke="black";fill="none";marker="none";if((picture.nodeName=="EMBED"||picture.nodeName=="embed")&&isIE){svgpicture=picture.getSVGDocument().getElementById("root");doc=picture.getSVGDocument()}else{picture.setAttribute("onmousemove","updateCoords"+(f.slice(f.length-1)-1)+"()");svgpicture=picture;doc=document}xunitlength=svgpicture.getAttribute("xunitlength")-0;yunitlength=svgpicture.getAttribute("yunitlength")-0;xmin=svgpicture.getAttribute("xmin")-0;xmax=svgpicture.getAttribute("xmax")-0;ymin=svgpicture.getAttribute("ymin")-0;ymax=svgpicture.getAttribute("ymax")-0;origin=[svgpicture.getAttribute("ox")-0,svgpicture.getAttribute("oy")-0]}function updatePicture(obj){var src=document.getElementById((typeof obj=="string"?obj:"picture"+(obj+1)+"input")).value;xmin=null;xmax=null;ymin=null;ymax=null;xscl=null;xgrid=null;yscl=null;ygrid=null;initialized=false;switchTo((typeof obj=="string"?obj.slice(0,8):"picture"+(obj+1)));src=src.replace(/plot\(\x20*([^\"f\[][^\n\r]+?)\,/g,'plot("$1",');src=src.replace(/plot\(\x20*([^\"f\[][^\n\r]+)\)/g,'plot("$1")');src=src.replace(/([0-9])([a-zA-Z])/g,"$1*$2");src=src.replace(/\)([\(0-9a-zA-Z])/g,")*$1");try{with(Math){eval(src)}}catch(err){alert(err+"\n"+src)}}function showHideCode(g){var f=g.nextSibling;while(f!=null&&f.nodeName!="BUTTON"&&f.nodeName!="button"){f=f.nextSibling}if(f.style.display=="none"){f.style.display=""}else{f.style.display="none"}while(f!=null&&f.nodeName!="TEXTAREA"&&f.nodeName!="textarea"){f=f.previousSibling}if(f.style.display=="none"){f.style.display=""}else{f.style.display="none"}}function hideCode(){}function showcode(){}function nobutton(){}function setBorder(g,f,j,h){if(h==null){border=new Array(g,g,g,g)}else{border=new Array(g,f,j,h)}}function initPicture(x_min,x_max,y_min,y_max){if(!initialized){strokewidth="1";strokedasharray=null;stroke="black";fill="none";fontstyle="italic";fontfamily="times";fontsize="16";fontweight="normal";fontstroke="black";fontfill="black";fontbackground="none";marker="none";initialized=true;if(x_min!=null){xmin=x_min}if(x_max!=null){xmax=x_max}if(y_min!=null){ymin=y_min}if(y_max!=null){ymax=y_max}if(xmin==null){xmin=-5}if(xmax==null){xmax=5}if(typeof xmin!="number"||typeof xmax!="number"||xmin>=xmax){alert("Picture requires at least two numbers: xmin < xmax")}else{if(y_max!=null&&(typeof y_min!="number"||typeof y_max!="number"||y_min>=y_max)){alert("initPicture(xmin,xmax,ymin,ymax) requires numbers ymin < ymax")}else{width=picture.getAttribute("width");if(width==null||width==""){width=defaultwidth}height=picture.getAttribute("height");if(height==null||height==""){height=defaultheight}xunitlength=(width-border[0]-border[2])/(xmax-xmin);yunitlength=xunitlength;if(ymin==null){origin=[-xmin*xunitlength+border[0],height/2];ymin=-(height-border[1]-border[3])/(2*yunitlength);ymax=-ymin}else{if(ymax!=null){yunitlength=(height-border[1]-border[3])/(ymax-ymin)}else{ymax=(height-border[1]-border[3])/yunitlength+ymin}origin=[-xmin*xunitlength+border[0],-ymin*yunitlength+border[1]]}winxmin=Math.max(border[0]-5,0);winxmax=Math.min(width-border[2]+5,width);winymin=Math.max(border[3]-5,0);winymax=Math.min(height-border[1]+5,height);if(isIE){svgpicture=picture.getSVGDocument().getElementById("root");while(svgpicture.childNodes.length()>5){svgpicture.removeChild(svgpicture.lastChild)}svgpicture.setAttribute("width",width);svgpicture.setAttribute("height",height);doc=picture.getSVGDocument()}else{var qnode=document.createElementNS("http://www.w3.org/2000/svg","svg");qnode.setAttribute("id",picture.getAttribute("id"));qnode.setAttribute("style","display:inline; "+picture.getAttribute("style"));qnode.setAttribute("width",picture.getAttribute("width"));qnode.setAttribute("height",picture.getAttribute("height"));if(picture.parentNode!=null){picture.parentNode.replaceChild(qnode,picture)}else{svgpicture.parentNode.replaceChild(qnode,svgpicture)}svgpicture=qnode;doc=document;pointerpos=doc.getElementById("pointerpos");if(pointerpos==null){pointerpos=myCreateElementSVG("circle");pointerpos.setAttribute("id","pointerpos");pointerpos.setAttribute("cx",0);pointerpos.setAttribute("cy",0);pointerpos.setAttribute("r",0.5);pointerpos.setAttribute("fill","red");svgpicture.appendChild(pointerpos)}}svgpicture.setAttribute("xunitlength",xunitlength);svgpicture.setAttribute("yunitlength",yunitlength);svgpicture.setAttribute("xmin",xmin);svgpicture.setAttribute("xmax",xmax);svgpicture.setAttribute("ymin",ymin);svgpicture.setAttribute("ymax",ymax);svgpicture.setAttribute("ox",origin[0]);svgpicture.setAttribute("oy",origin[1]);var node=myCreateElementSVG("rect");node.setAttribute("x","0");node.setAttribute("y","0");node.setAttribute("width",width);node.setAttribute("height",height);node.setAttribute("style","stroke-width:1;fill:white");svgpicture.appendChild(node);if(!isIE&&picture.getAttribute("onmousemove")!=null){svgpicture.addEventListener("mousemove",mousemove_listener,true);var st=picture.getAttribute("onmousemove");svgpicture.addEventListener("mousemove",eval(st.slice(0,st.indexOf("("))),true);node=myCreateElementSVG("polyline");node.setAttribute("points","0,0 "+width+",0");node.setAttribute("style","stroke:white; stroke-width:3");node.addEventListener("mousemove",top_listener,true);svgpicture.appendChild(node);node=myCreateElementSVG("polyline");node.setAttribute("points","0,"+height+" "+width+","+height);node.setAttribute("style","stroke:white; stroke-width:3");node.addEventListener("mousemove",bottom_listener,true);svgpicture.appendChild(node);node=myCreateElementSVG("polyline");node.setAttribute("points","0,0 0,"+height);node.setAttribute("style","stroke:white; stroke-width:3");node.addEventListener("mousemove",left_listener,true);svgpicture.appendChild(node);node=myCreateElementSVG("polyline");node.setAttribute("points",(width-1)+",0 "+(width-1)+","+height);node.setAttribute("style","stroke:white; stroke-width:3");node.addEventListener("mousemove",right_listener,true);svgpicture.appendChild(node)}border=defaultborder}}}}function line(h,g,j){var f;if(j!=null){f=doc.getElementById(j)}if(f==null){f=myCreateElementSVG("path");f.setAttribute("id",j);svgpicture.appendChild(f)}f.setAttribute("d","M"+(h[0]*xunitlength+origin[0])+","+(height-h[1]*yunitlength-origin[1])+" "+(g[0]*xunitlength+origin[0])+","+(height-g[1]*yunitlength-origin[1]));f.setAttribute("stroke-width",strokewidth);if(strokedasharray!=null){f.setAttribute("stroke-dasharray",strokedasharray)}f.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){f.setAttribute("fill",fill.substring(5));f.setAttribute("fill-opacity",fillopacity)}else{f.setAttribute("fill",fill)}if(marker=="dot"||marker=="arrowdot"){ASdot(h,4,markerstroke,markerfill);if(marker=="arrowdot"){arrowhead(h,g)}ASdot(g,4,markerstroke,markerfill)}else{if(marker=="arrow"){arrowhead(h,g)}}}function path(j,l,k){if(k==null){k=""}var h,f,g;if(l!=null){h=doc.getElementById(l)}if(h==null){h=myCreateElementSVG("path");h.setAttribute("id",l);svgpicture.appendChild(h)}if(typeof j=="string"){f=j}else{f="M";f+=(j[0][0]*xunitlength+origin[0])+","+(height-j[0][1]*yunitlength-origin[1])+" "+k;for(g=1;g<j.length;g++){f+=(j[g][0]*xunitlength+origin[0])+","+(height-j[g][1]*yunitlength-origin[1])+" "}}h.setAttribute("d",f);h.setAttribute("stroke-width",strokewidth);if(strokedasharray!=null){h.setAttribute("stroke-dasharray",strokedasharray)}h.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){h.setAttribute("fill",fill.substring(5));h.setAttribute("fill-opacity",fillopacity)}else{h.setAttribute("fill",fill)}if(marker=="dot"||marker=="arrowdot"){for(g=0;g<j.length;g++){if(k!="C"&&k!="T"||g!=1&&g!=2){ASdot(j[g],4,markerstroke,markerfill)}}}}function curve(f,g){path(f,g,"T")}function circle(g,f,j){var h;if(j!=null){h=doc.getElementById(j)}if(h==null){h=myCreateElementSVG("circle");h.setAttribute("id",j);svgpicture.appendChild(h)}h.setAttribute("cx",g[0]*xunitlength+origin[0]);h.setAttribute("cy",height-g[1]*yunitlength-origin[1]);h.setAttribute("r",f*xunitlength);h.setAttribute("stroke-width",strokewidth);h.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){h.setAttribute("fill",fill.substring(5));h.setAttribute("fill-opacity",fillopacity)}else{h.setAttribute("fill",fill)}}function loop(f,g,h){if(g==null){g=[1,0]}path([f,[f[0]+g[0],f[1]+g[1]],[f[0]-g[1],f[1]+g[0]],f],h,"C");if(marker=="arrow"||marker=="arrowdot"){arrowhead([f[0]+Math.cos(1.4)*g[0]-Math.sin(1.4)*g[1],f[1]+Math.sin(1.4)*g[0]+Math.cos(1.4)*g[1]],f)}}function arc(l,g,f,k){var j,h;if(k!=null){j=doc.getElementById(k)}if(f==null){h=[g[0]-l[0],g[1]-l[1]];f=Math.sqrt(h[0]*h[0]+h[1]*h[1])}if(j==null){j=myCreateElementSVG("path");j.setAttribute("id",k);svgpicture.appendChild(j)}j.setAttribute("d","M"+(l[0]*xunitlength+origin[0])+","+(height-l[1]*yunitlength-origin[1])+" A"+f*xunitlength+","+f*yunitlength+" 0 0,0 "+(g[0]*xunitlength+origin[0])+","+(height-g[1]*yunitlength-origin[1]));j.setAttribute("stroke-width",strokewidth);j.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){j.setAttribute("fill",fill.substring(5));j.setAttribute("fill-opacity",fillopacity)}else{j.setAttribute("fill",fill)}if(marker=="arrow"||marker=="arrowdot"){u=[(g[1]-l[1])/4,(l[0]-g[0])/4];h=[(g[0]-l[0])/2,(g[1]-l[1])/2];h=[l[0]+h[0]+u[0],l[1]+h[1]+u[1]]}else{h=[l[0],l[1]]}if(marker=="dot"||marker=="arrowdot"){ASdot(l,4,markerstroke,markerfill);if(marker=="arrowdot"){arrowhead(h,g)}ASdot(g,4,markerstroke,markerfill)}else{if(marker=="arrow"){arrowhead(h,g)}}}function ellipse(f,j,h,k){var g;if(k!=null){g=doc.getElementById(k)}if(g==null){g=myCreateElementSVG("ellipse");g.setAttribute("id",k);svgpicture.appendChild(g)}g.setAttribute("cx",f[0]*xunitlength+origin[0]);g.setAttribute("cy",height-f[1]*yunitlength-origin[1]);g.setAttribute("rx",j*xunitlength);g.setAttribute("ry",h*yunitlength);g.setAttribute("stroke-width",strokewidth);g.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){g.setAttribute("fill",fill.substring(5));g.setAttribute("fill-opacity",fillopacity)}else{g.setAttribute("fill",fill)}}function rect(k,h,l,j,g){var f;if(l!=null){f=doc.getElementById(l)}if(f==null){f=myCreateElementSVG("rect");f.setAttribute("id",l);svgpicture.appendChild(f)}f.setAttribute("x",k[0]*xunitlength+origin[0]);f.setAttribute("y",height-h[1]*yunitlength-origin[1]);f.setAttribute("width",(h[0]-k[0])*xunitlength);f.setAttribute("height",(h[1]-k[1])*yunitlength);if(j!=null){f.setAttribute("rx",j*xunitlength)}if(g!=null){f.setAttribute("ry",g*yunitlength)}f.setAttribute("stroke-width",strokewidth);f.setAttribute("stroke",stroke);if(fill.substr(0,5)=="trans"){f.setAttribute("fill",fill.substring(5));f.setAttribute("fill-opacity",fillopacity)}else{f.setAttribute("fill",fill)}}function text(g,f,j,h){g[0]=g[0]*xunitlength+origin[0];g[1]=g[1]*yunitlength+origin[1];textabs(g,f,j,h)}function textabs(g,s,o,k,f,q){if(k==null){k=0}else{k=(360-k)%360}var j="middle";var v=0;var r=0;if(k==270){var r=0;var v=fontsize/3;if(o!=null){if(o.match(/left/)){v=-fontsize/2}if(o.match(/right/)){v=fontsize-0}if(o.match(/above/)){j="start";r=-fontsize/2}if(o.match(/below/)){j="end";r=fontsize/2}}}if(k==90){var r=0;var v=-fontsize/3;if(o!=null){if(o.match(/left/)){v=-fontsize-0}if(o.match(/right/)){v=fontsize/2}if(o.match(/above/)){j="end";r=-fontsize/2}if(o.match(/below/)){j="start";r=fontsize/2}}}if(k==0){var v=0;var r=fontsize/3;if(o!=null){if(o.match(/above/)){r=-fontsize/3}if(o.match(/below/)){r=fontsize-0}if(o.match(/right/)){j="start";v=fontsize/3}if(o.match(/left/)){j="end";v=-fontsize/3}}}var h;if(f!=null){h=doc.getElementById(f)}if(h==null){h=myCreateElementSVG("text");h.setAttribute("id",f);svgpicture.appendChild(h);h.appendChild(doc.createTextNode(s))}h.lastChild.nodeValue=s;h.setAttribute("x",g[0]+v);h.setAttribute("y",height-g[1]+r);if(k!=0){h.setAttribute("transform","rotate("+k+" "+(g[0]+v)+" "+(height-g[1]+r)+")")}h.setAttribute("font-style",(q!=null?q:fontstyle));h.setAttribute("font-family",fontfamily);h.setAttribute("font-size",fontsize);h.setAttribute("font-weight",fontweight);h.setAttribute("text-anchor",j);if(fontstroke!="none"){h.setAttribute("stroke",fontstroke)}if(fontfill!="none"){h.setAttribute("fill",fontfill)}h.setAttribute("stroke-width","0px");if(fontbackground!="none"){var l=myCreateElementSVG("rect");var m=h.getBBox();l.setAttribute("fill",fontbackground);l.setAttribute("stroke-width","0px");l.setAttribute("x",m.x-2);l.setAttribute("y",m.y-2);l.setAttribute("width",m.width+4);l.setAttribute("height",m.height+4);if(k!=0){l.setAttribute("transform","rotate("+k+" "+(g[0]+v)+" "+(height-g[1]+r)+")")}svgpicture.insertBefore(l,h)}return g}function ASdot(h,g,j,l){if(j==null){j=stroke}if(l==null){l=fill}var k=myCreateElementSVG("circle");k.setAttribute("cx",h[0]*xunitlength+origin[0]);k.setAttribute("cy",height-h[1]*yunitlength-origin[1]);k.setAttribute("r",g);k.setAttribute("stroke-width",strokewidth);k.setAttribute("stroke",j);k.setAttribute("fill",l);svgpicture.appendChild(k)}function dot(g,k,h,o,m){var j;var f=g[0]*xunitlength+origin[0];var l=height-g[1]*yunitlength-origin[1];if(m!=null){j=doc.getElementById(m)}if(k=="+"||k=="-"||k=="|"){if(j==null){j=myCreateElementSVG("path");j.setAttribute("id",m);svgpicture.appendChild(j)}if(k=="+"){j.setAttribute("d"," M "+(f-ticklength)+" "+l+" L "+(f+ticklength)+" "+l+" M "+f+" "+(l-ticklength)+" L "+f+" "+(l+ticklength));j.setAttribute("stroke-width",0.5);j.setAttribute("stroke",axesstroke)}else{if(k=="-"){j.setAttribute("d"," M "+(f-ticklength)+" "+l+" L "+(f+ticklength)+" "+l)}else{j.setAttribute("d"," M "+f+" "+(l-ticklength)+" L "+f+" "+(l+ticklength))}j.setAttribute("stroke-width",strokewidth);j.setAttribute("stroke",stroke)}}else{if(j==null){j=myCreateElementSVG("circle");j.setAttribute("id",m);svgpicture.appendChild(j)}j.setAttribute("cx",f);j.setAttribute("cy",l);j.setAttribute("r",dotradius);j.setAttribute("stroke-width",strokewidth);j.setAttribute("stroke",stroke);j.setAttribute("fill",(k=="open"?"white":stroke))}if(h!=null){text(g,h,(o==null?"below":o),(m==null?m:m+"label"))}}function arrowhead(m,l){var f;var h=[m[0]*xunitlength+origin[0],height-m[1]*yunitlength-origin[1]];var g=[l[0]*xunitlength+origin[0],height-l[1]*yunitlength-origin[1]];var j=[g[0]-h[0],g[1]-h[1]];var o=Math.sqrt(j[0]*j[0]+j[1]*j[1]);if(o>1e-8){j=[j[0]/o,j[1]/o];f=[-j[1],j[0]];var k=myCreateElementSVG("path");k.setAttribute("d","M "+(g[0]-15*j[0]-4*f[0])+" "+(g[1]-15*j[1]-4*f[1])+" L "+(g[0]-3*j[0])+" "+(g[1]-3*j[1])+" L "+(g[0]-15*j[0]+4*f[0])+" "+(g[1]-15*j[1]+4*f[1])+" z");k.setAttribute("stroke-width",markerstrokewidth);k.setAttribute("stroke",stroke);k.setAttribute("fill",stroke);svgpicture.appendChild(k)}}function chopZ(g){var f=g.indexOf(".");if(f==-1){return g}for(var h=g.length-1;h>f&&g.charAt(h)=="0";h--){}if(h==f){h--}return g.slice(0,h+1)}function grid(g,f){axes(g,f,null,g,f)}function noaxes(){if(!initialized){initPicture()}}function axes(dx,dy,labels,gdx,gdy,dox,doy){var x,y,ldx,ldy,lx,ly,lxp,lyp,pnode,st;if(!initialized){initPicture()}if(typeof dx=="string"){labels=dx;dx=null}if(typeof dy=="string"){gdx=dy;dy=null}if(xscl!=null){dx=xscl;gdx=xscl;labels=dx}if(yscl!=null){dy=yscl;gdy=yscl}if(xtick!=null){dx=xtick}if(ytick!=null){dy=ytick}if(dox==null){dox=true}if(doy==null){doy=true}if(dox=="off"||dox==0){dox=false}else{dox=true}if(doy=="off"||doy==0){doy=false}else{doy=true}dx=(dx==null?xunitlength:dx*xunitlength);dy=(dy==null?dx:dy*yunitlength);fontsize=Math.floor(Math.min(dx/1.5,dy/1.5,16));ticklength=fontsize/4;if(xgrid!=null){gdx=xgrid}if(ygrid!=null){gdy=ygrid}if(gdx!=null){gdx=(typeof gdx=="string"?dx:gdx*xunitlength);gdy=(gdy==null?dy:gdy*yunitlength);pnode=myCreateElementSVG("path");st="";if(dox&&gdx>0){for(x=origin[0];x<=winxmax;x=x+gdx){if(x>=winxmin){st+=" M"+x+","+winymin+" "+x+","+winymax}}for(x=origin[0]-gdx;x>=winxmin;x=x-gdx){if(x<=winxmax){st+=" M"+x+","+winymin+" "+x+","+winymax}}}if(doy&&gdy>0){for(y=height-origin[1];y<=winymax;y=y+gdy){if(y>=winymin){st+=" M"+winxmin+","+y+" "+winxmax+","+y}}for(y=height-origin[1]-gdy;y>=winymin;y=y-gdy){if(y<=winymax){st+=" M"+winxmin+","+y+" "+winxmax+","+y}}}pnode.setAttribute("d",st);pnode.setAttribute("stroke-width",0.5);pnode.setAttribute("stroke",gridstroke);pnode.setAttribute("fill",fill);svgpicture.appendChild(pnode)}pnode=myCreateElementSVG("path");if(dox){st="M"+winxmin+","+(height-origin[1])+" "+winxmax+","+(height-origin[1])}if(doy){st+=" M"+origin[0]+","+winymin+" "+origin[0]+","+winymax}if(dox){for(x=origin[0];x<winxmax;x=x+dx){if(x>=winymin){st+=" M"+x+","+(height-origin[1]+ticklength)+" "+x+","+(height-origin[1]-ticklength)}}for(x=origin[0]-dx;x>winxmin;x=x-dx){if(x<=winxmax){st+=" M"+x+","+(height-origin[1]+ticklength)+" "+x+","+(height-origin[1]-ticklength)}}}if(doy){for(y=height-origin[1];y<winymax;y=y+dy){if(y>=winymin){st+=" M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y}}for(y=height-origin[1]-dy;y>winymin;y=y-dy){if(y<=winymax){st+=" M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y}}}if(labels!=null){with(Math){ldx=dx/xunitlength;ldy=dy/yunitlength;lx=(xmin>0||xmax<0?xmin:0);ly=(ymin>0||ymax<0?ymin:0);lxp=(ly==0?"below":"above");lyp=(lx==0?"left":"right");var ddx=floor(1.1-log(ldx)/log(10))+1;var ddy=floor(1.1-log(ldy)/log(10))+1;if(ddy<0){ddy=0}if(ddx<0){ddx=0}if(dox){for(x=(doy?ldx:0);x<=xmax;x=x+ldx){if(x>=xmin){text([x,ly],chopZ(x.toFixed(ddx)),lxp)}}for(x=-ldx;xmin<=x;x=x-ldx){if(x<=xmax){text([x,ly],chopZ(x.toFixed(ddx)),lxp)}}}if(doy){for(y=(dox?ldy:0);y<=ymax;y=y+ldy){if(y>=ymin){text([lx,y],chopZ(y.toFixed(ddy)),lyp)}}for(y=-ldy;ymin<=y;y=y-ldy){if(y<=ymax){text([lx,y],chopZ(y.toFixed(ddy)),lyp)}}}}}pnode.setAttribute("d",st);pnode.setAttribute("stroke-width",0.5);pnode.setAttribute("stroke",axesstroke);pnode.setAttribute("fill",fill);svgpicture.appendChild(pnode)}function safepow(h,g){if(h<0&&Math.floor(g)!=g){for(var f=3;f<50;f+=2){if(Math.abs(Math.round(f*g)-(f*g))<0.000001){if(Math.round(f*g)%2==0){return Math.pow(Math.abs(h),g)}else{return -1*Math.pow(Math.abs(h),g)}}}return sqrt(-1)}else{return Math.pow(h,g)}}function nthroot(g,f){return safepow(f,1/g)}function nthlogten(g,f){return((Math.log(f))/(Math.log(g)))}function matchtolower(f){return f.toLowerCase()}function mathjs(h,q){h=h.replace("[","(");h=h.replace("]",")");h=h.replace(/arc(sin|cos|tan)/g,"a#r#c $1");if(q!=null){var o=new RegExp("(sqrt|ln|log|sin|cos|tan|sec|csc|cot|abs|root)[(]","g");h=h.replace(o,"$1#(");var o=new RegExp("("+q+")("+q+")$","g");h=h.replace(o,"($1)($2)");var o=new RegExp("("+q+")(a#|sqrt|ln|log|sin|cos|tan|sec|csc|cot|abs|root)","g");h=h.replace(o,"($1)$2");var o=new RegExp("("+q+")("+q+")([^a-df-zA-Z(#])","g");h=h.replace(o,"($1)($2)$3");var o=new RegExp("([^a-df-zA-Z#])("+q+")([^a-df-zA-Z#])","g");h=h.replace(o,"$1($2)$3");var o=new RegExp("^("+q+")([^a-df-zA-Z])","g");h=h.replace(o,"($1)$2");var o=new RegExp("([^a-df-zA-Z])("+q+")$","g");h=h.replace(o,"$1($2)")}h=h.replace(/#/g,"");h=h.replace(/a#r#c\s+(sin|cos|tan)/g,"arc$1");h=h.replace(/\s/g,"");h=h.replace(/(Sin|Cos|Tan|Sec|Csc|Cot|Arc|Abs|Log|Ln|Sqrt)/g,matchtolower);h=h.replace(/log_(\d+)\(/,"nthlog($1,");h=h.replace(/log/g,"logten");if(h.indexOf("^-1")!=-1){h=h.replace(/sin\^-1/g,"arcsin");h=h.replace(/cos\^-1/g,"arccos");h=h.replace(/tan\^-1/g,"arctan");h=h.replace(/sec\^-1/g,"arcsec");h=h.replace(/csc\^-1/g,"arccsc");h=h.replace(/cot\^-1/g,"arccot");h=h.replace(/sinh\^-1/g,"arcsinh");h=h.replace(/cosh\^-1/g,"arccosh");h=h.replace(/tanh\^-1/g,"arctanh");h=h.replace(/sech\^-1/g,"arcsech");h=h.replace(/csch\^-1/g,"arccsch");h=h.replace(/coth\^-1/g,"arccoth")}h=h.replace(/root\((\d+)\)\(/,"nthroot($1,");h=h.replace(/([0-9])E([\-0-9])/g,"$1(EE)$2");h=h.replace(/^e$/g,"(E)");h=h.replace(/pi/g,"(pi)");h=h.replace(/^e([^a-zA-Z])/g,"(E)$1");h=h.replace(/([^a-zA-Z])e$/g,"$1(E)");h=h.replace(/([^a-zA-Z])e([^a-zA-Z])/g,"$1(E)$2");h=h.replace(/([0-9])([\(a-zA-Z])/g,"$1*$2");h=h.replace(/(!)([0-9\(])/g,"$1*$2");h=h.replace(/([0-9])\*\(EE\)([\-0-9])/,"$1e$2");h=h.replace(/\)([\(0-9a-zA-Z])/g,")*$1");var l,g,f,m,r;while((l=h.indexOf("^"))!=-1){if(l==0){return"Error: missing argument"}g=l-1;m=h.charAt(g);if(m>="0"&&m<="9"){g--;while(g>=0&&(m=h.charAt(g))>="0"&&m<="9"){g--}if(m=="."){g--;while(g>=0&&(m=h.charAt(g))>="0"&&m<="9"){g--}}}else{if(m==")"){r=1;g--;while(g>=0&&r>0){m=h.charAt(g);if(m=="("){r--}else{if(m==")"){r++}}g--}while(g>=0&&(m=h.charAt(g))>="a"&&m<="z"||m>="A"&&m<="Z"){g--}}else{if(m>="a"&&m<="z"||m>="A"&&m<="Z"){g--;while(g>=0&&(m=h.charAt(g))>="a"&&m<="z"||m>="A"&&m<="Z"){g--}}else{return"Error: incorrect syntax in "+h+" at position "+g}}}if(l==h.length-1){return"Error: missing argument"}f=l+1;m=h.charAt(f);nch=h.charAt(f+1);if(m>="0"&&m<="9"||(m=="-"&&nch!="(")||m=="."){f++;while(f<h.length&&(m=h.charAt(f))>="0"&&m<="9"){f++}if(m=="."){f++;while(f<h.length&&(m=h.charAt(f))>="0"&&m<="9"){f++}}}else{if(m=="("||(m=="-"&&nch=="(")){if(m=="-"){f++}r=1;f++;while(f<h.length&&r>0){m=h.charAt(f);if(m=="("){r++}else{if(m==")"){r--}}f++}}else{if(m>="a"&&m<="z"||m>="A"&&m<="Z"){f++;while(f<h.length&&(m=h.charAt(f))>="a"&&m<="z"||m>="A"&&m<="Z"){f++}if(m=="("&&h.slice(l+1,f).match(/^(sin|cos|tan|sec|csc|cot|logten|log|ln|exp|arcsin|arccos|arctan|arcsec|arccsc|arccot|sinh|cosh|tanh|sech|csch|coth|arcsinh|arccosh|arctanh|arcsech|arccsch|arccoth|sqrt|abs|nthroot)$/)){r=1;f++;while(f<h.length&&r>0){m=h.charAt(f);if(m=="("){r++}else{if(m==")"){r--}}f++}}}else{return"Error: incorrect syntax in "+h+" at position "+f}}}h=h.slice(0,g+1)+"safepow("+h.slice(g+1,l)+","+h.slice(l+1,f)+")"+h.slice(f)}while((l=h.indexOf("!"))!=-1){if(l==0){return"Error: missing argument"}g=l-1;m=h.charAt(g);if(m>="0"&&m<="9"){g--;while(g>=0&&(m=h.charAt(g))>="0"&&m<="9"){g--}if(m=="."){g--;while(g>=0&&(m=h.charAt(g))>="0"&&m<="9"){g--}}}else{if(m==")"){r=1;g--;while(g>=0&&r>0){m=h.charAt(g);if(m=="("){r--}else{if(m==")"){r++}}g--}while(g>=0&&(m=h.charAt(g))>="a"&&m<="z"||m>="A"&&m<="Z"){g--}}else{if(m>="a"&&m<="z"||m>="A"&&m<="Z"){g--;while(g>=0&&(m=h.charAt(g))>="a"&&m<="z"||m>="A"&&m<="Z"){g--}}else{return"Error: incorrect syntax in "+h+" at position "+g}}}h=h.slice(0,g+1)+"factorial("+h.slice(g+1,l)+")"+h.slice(l+1)}return h}function slopefield(fun,dx,dy){var g=fun;if(typeof fun=="string"){eval("g = function(x,y){ with(Math) return "+mathjs(fun)+" }")}var gxy,x,y,u,v,dz;if(dx==null){dx=1}if(dy==null){dy=1}dz=Math.sqrt(dx*dx+dy*dy)/6;var x_min=Math.ceil(xmin/dx);var y_min=Math.ceil(ymin/dy);for(x=x_min;x<=xmax;x+=dx){for(y=y_min;y<=ymax;y+=dy){gxy=g(x,y);if(!isNaN(gxy)){if(Math.abs(gxy)=="Infinity"){u=0;v=dz}else{u=dz/Math.sqrt(1+gxy*gxy);v=gxy*u}line([x-u,y-v],[x+u,y+v])}}}}function drawPictures(){drawPics()}function parseShortScript(sscript,gw,gh){if(sscript==null){initialized=false;sscript=picture.sscr}var sa=sscript.split(",");if(gw&&gh){sa[9]=gw;sa[10]=gh;sscript=sa.join(",");picture.setAttribute("sscr",sscript)}picture.setAttribute("width",sa[9]);picture.setAttribute("height",sa[10]);picture.style.width=sa[9]+"px";picture.style.height=sa[10]+"px";if(sa.length>10){commands="setBorder(5);";commands+="width="+sa[9]+"; height="+sa[10]+";";commands+="initPicture("+sa[0]+","+sa[1]+","+sa[2]+","+sa[3]+");";commands+="axes("+sa[4]+","+sa[5]+","+sa[6]+","+sa[7]+","+sa[8]+");";var inx=11;var eqnlist="Graphs: ";while(sa.length>inx+9){commands+='stroke="'+sa[inx+7]+'";';commands+='strokewidth="'+sa[inx+8]+'";';if(sa[inx+9]!=""){commands+='strokedasharray="'+sa[inx+9].replace(/\s+/g,",")+'";'}if(sa[inx]=="slope"){eqnlist+="dy/dx="+sa[inx+1]+"; ";commands+='slopefield("'+sa[inx+1]+'",'+sa[inx+2]+","+sa[inx+2]+");"}else{if(sa[inx]=="label"){eqnlist+="label="+sa[inx+1]+"; ";commands+="text(["+sa[inx+5]+","+sa[inx+6]+'],"'+sa[inx+1]+'");'}else{if(sa[inx]=="func"){eqnlist+="y="+sa[inx+1]+"; ";eqn='"'+sa[inx+1]+'"'}else{if(sa[inx]=="polar"){eqnlist+="r="+sa[inx+1]+"; ";eqn='["cos(t)*('+sa[inx+1]+')","sin(t)*('+sa[inx+1]+')"]'}else{if(sa[inx]=="param"){eqnlist+="[x,y]=["+sa[inx+1]+","+sa[inx+2]+"]; ";eqn='["'+sa[inx+1]+'","'+sa[inx+2]+'"]'}}}if(typeof eval(sa[inx+5])=="number"){commands+="plot("+eqn+","+sa[inx+5]+","+sa[inx+6]+",null,null,"+sa[inx+3]+","+sa[inx+4]+");"}else{commands+="plot("+eqn+",null,null,null,null,"+sa[inx+3]+","+sa[inx+4]+");"}}}inx+=10}try{eval(commands)}catch(e){setTimeout(function(){parseShortScript(sscript,gw,gh)},100)}picture.setAttribute("alt",eqnlist);return commands}}function drawPics(){var index,nd;pictures=document.getElementsByTagName("embed");if(!ASnoSVG){try{for(var i=0;i<pictures.length;i++){if(pictures[i].getAttribute("sscr")!=""||pictures[i].getAttribute("script")!=""){if(pictures[i].getSVGDocument().getElementById("root")==null){setTimeout(drawPics,100);return}}}}catch(e){setTimeout(drawPics,100);return}}var len=pictures.length;for(index=0;index<len;index++){picture=((!ASnoSVG&&isIE)?pictures[index]:pictures[0]);if(!ASnoSVG){initialized=false;var sscr=picture.getAttribute("sscr");if((sscr!=null)&&(sscr!="")){try{parseShortScript(sscr)}catch(e){}}else{src=picture.getAttribute("script");if((src!=null)&&(src!="")){try{with(Math){eval(src)}}catch(err){alert(err+"\n"+src)}}}}else{if(picture.getAttribute("sscr")!=""){n=document.createElement("img");n.setAttribute("style",picture.getAttribute("style"));n.setAttribute("src",AScgiloc+"?sscr="+encodeURIComponent(picture.getAttribute("sscr")));pn=picture.parentNode;pn.replaceChild(n,picture)}}}}function plot(fun,x_min,x_max,points,id,min_type,max_type){var pth=[];var f=function(x){return x},g=fun;var name=null;if(typeof fun=="string"){eval("g = function(x){ with(Math) return "+mathjs(fun)+" }")}else{if(typeof fun=="object"){eval("f = function(t){ with(Math) return "+mathjs(fun[0])+" }");eval("g = function(t){ with(Math) return "+mathjs(fun[1])+" }")}}if(typeof x_min=="string"){name=x_min;x_min=xmin}else{name=id}var min=(x_min==null?xmin:x_min);var max=(x_max==null?xmax:x_max);if(max<=min){return null}var inc=max-min-0.000001*(max-min);inc=(points==null?inc/200:inc/points);var gt;for(var t=min;t<=max;t+=inc){gt=g(t);if(!(isNaN(gt)||Math.abs(gt)=="Infinity")){pth[pth.length]=[f(t),gt]}}path(pth,name);if(min_type==1){arrowhead(pth[1],pth[0])}else{if(min_type==2){dot(pth[0],"open")}else{if(min_type==3){dot(pth[0],"closed")}}}if(max_type==1){arrowhead(pth[pth.length-2],pth[pth.length-1])}else{if(max_type==2){dot(pth[pth.length-1],"open")}else{if(max_type==3){dot(pth[pth.length-1],"closed")}}}return p}function updateCoords(g){switchTo("picture"+(g+1));var h=getX(),f=getY();if((xmax-h)*xunitlength>6*fontsize||(f-ymin)*yunitlength>2*fontsize){text([xmax,ymin],"("+h.toFixed(2)+", "+f.toFixed(2)+")","aboveleft","AScoord"+g,"")}else{text([xmax,ymin]," ","aboveleft","AScoord"+g,"")}}function updateCoords0(){updateCoords(0)}function updateCoords1(){updateCoords(1)}function updateCoords2(){updateCoords(2)}function updateCoords3(){updateCoords(3)}function updateCoords4(){updateCoords(4)}function updateCoords5(){updateCoords(5)}function updateCoords6(){updateCoords(6)}function updateCoords7(){updateCoords(7)}function updateCoords8(){updateCoords(8)}function updateCoords9(){updateCoords(9)}ASfn=[function(){updatePicture(0)},function(){updatePicture(1)},function(){updatePicture(2)},function(){updatePicture(3)},function(){updatePicture(4)},function(){updatePicture(5)},function(){updatePicture(6)},function(){updatePicture(7)},function(){updatePicture(8)},function(){updatePicture(9)}];ASupdateCoords=[function(){updateCoords(0)},function(){updateCoords(1)},function(){updateCoords(2)},function(){updateCoords(3)},function(){updateCoords(4)},function(){updateCoords(5)},function(){updateCoords(6)},function(){updateCoords(7)},function(){updateCoords(8)},function(){updateCoords(9)}];function generic(){drawPictures()}if(typeof window.addEventListener!="undefined"){window.addEventListener("load",generic,false)}else{if(typeof document.addEventListener!="undefined"){document.addEventListener("load",generic,false)}else{if(typeof window.attachEvent!="undefined"){window.attachEvent("onload",generic)}else{if(typeof window.onload=="function"){var existing=onload;window.onload=function(){existing();generic()}}else{window.onload=generic}}}}if(checkIfSVGavailable){checkifSVGavailable=false;nd=isSVGavailable();ASnoSVG=nd!=null};