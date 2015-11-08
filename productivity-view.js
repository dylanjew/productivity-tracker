"use latest";

var { MongoClient } = require('mongodb');
var Handlebars = require('handlebars');

var html = `
<html>
<head>
  <title>Productivity From Calendar</title>
</head>
<body>
  <h2>Total minutes worked by day</h2>
  <ul>
    {{#each days}}
      <li>{{DayName day}}: {{duration}} minutes</li>
    {{/each}}
  </ul>
</body>
</html>
`;

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

Handlebars.registerHelper('DayName', function(day) {
  return dayNames[day];
});

module.exports = function(ctx, req, res) {
  let { MONGO_URL } = ctx.data;

  MongoClient.connect(MONGO_URL, (err, db) => {
    if(err) return res.end(err);

    db
      .collection('days')
      .find()
      .toArray( (err, days) => {
        if(err) return res.end(err);

        const view_ctx = {
          days: days.sort( (day1, day2) => {
            return day1.day - day2.day;
          })
        };

        const template = Handlebars.compile(html);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(template(view_ctx));
      });
  });
};
