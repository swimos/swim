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

import {Unit} from "@swim/unit";
import {Suite} from "@swim/unit";
import {EventDownlinkSpec} from "./EventDownlinkSpec";
import {ValueDownlinkSpec} from "./ValueDownlinkSpec";
import {ListDownlinkSpec} from "./ListDownlinkSpec";
import {MapDownlinkSpec} from "./MapDownlinkSpec";
import {HostRefSpec} from "./HostRefSpec";
import {NodeRefSpec} from "./NodeRefSpec";
import {LaneRefSpec} from "./LaneRefSpec";
import {WarpClientSpec} from "./WarpClientSpec";

export class ClientSuite extends Suite {
  @Unit
  eventDownlinkSpec(): Suite {
    return new EventDownlinkSpec();
  }

  @Unit
  valueDownlinkSpec(): Suite {
    return new ValueDownlinkSpec();
  }

  @Unit
  listDownlinkSpec(): Suite {
    return new ListDownlinkSpec();
  }

  @Unit
  mapDownlinkSpec(): Suite {
    return new MapDownlinkSpec();
  }

  @Unit
  hostRefSpec(): Suite {
    return new HostRefSpec();
  }

  @Unit
  nodeRefSpec(): Suite {
    return new NodeRefSpec();
  }

  @Unit
  laneRefSpec(): Suite {
    return new LaneRefSpec();
  }

  @Unit
  warpClientSpec(): Suite {
    return new WarpClientSpec();
  }
}
