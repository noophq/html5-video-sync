const path = require("path");
const webpack = require("webpack");

// Get runtime environment
const nodeEnv = process.env.NODE_ENV || "development";

let config = {
    entry: "./src/lib.ts",

    module: {
        rules: [
            // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
            {
                exclude: /node_modules/,
                loader: "awesome-typescript-loader",
                query: {
                    declaration: false,
                },
                test: /\.tsx?$/,
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        ],
    },

    output: {
        filename: "bundle.js",
        library: "videoSynchronizer",
        libraryTarget: "var",
        path: path.join(__dirname, "/dist"),
    },

    resolve: {
        alias: {
            "lib": path.resolve(__dirname, "src"),
        },
        // Add '.ts' as resolvable extensions.
        extensions: [".ts", ".js", ".json"],
    },

    target: "web",
};

if (nodeEnv === "development") {
    // Development environment
    // Renderer config for DEV environment
    config = Object.assign({}, config, {
        devServer: {
            contentBase: __dirname,
            hot: true,
            open: true,
            openPage: "test/app",
            publicPath: "/dist/",
            watchContentBase: true,
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",
    });
} else {
    // Production environment
    config = Object.assign({}, config, {
        plugins: [
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": '"production"',
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
            }),
        ],
    });
}

module.exports = config;
