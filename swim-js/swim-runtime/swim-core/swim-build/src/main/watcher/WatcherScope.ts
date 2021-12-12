// Copyright 2015-2021 Swim.inc
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

import type {Class, MutableDictionary} from "@swim/util";
import {OutputSettings, Output, OutputStyle, Format, Unicode} from "@swim/codec";
import {MemberFastenerClass, Provider, Timer} from "@swim/component";
import type {Workspace} from "../workspace/Workspace";
import {Scope} from "../scope/Scope";
import type {TaskConfig} from "../task/Task";
import type {PackageScope} from "../package/PackageScope";
import type {WatcherScopeObserver} from "./WatcherScopeObserver";

/** @public */
export class WatcherScope extends Scope {
  constructor(buildConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[], libraryNames?: string[]) {
    super();
    this.buildConfigs = buildConfigs;
    this.packageNames = packageNames;
    this.libraryNames = libraryNames;
    this.rebuildPromise = null;
    this.changedPackages = {};
    this.changedPackageCount = 0;
  }

  override readonly observerType?: Class<WatcherScopeObserver>;

  override get name(): string {
    return "watcher";
  }

  readonly buildConfigs: TaskConfig | readonly TaskConfig[];

  readonly packageNames: string[] | undefined;

  readonly libraryNames: string[] | undefined;

  /** @internal */
  rebuildPromise: Promise<void> | null;

  rebuild(): Promise<void> {
    let rebuildPromise = this.rebuildPromise;
    if (rebuildPromise === null) {
      const packageNames = this.getInvalidatedPackages();

      this.changedPackages = {};
      this.changedPackageCount = 0;
      this.buildTimer.cancel();

      const t0 = Date.now();
      this.onRebuildBegin(packageNames);
      const workspace = this.workspace.service;
      rebuildPromise = workspace.runPackageLibraryTasks(this.buildConfigs, packageNames, this.libraryNames);
      rebuildPromise = rebuildPromise.then(this.onRebuildSuccess.bind(this, packageNames, t0), this.onRebuildFailure.bind(this));
      this.rebuildPromise = rebuildPromise;
    }
    return rebuildPromise;
  }

  protected onRebuildBegin(packageNames: string[]): void {
    if (packageNames.length !== 0) {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = OutputStyle.magentaBold(output);
      output = output.write("rebuilding");
      output = OutputStyle.reset(output);
      output = this.writePackageNames(output, packageNames);
      output = output.write(" ");
      output = OutputStyle.gray(output);
      output = output.write("...");
      output = OutputStyle.reset(output);
      console.log(output.bind());
      console.log("");
    }
  }

  protected onRebuildSuccess(packageNames: string[], t0: number): void {
    const dt = Date.now() - t0;
    this.rebuildPromise = null;

    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.magentaBold(output);
    output = output.write("rebuilt");
    output = OutputStyle.reset(output);
    output = this.writePackageNames(output, packageNames);
    output = output.write(" ");
    output = OutputStyle.faint(output);
    output = output.write("in");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.faint(output);
    output = output.write(Format.prefix(dt / 1000) + "s");
    output = OutputStyle.reset(output);
    console.log(output.bind());
    console.log("");

    this.debounceRebuild();
  }

  protected onRebuildFailure(): void {
    this.rebuildPromise = null;

    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("rebuild failed");
    output = OutputStyle.reset(output);
    console.log(output.bind());
    console.log("");
    this.logWatchingForChanges();

    this.debounceRebuild();
  }

  /** @internal */
  changedPackages: MutableDictionary<PackageScope>;

  /** @internal */
  changedPackageCount: number;

  rebuildPackage(packageScope: PackageScope): void {
    if (this.changedPackages[packageScope.name] === void 0) {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = OutputStyle.magentaBold(output);
      output = output.write("modified");
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.bold(output);
      output = output.write(packageScope.name);
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.gray(output);
      output = output.write("...");
      output = OutputStyle.reset(output);
      console.log(output.bind());

      this.changedPackages[packageScope.name] = packageScope;
      this.changedPackageCount += 1;
      this.debounceRebuild();
    }
  }

