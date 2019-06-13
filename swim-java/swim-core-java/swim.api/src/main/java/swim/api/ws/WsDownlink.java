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

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.Link;
import swim.api.auth.Identity;
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

public interface WsDownlink<I, O> extends Link {
  @Override
  Uri hostUri();

  @Override
  Uri nodeUri();

  @Override
  Uri laneUri();

  @Override
  boolean isConnected();

  @Override
  boolean isRemote();

  @Override
  boolean isSecure();

  @Override
  String securityProtocol();

  @Override
  String cipherSuite();

  @Override
  InetSocketAddress localAddress();

  @Override
  Identity localIdentity();

  @Override
  Principal localPrincipal();

  @Override
  Collection<Certificate> localCertificates();

  @Override
  InetSocketAddress remoteAddress();

  @Override
  Identity remoteIdentity();

  @Override
  Principal remotePrincipal();

  @Override
  Collection<Certificate> remoteCertificates();

  @Override
  WsDownlink<I, O> observe(Object observer);

  @Override
  WsDownlink<I, O> unobserve(Object observer);

  WsLane<I, O> willUpgrade(WillUpgradeWs willUpgrade);

  WsLane<I, O> doUpgrade(DoUpgradeWs doUpgrade);

  WsLane<I, O> didUpgrade(DidUpgradeWs didUpgrade);

  WsLane<I, O> willReadFrame(WillReadFrameWs<I> willReadFrame);

  WsLane<I, O> didReadFrame(DidReadFrameWs<I> didReadFrame);

  WsLane<I, O> willWriteFrame(WillWriteFrameWs<O> willWriteFrame);

  WsLane<I, O> didWriteFrame(DidWriteFrameWs<O> didWriteFrame);

  WsDownlink<I, O> didDisconnect(DidDisconnect didDisconnect);

  WsDownlink<I, O> didFail(DidFail didFail);

  WsDownlink<I, O> open();

  <O2 extends O> void write(WsData<O2> frame);

  <O2 extends O> void write(WsControl<?, O2> frame);

  @Override
  void close();

  @Override
  void trace(Object message);

  @Override
  void debug(Object message);

  @Override
  void info(Object message);

  @Override
  void warn(Object message);

  @Override
  void error(Object message);
}
