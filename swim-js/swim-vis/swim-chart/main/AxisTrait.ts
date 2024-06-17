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
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";

/** @public */
export interface AxisTraitObserver<D = unknown, T extends AxisTrait<D> = AxisTrait<D>> extends TraitObserver<T> {
}

/** @public */
export abstract class AxisTrait<D = unknown> extends Trait {
  declare readonly observerType?: Class<AxisTraitObserver<D>>;
}

/** @public */
export abstract class TopAxisTrait<X = unknown> extends AxisTrait<X> {
  declare readonly observerType?: Class<AxisTraitObserver<X, TopAxisTrait<X>>>;
}

/** @public */
export abstract class RightAxisTrait<Y = unknown> extends AxisTrait<Y> {
  declare readonly observerType?: Class<AxisTraitObserver<Y, RightAxisTrait<Y>>>;
}

/** @public */
export abstract class BottomAxisTrait<X = unknown> extends AxisTrait<X> {
  declare readonly observerType?: Class<AxisTraitObserver<X, BottomAxisTrait<X>>>;
}

/** @public */
export abstract class LeftAxisTrait<Y = unknown> extends AxisTrait<Y> {
  declare readonly observerType?: Class<AxisTraitObserver<Y, LeftAxisTrait<Y>>>;
}
