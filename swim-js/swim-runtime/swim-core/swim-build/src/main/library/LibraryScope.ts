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

import * as Path from "path";
import type * as FS from "fs";
import type {Class} from "@swim/util";
import {Output, OutputStyle} from "@swim/codec";
import {MemberFastenerClass, ComponentRef} from "@swim/component";
import {Scope} from "../scope/Scope";
import {TaskStatus, TaskConfig} from "../task/Task";
import {PackageScope} from "../package/PackageScope";
import {LibraryTask} from "./LibraryTask";
import {CompileTask} from "./CompileTask";
import {LintTask} from "./LintTask";
import {ApiTask} from "./ApiTask";
import {BundleTask} from "./BundleTask";
import {BuildTask} from "./BuildTask";
import {WatchTask} from "./WatchTask";
import type {LibraryScopeObserver} from "./LibraryScopeObserver";

/** @public */
export class LibraryScope extends Scope {
  constructor(name: string) {
    super();
    this.name = name;
  }

  override readonly observerType?: Class<LibraryScopeObserver>;

  override readonly name: string;

  get packageScope(): PackageScope | null {
    return this.getSuper(PackageScope);
  }

  @ComponentRef<LibraryScope, CompileTask>({
    type: CompileTask,
    initComponent(compileTask: CompileTask): void {
      compileTask.baseDir.setValue(this.owner.baseDir.value);
    },
  })
  readonly compile!: ComponentRef<this, CompileTask>;
  static readonly compile: MemberFastenerClass<LibraryScope, "compile">;

  @ComponentRef<LibraryScope, LintTask>({
    type: LintTask,
  })
  readonly lint!: ComponentRef<this, LintTask>;
  static readonly lint: MemberFastenerClass<LibraryScope, "lint">;

  @ComponentRef<LibraryScope, ApiTask>({
    type: ApiTask,
  })
  readonly api!: ComponentRef<this, ApiTask>;
  static readonly api: MemberFastenerClass<LibraryScope, "api">;

  @ComponentRef<LibraryScope, BundleTask>({
    type: BundleTask,
  })
  readonly bundle!: ComponentRef<this, BundleTask>;
  static readonly bundle: MemberFastenerClass<LibraryScope, "bundle">;

  @ComponentRef<LibraryScope, BuildTask>({
    type: BuildTask,
  })
  readonly build!: ComponentRef<this, BuildTask>;
  static readonly build: MemberFastenerClass<LibraryScope, "build">;

  @ComponentRef<LibraryScope, WatchTask>({
    type: WatchTask,
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
  readonly watch!: ComponentRef<this, WatchTask>;
  static readonly watch: MemberFastenerClass<LibraryScope, "watch">;

  override async runTask(taskConfig: TaskConfig): Promise<TaskStatus> {
    const task = this.getTask(taskConfig.class);
    if (task instanceof LibraryTask) {
      return task.run(taskConfig.options);
    } else {
      return TaskStatus.Skipped;
    }
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

  static override async load(baseDir: string): Promise<LibraryScope | null> {
    const name = Path.basename(baseDir);
    const libraryScope = new LibraryScope(name);
    libraryScope.baseDir.setValue(baseDir);
    const compileTask = libraryScope.compile.insertComponent();
    const tsconfig = await compileTask.tsconfig.getOrLoadIfExists(null);
    if (tsconfig !== null) {
      libraryScope.lint.insertComponent();
      libraryScope.api.insertComponent();
      libraryScope.bundle.insertComponent();
      libraryScope.build.insertComponent();
      libraryScope.watch.insertComponent();
      return libraryScope;
    }
    return null;
  }
}
