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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {AnyUri, Uri} from "@swim/uri";
import {Item, Attr, AnyValue, Value, Record} from "@swim/structure";
import {Envelope} from "./Envelope";

export abstract class LaneAddressed extends Envelope {
  /** @hidden */
  readonly _node: Uri;
  /** @hidden */
  readonly _lane: Uri;
  /** @hidden */
  readonly _body: Value;

  constructor(node: Uri, lane: Uri, body: Value) {
    super();
    this._node = node;
    this._lane = lane;
    this._body = body;
  }

  node(): Uri;
  node(node: AnyUri): this;
  node(node?: AnyUri): Uri | this {
    if (node === void 0) {
      return this._node;
    } else {
      node = Uri.fromAny(node);
      return this.copy(node, this._lane, this._body);
    }
  }

  lane(): Uri;
  lane(lane: AnyUri): this;
  lane(lane?: AnyUri): Uri | this {
    if (lane === void 0) {
      return this._lane;
    } else {
      lane = Uri.fromAny(lane);
      return this.copy(this._node, lane, this._body);
    }
  }

  body(): Value;
  body(body: AnyValue): this;
  body(body?: AnyValue): Value | this {
    if (body === void 0) {
      return this._body;
    } else {
      body = Value.fromAny(body);
      return this.copy(this._node, this._lane, body);
    }
  }

  protected abstract copy(node: Uri, lane: Uri, body: Value): this;

  toValue(): Value {
    const header = Record.create(2)
        .slot("node", this._node.toString())
        .slot("lane", this._lane.toString());
    return Attr.of(this.tag(), header).concat(this._body);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LaneAddressed
        && (this as any).__proto__.constructor === (that as any).__proto__.constructor) {
      return this._node.equals(that._node) && this._lane.equals(that._lane)
          && this._body.equals(that._body);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.seed((this as any).__proto__),
        this._node.hashCode()), this._lane.hashCode()), this._body.hashCode()));
  }

  debug(output: Output): void {
    output = output.write((this as any).__proto__.constructor.name).write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._node.toString()).write(", ").debug(this._lane.toString());
    if (this._body.isDefined()) {
      output = output.write(", ").debug(this._body);
    }
    output = output.write(41/*')'*/);
  }

  static fromValue(value: Value,
                   E?: {
                     new(node: Uri, lane: Uri, body: Value): LaneAddressed;
                     tag(): string;
                   }): LaneAddressed | undefined {
    let node: Uri | undefined;
    let lane: Uri | undefined;
    const header = value.header(E!.tag());
    header.forEach(function (header: Item, index: number) {
      const key = header.key.stringValue(void 0);
      if (key !== void 0) {
        if (key === "node") {
          node = Uri.parse(header.toValue().stringValue(""));
        } else if (key === "lane") {
          lane = Uri.parse(header.toValue().stringValue(""));
        }
      } else if (header instanceof Value) {
        if (index === 0) {
          node = Uri.parse(header.stringValue(""));
        } else if (index === 1) {
          lane = Uri.parse(header.stringValue(""));
        }
      }
    });
    if (node && lane) {
      const body = value.body();
      return new E!(node, lane, body);
    }
    return void 0;
  }
}
