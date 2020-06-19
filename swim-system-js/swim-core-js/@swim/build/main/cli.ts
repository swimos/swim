// Copyright 2015-2020 Swim inc.
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
import {Project} from "./Project";
import {Target} from "./Target";

function runProjects(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.printProjects();
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runTargets(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.printTargets(args.projects!);
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runCompile(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): Promise<unknown> => {
      if (target.id === "test" && args.test === null) {
        target.retest = true;
      }
      if (target.id === "main" && args.doc === null) {
        target.redoc = true;
      }
      return target.compile();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runTest(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
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

function runDoc(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
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

function runWatch(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.forEachTransitiveTarget(args.projects!, (target: Target): void => {
      if (target.id === "test" && args.test === null) {
        target.retest = true;
      }
      if (target.id === "main" && args.doc === null) {
        target.redoc = true;
      }
      target.watch();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runUpdate(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.forEachProject(args.projects!, (project: Project): void => {
      project.updatePackage();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runPublish(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    function publishProject(project: Project): Promise<unknown> | void {
      const options = {
        tag: typeof args.tag === "string" ? args.tag : void 0,
        "dry-run": args["dry-run"] === null,
      };
      return project.publish(options);
    }
    if (args.recursive === void 0) {
      build.forEachProject(args.projects!, publishProject);
    } else {
      build.forEachTransitiveProject(args.projects!, publishProject, "main");
    }
  }, (reason: any): void => {
    console.log(reason);
  });
}

function runClean(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  Build.load(args.config!, args.devel === null).then((build: Build): void => {
    build.forEachProject(args.projects!, (project: Project): void => {
      project.clean();
    });
  }, (reason: any): void => {
    console.log(reason);
  });
}

const projectsCmd: Cmd = Cmd.of("projects")
    .desc("list projects")
    .exec(runProjects);

const targetsCmd: Cmd = Cmd.of("targets")
    .desc("list transitive target dependencies")
    .opt(Opt.of("projects").flag("p").arg("project[:target}(,project[:target})*").desc("comma-separated list of project[:target} specifiers to list"))
    .exec(runTargets);

const compileCmd = Cmd.of("compile")
    .desc("compile sources")
    .opt(Opt.of("projects").flag("p").arg("project[:target}(,project[:target})*").desc("comma-separated list of project[:target} specifiers to compile"))
    .opt(Opt.of("devel").flag("d").desc("disable minification"))
    .opt(Opt.of("test").flag("t").desc("run unit tests after successful compilation"))
    .opt(Opt.of("tests").arg("pattern").desc("only run tests whose names match this pattern"))
    .opt(Opt.of("doc").desc("build documentation after successful compilation"))
    .exec(runCompile);

const testCmd = Cmd.of("test")
    .desc("run unit tests")
    .opt(Opt.of("projects").flag("p").arg("project[:target}(,project[:target})*").desc("comma-separated list of project[:target} specifiers to test"))
    .opt(Opt.of("devel").flag("d").desc("disable minification"))
    .opt(Opt.of("tests").arg("pattern").desc("only run tests whose names match this pattern"))
    .exec(runTest);

const docCmd = Cmd.of("doc")
    .desc("generate documentation")
    .opt(Opt.of("projects").flag("p").arg("project[:target}(,project[:target})*").desc("comma-separated list of project[:target} specifiers to document"))
    .opt(Opt.of("devel").flag("d").desc("disable minification"))
    .exec(runDoc);

const watchCmd = Cmd.of("watch")
    .desc("rebuild targets on source change")
    .opt(Opt.of("projects").flag("p").arg("project[:target}(,project[:target})*").desc("comma-separated list of project[:target} specifiers to watch"))
    .opt(Opt.of("devel").flag("d").desc("disable minification"))
    .opt(Opt.of("test").flag("t").desc("run unit tests after successful compilation"))
    .opt(Opt.of("tests").arg("pattern").desc("only run tests whose names match this pattern"))
    .opt(Opt.of("doc").desc("build documentation after successful compilation"))
    .exec(runWatch);

const updateCmd: Cmd = Cmd.of("update")
    .desc("update package versions to match build config")
    .opt(Opt.of("projects").flag("p").arg("project(,project)*").desc("comma-separated list of projects to update"))
    .exec(runUpdate);

const publishCmd: Cmd = Cmd.of("publish")
    .desc("publish packages to npm")
    .opt(Opt.of("projects").flag("p").arg("project(,project)*").desc("comma-separated list of projects to publish"))
    .opt(Opt.of("recursive").flag("r").desc("recursively publish project dependencies"))
    .opt(Opt.of("dry-run").desc("does everything publish would do except actually publishing to the registry"))
    .opt(Opt.of("tag").arg("tag").desc("registers the published package with the given tag"))
    .exec(runPublish);

const cleanCmd: Cmd = Cmd.of("clean")
    .desc("delete generated files")
    .opt(Opt.of("projects").flag("p").arg("project(,project)*").desc("comma-separated list of projects to clean"))
    .exec(runClean);

export const cli = Cmd.of("build")
    .opt(Opt.of("config").flag("c").arg(Arg.of("build.config.js").value("build.config.js").optional(true)).desc("build config script path"))
    .cmd(projectsCmd)
    .cmd(targetsCmd)
    .cmd(compileCmd)
    .cmd(testCmd)
    .cmd(docCmd)
    .cmd(watchCmd)
    .cmd(updateCmd)
    .cmd(publishCmd)
    .cmd(cleanCmd)
    .helpCmd();
