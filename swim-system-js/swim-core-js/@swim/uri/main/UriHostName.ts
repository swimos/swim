// Copyright 2015-2020 Swim inc.
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

import type {Output} from "@swim/codec";
import {Uri} from "./Uri";
import {UriHost} from "./UriHost";

/** @hidden */
export class UriHostName extends UriHost {
  /** @hidden */
  constructor(address: string) {
    super();
    Object.defineProperty(this, "address", {
      value: address,
      enumerable: true,
    });
  }

  declare readonly address: string;

  get name(): string {
    return this.address;
  }

  debug(output: Output): void {
    output = output.write("UriHost").write(46/*'.'*/).write("hostname")
        .write(40/*'('*/).debug(this.address).write(41/*')'*/);
  }

  display(output: Output): void {
    Uri.writeHost(this.address, output);
  }

  toString(): string {
    return this.address;
  }
}
