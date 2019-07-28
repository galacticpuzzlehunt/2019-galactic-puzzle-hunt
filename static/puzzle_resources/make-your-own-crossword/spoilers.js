var process = function(word) {
  word = word.replace(/[^a-zA-Z]/g, '');
  url = 'https://api.datamuse.com/words?sp=' + word + '&md=fd';
  return $.get(url).then(data => {
    var response = data;
    var result = 0;
    for (var i = 0; i < response.length; i++) {
      if (response[i]['word'] == word) {
        var score = parseFloat(response[i]['tags'][0].substring(2));
        if (score > 1.0) {
          result = 2;
          break;
        }
        if (score > 0.1) {
          result = 1;
          break;
        }
      }
    }
    return result;
  });
};

var lookup_word = function(word) {
  word = word.toLowerCase();
  process(word).then(result => {
    var text = '';
    if (result == 0) {
      text = word + ' is Invalid'
    } else if (result == 1) {
      text = word + ' is Uncommon'
    } else {
      text = word + ' is Common'
    }
    $('#word_result').html(text);
  });
};

var get_transformed_grid = function(grid, count) {
  var cluephrase = 'ANSWERUNCLEARORSOILED';
  var unique_index = 0;

  for (var i = 0; i < 21; i++) {
    var c = String.fromCharCode(i + 'A'.charCodeAt(0));
    if (count.get(c) > 0) {
      count.set(c, cluephrase[unique_index]);
      unique_index++;
    } else {
      count.set(c, '#');
    }
  }

  for (var i = 0; i < 5; i++) {
    var c = String.fromCharCode(i + 'V'.charCodeAt(0));
    count.set(c, '*');
  }

  count.set('*', '*');
  count.set('\n', '\n');

  retgrid = '<p>Thank you so much for your help! As a token of our appreciation, we’d like to give you the following puzzle:</p>\n';
  retgrid += '<table class="asdf" style="font-family: monospace; font-size: 2.5rem;">\n';
  for (var i = 0; i < 81; i++) {
    if (i % 9 == 0) {
      retgrid += '    <tr>\n'
    }
    retgrid += '        <td>'+count.get(grid[i])+'</td>\n';
    if (i % 9 == 8) {
      retgrid += '    </tr>\n';
    }
  }
  retgrid += '</table>\n';
  return retgrid;
}

