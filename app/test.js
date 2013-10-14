var Firebase = require('firebase');
var baseRef = new Firebase('https://warning-kill-ranks.firebaseio.com/prod')
baseRef.once('value', function(snapshot) { console.log(snapshot.val())});
