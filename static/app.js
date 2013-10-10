(function () {
    angular.module('rank', ['firebase'])
            .controller('Controller', ['$scope', '$http', 'angularFire',
     function ($scope, $http, angularFire) {
        $scope.members = [];
        var baseRef = new Firebase('https://warning-kill-ranks.firebaseio.com/dev');
         
        var promise = angularFire(baseRef, $scope, 'data', '');
        promise.then(function() {
            var data = JSON.parse($scope.data);
            for (var i in data.users) {
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
    }]);
                                                             
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