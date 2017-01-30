/**
 * githubRepositoryService service
 *
 * Entails whole logic of working with github repository.
 * Exposes "interface" methods: "fetchRepositoriesByUsername" and "searchUser"
 * which are used by generic components repositoryList and repositoryUserSearch.
 *
 * Uses $rootScope as event bus to send method specific, "interface" events (
 * e.g. "githubRepositoryService:fetchRepositoriesByUsername:success"
 * "githubRepositoryService:fetchRepositoriesByUsername:failure"), which are used by
 * generic components (repositoryList, repositoryUserSearch) to parse data, display it, handle errors.
 *
 * @module RepositoryExplorer
 */
RepositoryExplorer.service('githubRepositoryService', [
    '$http',
    '$rootScope',
    function ($http, $rootScope) {
        function handleError (error, callbackName, arguments) {
            if (error.status == 403 && lastSuccessfullCallDates[callbackName]) {
                // in case we've received forbidden response ("API rate limit exceeded for ...")
                // from github in previous request
                // send same request with "If-Modified-Since" header, with date of last successfull request
                // with the hope to make use of github's conditional requests
                // https://developer.github.com/v3/#conditional-requests
                GithubRepositoryService[callbackName].apply(null, arguments);

                // reset date to avoid recursion
                lastSuccessfullCallDates[callbackName] = '';

                return;
            }

            $rootScope.$broadcast(
                'githubRepositoryService:' + callbackName + ':failure',
                error.data ? error.data.message : 'Check you internet connection'
            );
        }

        var lastSuccessfullCallDates = {};

        var GithubRepositoryService = {
            fetchRepositoriesByUsername: function (username, requestConfig) {
                var data = [];

                $http.get('https://api.github.com/users/' + username + '/repos', requestConfig).then(function (response) {
                    data = [];
                    lastSuccessfullCallDates['fetchRepositoriesByUsername'] = (new Date()).toString();

                    response.data.forEach(function (repository) {
                        data.push({
                            name: repository.name,
                            description: repository.description,
                            url: repository.html_url
                        });
                    });

                    $rootScope.$broadcast(
                        'githubRepositoryService:fetchRepositoriesByUsername:success',
                        data
                    )
                }).catch(function (error) {
                    handleError(error, 'fetchRepositoriesByUsername', [username, {
                        'headers': {
                            'If-Modified-Since': lastSuccessfullCallDates['fetchRepositoriesByUsername']
                        }
                    }]);
                });
            },

            searchUser: function (phrase, requestConfig) {
                var data;

                if (!phrase) {
                    return;
                }

                $http
                .get('https://api.github.com/search/users?q=' + phrase, {
                        'headers': {
                            'If-Modified-Since': lastSuccessfullCallDates['searchUser']
                        }
                    })
                .then(function (response) {
                    data = [];
                    lastSuccessfullCallDates['searchUser'] = (new Date()).toString();

                    response.data.items.forEach(function (user) {
                        data.push({
                            login: user.login,
                            url: user.html_url
                        });
                    });

                    $rootScope.$broadcast(
                        'githubRepositoryService:searchUser:success',
                        data
                    );
                }).catch(function (error) {
                    handleError(error, 'searchUser', [phrase, {
                        'headers': {
                            'If-Modified-Since': lastSuccessfullCallDates['searchUser']
                        }
                    }]);
                });
            }
        };

        return GithubRepositoryService;
    }
]);