// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Class, Dictionary, MutableDictionary} from "@swim/util";
import {MemberFastenerClass, Provider, Component, ComponentRef, ComponentSet} from "@swim/component";
import {FileRef} from "@swim/sys";
import type {Workspace} from "../workspace/Workspace";
import {Scope} from "../scope/Scope";
import {TaskStatus, TaskConfig, Task} from "../task/Task";
import {PackageTask} from "./PackageTask";
import {DepsTask} from "./DepsTask";
import {LibsTask} from "./LibsTask";
import {TestTask} from "./TestTask";
import {DocTask} from "./DocTask";
import {VersionTask} from "./VersionTask";
import {PublishTask} from "./PublishTask";
import {CleanTask} from "./CleanTask";
import type {PackageScopeObserver} from "./PackageScopeObserver";
import {LibraryScope} from "../"; // forward import

/** @public */
export interface PackageConfig {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: Dictionary<string>;
  readonly optionalDependencies?: Dictionary<string>;
  readonly peerDependencies?: Dictionary<string>;
  readonly devDependencies?: Dictionary<string>;
  readonly scripts?: Dictionary<string>,
}

/** @public */
export class PackageScope extends Scope {
  constructor(name: string) {
    super();
    this.name = name;
    this.unscopedName = PackageScope.unscopedName(name);
  }

  override readonly observerType?: Class<PackageScopeObserver>;

  override readonly name: string;

  readonly unscopedName: string | undefined;

  /** @internal */
  setName(name: string): void {
    (this as Mutable<this>).name = name;
    (this as Mutable<this>).unscopedName = PackageScope.unscopedName(name);
  }

  @FileRef<PackageScope, PackageConfig | null>({
    fileName: "package.json",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
  })
  readonly package!: FileRef<this, PackageConfig | null>;
  static readonly package: MemberFastenerClass<PackageScope, "package">;

  @ComponentSet<PackageScope, LibraryScope>({
    // avoid cyclic static reference to type: LibraryScope
    binds: true,
    observes: true,
    libraryDidChange(libraryScope: LibraryScope): void {
      this.owner.callObservers("packageLibraryDidChange", libraryScope, this.owner);
      this.owner.callObservers("packageDidChange", this.owner);
    },
    detectComponent(component: Component): LibraryScope | null {
      return component instanceof LibraryScope ? component : null;
    },
  })
  readonly libraries!: ComponentSet<this, LibraryScope>;
  static readonly libraries: MemberFastenerClass<PackageScope, "libraries">;

  @ComponentSet<PackageScope, PackageScope>({
    type: PackageScope,
    observes: true,
    didAttachComponent(dependencyScope: PackageScope): void {
      dependencyScope.dependents.addComponent(this.owner);
    },
    willDetachComponent(dependencyScope: PackageScope): void {
      dependencyScope.dependents.removeComponent(this.owner);
    },
    packageDidChange(dependencyScope: PackageScope): void {
      this.owner.callObservers("packageDependencyDidChange", dependencyScope, this.owner);
    },
  })
  readonly dependencies!: ComponentSet<this, PackageScope>;
  static readonly dependencies: MemberFastenerClass<PackageScope, "dependencies">;

  protected detectDependency(packageScope: PackageScope): void {
    const packageDependencies = this.package.value !== null ? this.package.value.dependencies : void 0;
    if (packageDependencies !== void 0 && packageScope.name in packageDependencies) {
      this.dependencies.addComponent(packageScope);
    }
  }

  @ComponentSet<PackageScope, PackageScope>({
    type: PackageScope,
  })
  readonly dependents!: ComponentSet<this, PackageScope>;
  static readonly dependents: MemberFastenerClass<PackageScope, "dependents">;

  @Provider<PackageScope, Workspace>({
    extends: true,
    observes: true,
    didAttachService(service: Workspace): void {
      const packages = service.packageNameMap;
      for (const packageName in packages) {
        const packageScope = packages[packageName]!;
        this.owner.detectDependency(packageScope);
      }
    },
    workspaceDidAttachPackage(packageScope: PackageScope): void {
      this.owner.detectDependency(packageScope);
    },
  })
  override readonly workspace!: Provider<this, Workspace>;
  static override readonly workspace: MemberFastenerClass<PackageScope, "workspace">;

