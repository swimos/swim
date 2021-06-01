// Copyright 2015-2021 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Cmd, Opt, Arg} from "@swim/args";
import {Build} from "./Build";
import type {Project} from "./Project";
import type {Target} from "./Target";

function runProjects(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.printProjects();
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runTargets(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.printTargets(args.projects!);
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runCompile(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): Promise<unknown> => {
      if (target.id === "test" && "test" in args) {
        target.retest = true;
      }
      if (target.id === "main" && "doc" in args) {
        target.redoc = true;
      }
      return target.compile();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runTest(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): Promise<unknown> | void => {
      if (target.id === "test") {
        target.retest = true;
        return target.compile();
      }
      return;
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runDoc(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): Promise<unknown> | void => {
      if (target.selected && target.id === "main") {
        return target.doc();
      }
      return;
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runWatch(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): void => {
      if (target.id === "test" && "test" in args) {
        target.retest = true;
      }
      if (target.id === "main" && "doc" in args) {
        target.redoc = true;
      }
      target.watch();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runUpdate(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachProject(args.projects!, (project: Project): void => {
      project.updatePackage();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runPublish(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    function publishProject(project: Project): Promise<unknown> | void {
      const options = {
        tag: typeof args.tag === "string" ? args.tag : void 0,
        "dry-run": "dry-run" in args,
      };
      return project.publish(options);
    }
    if ("recursive" in args) {
      build.forEachTransitiveProject(args.projects!, publishProject, "main");
    } else {
      build.forEachProject(args.projects!, publishProject);
    }
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runClean(this: Cmd, args: {[name: string]: string | undefined}): void {
  Build.load(args.config!, "devel" in args).then((build: Build): void => {
    build.forEachProject(args.projects!, (project: Project): void => {
      project.clean();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

const projectsCmd: Cmd = Cmd.create("projects")
    .withDesc("list projects")
    .withHelpCmd()
    .onExec(runProjects);

const targetsCmd: Cmd = Cmd.create("targets")
    .withDesc("list transitive target dependencies")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project[:target}(,project[:target})*").withDesc("comma-separated list of project[:target} specifiers to list"))
    .withHelpCmd()
    .onExec(runTargets);

const compileCmd = Cmd.create("compile")
    .withDesc("compile sources")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project[:target}(,project[:target})*").withDesc("comma-separated list of project[:target} specifiers to compile"))
    .withOpt(Opt.create("devel").withFlag("d").withDesc("disable minification"))
    .withOpt(Opt.create("test").withFlag("t").withDesc("run unit tests after successful compilation"))
    .withOpt(Opt.create("tests").withArg("pattern").withDesc("only run tests whose names match this pattern"))
    .withOpt(Opt.create("doc").withDesc("build documentation after successful compilation"))
    .withHelpCmd()
    .onExec(runCompile);

const testCmd = Cmd.create("test")
    .withDesc("run unit tests")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project[:target}(,project[:target})*").withDesc("comma-separated list of project[:target} specifiers to test"))
    .withOpt(Opt.create("devel").withFlag("d").withDesc("disable minification"))
    .withOpt(Opt.create("tests").withArg("pattern").withDesc("only run tests whose names match this pattern"))
    .withHelpCmd()
    .onExec(runTest);

const docCmd = Cmd.create("doc")
    .withDesc("generate documentation")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project[:target}(,project[:target})*").withDesc("comma-separated list of project[:target} specifiers to document"))
    .withOpt(Opt.create("devel").withFlag("d").withDesc("disable minification"))
    .withHelpCmd()
    .onExec(runDoc);

const watchCmd = Cmd.create("watch")
    .withDesc("rebuild targets on source change")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project[:target}(,project[:target})*").withDesc("comma-separated list of project[:target} specifiers to watch"))
    .withOpt(Opt.create("devel").withFlag("d").withDesc("disable minification"))
    .withOpt(Opt.create("test").withFlag("t").withDesc("run unit tests after successful compilation"))
    .withOpt(Opt.create("tests").withArg("pattern").withDesc("only run tests whose names match this pattern"))
    .withOpt(Opt.create("doc").withDesc("build documentation after successful compilation"))
    .withHelpCmd()
    .onExec(runWatch);

const updateCmd: Cmd = Cmd.create("update")
    .withDesc("update package versions to match build config")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project(,project)*").withDesc("comma-separated list of projects to update"))
    .withHelpCmd()
    .onExec(runUpdate);

const publishCmd: Cmd = Cmd.create("publish")
    .withDesc("publish packages to npm")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project(,project)*").withDesc("comma-separated list of projects to publish"))
    .withOpt(Opt.create("recursive").withFlag("r").withDesc("recursively publish project dependencies"))
    .withOpt(Opt.create("dry-run").withDesc("does everything publish would do except actually publishing to the registry"))
    .withOpt(Opt.create("tag").withArg("tag").withDesc("registers the published package with the given tag"))
    .withHelpCmd()
    .onExec(runPublish);

const cleanCmd: Cmd = Cmd.create("clean")
    .withDesc("delete generated files")
    .withOpt(Opt.create("projects").withFlag("p").withArg("project(,project)*").withDesc("comma-separated list of projects to clean"))
    .withHelpCmd()
    .onExec(runClean);

export const cli = Cmd.create("build")
    .withOpt(Opt.create("config").withFlag("c").withArg(Arg.create("build.config.js").withValue("build.config.js").asOptional(true)).withDesc("build config script path"))
    .withCmd(projectsCmd)
    .withCmd(targetsCmd)
    .withCmd(compileCmd)
    .withCmd(testCmd)
    .withCmd(docCmd)
    .withCmd(watchCmd)
    .withCmd(updateCmd)
    .withCmd(publishCmd)
    .withCmd(cleanCmd)
    .withHelpCmd();
