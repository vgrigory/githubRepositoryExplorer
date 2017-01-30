/**
 * RepositoryUserSearch component
 *
 * Generic component aimed to search for repository users.
 *
 * Repository logic (github, bitbucket, ...) is kept in separate services
 * and injected by this component dynamically depending on "repository-type" value.
 *
 * @module RepositoryExplorer
 */
RepositoryExplorer.component('repositoryUserSearch', {
    templateUrl: function ($element, $attrs) {
        return $attrs.templateUrl;
    },
    bindings: {
        'repositoryType': '@'
    },
    controller: function ($scope, $http, $injector, $attrs, $rootScope) {
        var repositoryService = $injector.get($attrs.repositoryType + 'RepositoryService');

        $scope.repositoryUsers = [];
        $scope.selectedUser = {};
        $scope.searchUser = repositoryService.searchUser;

        $scope.selectUser = function (username) {
            $rootScope.$broadcast('RepositoryUserSearchComponent:selectUser', username);
        }

        $scope.$on(
            $attrs.repositoryType + 'RepositoryService:searchUser:success',
            function (event, usersData) {
                $scope.repositoryUsers = [];

                usersData.forEach(function (user) {
                    $scope.repositoryUsers.push(user);
                });
            }
        );

        $scope.$on(
            $attrs.repositoryType + 'RepositoryService:searchUser:failure',
            function (event, error) {
                $scope.error = error;
            }
        );
    }
});