  @ComponentRef<PackageScope, DepsTask>({
    type: DepsTask,
  })
  readonly deps!: ComponentRef<this, DepsTask>;
  static readonly deps: MemberFastenerClass<PackageScope, "deps">;

  @ComponentRef<PackageScope, LibsTask>({
    type: LibsTask,
  })
  readonly libs!: ComponentRef<this, LibsTask>;
  static readonly libs: MemberFastenerClass<PackageScope, "libs">;

  @ComponentRef<PackageScope, TestTask>({
    type: TestTask,
  })
  readonly test!: ComponentRef<this, TestTask>;
  static readonly test: MemberFastenerClass<PackageScope, "test">;

  @ComponentRef<PackageScope, DocTask>({
    type: DocTask,
  })
  readonly doc!: ComponentRef<this, DocTask>;
  static readonly doc: MemberFastenerClass<PackageScope, "doc">;

  @ComponentRef<PackageScope, VersionTask>({
    type: VersionTask,
  })
  readonly version!: ComponentRef<this, VersionTask>;
  static readonly version: MemberFastenerClass<PackageScope, "version">;

  @ComponentRef<PackageScope, PublishTask>({
    type: PublishTask,
  })
  readonly publish!: ComponentRef<this, PublishTask>;
  static readonly publish: MemberFastenerClass<PackageScope, "publish">;

  @ComponentRef<PackageScope, CleanTask>({
    type: CleanTask,
  })
  readonly clean!: ComponentRef<this, CleanTask>;
  static readonly clean: MemberFastenerClass<PackageScope, "clean">;

  getLibraries(libraryNames?: string[] | string): MutableDictionary<LibraryScope> | null {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    let libs: MutableDictionary<LibraryScope> | null = null;
    const libraries = this.libraries.components;
    for (const componentId in libraries) {
      const libraryScope = libraries[componentId]!;
      if (libraryNames === void 0 || libraryNames.includes(libraryScope.name)) {
        if (libs === null) {
          libs = {};
        }
        libs[libraryScope.name] = libraryScope;
      }
    }
    return libs;
  }

  async forEachLibrary(libraryNames: string[] | string | undefined, callback: (libraryScope: LibraryScope) => Promise<void> | void): Promise<void>;
  async forEachLibrary<S>(libraryNames: string[] | string | undefined, callback: (this: S, libraryScope: LibraryScope) => Promise<void> | void, thisArg?: S): Promise<void>;
  async forEachLibrary<S>(libraryNames: string[] | string | undefined, callback: (this: S, libraryScope: LibraryScope) => Promise<void> | void, thisArg?: S): Promise<void> {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    const libraries = this.libraries.components;
    for (const componentId in libraries) {
      const libraryScope = libraries[componentId]!;
      if (libraryNames === void 0 || libraryNames.includes(libraryScope.name)) {
        const result = callback.call(thisArg as S, libraryScope);
        if (result !== void 0) {
          await result;
        }
      }
    }
  }

  getDependencies(): MutableDictionary<PackageScope>;
  /** @internal */
  getDependencies(packages: MutableDictionary<PackageScope>): MutableDictionary<PackageScope>;
  getDependencies(packages?: MutableDictionary<PackageScope>): MutableDictionary<PackageScope> {
    let dependent: boolean;
    if (packages === void 0) {
      packages = {};
      dependent = false;
    } else {
      dependent = true;
    }
    const dependencies = this.dependencies.components;
    for (const componentId in dependencies) {
      const dependency = dependencies[componentId]!;
      packages = dependency.getDependencies(packages);
    }
    if (dependent && packages[this.name] === void 0) {
      packages[this.name] = this;
    }
    return packages;
  }

