(function() {
  window.cdr = {
      state: {
         setup:0,
         words:{},
      },
      players: [
         {
            words:{},
				placement:{},
            board:{} 
         },
         {
            words:{},
				placement:{},
            board:{}
         }
      ],
      boards: {
         p1: {},
         p2: {}
      },
      init: function() {
         cdr.container = $$("container");
         cdr.enemy = $$("enemy");
         cdr.ally = $$("ally");
         cdr.container.appendChild(cdr.genAlphabet());
         cdr.ally.appendChild(cdr.genTable(10, 10, 'p1'));
         cdr.enemy.appendChild(cdr.genTable(10, 10, 'p2'));

         var winputs = document.querySelectorAll("input.letter");
         for (var i=0; i<winputs.length; i++) {
            winputs[i].addEventListener("change", cdr.updateWords);
            //winputs[i].addEventListener("focus", cdr.clearThisValue );
            winputs[i].addEventListener("keypress", cdr.setupKeypress );
            winputs[i].addEventListener("focus", cdr.focus );
            winputs[i].addEventListener("click", cdr.focus );
         }
         for (var i=2; i<7; i++) {
            $$(`my${i}l`).addEventListener("mousedown", cdr.dragstart);
         }
         $$("p1").addEventListener("mouseover", cdr.mouseover);
         cdr.state.blipping = 1;
         cdr.randomBlips("p2");
         cdr.setupBot();
      },
		focus: function(event) {
			this.setSelectionRange(0, this.value.length);
		},
      dragstart: function(event) {
			if (!cdr.state.haveWords) return true;
         var dir = "horizontal"; //document.querySelector('input[name="orientation"]:checked').value;
			var tgt = event.target;
			var wl = 0;
			if (m = tgt.id.match(/my(\d)l/)) {
				wl = m[1];
			}
			var content = cdr.players[0].words[wl];
			cdr.state.dragword = content;
			console.log("Dragging word: "+content);

			if (dir == "vertical") {
				content = content.split("").join("<br>");
				cdr.state.dragdir = "vertical";
			} else {
				cdr.state.dragdir = "horizontal";
			}
         cdr.state.dragging = cdr.el("div", '', 'word', content);
         document.body.appendChild(cdr.state.dragging);
         document.addEventListener("mousemove", cdr.drag);
         document.addEventListener("mouseup", cdr.dragend);
         cdr.state.dragging.style.position = "absolute";
         cdr.state.dragging.style.top = event.clientY + 'px';
         cdr.state.dragging.style.left = event.clientX + 'px';
         cdr.state.dragging.style.zIndex = 9999;
         event.preventDefault();
         return false;
      },
      drag: function(event) {
         if (!cdr.state.dragging) return false;
         cdr.state.dragging.style.top = event.clientY + 'px';
         cdr.state.dragging.style.left = event.clientX + 'px';
         event.preventDefault();
         return false;
      },
      dragend: function(event) {
         if (!cdr.state.dragging) return false;
			cdr.clearTableColors("p1");
			if (!event.target.id.match(/^p\d/)) {
				cdr.state.dragging.parentNode.removeChild(cdr.state.dragging);
				cdr.state.dragging = undefined;
				return true;
			}
         var word = cdr.state.dragword;
         var letters = word.split('');
         var papa = $$(`my${letters.length}l`);
         papa.style.backgroundColor = "#0d0";
			
         var tgt = event.target, matches;
         var dir = cdr.state.dragdir; // document.querySelector('input[name="orientation"]:checked').value;
         document.removeEventListener("mousemove", cdr.drag);

         if (matches = tgt.id.match(/p1([A-J])([0-9]+)/)) {
				var cell = matches[1] + matches[2];
				cdr.players[0].placement[cdr.state.dragword] = cell;
				var col = (dir=="vertical") ? parseInt(matches[2]) : matches[1].charCodeAt(0) - 65;
				var pos = 0;
				for (var i=col; i<col + word.length; i++) {
					var el = cdr.el('span', '', 'letter', letters[pos]);
					var id = (dir=="vertical") ? "p1" + matches[1] + i : "p1" + String.fromCharCode(i + 65) + matches[2];
					var d = (dir=="vertical") ? "vert" : "horiz";
					if (pos == 0) {
						$$(id).classList.add(d + 'ShipFore');
					} else if (pos == word.length-1) {
						$$(id).classList.add(d + 'ShipAft');
					} else {
						$$(id).classList.add(d + 'ShipMid');
					}
					$$(id).appendChild(el);
					cdr.showLetter(el, pos * 100);
					pos++;
				}
         }
         cdr.state.dragging.parentNode.removeChild(cdr.state.dragging);
         cdr.state.dragging = undefined;
			cdr.state.dragword = undefined;
			cdr.state.dragdir = undefined;
         cdr.clearTableColors("p1");
			if (cdr.checkPlacements(0)) {
				$$("start").disabled = false;
			}
      },
      mouseover: function(event) {
         if (!cdr.state.dragging) return;
         if (!event.target.id.match(/p[12][A-J][0-9]+/)) return;
         var tgt = event.target, matches;
         var wl = cdr.state.dragging.innerHTML.replace(/<br>/g, '').length;
         var dir = cdr.state.dragdir;

			if (cdr.state.lastOver) {
				console.log("Checking if we should change direction");
				var l = cdr.state.lastOver.match(/p[12]([A-J])([0-9]+)/);
				var n = tgt.id.match(/p[12]([A-J])([0-9]+)/);
				
				if (l) l[2] = parseInt(l[2]);
				if (n) n[2] = parseInt(n[2]);

				if (cdr.state.dragdir!="vertical" && (n && l && (n[1] == l[1]) && ((n[2] == l[2]-1) || (n[2] == l[2]+1)))) {
					console.log("Going vertical");
					dir = "vertical";
					cdr.state.dragdir = "vertical";
					cdr.state.dragging.innerHTML = cdr.state.dragging.innerHTML.replace(/<br>/g, '').replace(/(\w)/g, '$1<br>');
				} else if (cdr.state.dragdir!="horizontal" && (n && l && (n[2] == l[2]) && ((n[1].charCodeAt(0)-65 == l[1].charCodeAt(0)-65 - 1) || (n[1].charCodeAt(0)-65 == l[1].charCodeAt(0)-65 + 1)))) {
					dir = "horizontal";
					cdr.state.dragdir = "horizontal";
					cdr.state.dragging.innerHTML = cdr.state.dragging.innerHTML.replace(/<br>/g, '');
					console.log("Going horizontal");
				}
			}

         if (matches = tgt.id.match(/(p[12])([A-J])([0-9]+)/)) { 
            if (dir == "vertical") {
               var pos = matches[3];
               if ((10 - pos) < wl)  {
                  for (var i=pos; i < 10; i++) {
                     $$(matches[1]+matches[2]+i).style.backgroundColor = "#c00";
                  }

               } else if (!cdr.placementOK(cdr.state.dragword, tgt.id, true)) {
                  for (var i=pos; i < parseInt(pos) + wl; i++) {
                     var el = $$(matches[1]+matches[2]+i);
                     if (el) el.style.backgroundColor = "#c00";
                  }

					} else {
                  for (var i=pos; i < parseInt(pos) + wl; i++) {
                     var el = $$(matches[1]+matches[2]+i);
                     if (el) el.style.backgroundColor = "#0c0";
                  }
               }
                
            } else {
               var pos = matches[2].charCodeAt(0) - 65;

               if ((10 - pos) < wl) {
                  for (var i=pos; i < 10; i++) {
                     $$(matches[1]+String.fromCharCode(i+65)+matches[3]).style.backgroundColor = "#c00";
                  }

               } else if (!cdr.placementOK(cdr.state.dragword, tgt.id, false)) {
                  for (var i=pos; i < parseInt(pos) + wl; i++) {
                     var el = $$(matches[1]+String.fromCharCode(i+65)+matches[3]);
                     if (el) el.style.backgroundColor = "#c00";
                  }
					} else {
                  for (var i=pos; i < pos + wl; i++) {
                     $$(matches[1]+String.fromCharCode(i+65)+matches[3]).style.backgroundColor = "#0c0";
                  }
               }
            }
				cdr.state.lastOver = tgt.id;
         }
      },
      mouseout: function(event) {
         cdr.clearTableColors('p1');
      },
      clearTable: function(who) {
         for (var r=0; r<10; r++) {
            for (var c=0; c<10; c++) {
               var el = $$(who + String.fromCharCode(c+65) + r);
               el.innerHTML = "";
            }
         }
      },
      clearTableColors: function(who) {
         for (var r=0; r<10; r++) {
            for (var c=0; c<10; c++) {
               var el = $$(who + String.fromCharCode(c+65) + r);
               el.style.backgroundColor = "";
            }
         }
      },
      setupNext: function() {
         if (cdr.state.setup==0) {
            cdr.state.setup = 1;
            $$("wizard").style.display = "none";
            $$("wizard2").style.display = "inline-block";
            $$('pickRandom').style.display = "none";
            $$('placeRandom').style.display = "inline-block";
            $$('navBack').style.display = "inline-block";
         } else if (cdr.state.setup == 1) {
            $$("newgame").style.display = "none";
            cdr.state.setup = 0;
         }
      },
      setupPrev: function() {
         if (cdr.state.setup==1) {
            cdr.state.setup = 0;
            $$("wizard").style.display = "inline-block";
            $$("wizard2").style.display = "none";
            $$('pickRandom').style.display = "inline-block";
            $$('placeRandom').style.display = "none";
            $$('navBack').style.display = "none";
         }
      },
      clearThisValue: function(event) {
         this.value = "";
      },
      setupKeypress: function(event) {
         var key = event.key.toUpperCase();
         if (key.match(/[A-Z]/)) {
            var tgt = event.target;
            // setTimeout(function() { tgt.value = key; }, 100);

            var matches = event.target.id.match(/w(\d)l(\d)/), next;
            if (matches[1]) {
               if (matches[2]<matches[1]) {
                  next = "w"+matches[1]+"l"+(parseInt(matches[2])+1);
               } else if (matches[1] < 6) {
                  next = "w" + (parseInt(matches[1]) + 1) + "l1";
               } else {
                  next = "w2l1";
               }
            }
            if (next) {
               $$(next).focus();
            }
         } else {
            return true;
         }
      },
      setupBot: function() {
         cdr.clearTable("p2");
         var botwords = cdr.randomWords();
         var unplaced = [];

         cdr.players[1].words = [];
         pause = 0;
         for (var i=0; i<5; i++) {
				cdr.players[1].words[botwords[i].length] = botwords[i];
            var placed = cdr.placeWord(botwords[i], "p2", pause, false);
            if (!placed) {
               unplaced.push(botwords[i]);
            } else {
               pause += botwords[i].length;
            }
         }
         var cnt = 0;
         while (botword = unplaced.shift()) {
            var placed = cdr.placeWord(botword, "p2", pause, false);
            if (!placed) {
               unplaced.push(botword);
            } else {
               pause += botword.length;
            }
            ++cnt;
            if (cnt > 100) {
               unplaced = [];
            }
         }
         setTimeout(function() { cdr.state.blipping = 0; }, 5000);
      },
      placeWords: function(who, words=cdr.players[0].words) {
         $$("newgame").style.transform = "scale(0)";
         setTimeout(function() { $$("newgame").style.display = "none"; $$("newgame").style.transform = "scale(1)"; }, 1500);
         var tcnt = 0;
         for (var i in words) {
				if (words.hasOwnProperty(i)) {
					var success = 0, cnt = 0;
					do {
						success = cdr.placeWord(words[i], who, tcnt);
						++cnt;
					} while (!success && cnt<100);
					tcnt += words[i].length;
				}
         }
			if (cdr.checkPlacements(0)) {
				$$("start").disabled = false;
			}
      },
      randomBlips: function(who) {
         var r = cdr.rand(9);
         var c = String.fromCharCode(cdr.rand(9)+65);
			var v = cdr.rand(4,1);
         $$(who+c+r).classList.add('blip'+v);
         setTimeout(function() { $$(who+c+r).classList.remove('blip'+v); }, cdr.rand(1000));
         if (cdr.state.blipping) {
            setTimeout(function() { cdr.randomBlips(who); }, cdr.rand(10));
         }
      },
		checkPlacements: function(player=0) {
			var ok = false;

			if (Object.keys(cdr.players[player].placement).length >= 5) {
				ok = true;
			}
			return ok;
		},
		placementOK: function(word, cell, vert=false) {
			var ok = 1,
			    m = cell.match(/p[12]([A-J])([\d]+)/),
				 col = m[1].charCodeAt(0) - 65;
			m[2] = parseInt(m[2]);
		  
			for (var i=col; i<col + word.length; i++) {
				id = (vert) ? String.fromCharCode(65 + i) + m[2] : m[1] + i;
				if (cdr.players[0].board[id]) {
					return false;
				}
			}
			return true;
		},
      placeWord: function(word, board, pause=0, show=true) {
         var v = (Math.random()>.5) ? true : false,
             s = cdr.rand(9),
             l = word.length,
             p = cdr.rand(9 - l), id,
             letters = word.split(''),
             tcnt = pause,
             player = (board=="p2") ? 1 : 0,
				 dir = (v) ? "vert" : "horiz";
            
			var cnt = 0, ok = 1, id, col, tp = (p > 0) ? p - 1 : p;
			for (var i=tp; i<p+word.length; i++) {
				id = (v) ? String.fromCharCode(65 + s) + i : String.fromCharCode(65 + i) + s;
				if (cdr.players[player].board[id]) {
					ok = 0;
					return;
				}
			}
			if (ok) {
				id = (v) ? String.fromCharCode(65 + s) + p : String.fromCharCode(65 + p) + s;
				cdr.players[player].placement[word] = id;
				for (var i=p; i<p+word.length; i++) {
					var el = cdr.el("span", '', 'letter', letters[cnt]);
					var addclass = "";
					if (i==p) {
						addclass = dir + 'ShipFore';
					} else if (i==(p+word.length-1)) {
						addclass = dir + 'ShipAft';
					} else {
						addclass = dir + 'ShipMid';
					}

					id = (v) ? String.fromCharCode(65 + s) + i : String.fromCharCode(65+i) + s;
					$$(board + id).appendChild(el);
					if (show) $$(board + id).classList.add(addclass);

					cdr.players[player].board[id] = letters[cnt];
					if (show) cdr.showLetter(el, 100*tcnt);
					cnt++;
					tcnt++;
				}
			}

         return true;
      },
      showLetter: function(who, delay) {
         setTimeout(function() { 
           who.style.transform = "scale(1)"; 
         }, delay);
      },
      updateWords: function(event) {
         var tgt = event.target;
         var matches = tgt.id.match(/w(\d)/);
         var m = matches[1];

         if (m) {
            var word = "";
            for (var i=1; i<m+1; i++) {
               var el = $$("w"+m+"l"+i);
               if (el) {
                  word += el.value.toUpperCase();
						el.value = el.value.toUpperCase();
               } else {
                  word += "";
               }
            }
            if ((m == word.length) && cdr.checkWord(word)) {
               // $$('my'+m+'l').innerHTML = word;
               $$('w'+m+'chk').classList.remove('notok');
               $$('w'+m+'chk').classList.add('ok');
               cdr.players[0].words[m] = word;
               if (cdr.checkWords()) {
                  $$("navNext").removeAttribute("disabled");
               }
            } else {
               $$('w'+m+'chk').classList.add('notok');
               $$('w'+m+'chk').classList.remove('ok');
            }
         }
      },
      checkWords: function() {
         for (var i=2; i<7; i++) {
            if (!cdr.players[0].words[i] || cdr.players[0].words[i].length!=i) {
               return false;
            }
         }
			cdr.state.haveWords = true;
         return true;
      },
      checkWord: function(word) {
         var mydict = dictionary;
         var letters = word.split("");

         for (var i=0; i<letters.length; i++) {
            var l = letters[i].toUpperCase();
            if (mydict[l]) {
               mydict = mydict[l];
            } else {
               return false;
            }
         }
         if (mydict['$']) {
            return true;
         }
      },
      randomWords: function() {
         var words = [], word;
         for (var i=2; i<7; i++) {
            word = cdr.pickWord(i);
            words.push(word);
         }
         return words;
      },
      pickRandomWords: function() {
         cdr.players[0].words = [];
         for (var i=2; i<7; i++) {
            var word = cdr.pickWord(i);
            cdr.players[0].words[i] = word;
            var letters = word.split('');
            for (var l=0; l<word.length; l++) {
               var el = $$(`w${i}l${l+1}`);
               el.value = letters[l];
               
               if ("createEvent" in document) {
                  var evt = document.createEvent("HTMLEvents");
                  evt.initEvent("change", false, true);
                  el.dispatchEvent(evt);
               } else {
                  el.fireEvent("onchange");
               }
            }
         }
      },
      pickWord: function(len) {
         return dictByLength[len][cdr.rand(dictByLength[len].length)];
      },
      rand: function(len, start=0) {
         return Math.round(Math.random()*len)+start;
      },
      el: function(tag, id, classname, content) {
         var el = document.createElement(tag);
         if (id) el.id = id;
         if (classname) el.className = classname;
         if (content) el.innerHTML = content;
         return el;
      },
      genAlphabet: function() {
         var out = cdr.el("div", "alphabet");
         for (var i=0; i<26; i++) {
            out.appendChild(cdr.el("span", String.fromCharCode(65 + i), "alphabet", String.fromCharCode(65 + i)));
         }
         return out;
      },
      genTable: function(rows, cols, prefix) {
         var rs = cdr.rand(4, 1);
         var out = cdr.el('table', prefix, 'board unset s' + rs);
         out.addEventListener("mousedown", cdr.handleClick);
         var tr = cdr.el("tr");
         tr.appendChild(cdr.el('th', '', 'top left'));

         for (var h=0; h<cols; h++) {
            tr.appendChild(cdr.el('th', '', 'top', String.fromCharCode(65 + h)));
         }
         out.appendChild(tr);
         for (var r=0; r<rows; r++) {
            tr = cdr.el('tr');
            tr.appendChild(cdr.el('th', '', 'left', r + 1));
            for (var c=0; c<rows; c++) {
               var td = cdr.el('td', prefix + String.fromCharCode(c + 65) + r, 'cell');
               td.addEventListener("mouseout", cdr.mouseout);
               tr.appendChild(td);
            }
            out.appendChild(tr);
         }
         return out;
      },
      handleClick: function(event) {
         var tgt = event.target;

         if (tgt.id.match(/p1([A-J])([0-9]+)/)) {

            var txtbox = "<input type='text' id='input' size='1' onchange='return cdr.updateLayout(this.parentNode.id, this.value)' />";
            tgt.innerHTML = txtbox;
            setTimeout(function() { 
               var txtin = $$("input");
               txtin.focus();
            }, 100);
         }
      },
      updateLayout: function(who, what) {
         $$("input").parentNode.removeChild($$("input"));
         $$(who).appendChild(cdr.el('span', '', '', what));
         
      }
  };
  cdr.init();
})();
function $$(id) {
   return document.getElementById(id);  
}

