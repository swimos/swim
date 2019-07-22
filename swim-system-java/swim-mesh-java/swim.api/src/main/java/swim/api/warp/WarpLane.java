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

package swim.api.warp;

import swim.api.Lane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;

public interface WarpLane extends Lane {
  @Override
  WarpLane observe(Object observer);

  @Override
  WarpLane unobserve(Object observer);

  WarpLane willCommand(WillCommand willCommand);

  WarpLane didCommand(DidCommand willCommand);

  WarpLane willUplink(WillUplink willUplink);

  WarpLane didUplink(DidUplink didUplink);

  WarpLane willEnter(WillEnter willEnter);

  WarpLane didEnter(DidEnter didEnter);

  WarpLane willLeave(WillLeave willLeave);

  WarpLane didLeave(DidLeave didLeave);
}
