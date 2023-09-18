// Copyright 2015-2023 Nstream, inc.
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

package swim.system.warp;

import swim.structure.Value;
import swim.system.Push;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class DemandDownlinkModem<View extends WarpDownlinkView> extends WarpDownlinkModel<View> {

  public DemandDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                             float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
  }

  @Override
  protected abstract Push<CommandMessage> nextUpCue();

}
