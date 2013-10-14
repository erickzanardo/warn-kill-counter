var http = require('http');
var qs = require('querystring');
var fs = require('fs');

if (process.argv.length != 4) {
    throw 'Invalid call, example, from user project pom directory run: "/path/to/file 8080"'
}

var filePath = process.argv[2];
var serverPort = parseInt(process.argv[3])

var GITHUB_COMMAND = 'git pull origin master && git checkout ';
var MAVEN_COMMAND = 'mvn clean install -Dmaven.test.skip.exec=true -Dmaven.compiler.showDeprecation=true > /tmp/warn_out && cat /tmp/warn_out | grep WARNING | grep deprecated | wc -l';

var sys = require('sys')
var exec = require('child_process').exec;

var executing = false;
var queue = [];

var executeCommit = function () {
    var commit = queue.shift();
    console.log('Executing: ' + commit.id);
    exec(GITHUB_COMMAND + commit.id, function(error, stdout, stderr) {
        console.log(stdout, stderr);
        exec(MAVEN_COMMAND, function(error, stdout, stderr) {

            if (!error) {
                console.log('WARNINGs founds:' + stdout);
                fs.readFile(filePath, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    var baseData = JSON.parse(data.toString());
    
                    var baseWarns = baseData.warns;
                    var actualWarns = parseInt(stdout);
    
                    var points = baseWarns - actualWarns;
                    
                    if (points > 0) {
                        var author = commit.author;
                        
                        var member = {};
                        if (baseData.users[author]) {
                            member = baseData.users[author];
                        } else {
                            member = {
                                username: author,
                                kills: 0
                            };
                            baseData.users[author] = member;
                        }
    
                        member.kills += points;
                    }
                    baseData.warns = baseWarns - points;
    
                    fs.writeFile(filePath, JSON.stringify(baseData), function (err) {
                        if (err) return console.log(err);
                        console.log('Done: ' + commit.id);
    
                        if (queue.length) {
                            executeCommit();
                        } else {
                            executing = false;
                        }
                    });
                });
            } else {
                console.log('Build failed: ' + commit.id);
                if (queue.length) {
                    executeCommit();
                } else {
                    executing = false;
                }
            }
        });
    });
};

http.createServer(function (request, response) {
    if(request.method == 'POST') {
        
        var body = '';
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var formData = qs.parse(body);
            var pushData = JSON.parse(formData.payload);

            var commits = [];
            var pushCommits = pushData.commits;
            for (var i = 0; i < pushCommits.length; i++) {
                var pushCommit = pushCommits[i];
                var commit = {
                    author: pushCommit.committer.username,
                    id: pushCommit.id
                };
                commits.push(commit);
            }
            
            for (var i = 0; i < commits.length; i++) {
                queue.push(commits[i]);
            }
            
            if (!executing) {
                executing = true;
                executeCommit();
            }
            
            response.end('Done!');
        });
        
    }
    
    if(request.method == 'GET') {
        response.end('Alive!');
    }
}).listen(serverPort);
console.log('Server running at localhost:' + serverPort);