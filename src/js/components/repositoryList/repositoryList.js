/**
 * RepositoryList component
 *
 * Generic component aimed to list repositories of given user.
 *
 * Repository logic (github, bitbucket, ...) is kept in separate services
 * and injected by this component dynamically depending on "repository-type" attribute's value.
 *
 * Template is passed dynamically via "template-url" attribute
 *
 * @module RepositoryExplorer
 */
RepositoryExplorer.component('repositoryList', {
    templateUrl: function ($element, $attrs) {
        return $attrs.templateUrl;
    },
    bindings: {
        'repositoryType': '@'
    },
    controller: function ($scope, $http, $injector, $attrs) {
        var repositoryService = $injector.get($attrs.repositoryType + 'RepositoryService');

        $scope.repositories = [];

        $scope.$on(
            $attrs.repositoryType + 'RepositoryService:fetchRepositoriesByUsername:success',
            function (event, repositoriesData) {
                $scope.repositories = [];

                repositoriesData.forEach(function (repository) {
                    $scope.repositories.push(repository);
                });
            }
        );

        $scope.$on('RepositoryUserSearchComponent:selectUser', function (event, username) {
            repositoryService.fetchRepositoriesByUsername(username);
        });
    }
});