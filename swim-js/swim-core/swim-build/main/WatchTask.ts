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

import type * as FS from "fs";
import * as chokidar from "chokidar";
import type {Class} from "@swim/util";
import type {TaskObserver} from "./Task";
import {TaskStatus} from "./Task";
import {LibraryTask} from "./LibraryTask";

/** @public */
export interface WatchTaskObserver<T extends WatchTask = WatchTask> extends TaskObserver<T> {
  taskDidAdd?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidAddDir?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidChange?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidUnlink?(path: string, task: T): void;

  taskDidUnlinkDir?(path: string, task: T): void;
}

/** @public */
export class WatchTask extends LibraryTask {
  declare readonly observerType?: Class<WatchTaskObserver>;

  override get name(): string {
    return "watch";
  }

  override async exec(): Promise<TaskStatus> {
    const baseDir = this.baseDir.value;
    if (baseDir === void 0) {
      return TaskStatus.Pending;
    }
    const watcher = new chokidar.FSWatcher({
      ignoreInitial: true,
    });
    watcher.on("add", this.onAdd.bind(this));
    watcher.on("addDir", this.onAddDir.bind(this));
    watcher.on("change", this.onChange.bind(this));
    watcher.on("unlink", this.onUnlink.bind(this));
    watcher.on("unlinkDir", this.onUnlinkDir.bind(this));
    watcher.add(baseDir);
    return TaskStatus.Success;
  }

  protected onAdd(path: string, stats: FS.Stats | undefined): void {
    this.callObservers("taskDidAdd", path, stats !== void 0 ? stats : null, this);
  }

  protected onAddDir(path: string, stats: FS.Stats | undefined): void {
    this.callObservers("taskDidAddDir", path, stats !== void 0 ? stats : null, this);
  }

  protected onChange(path: string, stats: FS.Stats | undefined): void {
    this.callObservers("taskDidChange", path, stats !== void 0 ? stats : null, this);
  }

  protected onUnlink(path: string): void {
    this.callObservers("taskDidUnlink", path, this);
  }

  protected onUnlinkDir(path: string): void {
    this.callObservers("taskDidUnlinkDir", path, this);
  }
}
