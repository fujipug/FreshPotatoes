const sqlite = require('sqlite'),
	Sequelize = require('sequelize'),
	request = require('request'),
	express = require('express'),
	app = express();

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;

// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);

// app.get('*', function(req, res) {
// 	res.status(404).end();
// });

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
	var givenId = req.params.id;
	var releaseDate;
	var defaultLimit;

	if (req.query.limit == null) {
		defaultLimit = 10;
	} else {
		defaultLimit = req.query.limit;
	}

	var defaultOffset;
	if (req.query.offset == null) {
		defaultOffset = 0;
	} else {
		defaultOffset = req.query.offset;
	}

	var limitCount = defaultLimit;
	var offsetCount = defaultOffset;

	sqlite.get('SELECT * FROM films WHERE id = ?', givenId)
	.then((film) => {

	if (film.id == null || film.id == [] || film.id == '') {
		res.json({
			"message" : "Return an explicit error here"
		});
	} else {
	var releaseDate = new Date(film.release_date);
	sqlite.all('SELECT * FROM films WHERE genre_id = ?', film.genre_id)
	.then((foundFilms) => {

		var filteredFilms = [];
		for (var i = 0; i < foundFilms.length; i++) {
			var tempDate = new Date(foundFilms[i].release_date);
			var diff = (releaseDate - tempDate)/86400000;
			if (diff <= 5478 && diff >= -5478 && limitCount > 0) {
				if (givenId != foundFilms[i].id) {
					if (offsetCount <= 0) {
						filteredFilms.push(foundFilms[i]);
						limitCount--;
					} else {
						offsetCount--;
					}
				}
			}
		}

		filteredFilms.sort(function(a, b) { 
		  return a.id - b.id  ||  a.name.localeCompare(b.name);
		});

		filteredFilms.slice(0, limitCount);
		console.log(limitCount);
		res.json({
			'recommendations' : filteredFilms,
			'meta' : {
			"limit" : defaultLimit,
			"offset" : defaultOffset,
		}
	});
})
	.catch(err => res.json({
		status: 'error',
		message: err
	}));
}

})
	.catch(err => res.json({
		status: 'error',
		message: err
	}));

}

// START SERVER
Promise.resolve()
// connnect to db
.then(() => sqlite.open(DB_PATH, { Promise }))
.catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); })
.then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)));


module.exports = app;