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

package swim.api.lane;

import swim.api.lane.function.OnCue;
import swim.api.warp.WarpLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.structure.Form;

public interface DemandLane<V> extends WarpLane {
  Form<V> valueForm();

  <V2> DemandLane<V2> valueForm(Form<V2> valueForm);

  <V2> DemandLane<V2> valueClass(Class<V2> valueClass);

  @Override
  DemandLane<V> observe(Object observer);

  @Override
  DemandLane<V> unobserve(Object observer);

  DemandLane<V> onCue(OnCue<V> onCue);

  @Override
  DemandLane<V> willCommand(WillCommand willCommand);

  @Override
  DemandLane<V> didCommand(DidCommand didCommand);

  @Override
  DemandLane<V> willUplink(WillUplink willUplink);

  @Override
  DemandLane<V> didUplink(DidUplink didUplink);

  @Override
  DemandLane<V> willEnter(WillEnter willEnter);

  @Override
  DemandLane<V> didEnter(DidEnter didEnter);

  @Override
  DemandLane<V> willLeave(WillLeave willLeave);

  @Override
  DemandLane<V> didLeave(DidLeave didLeave);

  void cue();
}
