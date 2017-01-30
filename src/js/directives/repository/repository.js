/**
 * Repository directive
 *
 * Simple directive rendering repository data using given template.
 *
 * @module RepositoryExplorer
 */
RepositoryExplorer.directive('repository', function () {
    return {
        templateUrl: function ($element, $attrs) {
            return $attrs.templateUrl;
        },
        scope: {
            repoData: '<'
        }
    };
});