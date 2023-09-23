// Copyright 2015-2023 Nstream, inc.
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
import type * as FS from "fs";
import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Output} from "@swim/codec";
import {OutputStyle} from "@swim/codec";
import {Provider} from "@swim/component";
import {ComponentRef} from "@swim/component";
import type {Service} from "@swim/component";
import type {Workspace} from "./Workspace";
import type {ScopeObserver} from "./Scope";
import {Scope} from "./Scope";
import {TaskStatus} from "./Task";
import type {TaskConfig} from "./Task";
import {PackageScope} from "./PackageScope";
import {LibraryTask} from "./LibraryTask";
import {CompileTask} from "./CompileTask";
import {LintTask} from "./LintTask";
import {ApiTask} from "./ApiTask";
import {BundleTask} from "./BundleTask";
import {BuildTask} from "./BuildTask";
import {WatchTask} from "./WatchTask";

/** @public */
export interface LibraryScopeObserver<T extends LibraryScope = LibraryScope> extends ScopeObserver<T> {
  libraryDidChange?(libraryScope: T): void;
}

/** @public */
export class LibraryScope extends Scope {
  constructor(name: string) {
    super();
    this.name = name;
  }

  declare readonly observerType?: Class<LibraryScopeObserver>;

  override readonly name: string;

  get packageScope(): PackageScope | null {
    return this.getAncestor(PackageScope);
  }

  @ComponentRef({
    componentType: CompileTask,
    initComponent(compileTask: CompileTask): void {
      compileTask.baseDir.set(this.owner.baseDir.value);
    },
  })
  readonly compile!: ComponentRef<this, CompileTask>;

  @ComponentRef({
    componentType: LintTask,
  })
  readonly lint!: ComponentRef<this, LintTask>;

  @ComponentRef({
    componentType: ApiTask,
  })
  readonly api!: ComponentRef<this, ApiTask>;

  @ComponentRef({
    componentType: BundleTask,
  })
  readonly bundle!: ComponentRef<this, BundleTask>;

  @ComponentRef({
    componentType: BuildTask,
  })
  readonly build!: ComponentRef<this, BuildTask>;

  @ComponentRef({
    componentType: WatchTask,
    observes: true,
    taskDidAdd(path: string, stats: FS.Stats | null): void {
      this.owner.callObservers("libraryDidChange", this.owner);
    },
    taskDidAddDir(path: string, stats: FS.Stats | null): void {
      this.owner.callObservers("libraryDidChange", this.owner);
    },
    taskDidChange(path: string, stats: FS.Stats | null): void {
      this.owner.callObservers("libraryDidChange", this.owner);
    },
    taskDidUnlink(path: string): void {
      this.owner.callObservers("libraryDidChange", this.owner);
    },
    taskDidUnlinkDir(path: string): void {
      this.owner.callObservers("libraryDidChange", this.owner);
    },
  })
  readonly watch!: ComponentRef<this, WatchTask> & Observes<WatchTask>;

  override async runTask(taskConfig: TaskConfig): Promise<TaskStatus> {
    const task = this.getTask(taskConfig.class);
    if (task instanceof LibraryTask) {
      return task.run(taskConfig.options);
    }
    return TaskStatus.Skipped;
  }

  override writeName<T>(output: Output<T>): Output<T> {
    const packageScope = this.packageScope;
    if (packageScope !== null) {
      output = OutputStyle.bold(output);
      output = output.write(packageScope.name);
      output = OutputStyle.reset(output);
      output = OutputStyle.faint(output);
      output = output.write(58/*':'*/);
      output = OutputStyle.reset(output);
    }
    output = OutputStyle.grayBold(output);
    output = output.write(this.name);
    output = OutputStyle.reset(output);
    return output;
  }

  @Provider({
    extends: true,
    mountService(service: Workspace, target: Service | null, key: string | undefined): void {
      super.mountService(service, target, key);
      service.libraries.addComponent(this.owner);
    },
    unmountService(service: Workspace): void {
      super.unmountService(service);
      service.libraries.removeComponent(this.owner);
    },
  })
  override readonly workspace!: Provider<this, Workspace> & Scope["workspace"];

  static override async load(baseDir: string): Promise<LibraryScope | null> {
    const name = Path.basename(baseDir);
    const libraryScope = new LibraryScope(name);
    libraryScope.baseDir.set(baseDir);
    const compileTask = libraryScope.compile.insertComponent();
    const tsconfig = await compileTask.tsconfig.getOrLoadIfExists(null);
    if (tsconfig !== null) {
      libraryScope.lint.insertComponent();
      libraryScope.api.insertComponent();
      libraryScope.bundle.insertComponent();
      libraryScope.build.insertComponent();
      libraryScope.watch.insertComponent();
      libraryScope.workspace; // instantiate
      return libraryScope;
    }
    return null;
  }
}