  async forEachDependency(callback: (packageScope: PackageScope) => Promise<void> | void): Promise<void>;
  async forEachDependency<S>(callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S, packages?: MutableDictionary<PackageScope>): Promise<void>;
  async forEachDependency<S>(callback: (this: S, packageScope: PackageScope) => Promise<void> | void, thisArg?: S, packages?: MutableDictionary<PackageScope>): Promise<void> {
    if (packages === void 0) {
      packages = {};
    }
    const dependencies = this.dependencies.components;
    for (const componentId in dependencies) {
      const dependency = dependencies[componentId]!;
      await dependency.forEachDependency(callback, thisArg, packages);
    }
    if (packages[this.name] === void 0) {
      packages[this.name] = this;
      const result = callback.call(thisArg as S, this);
      if (result !== void 0) {
        await result;
      }
    }
  }

  getDependents(): MutableDictionary<PackageScope>;
  /** @internal */
  getDependents(packages: MutableDictionary<PackageScope>): MutableDictionary<PackageScope>;
  getDependents(packages?: MutableDictionary<PackageScope>): MutableDictionary<PackageScope> {
    let dependent: boolean;
    if (packages === void 0) {
      packages = {};
      dependent = false;
    } else {
      dependent = true;
    }
    if (dependent && packages[this.name] === void 0) {
      packages[this.name] = this;
    }
    const dependents = this.dependents.components;
    for (const componentId in dependents) {
      const dependent = dependents[componentId]!;
      packages = dependent.getDependents(packages);
    }
    return packages;
  }

  override async runTask(taskConfig: TaskConfig): Promise<TaskStatus> {
    const task = this.getTask(taskConfig.class);
    if (task instanceof PackageTask) {
      return task.run(taskConfig.options);
    } else {
      return TaskStatus.Skipped;
    }
  }

  async runLibraryTasks(taskConfigs: TaskConfig | readonly TaskConfig[], libraryNames?: string[] | string): Promise<void> {
    await this.forEachLibrary(libraryNames, function (libraryScope: LibraryScope): Promise<void> {
      return libraryScope.runTasks(taskConfigs) as unknown as Promise<void>;
    }, this);
    await this.runTasks(taskConfigs);
  }

  libraryTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>): TaskStatus;
  /** @internal */
  libraryTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>, taskStatus: TaskStatus): TaskStatus;
  libraryTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>, taskStatus?: TaskStatus): TaskStatus {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    if (taskStatus === void 0) {
      taskStatus = TaskStatus.Success;
    }
    const libraries = this.libraries.components;
    for (const componentId in libraries) {
      const libraryScope = libraries[componentId]!;
      if (libraryNames === void 0 || libraryNames.includes(libraryScope.name)) {
        const libraryTask = libraryScope.getTask(taskClass);
        if (libraryTask !== null) {
          const libraryTaskStatus = libraryTask.status.value;
          if (libraryTaskStatus > taskStatus) {
            taskStatus = libraryTaskStatus;
          }
        }
      }
    }
    return taskStatus;
  }

  dependencyTaskStatus(taskClass: Class<Task>): TaskStatus;
  /** @internal */
  dependencyTaskStatus(taskClass: Class<Task>, taskStatus: TaskStatus, packages: MutableDictionary<PackageScope>): TaskStatus;
  dependencyTaskStatus(taskClass: Class<Task>, taskStatus?: TaskStatus, packages?: MutableDictionary<PackageScope>): TaskStatus {
    if (taskStatus === void 0) {
      taskStatus = TaskStatus.Success;
    }
    if (packages === void 0) {
      packages = {};
    }
    const dependencies = this.dependencies.components;
    for (const componentId in dependencies) {
      const dependency = dependencies[componentId]!;
      taskStatus = dependency.dependencyTaskStatus(taskClass, taskStatus, packages);
    }
    if (packages[this.name] === void 0) {
      packages[this.name] = this;
      const dependencyTask = this.getTask(taskClass);
      if (dependencyTask !== null) {
        const dependencyTaskStatus = dependencyTask.status.value;
        if (dependencyTaskStatus > taskStatus) {
          taskStatus = dependencyTaskStatus;
        }
      }
    }
    return taskStatus;
  }

  libraryDependencyTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>): TaskStatus;
  /** @internal */
  libraryDependencyTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>, taskStatus: TaskStatus, packages: MutableDictionary<PackageScope>): TaskStatus;
  libraryDependencyTaskStatus(libraryNames: string[] | string | undefined, taskClass: Class<Task>, taskStatus?: TaskStatus, packages?: MutableDictionary<PackageScope>): TaskStatus {
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    if (taskStatus === void 0) {
      taskStatus = TaskStatus.Success;
    }
    if (packages === void 0) {
      packages = {};
    }
    const dependencies = this.dependencies.components;
    for (const componentId in dependencies) {
      const dependency = dependencies[componentId]!;
      taskStatus = dependency.libraryDependencyTaskStatus(libraryNames, taskClass, taskStatus, packages);
    }
    if (packages[this.name] === void 0) {
      packages[this.name] = this;
      taskStatus = this.libraryTaskStatus(libraryNames, taskClass, taskStatus);
    }
    return taskStatus;
  }

  getVersion(newSemanticVersion?: string, tag?: string, snapshot?: string | boolean): string | undefined {
    let oldVersion: string | undefined;
    let oldSemanticVersion: string | undefined;
    let oldSnapshotVersion: string | undefined;
    let oldSnapshotTag: string | undefined;
    let oldSnapshotUid: string | undefined;
    let oldSnapshotDate: string | undefined;
    let oldSnapshotInc: string | undefined;
    let newVersion: string | undefined;
    let newSnapshotVersion: string | undefined;
    let newSnapshotTag: string | undefined;
    let newSnapshotUid: string | undefined;
    let newSnapshotDate: string | undefined;
    let newSnapshotInc: string | undefined;

    if (oldVersion === void 0 && this.package.value !== null) {
      oldVersion = this.package.value.version;
    }

    if (oldVersion !== void 0) {
      const snapshotIndex = oldVersion.lastIndexOf("-");
      if (snapshotIndex >= 0) {
        oldSemanticVersion = oldVersion.substr(0, snapshotIndex);
        oldSnapshotVersion = oldVersion.substr(snapshotIndex + 1);
        const uidIndex = oldSnapshotVersion.indexOf(".");
        if (uidIndex >= 0) {
          oldSnapshotTag = oldSnapshotVersion.substr(0, uidIndex);
          oldSnapshotUid = oldSnapshotVersion.substr(uidIndex + 1);
          if (isFinite(+oldSnapshotTag)) {
            oldSnapshotUid = oldSnapshotTag;
            oldSnapshotTag = void 0;
          }
        } else if (!isFinite(+oldSnapshotVersion)) {
          oldSnapshotTag = oldSnapshotVersion;
        } else {
          oldSnapshotUid = oldSnapshotVersion;
        }
        if (oldSnapshotUid !== void 0) {
          const incIndex = oldSnapshotUid.lastIndexOf(".");
          if (incIndex >= 0) {
            oldSnapshotDate = oldSnapshotUid.substr(0, incIndex);
            oldSnapshotInc = oldSnapshotUid.substr(incIndex + 1);
          } else {
            oldSnapshotDate = oldSnapshotUid;
          }
        }
      } else {
        oldSemanticVersion = oldVersion;
      }
      if (newSemanticVersion === void 0) {
        newSemanticVersion = oldSemanticVersion;
      }

      newVersion = newSemanticVersion;

      if (tag !== void 0 || typeof snapshot === "string" || snapshot === true) {
        if (typeof snapshot === "string") {
          newSnapshotDate = snapshot;
        } else {
          const today = new Date();
          const year = "" + today.getUTCFullYear();
          let month = "" + (today.getUTCMonth() + 1);
          while (month.length < 2) month = "0" + month;
          let day = "" + today.getUTCDate();
          while (day.length < 2) day = "0" + day;
          newSnapshotDate = year + month + day;
        }

        newSnapshotTag = tag !== void 0 ? tag : oldSnapshotTag;

        if (newSemanticVersion === oldSemanticVersion && newSnapshotTag === oldSnapshotTag && newSnapshotDate === oldSnapshotDate) {
          if (isFinite(+(oldSnapshotInc as any))) {
            newSnapshotInc = "" + (+(oldSnapshotInc as any) + 1);
          } else {
            newSnapshotInc = "1";
          }
        }

        newSnapshotUid = newSnapshotDate;
        if (newSnapshotInc !== void 0) {
          newSnapshotUid += "." + newSnapshotInc;
        }

        if (newSnapshotTag !== void 0) {
          newSnapshotVersion = newSnapshotTag;
          if (typeof snapshot === "string" || snapshot === true) {
            newSnapshotVersion += "." + newSnapshotUid;
          }
        } else {
          newSnapshotVersion = newSnapshotUid;
        }

        newVersion += "-" + newSnapshotVersion;
      }
    }

    return newVersion;
  }

  getDependencyVersions(version?: string, tag?: string, snapshot?: string | boolean): MutableDictionary<string>;
  /** @internal */
  getDependencyVersions(version: string | undefined, tag: string | undefined, snapshot: string | boolean | undefined, packageVersions: MutableDictionary<string>): MutableDictionary<string>;
  getDependencyVersions(version?: string, tag?: string, snapshot?: string | boolean, packageVersions?: MutableDictionary<string>): MutableDictionary<string> {
    if (packageVersions === void 0) {
      packageVersions = {};
    }
    const dependencies = this.dependencies.components;
    for (const componentId in dependencies) {
      const dependency = dependencies[componentId]!;
      packageVersions = dependency.getDependencyVersions(version, tag, snapshot, packageVersions);
    }
    if (!(this.name in packageVersions)) {
      packageVersions[this.name] = this.getVersion(version, tag, snapshot);
    }
    return packageVersions;
  }

  /** @internal */
  async initChildren(): Promise<void> {
    const libraryScope = await LibraryScope.load(this.baseDir.value!);
    if (libraryScope !== null) {
      await this.initLibraryScope(libraryScope);
    }
  }

  /** @internal */
  async initLibraryScope(libraryScope: LibraryScope): Promise<void> {
    const compileTask = libraryScope.compile.getComponent();
    const tsconfig = await compileTask.tsconfig.getOrLoadIfExists(null);
    if (tsconfig !== null) {
      if (tsconfig.fileNames.length !== 0) {
        this.appendChild(libraryScope, libraryScope.name);
      }
      const projectReferences = tsconfig.projectReferences;
      if (projectReferences !== void 0) {
        for (let i = 0; i < projectReferences.length; i += 1) {
          const projectReference = projectReferences[i]!;
          if (!projectReference.circular) {
            const packageDir = projectReference.path;
            const packageScope = await Scope.load(packageDir);
            if (packageScope !== null) {
              this.appendChild(packageScope, packageScope.name);
            }
          }
        }
      }
    }
  }

  static override async load(baseDir: string): Promise<PackageScope | null> {
    const packageScope = new PackageScope("");
    packageScope.baseDir.setValue(baseDir);
    const packageConfig = await packageScope.package.loadIfExists(void 0, null);
    if (packageConfig !== null) {
      packageScope.setName(packageConfig.name);
      packageScope.deps.insertComponent();
      packageScope.libs.insertComponent();
      packageScope.test.insertComponent();
      packageScope.doc.insertComponent();
      packageScope.version.insertComponent();
      packageScope.publish.insertComponent();
      packageScope.clean.insertComponent();
      await packageScope.initChildren();
      return packageScope;
    }
    return null;
  }

  /** @internal */
  static unscopedName(name: string): string | undefined {
    let index: number;
    if (name.charCodeAt(0) === 64/*'@'*/ && (index = name.lastIndexOf("/"), index >= 0)) {
      return name.substr(index + 1);
    }
    return void 0;
  }
}
