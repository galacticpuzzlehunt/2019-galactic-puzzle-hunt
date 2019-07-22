// SPOILERS! READ AT YOUR OWN RISK!

var GRID_WIDTH = 11;
var GRID_HEIGHT = 11;

var words = ["MACKENZIE", "ABBOTT", "BOWELL", "LAURIER", "BENNETT", "DIEFENBAKER", "TURNER", "CAMPBELL", "TRUDEAU"]
var s0 = [[1,2,4],[1,1,3],[5,0,7],[7,5,7],[4,5,7],[7,3,2],[6,8,4],[4,2,0],[1,8,6]]
var sd = [[8,9,1],[9,2,6],[1,9,0],[8,1,3],[2,7,6],[8,4,2],[7,5,7],[6,8,3],[7,4,1]]
var sm = [2,3,5,7,11,13,17,19,23]
var goal2 = [1,0,2,6,9,1,7,18,18]
var k = [11,11,8]
var dirs = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]]

var place = function(word, startpos, startdir, grid, wordplaced) {
  for (var i = 0; i < word.length; i++) {
    grid[startpos[0]][startpos[1]] = word[i]
    startpos = [(startpos[0]+startdir[0]+11)%11,(startpos[1]+startdir[1]+11)%11]
  }
  wordplaced.push(word)
  return
};


var generate = function(idnum) {
  if (idnum < 0) {
    return [null, "Sorry, our archives don't go that low."]
  }
  if (idnum >= 100000000) {
    return [null, "Sorry, our archives don't go that high."]
  }

  var grid = [];
  for (var i = 0; i < 11; i++) {
    row = [];
    for (var j = 0; j < 11; j++) {
      row.push(".")
    }
    grid.push(row)
  }

  var settings = []
  var wordplaced = []
  for (var i = 0; i < 9; i++) {
    var row = []
    for (var j = 0; j < 3; j++) {
      row.push((s0[i][j]+sd[i][j]*(idnum%sm[i]))%k[j])
    }
    settings.push(row)
  }
  for (var i = 0; i < words.length; i++) {
    place(words[i], [settings[i][0],settings[i][1]], dirs[settings[i][2]], grid, wordplaced)
  }
  var countup = 0
  var message = "GREATWORKYOURFIRSTCLUEISTHEANSWERHOLDSNINELETTERSOKYOUMUSTNOWISOLATETHEUNIQUEVALIDWORDSEARCH!!!!!!!!"

  for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
      if (grid[i][j] == ".") {
        grid[i][j] = message[countup]
        countup++
      }
    }
  }
  return [grid, null]
};

var main = function() {
    var showGrid = function(id, grid){
        $('#puzzle_title').text('Puzzle #' + id);

        $('#puzzle_grid').html('');
        for(var y=0;y<GRID_HEIGHT;y++){
            $('#puzzle_grid').append('<tr>');
            for(var x=0;x<GRID_WIDTH;x++){
                $('#puzzle_grid').append('<td>' + grid[y][x] + '</td>');
            }
            $('#puzzle_grid').append('</tr>');
        }
    };

    var getGrid = function(id_num, random){
        $('#error').hide();
        var requestData = {"id_num": id_num, "random": random};

        var response = generate(id_num);
        var grid = response[0]
        var error = response[1]

        if (error) {
          $('#puzzle').hide();
          $('#error').show();
          $('#error').html(error);
        } else {
          $('#puzzle').show();
          showGrid(id_num, grid);
        }
    }

    $('#get_grid').on('submit', function(){
        getGrid(parseInt($('#id_num').val()), false);
        return false;
    });

    var random_id = Math.floor(Math.random() * 100000000);
    getGrid(random_id, true);
};


$(document).ready(main);
