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

import * as Path from "path";
import type {Class} from "@swim/util";
import type {Dictionary} from "@swim/util";
import type {MutableDictionary} from "@swim/util";
import type {Observes} from "@swim/util";
import {OutputSettings} from "@swim/codec";
import {OutputStyle} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import {ComponentSet} from "@swim/component";
import {Scope} from "./"; // forward import
import {TaskStatus} from "./"; // forward import
import type {TaskConfig} from "./Task";
import {PackageScope} from "./"; // forward import
import {LibraryScope} from "./"; // forward import

/** @public */
export interface WorkspaceObserver<S extends Workspace = Workspace> extends ServiceObserver<S> {
  serviceWillAttachPackage?(packageScope: PackageScope, service: S): void;

  serviceDidAttachPackage?(packageScope: PackageScope, service: S): void;

  serviceWillDetachPackage?(packageScope: PackageScope, service: S): void;

  serviceDidDetachPackage?(packageScope: PackageScope, service: S): void;

  serviceWillAttachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceDidAttachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceWillDetachLibrary?(libraryScope: LibraryScope, service: S): void;

  serviceDidDetachLibrary?(libraryScope: LibraryScope, service: S): void;

  servicePackageDidChange?(packageScope: PackageScope, service: S): void;

  serviceLibraryDidChange?(libraryScope: LibraryScope, service: S): void;
}

/** @public */
export class Workspace extends Service {
  constructor() {
    super();
    this.packageNameMap = {};
    this.unscopedPackageNameMap = {};
    this.libraryPathMap = {};
  }

  declare readonly observerType?: Class<WorkspaceObserver>;

  @ComponentSet({
    get componentType(): typeof PackageScope {
      return PackageScope;
    },
    observes: true,
    initComponent(packageScope: PackageScope): void {
      const packageNameMap = this.owner.packageNameMap as MutableDictionary<PackageScope>;
      const unscopedPackageNameMap = this.owner.unscopedPackageNameMap as MutableDictionary<PackageScope>;
      packageNameMap[packageScope.name] = packageScope;
      if (packageScope.unscopedName !== void 0) {
        unscopedPackageNameMap[packageScope.unscopedName] = packageScope;
      }
    },
    willAttachComponent(packageScope: PackageScope): void {
      this.owner.callObservers("serviceWillAttachPackage", packageScope, this.owner);
    },
    didAttachComponent(packageScope: PackageScope): void {
      this.owner.callObservers("serviceDidAttachPackage", packageScope, this.owner);
    },
    deinitComponent(packageScope: PackageScope): void {
      const packageNameMap = this.owner.packageNameMap as MutableDictionary<PackageScope>;
      const unscopedPackageNameMap = this.owner.unscopedPackageNameMap as MutableDictionary<PackageScope>;
      if (packageNameMap[packageScope.name] === packageScope) {
        if (packageScope.unscopedName !== void 0 && unscopedPackageNameMap[packageScope.unscopedName] === packageScope) {
          delete unscopedPackageNameMap[packageScope.unscopedName];
        }
        delete packageNameMap[packageScope.name];
      }
    },
    willDetachComponent(packageScope: PackageScope): void {
      this.owner.callObservers("serviceWillDetachPackage", packageScope, this.owner);
    },
    didDetachComponent(packageScope: PackageScope): void {
      this.owner.callObservers("serviceDidDetachPackage", packageScope, this.owner);
    },
    packageDidChange(packageScope: PackageScope): void {
      this.owner.callObservers("servicePackageDidChange", packageScope, this.owner);
    },
    packageLibraryDidChange(libraryScope: LibraryScope): void {
      this.owner.callObservers("serviceLibraryDidChange", libraryScope, this.owner);
    },
  })
  readonly packages!: ComponentSet<this, PackageScope> & Observes<PackageScope>;

  readonly packageNameMap: Dictionary<PackageScope>;

  readonly unscopedPackageNameMap: Dictionary<PackageScope>;

