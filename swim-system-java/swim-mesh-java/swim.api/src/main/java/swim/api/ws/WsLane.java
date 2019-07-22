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

package swim.api.ws;

import swim.api.Lane;
import swim.api.ws.function.DidReadFrameWs;
import swim.api.ws.function.DidUpgradeWs;
import swim.api.ws.function.DidWriteFrameWs;
import swim.api.ws.function.DoUpgradeWs;
import swim.api.ws.function.WillReadFrameWs;
import swim.api.ws.function.WillUpgradeWs;
import swim.api.ws.function.WillWriteFrameWs;
import swim.ws.WsControl;
import swim.ws.WsData;

public interface WsLane<I, O> extends Lane {
  @Override
  WsLane<I, O> observe(Object observer);

  @Override
  WsLane<I, O> unobserve(Object observer);

  WsLane<I, O> willUpgrade(WillUpgradeWs willUpgrade);

  WsLane<I, O> doUpgrade(DoUpgradeWs doUpgrade);

  WsLane<I, O> didUpgrade(DidUpgradeWs didUpgrade);

  WsLane<I, O> willReadFrame(WillReadFrameWs<I> willReadFrame);

  WsLane<I, O> didReadFrame(DidReadFrameWs<I> didReadFrame);

  WsLane<I, O> willWriteFrame(WillWriteFrameWs<O> willWriteFrame);

  WsLane<I, O> didWriteFrame(DidWriteFrameWs<O> didWriteFrame);

  <O2 extends O> void write(WsData<O2> frame);

  <O2 extends O> void write(WsControl<?, O2> frame);
}
