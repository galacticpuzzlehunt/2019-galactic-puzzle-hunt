var REQUEST_URL = "/puzzle/ministry-of-wordsearches/grid";
var GRID_WIDTH = 11;
var GRID_HEIGHT = 11;

var main = function() {
    var showGrid = function(data){
        $('#puzzle_title').text('Puzzle #' + data.id);

        $('#puzzle_grid').html('');
        for(var y=0;y<GRID_HEIGHT;y++){
            $('#puzzle_grid').append('<tr>');
            for(var x=0;x<GRID_WIDTH;x++){
                $('#puzzle_grid').append('<td>' + data.grid[y][x] + '</td>');
            }
            $('#puzzle_grid').append('</tr>');
        }
    };

    var getGrid = function(id_num, random){
        $('#error').hide();
        var requestData = {"id_num": id_num, "random": random};

        $.post(REQUEST_URL, requestData,
            function(response){
                var responseData = $.parseJSON(response);
                if(responseData.error.length > 0){
                    $('#puzzle').hide();
                    $('#error').show();
                    $('#error').html(responseData.error);
                }else{
                    $('#puzzle').show();
                    showGrid(responseData);
                }
            });
    }

    $('#get_grid').on('submit', function(){
        getGrid(parseInt($('#id_num').val()), false);
        return false;
    });

    var random_id = Math.floor(Math.random() * 100000000);
    getGrid(random_id, true);
};
    

$(document).ready(main);