var validate_grid = function(grid) {
  grid = grid.replace(/\s/g, '');
  grid = grid.toUpperCase();
  var error_string = '';
  start = false;

  // check grid shape, connectivity, and symmetry
  if (grid.length != 81) {
    error_string = 'You must input a 9 by 9 grid of characters.'
    return error_string;
  }
  var rows = new Array(9);
  for (var i = 0; i < 9; i++) {
    rows[i] = grid.substring(i * 9, i * 9 + 9);
  }
  var graph = [];
  for (var i = 0; i < 9; i++) {
    var newrow = [];
    for (var j = 0; j < 9; j++) {
      c = rows[i][j];
      if (c == '*')
        newrow.push(false);
      else {
        newrow.push(true);
        start = true;
      }
    }
    graph.push(newrow);
  }
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      if (graph[i][j] != graph[8 - i][8 - j]) {
        error_string = 'Your input grid must have two-way symmetry.';
        return error_string;
      }
    }
  }
  if (!start) {
    error_string = 'Your input grid must contain letters.';
    return error_string;
  }

  var queue = [];
  for (var i = 0; i < 9; i++) {
    if (graph[i][i]) {
      graph[i][i] = false;
      queue.push([i,i])
      break;
    }
  }

  while (queue.length > 0) {
    next = queue.shift();
    x = next[0];
    y = next[1];
    if (x > 0 && graph[x - 1][y] == true) {
      graph[x-1][y] = false;
      queue.push([x-1, y])
    }
    if (x < 8 && graph[x + 1][y] == true) {
      graph[x+1][y] = false;
      queue.push([x+1, y])
    }
    if (y > 0 && graph[x][y - 1] == true) {
      graph[x][y-1] = false;
      queue.push([x, y-1])
    }
    if (y < 8 && graph[x][y + 1] == true) {
      graph[x][y+1] = false;
      queue.push([x, y+1])
    }
  }

  var unexplored = false;
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      unexplored = unexplored || graph[i][j];
    }
  }

  if (unexplored) {
    error_string = 'Your letters of your input grid must be connected.'
    return error_string;
  }

  // count characters
  var count = new Map();
  count.set('*', 0);
  for (var i = 0; i < 26; i++) {
    count.set(String.fromCharCode(i + 'A'.charCodeAt(0)), 0);
  }
  invalid_characters = [];
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      var c = rows[i][j];
      if (!count.has(c)) {
        invalid_characters.push(c);
      } else{
        count.set(c, count.get(c) + 1);
      }
    }
  }

  if (invalid_characters.length > 0) {
    error_string += ' The following characters in your grid are invalid:';
    for (var i = 0; i < invalid_characters.length; i++){
      error_string += ' ' + invalid_characters[i];
    }
    error_string += '.';
  }

  if (count.get('*') > 21) {
    error_string += ' You must have at most 21 blank squares in your grid. You have ' + count.get('*') + '.';
  }

  for (var i = 0; i < 5; i++) {
    var c = String.fromCharCode(i + 'V'.charCodeAt(0));
    var count_c = count.get(c);
    if (count_c != 1) {
      error_string += ' You must have exactly one ' + c + ' in your grid. You have ' + count_c + '.';
    }
  }

  // verify real words
  var two_letter = 0;
  var one_letter = 0;
  var all_words = [];
  for (var i = 0; i < 9; i++) {
    all_words = all_words.concat(rows[i].split('*'));
  }
  for (var i = 0; i < 9; i++) {
    var col = '';
    for (var j = 0; j < 9; j++) {
      col += rows[j][i];
    }
    all_words = all_words.concat(col.split('*'));
  }

  var uncommon_words = [];
  var invalid_words = [];
  var lookup_words = [];
  var lookup_promises = [];
  all_words.forEach(word => {
    if (word.length == 1){
      one_letter += 1;
    } else if (word.length == 2) {
      two_letter += 1;
    } else if (word.length > 0) {
      lookup_words.push(word.toLowerCase());
      lookup_promises.push(process(word.toLowerCase()));
    }
  });

  Promise.all(lookup_promises).then(values => {
    for (var i = 0; i < values.length; i++) {
      var word = lookup_words[i];
      if (values[i] == 0) {
        invalid_words.push(word);
      } else if (values[i] == 1) {
        uncommon_words.push(word);
      }
    }

    if (invalid_words.length > 0) {
      error_string += ' The following are invalid words:';
      invalid_words.forEach(word => {
        error_string += ' ' + word;
      });
      error_string += '.';
    }
    if (uncommon_words.length > 5) {
      error_string += ' You have too many uncommon words. You\'re allowed five, but in your grid the following words are uncommon:';
      uncommon_words.forEach(word => {
        error_string += ' ' + word;
      });
      error_string += '.';
    }
    if (one_letter > 0) {
      error_string = ' You have ' + one_letter + ' one-letter words, but you aren\'t allowed any.';
    }
    if (two_letter > 2) {
      error_string = ' You have ' + two_letter + ' two-letter words, but you\'re allowed at most 2.';
    }

    if (error_string.length > 0) {
      if (error_string[0] == ' ') {
        error_string = error_string.substring(1);
      }
      $('#result').html(error_string);
    } else {
      x = get_transformed_grid(grid, count);
      $('#result').html(x);
    }
  });


  return false;
};


var main = function() {
  $('#get_grid').on('submit', function() {
    var result = validate_grid($('#grid').val());
    if (result) {
      $('#result').html(result);
    }
    return false;
  });

  $('#get_word').on('submit', function() {
    var result = lookup_word($('#word').val());
    if (result) {
      $('#word_result').html(result);
    }
    return false;
  });
};

$(document).ready(main);
