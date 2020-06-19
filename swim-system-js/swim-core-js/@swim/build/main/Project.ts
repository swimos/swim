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

import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

import {OutputSettings, OutputStyle, Unicode} from "@swim/codec";
import {Build} from "./Build";
import {TargetConfig, Target} from "./Target";

export interface ProjectConfig {
  id: string;
  name: string;
  path?: string;
  title?: string;
  readme?: string;
  targets: TargetConfig[];
  devel?: boolean;
  tests?: string;
  cleanDirs?: string[];
  compilerOptions?: ts.CompilerOptions;
  umbrella?: boolean;
}

export class Project {
  readonly build: Build;

  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly baseDir: string;
  readonly title: string | undefined;
  readonly readme: string | undefined;

  readonly packagePath: string;
  readonly package: any;

  readonly targets: {[name: string]: Target | undefined};
  readonly targetList: Target[];

  readonly devel: boolean;
  readonly tests: string | undefined;
  readonly cleanDirs: string[];

  readonly compilerOptions: ts.CompilerOptions;
  bundleConfig: any;

  readonly umbrella: boolean;

  constructor(build: Build, config: ProjectConfig) {
    this.build = build;

    this.id = config.id;
    this.name = config.name;
    this.path = config.path !== void 0 ? config.path : this.name;
    this.baseDir = path.resolve(this.build.baseDir, this.path);
    this.title = config.title;
    this.readme = config.readme;

    this.packagePath = path.join(this.baseDir, "package.json");
    try {
      this.package = JSON.parse(fs.readFileSync(this.packagePath, "utf8"));
    } catch (error) {
      console.log(this.packagePath);
      throw error;
    }

    this.targets = {};
    this.targetList = [];

    this.devel = !!config.devel;
    this.tests = config.tests;
    this.cleanDirs = config.cleanDirs || ["dist", "doc", "lib"];

    this.compilerOptions = config.compilerOptions || this.build.compilerOptions;
    this.bundleConfig = {};

    this.umbrella = config.umbrella || false;
  }

  initTargets(config: ProjectConfig): void {
    for (let i = 0; i < config.targets.length; i += 1) {
      const targetConfig = config.targets[i];
      const target = new Target(this, targetConfig);
      this.targets[target.id] = target;
      this.targetList.push(target);
    }
  }

  initDeps(config: ProjectConfig): void {
    for (let i = 0; i < config.targets.length; i += 1) {
      const targetConfig = config.targets[i];
      const target = this.targets[targetConfig.id]!;
      target.initDeps(targetConfig);
    }
  }

  initBundle(): Promise<unknown> {
    const bundleConfigPath = path.join(this.baseDir, "rollup.config.js");
    if (fs.existsSync(bundleConfigPath)) {
      return Build.importScript(bundleConfigPath)
        .then((bundleConfig: any): void => {
          for (let i = 0; i < this.targetList.length; i += 1) {
            const target = this.targetList[i];
            const targetBundleConfig = bundleConfig[target.id];
            if (targetBundleConfig !== void 0) {
              target.initBundle(targetBundleConfig);
            }
          }
          this.bundleConfig = bundleConfig;
          return void 0;
        });
    } else {
      return Promise.resolve(void 0);
    }
  }

  updatePackage(): void {
    const build = this.build;
    const pkg = this.package;
    let modified = false;

    if (build.version !== void 0) {
      if (pkg.version !== build.version) {
        pkg.version = build.version;
        modified = true;
      }
      const deps = pkg.dependencies;
      for (const dep in deps) {
        for (let i = 0; i < this.build.projectList.length; i += 1) {
          const project = this.build.projectList[i];
          if (project.name === dep && deps[dep] !== build.version) {
            deps[dep] = build.version;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(this.packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    }
  }

  publish(options?: {tag?: string, "dry-run"?: boolean}): Promise<unknown> {
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("publishing");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.id);
    OutputStyle.reset(output);
    console.log(output.bind());

    return new Promise((resolve, reject): void => {
      const command = "npm";
      const args = ["publish"];
      if (options !== void 0) {
        if (options.tag !== void 0) {
          args.push("--tag", options.tag);
        }
        if (options["dry-run"]) {
          args.push("--dry-run");
        }
      }
      const output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.gray(output);
      output.write("npm");
      OutputStyle.reset(output);
      for (let i = 0; i < args.length; i += 1) {
        output.write(" ");
        OutputStyle.gray(output);
        output.write(args[i]);
        OutputStyle.reset(output);
      }
      console.log(output.bind());

      const t0 = Date.now();
      const proc = child_process.spawn(command, args, {cwd: this.baseDir, stdio: "inherit"});
      proc.on("exit", (code: number): void => {
        const dt = Date.now() - t0;
        if (code === 0) {
          const output = Unicode.stringOutput(OutputSettings.styled());
          OutputStyle.greenBold(output);
          output.write("published");
          OutputStyle.reset(output);
          output.write(" ");
          OutputStyle.yellow(output);
          output.write(this.id);
          OutputStyle.reset(output);
          output.write(" in ");
          output.debug(dt);
          output.write("ms");
          console.log(output.bind());
          console.log();
          resolve();
        } else {
          const output = Unicode.stringOutput(OutputSettings.styled());
          OutputStyle.redBold(output);
          output.write("failed to publish");
          OutputStyle.reset(output);
          output.write(" ");
          OutputStyle.yellow(output);
          output.write(this.id);
          OutputStyle.reset(output);
          console.log(output.bind());
          console.log();
          reject(code);
        }
      });
    });
  }

  clean(): void {
    this.cleanTargets();
    for (let i = 0; i < this.cleanDirs.length; i += 1) {
      const cleanDir = path.resolve(this.baseDir, this.cleanDirs[i]);
      const output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.greenBold(output);
      output.write("deleting");
      OutputStyle.reset(output);
      output.write(" ");
      output.write(cleanDir);
      console.log(output.bind());
      Project.rmdir(cleanDir);
    }
  }

  cleanTargets(): void {
    for (let i = 0; i < this.targetList.length; i += 1) {
      const target = this.targetList[i];
      target.clean();
    }
  }

  private static rmdir(dir: string): void {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((fileName) => {
        const file = path.join(dir, fileName);
        if (fs.lstatSync(file).isDirectory()) {
          Project.rmdir(file);
        } else {
          fs.unlinkSync(file);
        }
      });
      fs.rmdirSync(dir);
    }
  }
}
