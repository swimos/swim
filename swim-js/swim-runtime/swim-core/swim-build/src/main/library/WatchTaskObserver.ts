// Copyright 2015-2023 Swim.inc
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
import type {TaskObserver} from "../task/TaskObserver";
import type {WatchTask} from "./WatchTask";

/** @public */
export interface WatchTaskObserver<T extends WatchTask = WatchTask> extends TaskObserver<T> {
  taskDidAdd?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidAddDir?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidChange?(path: string, stats: FS.Stats | null, task: T): void;

  taskDidUnlink?(path: string, task: T): void;

  taskDidUnlinkDir?(path: string, task: T): void;
}
