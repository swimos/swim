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

import swim.api.Downlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.ws.function.DidReadFrameWs;
import swim.api.ws.function.DidUpgradeWs;
import swim.api.ws.function.DidWriteFrameWs;
import swim.api.ws.function.DoUpgradeWs;
import swim.api.ws.function.WillReadFrameWs;
import swim.api.ws.function.WillUpgradeWs;
import swim.api.ws.function.WillWriteFrameWs;
import swim.uri.Uri;
import swim.ws.WsControl;
import swim.ws.WsData;

public interface WsDownlink<I, O> extends Downlink, WsLink {
  WsDownlink<I, O> requestUri(Uri requestUri);

  @Override
  WsDownlink<I, O> observe(Object observer);

  @Override
  WsDownlink<I, O> unobserve(Object observer);

  WsDownlink<I, O> willUpgrade(WillUpgradeWs willUpgrade);

  WsDownlink<I, O> doUpgrade(DoUpgradeWs doUpgrade);

  WsDownlink<I, O> didUpgrade(DidUpgradeWs didUpgrade);

  WsDownlink<I, O> willReadFrame(WillReadFrameWs<I> willReadFrame);

  WsDownlink<I, O> didReadFrame(DidReadFrameWs<I> didReadFrame);

  WsDownlink<I, O> willWriteFrame(WillWriteFrameWs<O> willWriteFrame);

  WsDownlink<I, O> didWriteFrame(DidWriteFrameWs<O> didWriteFrame);

  @Override
  WsDownlink<I, O> didConnect(DidConnect didConnect);

  @Override
  WsDownlink<I, O> didDisconnect(DidDisconnect didDisconnect);

  @Override
  WsDownlink<I, O> didClose(DidClose didClose);

  @Override
  WsDownlink<I, O> didFail(DidFail didFail);

  @Override
  WsDownlink<I, O> open();

  <O2 extends O> void write(WsData<O2> frame);

  <O2 extends O> void write(WsControl<?, O2> frame);
}