  @ComponentSet({
    get componentType(): typeof LibraryScope {
      return LibraryScope;
    },
    initComponent(libraryScope: LibraryScope): void {
      const libraries = this.owner.libraryPathMap as MutableDictionary<LibraryScope>;
      const libraryDir = libraryScope.baseDir.value;
      if (libraryDir !== void 0) {
        libraries[libraryDir] = libraryScope;
      }
    },
    willAttachComponent(libraryScope: LibraryScope): void {
      this.owner.callObservers("serviceWillAttachLibrary", libraryScope, this.owner);
    },
    didAttachComponent(libraryScope: LibraryScope): void {
      this.owner.callObservers("serviceDidAttachLibrary", libraryScope, this.owner);
    },
    deinitComponent(libraryScope: LibraryScope): void {
      const libraries = this.owner.libraryPathMap as MutableDictionary<LibraryScope>;
      const libraryDir = libraryScope.baseDir.value;
      if (libraryDir !== void 0 && libraries[libraryDir] === libraryScope) {
        delete libraries[libraryDir];
      }
    },
    willDetachComponent(libraryScope: LibraryScope): void {
      this.owner.callObservers("serviceWillDetachLibrary", libraryScope, this.owner);
    },
    didDetachComponent(libraryScope: LibraryScope): void {
      this.owner.callObservers("serviceDidDetachLibrary", libraryScope, this.owner);
    },
  })
  readonly libraries!: ComponentSet<this, LibraryScope>;

  readonly libraryPathMap: Dictionary<LibraryScope>;

  getLibrary(libraryDir: string): LibraryScope | null {
    const libraryScope = this.libraryPathMap[libraryDir];
    return libraryScope !== void 0 ? libraryScope : null;
  }

