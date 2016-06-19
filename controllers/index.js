var model = require('../models/movies');

var vote = function (req, res, action) {
    var movie = {
        id:req.params.id
    };
    model.updateMovie(movie, action, function (success, result) {
        if (success) res.json({
            status: 'OK'
        });
        else res.json({
            status: 'Error'
        });
    });
}

module.exports = function (app) {
    app.get('/', function (req, res) {
        model.getMovies(function (result) {
            res.render('index', {
                movies: result
            });
        });
    });

    app.post('/movie', function (req, res) {
        var movie = {
            title:req.body.title,
            likes:0,
            unlikes:0
        };
        model.saveMovie(movie, function (success, result) {
            if (success) res.json({
                status: 'OK'
            });
            else res.json({
                status: 'Error'
            });
        });
    });

    app.put('/movie/like/:id', function (req, res) {
       vote(req, res, 'likes');
    });

    app.put('/movie/unlike/:id', function (req, res) {
        vote(req, res, 'unlikes');
    });
};
