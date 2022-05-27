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

import type {Class} from "@swim/util";
import {OutputSettings, Output, OutputStyle, Format, Unicode} from "@swim/codec";
import {FastenerClass, Property, Provider, Component, ComponentSet} from "@swim/component";
import {Workspace} from "../workspace/Workspace";
import type {ScopeObserver} from "./ScopeObserver";
import {TaskStatus, TaskConfig, Task} from "../"; // forward import
import {PackageScope} from "../"; // forward import
import {LibraryScope} from "../"; // forward import

/** @public */
export abstract class Scope extends Component<Scope> {
  override get componentType(): Class<Scope> {
    return Scope;
  }

  override readonly observerType?: Class<ScopeObserver>;

  abstract readonly name: string;

  @Property({valueType: String})
  readonly baseDir!: Property<this, string | undefined>;

  @ComponentSet<Scope["tasks"]>({
    // avoid cyclic static reference to componentType: Task
    binds: true,
    detectComponent(component: Component): Task | null {
      return component instanceof Task ? component : null;
    },
  })
  readonly tasks!: ComponentSet<this, Task>;
  static readonly tasks: FastenerClass<Scope["tasks"]>;

  getTask<C extends Class<Task>>(taskClass: C): InstanceType<C> | null {
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof taskClass) {
        return child as InstanceType<C>;
      }
      child = child.nextSibling;
    }
    return null;
  }

  async runTask(taskConfig: TaskConfig): Promise<TaskStatus> {
    const task = this.getTask(taskConfig.class);
    if (task !== null) {
      return task.run(taskConfig.options);
    } else {
      return TaskStatus.Skipped;
    }
  }

  async runTasks(taskConfigs: TaskConfig | readonly TaskConfig[]): Promise<TaskStatus> {
    if ("class" in taskConfigs) {
      return this.runTask(taskConfigs);
    } else {
      let runStatus = TaskStatus.Skipped;
      for (let i = 0; i < taskConfigs.length; i += 1) {
        const taskClass = taskConfigs[i]!;
        const taskStatus = await this.runTask(taskClass);
        if (taskStatus > runStatus) {
          runStatus = taskStatus;
        }
      }
      return runStatus;
    }
  }

  @Provider<Scope["workspace"]>({
    serviceType: Workspace,
    inherits: false,
  })
  readonly workspace!: Provider<this, Workspace>;
  static readonly workspace: FastenerClass<Scope["workspace"]>;

  writeName<T>(output: Output<T>): Output<T> {
    output = OutputStyle.bold(output);
    output = output.write(this.name);
    output = OutputStyle.reset(output);
    return output;
  }

  writeBegin<T>(output: Output<T>, phrase: string): Output<T> {
    output = OutputStyle.cyanBold(output);
    output = output.write(phrase);
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = this.writeName(output);
    return output;
  }

  logBegin(phrase: string): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = this.writeBegin(output, phrase);
    console.log(output.bind());
  }

  writeSuccess<T>(output: Output<T>, phrase: string, dt?: number): Output<T> {
    output = OutputStyle.greenBold(output);
    output = output.write(phrase);
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = this.writeName(output);
    if (dt !== void 0) {
      output = output.write(" ");
      output = OutputStyle.faint(output);
      output = output.write("in");
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.faint(output);
      output = output.write(Format.prefix(dt / 1000) + "s");
      output = OutputStyle.reset(output);
    }
    return output;
  }

  logSuccess(phrase: string, dt?: number): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = this.writeSuccess(output, phrase, dt);
    console.log(output.bind());
    console.log("");
  }

  writeFailure<T>(output: Output<T>, phrase: string): Output<T> {
    output = OutputStyle.redBold(output);
    output = output.write(phrase);
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = this.writeName(output);
    return output;
  }

  logFailure(phrase: string): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = this.writeFailure(output, phrase);
    console.log(output.bind());
    console.log("");
  }

  writeWarning<T>(output: Output<T>, phrase: string): Output<T> {
    output = OutputStyle.yellowBold(output);
    output = output.write(phrase);
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = this.writeName(output);
    return output;
  }

  logWarning(phrase: string): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = this.writeWarning(output, phrase);
    console.log(output.bind());
    console.log("");
  }

  static async load(baseDir: string): Promise<Scope | null> {
    let scope: Scope | null = null;
    if (scope === null) {
      scope = await PackageScope.load(baseDir);
    }
    if (scope === null) {
      scope = await LibraryScope.load(baseDir);
    }
    return scope;
  }
}
