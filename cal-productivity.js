var MongoClient = require('mongodb').MongoClient;

var calculate_duration = function(start, end) {
  // convert ms to minutes
  var ms_to_minutes = 1000*60.0;
  var duration = (end - start) / ms_to_minutes;
  return duration;
};

var months = {
    'January'   : 0,
    'February'  : 1,
    'March'     : 2,
    'April'     : 3,
    'May'       : 4,
    'June'      : 5,
    'July'      : 6,
    'August'    : 7,
    'September' : 8,
    'October'   : 9,
    'November'  : 10,
    'December'  : 11,
}

// August 23, 2011 at 10:00PM
var parseDate = function(date) {
  var parts = date.split(' ');
  var month = months[parts[0]];
  var day = parts[1];
  // Remove the ","
  day = Number(day.replace(',',''));
  var year = Number(parts[2]);
  var time = parts[4].split(':');
  var hour = Number(time[0]);
  if (time[1][2] == 'P') {
    hour += 12;
  }
  var minutes = Number(time[1].substring(0,2));
  return new Date(year, month, day, hour, minutes );
}

var save_event = function(title, start, end, db, cb) {
  var start_date = parseDate(start);
  var end_date = parseDate(end);
  var duration = calculate_duration(start_date, end_date);
  var day = start_date.getDay();
  var doc = {
    day: day
  };

  var update = {
    $inc: {
      duration: duration
    },
    $push: {
      events: {
        title: title,
        date: start_date,
        duration: duration
      }
    }
  };

  var options = {
    upsert: true
  };

  db.collection('days').updateOne(doc, update, options, function(err) {
    if(err) return cb(err);

    console.log('Successfully saved event %s', title);
  });

};

module.exports = function (ctx, done) {
  var title = ctx.data.title;
  var start = ctx.data.start;
  var end = ctx.data.end;

  MongoClient.connect(ctx.data.MONGO_URL, function (err, db) {
    if(err) return done(err);

    save_event(title, start, end, db, function (err) {
      if(err) return done(err);

      cb(null);
    });

    done(null, 'Success');
  });
};