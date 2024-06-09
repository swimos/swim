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

import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import {OutputSettings} from "@swim/codec";
import type {Output} from "@swim/codec";
import {OutputStyle} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Property} from "@swim/component";
import type {ScopeObserver} from "./Scope";
import {Scope} from "./Scope";

/** @public */
export enum TaskStatus {
  Skipped = -1,
  Success = 0,
  Pending = 1,
  Failure = 2,
}

/** @public */
export interface TaskOptions {
}

/** @public */
export type TaskOptionsType<S extends Task> =
  S extends {readonly optionsType?: Class<infer T> | null} ? T : never;

/** @public */
export interface TaskConfig<T extends Task = Task> {
  readonly class: Class<T>;
  readonly options?: TaskOptionsType<T>;
}

/** @public */
export interface TaskObserver<T extends Task = Task> extends ScopeObserver<T> {
  taskWillRun?(task: T): void;

  taskDidRun?(status: TaskStatus, task: T): void;
}

/** @public */
export abstract class Task extends Scope {
  declare readonly observerType?: Class<TaskObserver>;

  declare readonly optionsType?: Class<TaskOptions>;

  @Property({valueType: String, inherits: true})
  override readonly baseDir!: Property<this, string | undefined>;

  @Property({valueType: Number, value: TaskStatus.Pending})
  readonly status!: Property<this, TaskStatus>;

  getPeerTask<C extends Class<Task>>(taskClass: C): InstanceType<C> | null {
    const parent = this.parent;
    return parent !== null ? parent.getTask(taskClass) : null;
  }

  async run(options?: TaskOptionsType<this>): Promise<TaskStatus> {
    this.status.set(TaskStatus.Pending);
    this.willRun();
    const status = await this.exec(options);
    this.status.set(status);
    this.didRun(status);
    return status;
  }

  protected willRun(): void {
    this.callObservers("taskWillRun", this);
  }

  protected didRun(status: TaskStatus): void {
    this.callObservers("taskDidRun", status, this);
  }

  abstract exec(options?: TaskOptionsType<this>): Promise<TaskStatus>;

  override writeBegin<T>(output: Output<T>, phrase: string): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeBegin(output, phrase);
    }
    return super.writeBegin(output, phrase);
  }

  override writeSuccess<T>(output: Output<T>, phrase: string, dt?: number): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeSuccess(output, phrase, dt);
    }
    return super.writeSuccess(output, phrase, dt);
  }

  override writeFailure<T>(output: Output<T>, phrase: string): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeFailure(output, phrase);
    }
    return super.writeFailure(output, phrase);
  }

  override writeWarning<T>(output: Output<T>, phrase: string): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeWarning(output, phrase);
    }
    return super.writeWarning(output, phrase);
  }

  writeCommand<T>(output: Output<T>, command: string, args: readonly string[]): Output<T> {
    output = OutputStyle.gray(output);
    output = output.write(command);
    output = OutputStyle.reset(output);
    for (let i = 0; i < args.length; i += 1) {
      output = output.write(" ");
      output = OutputStyle.gray(output);
      output = output.write(args[i]!);
      output = OutputStyle.reset(output);
    }
    return output;
  }

  logCommand(command: string, args: readonly string[]): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = this.writeCommand(output, command, args);
    console.log(output.bind());
    console.log("");
  }

  static config<S extends Class<Instance<S, Task>>>(this: S, options?: TaskOptionsType<InstanceType<S>>): TaskConfig<InstanceType<S>> {
    return {
      class: this,
      options: options,
    };
  }
}
