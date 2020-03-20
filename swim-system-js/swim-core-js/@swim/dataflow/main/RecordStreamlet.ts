// Copyright 2015-2020 SWIM.AI inc.
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

import {Value, Record} from "@swim/structure";
import {Inlet, Outlet, StreamletContext, StreamletScope, StreamletClass, Streamlet, AbstractStreamlet} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";

export abstract class RecordStreamlet<I extends Value = Value, O extends Value = I> extends Record implements Streamlet<I, O> {
  isConstant(): boolean {
    return false;
  }

  protected streamletClass(): StreamletClass {
    return (this as any).__proto__ as StreamletClass;
  }

  abstract streamletScope(): StreamletScope<O> | null;

  abstract setStreamletScope(parent: StreamletScope<O> | null): void;

  abstract streamletContext(): StreamletContext | null;

  abstract setStreamletContext(context: StreamletContext | null): void;

  abstract inlet(key: string): Inlet<I> | null;

  abstract bindInput(key: string, input: Outlet<I>): void;

  abstract unbindInput(key: string): void;

  abstract outlet(key: string): Outlet<O> | null;

  abstract disconnectInputs(): void;

  abstract disconnectOutputs(): void;

  abstract decohere(): void;

  abstract recohere(version: number): void;

  compile(): void {
    AbstractStreamlet.reflectEachInlet<I, O, void, this>(this, this.streamletClass(), function (inlet: Inlet<I>, name: string): void {
      if (inlet.input() === null) {
        this.compileInlet(inlet, name);
      }
    }, this);
  }

  compileInlet(inlet: Inlet<I>, name: string): void {
    const scope = this.streamletScope();
    if (scope !== null) {
      const input = scope.outlet(name);
      if (input !== null) {
        // Assume Outlet<O> conforms to Outlet<I>.
        inlet.bindInput(input as Outlet<unknown> as Outlet<I>);
      }
    }
  }
}
RecordOutlet.Streamlet = RecordStreamlet;
