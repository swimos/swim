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

import {ConstraintKey, ConstraintMap} from "./ConstraintMap";

/** @hidden */
export interface ConstraintSymbol extends ConstraintKey {
  isExternal(): boolean;

  isDummy(): boolean;

  isInvalid(): boolean;
}

/** @hidden */
export const ConstraintSymbol = {
  Invalid: void 0 as any as ConstraintInvalid, // defined by ConstraintInvalid
};

/** @hidden */
export class ConstraintSlack implements ConstraintSymbol {
  /** @hidden */
  readonly _id: number;

  constructor() {
    this._id = ConstraintMap.nextId();
  }

  get id(): number {
    return this._id;
  }

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return false;
  }
}

/** @hidden */
export class ConstraintDummy implements ConstraintSymbol {
  /** @hidden */
  readonly _id: number;

  constructor() {
    this._id = ConstraintMap.nextId();
  }

  get id(): number {
    return this._id;
  }

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return true;
  }

  isInvalid(): boolean {
    return false;
  }
}

/** @hidden */
export class ConstraintError implements ConstraintSymbol {
  /** @hidden */
  readonly _id: number;

  constructor() {
    this._id = ConstraintMap.nextId();
  }

  get id(): number {
    return this._id;
  }

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return false;
  }
}

/** @hidden */
export class ConstraintInvalid implements ConstraintSymbol {
  get id(): number {
    return -1;
  }

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return true;
  }
}
ConstraintSymbol.Invalid = new ConstraintInvalid();
