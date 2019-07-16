# Swim TypeScript System

## Building

### Setup

Install build dependencies:

```sh
swim-system-js $ npm install
```

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-system-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `core` project, and all
targets of the `ui` project, run:

```sh
swim-system-js $ bin/build.js compile -p core:main,ui
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `ui` project, run:

```sh
swim-system-js $ bin/build.js test -p ui
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `vis` project when any source file in the project–or in
one of the project's transitive local dependencies–changes, run:

```sh
swim-system-js $ bin/build.js watch -p vis:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `ui` project, bypassing minification, and skipping generation of
the main script, run:

```sh
swim-system-js $ bin/build.js watch -p ui:test -d -t
```

### Building documentation

```sh
swim-system-js $ bin/build.js doc -p system
```
