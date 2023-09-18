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

package swim.io.ws;

import swim.codec.Decoder;
import swim.io.FlowContext;
import swim.io.IpContext;
import swim.io.IpSocket;
import swim.ws.WsControlFrame;
import swim.ws.WsDataFrame;
import swim.ws.WsOpcode;

public interface WebSocketContext<I, O> extends IpContext, FlowContext {

  WsSettings wsSettings();

  <I2 extends I> void read(Decoder<I2> payloadDecoder);

  <I2 extends I> void read(WsOpcode frameType, Decoder<I2> payloadDecoder);

  <O2 extends O> void write(WsDataFrame<O2> frame);

  <O2 extends O> void write(WsControlFrame<?, O2> frame);

  void become(IpSocket socket);

  void close();

}
