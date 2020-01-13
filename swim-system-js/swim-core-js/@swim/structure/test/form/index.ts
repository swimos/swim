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

import {Spec, Unit} from "@swim/unit";

import {StringFormSpec} from "./StringFormSpec";
import {NumberFormSpec} from "./NumberFormSpec";
import {BooleanFormSpec} from "./BooleanFormSpec";
import {AnyFormSpec} from "./AnyFormSpec";
import {ItemFormSpec} from "./ItemFormSpec";
import {ValueFormSpec} from "./ValueFormSpec";

@Unit
class FormSpec extends Spec {
  @Unit
  stringFormSpec(): Spec {
    return new StringFormSpec();
  }

  @Unit
  numberFormSpec(): Spec {
    return new NumberFormSpec();
  }

  @Unit
  booleanFormSpec(): Spec {
    return new BooleanFormSpec();
  }

  @Unit
  anyFormSpec(): Spec {
    return new AnyFormSpec();
  }

  @Unit
  itemFormSpec(): Spec {
    return new ItemFormSpec();
  }

  @Unit
  valueFormSpec(): Spec {
    return new ValueFormSpec();
  }
}

export {
  FormSpec,
  StringFormSpec,
  NumberFormSpec,
  BooleanFormSpec,
  AnyFormSpec,
  ItemFormSpec,
  ValueFormSpec,
};
