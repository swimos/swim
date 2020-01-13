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

import {EventDownlinkSpec} from "./EventDownlinkSpec";
import {ListDownlinkSpec} from "./ListDownlinkSpec";
import {MapDownlinkSpec} from "./MapDownlinkSpec";
import {ValueDownlinkSpec} from "./ValueDownlinkSpec";

import {MapDownlinkRecordSpec} from "./MapDownlinkRecordSpec";
import {ValueDownlinkRecordSpec} from "./ValueDownlinkRecordSpec";

import {DownlinkStreamletSpec} from "./DownlinkStreamletSpec";

@Unit
class DownlinkSpec extends Spec {
  @Unit
  eventDownlinkSpec(): Spec {
    return new EventDownlinkSpec();
  }

  @Unit
  listDownlinkSpec(): Spec {
    return new ListDownlinkSpec();
  }

  @Unit
  mapDownlinkSpec(): Spec {
    return new MapDownlinkSpec();
  }

  @Unit
  valueDownlinkSpec(): Spec {
    return new ValueDownlinkSpec();
  }

  @Unit
  mapDownlinkRecordSpec(): Spec {
    return new MapDownlinkRecordSpec();
  }

  @Unit
  valueDownlinkRecordSpec(): Spec {
    return new ValueDownlinkRecordSpec();
  }

  @Unit
  downlinkStreamletSpec(): Spec {
    return new DownlinkStreamletSpec();
  }
}

export {
  DownlinkSpec,
  EventDownlinkSpec,
  ListDownlinkSpec,
  MapDownlinkSpec,
  ValueDownlinkSpec,
  MapDownlinkRecordSpec,
  ValueDownlinkRecordSpec,
  DownlinkStreamletSpec,
};
