// Copyright 2015-2019 SWIM.AI inc.
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

import {WarpClientSpec} from "./WarpClientSpec";

import {DownlinkSpec} from "./downlink";
import {RefSpec} from "./ref";

@Unit
class ClientSpec extends Spec {
  @Unit
  downlinkSpec(): Spec {
    return new DownlinkSpec();
  }

  @Unit
  refSpec(): Spec {
    return new RefSpec();
  }

  @Unit
  warpClientSpec(): Spec {
    return new WarpClientSpec();
  }
}

export * from "./downlink";
export * from "./ref";

export {
  WarpClientSpec,
  ClientSpec,
};

ClientSpec.run();
