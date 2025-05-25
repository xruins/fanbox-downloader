const path = require('path');

module.exports = {
    mode: "production",
    entry: './fanbox-downloader.ts',
    output: {
        filename: 'fanbox-downloader.min.js',
        path: path.resolve(__dirname, 'docs'),
        library: {
            type: 'module',
        },
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: {
                loader: 'ts-loader',
                options: {
                    allowTsInNodeModules: true,
                    compilerOptions: {
                        skipLibCheck: true
                    }
                }
            }
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    experiments: {
        outputModule: true,
    },
}
