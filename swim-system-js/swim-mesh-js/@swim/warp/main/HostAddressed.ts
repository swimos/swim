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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {AnyUri, Uri} from "@swim/uri";
import {AnyValue, Value, Attr} from "@swim/structure";
import {Envelope} from "./Envelope";

export abstract class HostAddressed extends Envelope {
  /** @hidden */
  readonly _body: Value;

  constructor(body: Value) {
    super();
    this._body = body;
  }

  node(): Uri;
  node(node: AnyUri): this;
  node(node?: AnyUri): Uri | this {
    if (node === void 0) {
      return Uri.empty();
    } else {
      return this;
    }
  }

  lane(): Uri;
  lane(lane: AnyUri): this;
  lane(lane?: AnyUri): Uri | this {
    if (lane === void 0) {
      return Uri.empty();
    } else {
      return this;
    }
  }

  body(): Value;
  body(body: AnyValue): this;
  body(body?: AnyValue): Value | this {
    if (body === void 0) {
      return this._body;
    } else {
      body = Value.fromAny(body);
      return this.copy(body);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof HostAddressed
        && (this as any).__proto__.constructor === (that as any).__proto__.constructor) {
      return this._body.equals(that._body);
    }
    return false;
  }

  hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.seed((this as any).__proto__), this._body.hashCode()));
  }

  debug(output: Output): void {
    output = output.write((this as any).__proto__.constructor.name).write(46/*'.'*/).write("of").write(40/*'('*/);
    if (this._body.isDefined()) {
      output = output.debug(this._body);
    }
    output = output.write(41/*')'*/);
  }

  protected abstract copy(body: Value): this;

  toValue(): Value {
    return Attr.of(this.tag()).concat(this._body);
  }

  static fromValue(value: Value,
                   E?: {
                     new(body: Value): HostAddressed;
                     tag(): string;
                   })
                   : HostAddressed | undefined {
    const header = value.header(E!.tag());
    if (header.isDefined()) {
      const body = value.body();
      return new E!(body);
    }
    return void 0;
  }
}
