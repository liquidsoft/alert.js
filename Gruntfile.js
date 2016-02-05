module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        less: {
            dist: {
                options: {
                    banner: "/*\n<%= pkg.name %>\n@version <%= pkg.version %>\n@author <%= pkg.author %>\n */\n\n",
                    compress: false
                },
                files: {
                    "dist/alert.css": "src/alert.less"
                }
            }
        },

        concat: {
            options: {
                banner: "/*\n<%= pkg.name %>\n@version <%= pkg.version %>\n@author <%= pkg.author %>\n */\n\n"
            },
            dist: {
                src: ["src/alert.js"],
                dest: "dist/alert.js"
            }
        },

        uglify: {
            options: {
                banner: "/*\n<%= pkg.name %>\n@version <%= pkg.version %>\n@author <%= pkg.author %>\n */\n"
            },
            dist: {
                files: {
                    "dist/alert.min.js": ["dist/alert.js"]
                }
            }
        },

        watch: {
            less: {
                files: ["src/**/*.less"],
                tasks: ["less"]
            },

            js: {
                files: ["src/**/*.js"],
                tasks: ["concat", "uglify"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["concat", "uglify", "less"]);
    grunt.registerTask("default", ["build", "watch"]);
}