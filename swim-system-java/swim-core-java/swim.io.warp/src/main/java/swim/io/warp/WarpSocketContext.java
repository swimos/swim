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

package swim.io.warp;

import swim.concurrent.PullRequest;
import swim.io.FlowContext;
import swim.io.IpContext;
import swim.io.IpSocket;
import swim.warp.Envelope;
import swim.ws.WsControl;

public interface WarpSocketContext extends IpContext, FlowContext {
  WarpSettings warpSettings();

  void feed(PullRequest<Envelope> pullRequest);

  void feed(Envelope envelope, float prio);

  void feed(Envelope envelope);

  void write(WsControl<?, ? extends Envelope> frame);

  void become(IpSocket socket);

  void close();
}
