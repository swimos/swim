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

import type {Class} from "@swim/util";
import {OutputSettings, Output, OutputStyle, Unicode} from "@swim/codec";
import {Property} from "@swim/component";
import {Scope} from "../scope/Scope";
import type {TaskObserver} from "./TaskObserver";

/** @public */
export const enum TaskStatus {
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
export abstract class Task extends Scope {
  override readonly observerType?: Class<TaskObserver>;

  readonly optionsType?: Class<TaskOptions>;

  @Property({type: String, inherits: true})
  override readonly baseDir!: Property<this, string | undefined>;

  @Property({type: Number, value: TaskStatus.Pending})
  readonly status!: Property<this, TaskStatus>;

  getPeerTask<C extends Class<Task>>(taskClass: C): InstanceType<C> | null {
    const parent = this.parent;
    return parent !== null ? parent.getTask(taskClass) : null;
  }

  async run(options?: TaskOptionsType<this>): Promise<TaskStatus> {
    this.status.setValue(TaskStatus.Pending);
    this.willRun();
    const status = await this.exec(options);
    this.status.setValue(status);
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
    } else {
      return super.writeBegin(output, phrase);
    }
  }

  override writeSuccess<T>(output: Output<T>, phrase: string, dt?: number): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeSuccess(output, phrase, dt);
    } else {
      return super.writeSuccess(output, phrase, dt);
    }
  }

  override writeFailure<T>(output: Output<T>, phrase: string): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeFailure(output, phrase);
    } else {
      return super.writeFailure(output, phrase);
    }
  }

  override writeWarning<T>(output: Output<T>, phrase: string): Output<T> {
    const parent = this.parent;
    if (parent !== null) {
      return parent.writeWarning(output, phrase);
    } else {
      return super.writeWarning(output, phrase);
    }
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

  static config<S extends Class<InstanceType<S>>>(this: S, options?: TaskOptionsType<InstanceType<S>>): TaskConfig<InstanceType<S>> {
    return {
      class: this,
      options: options,
    };
  }
}
