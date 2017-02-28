(function() {
  window.cdr = {
      state: {
         setup:0,
         words:{},
      },
      players: [
         {
            words:{},
            board:{} 
         },
         {
            words:{},
            board:{}
         }
      ],
      boards: {
         p1: {},
         p2: {}
      },
      init: function() {
         cdr.container = $$("container");
         cdr.container.appendChild(cdr.genAlphabet());
         cdr.container.appendChild(cdr.genTable(10, 10, 'p1'));
         cdr.container.appendChild(cdr.genTable(10, 10, 'p2'));

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
         cdr.state.dragging = cdr.el("div", '', 'word', event.target.innerHTML);
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
         var word = cdr.state.dragging.innerHTML;
         var letters = word.split('');
         var papa = $$(`my${letters.length}l`);
         papa.style.backgroundColor = "#0d0";

         var tgt = event.target, matches;
         var dir = document.querySelector('input[name="orientation"]:checked').value;
         document.removeEventListener("mousemove", cdr.drag);

         if (matches = tgt.id.match(/p1([A-J])([0-9]+)/)) {
            if (dir=="vertical") {
               var pos = 0;
               for (var i=matches[2]; i<parseInt(matches[2]) + word.length; i++) {
                  var el = cdr.el('span', '', 'letter', letters[pos]);
                  $$("p1"+matches[1]+i).appendChild(el);
                  cdr.showLetter(el, pos*100);
                  pos++;
               }
            } else {
               var col = matches[1].charCodeAt(0) - 65;
               var pos = 0;
               for (var i = col; i < col + word.length; i++) {
                  $$("p1" + String.fromCharCode(i+65) + matches[2]).innerHTML = "<span>" + letters[pos] + "</span>";
                  pos++;
               }
            }
         }
         cdr.state.dragging.parentNode.removeChild(cdr.state.dragging);
         cdr.state.dragging = undefined;
         cdr.clearTableColors();
      },
      mouseover: function(event) {
         if (!cdr.state.dragging) return;
         
         var tgt = event.target, matches;
         var wl = cdr.state.dragging.innerHTML.length;


         var dir = document.querySelector('input[name="orientation"]:checked').value;
         if (matches = tgt.id.match(/(p[12])([A-J])([0-9]+)/)) { 
            if (dir == "vertical") {
               var pos = matches[3];
               if ((10 - pos) < wl) {
                  for (var i=pos; i < 10; i++) {
                     $$(matches[1]+matches[2]+i).style.backgroundColor = "#c00";
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

               } else {
                  for (var i=pos; i < pos + wl; i++) {
                     $$(matches[1]+String.fromCharCode(i+65)+matches[3]).style.backgroundColor = "#0c0";
                  }
               }
            }
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
         if (!cdr.state.dragging) return;
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
         cdr.players[1].words = botwords;
         pause = 0;
         for (var i=0; i<5; i++) {
            var placed = cdr.placeWord(botwords[i], "p2", pause);
            if (!placed) {
               unplaced.push(botwords[i]);
            } else {
               pause += botwords[i].length;
            }
         }
         var cnt = 0;
         while (botword = unplaced.shift()) {
            var placed = cdr.placeWord(botword, "p2", pause);
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
         setTimeout(function() { cdr.state.blipping = 0; }, 3000);
      },
      placeWords: function(who, words=cdr.players[0].words) {
         $$("newgame").style.transform = "scale(0)";
         setTimeout(function() { $$("newgame").style.display = "none"; $$("newgame").style.transform = "scale(1)"; }, 1500);
         var tcnt = 0;
         for (var i=0; i<words.length; i++) {
            var success = 0, cnt = 0;
            do {
               success = cdr.placeWord(words[i], who, tcnt);
               ++cnt;
            } while (!success && cnt<100);
            tcnt += words[i].length;
         }
      },
      randomBlips: function(who) {
         var r = cdr.rand(9);
         var c = String.fromCharCode(cdr.rand(9)+65);
         $$(who+c+r).classList.add('blip');
         setTimeout(function() { $$(who+c+r).classList.remove('blip'); }, cdr.rand(200));
         if (cdr.state.blipping) {
            setTimeout(function() { cdr.randomBlips(who); }, cdr.rand(10));
         }
      },
      placeWord: function(word, board, pause=0) {
         var v = (Math.random()>.5) ? true : false,
             s = cdr.rand(9),
             l = word.length,
             p, id,
             letters = word.split(''),
             tcnt = pause,
             player = (board=="p2") ? 1 : 0;
            
         if (v) {    // attempt vertical placement
            p = cdr.rand(9 - l);  
            id = board + String.fromCharCode(65 + s);
            var cnt = 0, ok = 1, tp = (p > 0) ? p - 1 : p;
            for (var i=tp; i<p+word.length; i++) {
               if (cdr.players[player].board[String.fromCharCode(65 + s) + i]) {
                  ok = 0;
                  return;
               }
            }
            if (ok) {
               for (var i=p; i<p+word.length; i++) {
                  var el = cdr.el("span", '', 'letter', letters[cnt]);
                  $$(board + String.fromCharCode(65 + s) + i).appendChild(el);
                  cdr.showLetter(el, 100*tcnt);
                  cdr.players[player].board[String.fromCharCode(65 + s) + i] = letters[cnt];
                  cnt++;
                  tcnt++;
               }
            }

         } else {
            p = cdr.rand(9 - l);  
            
            var cnt = 0, ok = 1;
            for (var i=p; i<p+word.length; i++) {
               if (cdr.players[player].board[String.fromCharCode(65 + i) + s]) {
                  ok = 0;
                  return;
               }
            }
            if (ok) {
               for (var i=p; i<p+word.length; i++) {
                  var el = cdr.el("span", '', 'letter', letters[cnt]);
                  $$(board + String.fromCharCode(65+i) + s).appendChild(el);
                  cdr.showLetter(el, 100*tcnt);
                  cdr.players[player].board[String.fromCharCode(65 + i) + s] = letters[cnt];
                  cnt++;
                  tcnt++;
               }
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
               } else {
                  word += "";
               }
            }
            if ((m == word.length) && cdr.checkWord(word)) {
               $$('my'+m+'l').innerHTML = word;
               $$('w'+m+'chk').classList.remove('notok');
               $$('w'+m+'chk').classList.add('ok');
               cdr.state.words[m] = word;
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
            if (!cdr.state.words[i] || cdr.state.words[i].length!=i) {
               return false;
            }
         }
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
            cdr.players[0].words.push(word);
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