  getDependencies(packageNames: string[] | string | undefined): MutableDictionary<PackageScope>;
  /** @internal */
  getDependencies(packageNames: string[] | string | undefined, packages: MutableDictionary<PackageScope>): MutableDictionary<PackageScope>;
  getDependencies(packageNames: string[] | string | undefined, packages?: MutableDictionary<PackageScope>): MutableDictionary<PackageScope> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    if (packages === void 0) {
      packages = {};
    }
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        packages = packageScope.getDependencies(packages);
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
    return packages;
  }

  getDependents(packageNames: string[] | string | undefined): MutableDictionary<PackageScope>;
  /** @internal */
  getDependents(packageNames: string[] | string | undefined, packages: MutableDictionary<PackageScope>): MutableDictionary<PackageScope>;
  getDependents(packageNames: string[] | string | undefined, packages?: MutableDictionary<PackageScope>): MutableDictionary<PackageScope> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    if (packages === void 0) {
      packages = {};
    }
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        packages = packageScope.getDependents(packages);
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
    return packages;
  }

  async forEachPackage(packageNames: string[] | string | undefined, callback: (packageScope: PackageScope) => Promise<void> | void): Promise<void>;
  async forEachPackage<S>(packageNames: string[] | string | undefined, callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S): Promise<void>;
  async forEachPackage<S>(packageNames: string[] | string | undefined, callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S): Promise<void> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        const result = callback.call(thisArg as S, packageScope);
        if (result !== void 0) {
          await result;
        }
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
  }

  async forEachPackageDependency(packageNames: string[] | string | undefined, callback: (packageScope: PackageScope) => Promise<void> | void): Promise<void>;
  async forEachPackageDependency<S>(packageNames: string[] | string | undefined, callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S, packages?: MutableDictionary<PackageScope>): Promise<void>;
  async forEachPackageDependency<S>(packageNames: string[] | string | undefined, callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S, packages?: MutableDictionary<PackageScope>): Promise<void> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    if (packages === void 0) {
      packages = {};
    }
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        await packageScope.forEachDependency(callback, thisArg, packages);
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
  }

  async runPackageTasks(taskConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[] | string): Promise<TaskStatus> {
    let runStatus = TaskStatus.Skipped;
    await this.forEachPackage(packageNames, async function (packageScope: PackageScope): Promise<void> {
      const taskStatus = await packageScope.runTasks(taskConfigs);
      if (taskStatus > runStatus) {
        runStatus = taskStatus;
      }
    }, this);
    return runStatus;
  }

  async runPackageDependencyTasks(taskConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[] | string): Promise<TaskStatus> {
    let runStatus = TaskStatus.Skipped;
    await this.forEachPackageDependency(packageNames, async function (packageScope: PackageScope): Promise<void> {
      const taskStatus = await packageScope.runTasks(taskConfigs);
      if (taskStatus > runStatus) {
        runStatus = taskStatus;
      }
    }, this);
    return runStatus;
  }

  async runPackageLibraryTasks(taskConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[] | string, libraryNames?: string[] | string): Promise<TaskStatus> {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    let runStatus = TaskStatus.Skipped;
    await this.forEachPackage(packageNames, async function (packageScope: PackageScope): Promise<void> {
      const taskStatus = await packageScope.runLibraryTasks(taskConfigs, libraryNames);
      if (taskStatus > runStatus) {
        runStatus = taskStatus;
      }
    }, this);
    return runStatus;
  }

  async runPackageLibraryDependencyTasks(taskConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[] | string, libraryNames?: string[] | string): Promise<TaskStatus> {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    let runStatus = TaskStatus.Skipped;
    await this.forEachPackageDependency(packageNames, async function (packageScope: PackageScope): Promise<void> {
      const taskStatus = await packageScope.runLibraryTasks(taskConfigs, libraryNames);
      if (taskStatus > runStatus) {
        runStatus = taskStatus;
      }
    }, this);
    return runStatus;
  }

  printPackages(): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.cyanBold(output);
    output = output.write("packages");
    output = OutputStyle.reset(output);
    console.log(output.bind());

    const packages = this.packageNameMap;
    for (const packageName in packages) {
      output = Unicode.stringOutput(OutputSettings.styled());
      output = output.write(" - ");
      output = OutputStyle.yellow(output);
      output = output.write(packageName);
      output = OutputStyle.reset(output);
      console.log(output.bind());
    }
  }

  getPackageVersions(packageNames: string[] | string | undefined, version?: string, tag?: string, snapshot?: string | boolean): MutableDictionary<string>;
  /** @internal */
  getPackageVersions(packageNames: string[] | string | undefined, version: string | undefined, tag: string | undefined, snapshot: string | boolean): MutableDictionary<string>;
  getPackageVersions(packageNames: string[] | string | undefined, version?: string, tag?: string, snapshot?: string | boolean): MutableDictionary<string> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    const packages: MutableDictionary<string> = {};
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        packages[packageScope.name] = packageScope.getVersion(version, tag, snapshot);
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
    return packages;
  }

  getPackageDependencyVersions(packageNames: string[] | string | undefined, version?: string, tag?: string, snapshot?: string | boolean): MutableDictionary<string>;
  /** @internal */
  getPackageDependencyVersions(packageNames: string[] | string | undefined, version: string | undefined, tag: string | undefined, snapshot: string | boolean): MutableDictionary<string>;
  getPackageDependencyVersions(packageNames: string[] | string | undefined, version?: string, tag?: string, snapshot?: string | boolean): MutableDictionary<string> {
    if (packageNames === void 0) {
      packageNames = Object.keys(this.packageNameMap);
    } else if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    let packageVersions: MutableDictionary<string> = {};
    for (let i = 0; i < packageNames.length; i += 1) {
      const packageName = packageNames[i]!;
      let packageScope = this.packageNameMap[packageName];
      if (packageScope === void 0) {
        packageScope = this.unscopedPackageNameMap[packageName];
      }
      if (packageScope !== void 0) {
        packageVersions = packageScope.getDependencyVersions(version, tag, snapshot, packageVersions);
      } else {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.redBold(output);
        output = output.write("unknown package");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.bold(output);
        output = output.write(packageName!);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      }
    }
    return packageVersions;
  }

  static async load(path: string): Promise<Workspace | null> {
    const baseDir = Path.resolve(process.cwd(), path);
    const packageScope = await Scope.load(baseDir);
    if (packageScope === null) {
      return null;
    }
    packageScope.mount();
    return packageScope.workspace.service;
  }
}
