(function () {
     Controller = function ($scope, $http) {
        $scope.members = [];
         
        $http.get('data.js').success(function(data) {
            var users = data.users.sort(function (a, b) {
                return b.kills - a.kills; 
            });
            
            for (var i in users) {
                var d = data.users[i];
                var user = {
                    username:  d.username,
                    kills: d.kills,
                    killsArr: new Array(d.kills)
                };
                $scope.members.push(user);
            }
            fetchUsers($scope, $http);
        });
    }
                                                             
    var BASE_URL = "https://api.github.com/users/";
    
    var GithubFetcher = function(i, $scope, $http) {
        var member = $scope.members[i];
        var username = member.username;
        this.fetch = function() {
            $http.get(BASE_URL + username).success(function (userData) {
                var memberData = {
                    name: userData.name,
                    avatar: userData.avatar_url
                };
                
                member.name = memberData.name;
                member.avatar = memberData.avatar;
                localStorage.setItem(username, JSON.stringify(memberData));
            });
        };
    };
    
    var fetchUsers = function($scope, $http) {
        var members = $scope.members;
        for (var i = 0; i < members.length; i++) {
            var member = members[i];
            var username = member.username;
            var ls = localStorage.getItem(username);
            if (ls) {
                var memberData = JSON.parse(ls);
                member.name = memberData.name;
                member.avatar = memberData.avatar;
            } else {
                new GithubFetcher(i, $scope, $http).fetch();
            }
        }
    };
})();