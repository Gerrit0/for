const path = require('path');

module.exports = [
    {
        name: 'mom',
        entry: './mom/src/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve('./mom/dist/'),
        },
    }
]
