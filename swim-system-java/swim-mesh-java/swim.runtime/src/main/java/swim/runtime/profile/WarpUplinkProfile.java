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

package swim.runtime.profile;

import swim.runtime.Metric;
import swim.runtime.UplinkAddress;

public final class WarpUplinkProfile extends Metric {
  final UplinkAddress cellAddress;
  final int eventDelta;
  final int eventRate;
  final long eventCount;
  final int commandDelta;
  final int commandRate;
  final long commandCount;

  public WarpUplinkProfile(UplinkAddress cellAddress,
                           int eventDelta, int eventRate, long eventCount,
                           int commandDelta,  int commandRate, long commandCount) {
    this.cellAddress = cellAddress;
    this.eventDelta = eventDelta;
    this.eventRate = eventRate;
    this.eventCount = eventCount;
    this.commandDelta = commandDelta;
    this.commandRate = commandRate;
    this.commandCount = commandCount;
  }

  @Override
  public UplinkAddress cellAddress() {
    return this.cellAddress;
  }

  public int eventDelta() {
    return this.eventDelta;
  }

  public int eventRate() {
    return this.eventRate;
  }

  public long eventCount() {
    return this.eventCount;
  }

  public int commandDelta() {
    return this.commandDelta;
  }

  public int commandRate() {
    return this.commandRate;
  }

  public long commandCount() {
    return this.commandCount;
  }
}
