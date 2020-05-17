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

import {Output} from "@swim/codec";
import {Uri} from "./Uri";
import {UriHost} from "./UriHost";

/** @hidden */
export class UriHostIPv6 extends UriHost {
  /** @hidden */
  readonly _address: string;
  /** @hidden */
  _string?: string;

  /** @hidden */
  constructor(address: string) {
    super();
    this._address = address;
  }

  address(): string {
    return this._address;
  }

  ipv6(): string {
    return this._address;
  }

  debug(output: Output): void {
    output = output.write("UriHost").write(46/*'.'*/).write("ipv6")
        .write(40/*'('*/).debug(this._address).write(41/*')'*/);
  }

  display(output: Output): void {
    if (this._string !== void 0) {
      output = output.write(this._string);
    } else {
      output = output.write(91/*'['*/);
      Uri.writeHostLiteral(this._address, output);
      output = output.write(93/*']'*/);
    }
  }

  toString(): string {
    if (this._string === void 0) {
      this._string = "[" + this.address + "]";
    }
    return this._string;
  }
}
Uri.HostIPv6 = UriHostIPv6;
