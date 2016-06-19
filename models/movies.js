var model = module.exports;
var r = require('rethinkdb');
var config = require('../config');

var MOVIES_TABLE = 'movies';

model.setup = function (callback) {
    console.log("Setting up RethinkDB...");
    
    r.connect(config.database).then(function(conn) {
        // Does the database exist?
        r.dbCreate(config.database.db).run(conn).then(function(result) {
            console.log("Database created...");
        }).error(function(error) {
            console.log("Database already created...");
        }).finally(function() {
            // Does the table exist?
            r.table(MOVIES_TABLE).limit(1).run(conn, function(error, cursor) {
                var promise;
                if (error) {
                    console.log("Creating table...");
                    promise = r.tableCreate(MOVIES_TABLE).run(conn);
                } else {    
                    promise = cursor.toArray();
                }

                // The table exists, setup the update listener
                promise.then(function(result) {
                    console.log("Setting up update listener...");
                    r.table(MOVIES_TABLE).changes().run(conn).then(function(cursor) {
                        cursor.each(function(error, row) {
                            callback(row);
                        });
                    });
                }).error(function(error) {
                    throw error;
                });
            });
        });
    }).error(function(error) {
        throw error;
    });
}

model.getMovies = function (callback) {
    r.connect(config.database).then(function(conn) {
        r.table(MOVIES_TABLE).run(conn).then(function(cursor) {
            cursor.toArray(function(error, results) {
                if (error) throw error;
                callback(results);
            });
        }).error(function(error) {
            throw error;
        });
    }).error(function(error) {
        throw error;
    });
}

model.saveMovie = function (movie, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(MOVIES_TABLE).insert(movie).run(conn).then(function(results) {
            callback(true, results);
        }).error(function(error) {
            callback(false, error);
        });
    }).error(function(error) {
        callback(false, error);
    });
}

model.updateMovie = function (movie, field, callback) {
    r.connect(config.database).then(function(conn) {
        r.table(MOVIES_TABLE).get(movie.id).update(function(movie) {
            return r.object(field, movie(field).add(1)); 
        }).run(conn).then(function(results) {
           callback(true, results);
        }).error(function(error) {
            callback(false, error);
        });
    }).error(function(error) {
        callback(false, error);
    });
}

