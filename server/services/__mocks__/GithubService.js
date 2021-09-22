const authorize = require('../../tests/util/create');

const GithubService = {
    authorize,
    getUrl: () => 'localhost:5020/login',
    getUser() {
        return { username: 'foobar', name: 'Foo Bar', email: 'foo@bar.com' };
    }
};

module.exports = GithubService;
