// Copyright 2015-2024 Nstream, inc.
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

import type {Dictionary} from "@swim/util";
import {Arg} from "@swim/args";
import {Opt} from "@swim/args";
import {Cmd} from "@swim/args";
import {Workspace} from "@swim/build";
import {TaskStatus} from "@swim/build";
import type {TaskConfig} from "@swim/build";
import {DepsTask} from "@swim/build";
import {LibsTask} from "@swim/build";
import {CleanTask} from "@swim/build";
import {TestTask} from "@swim/build";
import {DocTask} from "@swim/build";
import {VersionTask} from "@swim/build";
import {PublishTask} from "@swim/build";
import {BuildTask} from "@swim/build";
import {WatchTask} from "@swim/build";
import {WatcherScope} from "@swim/build";

const pkgsCmd: Cmd = Cmd.create("pkgs")
  .withHelpCmd()
  .withDesc("list workspace packages")
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      workspace.printPackages();
    }
  });

const depsCmd: Cmd = Cmd.create("deps")
  .withHelpCmd()
  .withDesc("list transitive workspace package dependencies")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const depsConfig = DepsTask.config();
      const runStatus = await workspace.runPackageTasks(depsConfig, args.pkgs);
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const libsCmd: Cmd = Cmd.create("libs")
  .withHelpCmd()
  .withDesc("list buildable libraries")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const libsConfig = LibsTask.config();
      const runStatus = await workspace.runPackageTasks(libsConfig, args.pkgs);
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const testCmd = Cmd.create("test")
  .withHelpCmd()
  .withDesc("run unit tests")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("deps").withFlag("r").withDesc("test transitive dependencies"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const testConfig = TestTask.config();
      let runStatus: TaskStatus;
      if ("deps" in args) {
        runStatus = await workspace.runPackageDependencyTasks(testConfig, args.pkgs);
      } else {
        runStatus = await workspace.runPackageTasks(testConfig, args.pkgs);
      }
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const docCmd = Cmd.create("doc")
  .withHelpCmd()
  .withDesc("generate API documentation")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("deps").withFlag("r").withDesc("document transitive dependencies"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const docConfig = DocTask.config();
      let runStatus: TaskStatus;
      if ("deps" in args) {
        runStatus = await workspace.runPackageDependencyTasks(docConfig, args.pkgs);
      } else {
        runStatus = await workspace.runPackageTasks(docConfig, args.pkgs);
      }
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const watchCmd = Cmd.create("watch")
  .withHelpCmd()
  .withDesc("continuously rebuild sources on change")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("libs").withFlag("l").withArg("lib(,lib)*").withDesc("comma-separated list of library targets"))
  .withOpt(Opt.create("test").withFlag("t").withDesc("run unit tests after successful build"))
  .withOpt(Opt.create("force").withFlag("f").withDesc("unconditionally run all build steps"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const buildConfigs: TaskConfig[] = [];
      buildConfigs.push(BuildTask.config({
        force: "force" in args,
      }));
      if ("test" in args) {
        buildConfigs.push(TestTask.config());
      }
      const watchConfig = WatchTask.config();
      await WatcherScope.watch(watchConfig, buildConfigs, args.pkgs, args.libs);
    }
  });

