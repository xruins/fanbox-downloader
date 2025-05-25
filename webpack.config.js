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
        extensions: ['.ts', '.js'],
        fallback: {
            // Node.js polyfills for browser (if needed)
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer"),
            "util": require.resolve("util"),
            "crypto": false,
            "fs": false,
            "path": false,
            "os": false
        }
    },
    experiments: {
        outputModule: true,
    },
    // 外部依存関係をバンドルに含める設定
    externals: {
        // 削除: 外部ライブラリもバンドルに含めるため
    },
    // 最適化設定
    optimization: {
        minimize: true,
        usedExports: true,
        sideEffects: false,
    },
    // webpack dev server設定（開発時用）
    devServer: {
        static: {
            directory: path.join(__dirname, 'docs'),
        },
        compress: true,
        port: 9000,
    }
}
