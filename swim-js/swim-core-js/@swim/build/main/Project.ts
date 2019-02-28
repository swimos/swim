// Copyright 2015-2019 SWIM.AI inc.
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

  readonly packagePath: string;
  readonly package: any;

  readonly targets: {[name: string]: Target};
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
      const target = this.targets[targetConfig.id];
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
            if (targetBundleConfig) {
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

    if (build.version) {
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

  clean(): void {
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
