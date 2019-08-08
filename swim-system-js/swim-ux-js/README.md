# Swim Real-Time User Interface Widgets

## Building

**Note:** You can only build `swim-ux-js` from the parent `swim-system-js`
directory.

### Setup

Install build dependencies:

```sh
swim-ux-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the Swim user interface widgets.
The build script supports `compile`, `test`, `doc`, and `watch` commands,
described below.  All build script commands take an optional `--projects`
(`-p`) option to restrict the build to a comma-separated list of projects.

Each project supports multiple output targets; typical targets for a project
include `main`, to build the main sources, and `test`, to build the test
sources.  A specific target can be built for a project by appending a colon
(`:`) and the target name to the project name.  For example, to build just the
`main` sources of the `util` project, pass `-p util:main` to the build script.

Most build commands take a `--devel` (`-d`) option to expedite development
builds by skipping the minification step.

Run `bin/build.js help` to see a complete list of build commands.  Run
`bin/build.js <command> --help` to see a list of options supported by a
particular build command.

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-ux-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `pie` project, and all
targets of the `ux` project, run:

```sh
swim-ux-js $ bin/build.js compile -p pie:main,ux
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `chart` project, run:

```sh
swim-ux-js $ bin/build.js test -p chart
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `gauge` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-ux-js $ bin/build.js watch -p gauge:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `chart` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-ux-js $ bin/build.js watch -p chart:test -d -t
```