const versionCmd: Cmd = Cmd.create("version")
  .withDesc("update local package versions")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("deps").withFlag("r").withDesc("assign updated version to transitive dependencies of selected packages"))
  .withOpt(Opt.create("version").withFlag("v").withArg("version").withDesc("version to assign to selected packages"))
  .withOpt(Opt.create("tag").withFlag("t").withArg("tag").withDesc("version tag"))
  .withOpt(Opt.create("snapshot").withFlag("s").withArg(Arg.create("date").asOptional(true)).withDesc("apply a snapshot version with today's date and, if necessary, a numeric increment"))
  .withOpt(Opt.create("dry-run").withDesc("prints proposed package version changes without modifying any package.json files"))
  .withHelpCmd()
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const version = args.version;
      const tag = args.tag;
      const snapshot = args.snapshot !== void 0 ? args.snapshot : "snapshot" in args;
      let packageVersions: Dictionary<string>;
      if ("deps" in args) {
        packageVersions = workspace.getPackageDependencyVersions(args.pkgs, version, tag, snapshot);
      } else {
        packageVersions = workspace.getPackageVersions(args.pkgs, version, tag, snapshot);
      }
      const versionConfig = VersionTask.config({
        packageVersions: packageVersions,
        dryRun: "dry-run" in args,
      });
      const runStatus = await workspace.runPackageDependencyTasks(versionConfig);
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const publishCmd: Cmd = Cmd.create("publish")
  .withDesc("publish packages to npm")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("deps").withFlag("r").withDesc("publish transitive dependencies"))
  .withOpt(Opt.create("tag").withFlag("t").withArg("tag").withDesc("registers the published package with the given tag"))
  .withOpt(Opt.create("access").withFlag("a").withArg("public|restricted").withDesc("tells the registry whether this package should be published as public or restricted"))
  .withOpt(Opt.create("dry-run").withDesc("does everything publish would do except actually publishing to the registry"))
  .withHelpCmd()
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const publishConfig = PublishTask.config({
        tag: typeof args.tag === "string" ? args.tag : void 0,
        access: typeof args.access === "string" ? args.access : void 0,
        dryRun: "dry-run" in args,
      });
      let runStatus: TaskStatus;
      if ("deps" in args) {
        runStatus = await workspace.runPackageDependencyTasks(publishConfig, args.pkgs);
      } else {
        runStatus = await workspace.runPackageTasks(publishConfig, args.pkgs);
      }
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

const cleanCmd: Cmd = Cmd.create("clean")
  .withHelpCmd()
  .withDesc("remove generated files")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("deps").withFlag("r").withDesc("clean transitive dependencies"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const cleanConfig = CleanTask.config();
      let runStatus: TaskStatus;
      if ("deps" in args) {
        runStatus = await workspace.runPackageDependencyTasks(cleanConfig, args.pkgs);
      } else {
        runStatus = await workspace.runPackageTasks(cleanConfig, args.pkgs);
      }
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });

export const cli = Cmd.create("swim-build")
  .withOpt(Opt.create("workspace").withFlag("w").withArg(Arg.create(".").withValue(".").asOptional(true)).withDesc("workspace directory"))
  .withCmd(pkgsCmd)
  .withCmd(depsCmd)
  .withCmd(libsCmd)
  .withCmd(testCmd)
  .withCmd(docCmd)
  .withCmd(watchCmd)
  .withCmd(versionCmd)
  .withCmd(publishCmd)
  .withCmd(cleanCmd)
  .withHelpCmd()
  .withDesc("compile and bundle sources")
  .withOpt(Opt.create("pkgs").withFlag("p").withArg("pkg(,pkg)*").withDesc("comma-separated list of package names"))
  .withOpt(Opt.create("libs").withFlag("l").withArg("lib(,lib)*").withDesc("comma-separated list of library targets"))
  .withOpt(Opt.create("test").withFlag("t").withDesc("run unit tests after successful build"))
  .withOpt(Opt.create("force").withFlag("f").withDesc("unconditionally run all build steps"))
  .withOpt(Opt.create("no-deps").withDesc("don't build transitive dependencies"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const workspace = await Workspace.load(args.workspace!);
    if (workspace !== null) {
      const buildConfigs: TaskConfig[] = [];
      buildConfigs.push(BuildTask.config({
        force: "force" in args,
      }));
      if ("test" in args) {
        buildConfigs.push(TestTask.config());
      }
      let runStatus: TaskStatus;
      if ("no-deps" in args) {
        runStatus = await workspace.runPackageLibraryTasks(buildConfigs, args.pkgs, args.libs);
      } else {
        runStatus = await workspace.runPackageLibraryDependencyTasks(buildConfigs, args.pkgs, args.libs);
      }
      if (runStatus === TaskStatus.Failure) {
        process.exit(1);
      }
    }
  });