  debounceRebuild(): void {
    if (this.changedPackageCount !== 0 && this.rebuildPromise === null) {
      this.buildTimer.debounce();
    } else if (this.rebuildPromise === null && !this.buildTimer.scheduled) {
      this.logWatchingForChanges();
    }
  }

  @Timer<WatcherScope>({
    delay: 500,
    fire(): void {
      this.owner.rebuild();
    },
  })
  readonly buildTimer!: Timer<this>;

  getInvalidatedPackages(): string[] {
    const changedPackages = this.changedPackages;
    const changedPackageCount = this.changedPackageCount;
    let changedPackageNames: string[] | undefined;
    if (changedPackageCount !== 0) {
      changedPackageNames = [];
      for (const packageName in changedPackages) {
        changedPackageNames.push(packageName);
      }
    } else {
      changedPackageNames = this.packageNames;
    }

    const workspace = this.workspace.service;
    const dependentPackages = workspace.getDependents(changedPackageNames);
    const selectedPackages = workspace.getDependencies(this.packageNames);

    const invalidatedPackageNames: string[] = [];
    for (const packageName in selectedPackages) {
      if (dependentPackages[packageName] !== void 0) {
        invalidatedPackageNames.push(packageName);
      }
    }
    return invalidatedPackageNames;
  }

  protected writePackageNames<T>(output: Output<T>, packageNames: string[]): Output<T> {
    for (let i = 0, n = packageNames.length; i < n; i += 1) {
      if (i === 0) {
        output = output.write(" ");
      } else if (i !== n - 1) {
        output = OutputStyle.gray(output);
        output = output.write(",");
        output = OutputStyle.reset(output);
        output = output.write(" ");
      } else {
        output = output.write(" ");
        output = OutputStyle.gray(output);
        output = output.write("and");
        output = OutputStyle.reset(output);
        output = output.write(" ");
      }
      output = OutputStyle.bold(output);
      output = output.write(packageNames[i]!);
      output = OutputStyle.reset(output);
    }
    return output;
  }

  build(): Promise<void> {
    let rebuildPromise = this.rebuildPromise;
    if (rebuildPromise === null) {
      const workspace = this.workspace.service;
      rebuildPromise = workspace.runPackageLibraryDependencyTasks(this.buildConfigs, this.packageNames, this.libraryNames);
      rebuildPromise = rebuildPromise.then(this.onBuildSuccess.bind(this), this.onBuildFailure.bind(this));
      this.rebuildPromise = rebuildPromise;
    }
    return rebuildPromise;
  }

  protected onBuildSuccess(): void {
    this.rebuildPromise = null;
    this.debounceRebuild();
  }

  protected onBuildFailure(): void {
    this.rebuildPromise = null;
    this.debounceRebuild();
  }

  watch(watchConfig: TaskConfig): Promise<void> {
    const workspace = this.workspace.service;
    return workspace.runPackageLibraryDependencyTasks(watchConfig, this.packageNames, this.libraryNames);
  }

  protected logWatchingForChanges(): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.magentaBold(output);
    output = output.write("watching for changes");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.gray(output);
    output = output.write("...");
    output = OutputStyle.reset(output);
    console.log(output.bind());
    console.log("");
  }

  @Provider<WatcherScope, Workspace>({
    extends: true,
    observes: true,
    workspacePackageDidChange(packageScope: PackageScope): void {
      this.owner.rebuildPackage(packageScope);
    },
  })
  override readonly workspace!: Provider<this, Workspace>;
  static override readonly workspace: MemberFastenerClass<Scope, "workspace">;

  static async watch(watchConfig: TaskConfig, buildConfigs: TaskConfig | readonly TaskConfig[], packageNames?: string[] | string, libraryNames?: string[] | string): Promise<WatcherScope> {
    if (typeof packageNames === "string") {
      packageNames = packageNames.split(",");
    }
    if (typeof libraryNames === "string") {
      libraryNames = libraryNames.split(",");
    }
    const watcherScope = new WatcherScope(buildConfigs, packageNames, libraryNames);
    watcherScope.mount();

    await watcherScope.watch(watchConfig);
    await watcherScope.build();

    return watcherScope;
  }
}
