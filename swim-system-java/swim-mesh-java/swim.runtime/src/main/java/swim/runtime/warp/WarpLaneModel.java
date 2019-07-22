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

package swim.runtime.warp;

import swim.api.auth.Identity;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.runtime.LaneModel;
import swim.runtime.LaneRelay;
import swim.runtime.LinkBinding;
import swim.runtime.PushRequest;
import swim.runtime.WarpBinding;
import swim.structure.Value;
import swim.warp.CommandMessage;
import swim.warp.Envelope;

public abstract class WarpLaneModel<View extends WarpLaneView, U extends WarpUplinkModem> extends LaneModel<View, U> {
  @Override
  protected U createUplink(LinkBinding link) {
    if (link instanceof WarpBinding) {
      return createWarpUplink((WarpBinding) link);
    }
    return null;
  }

  protected abstract U createWarpUplink(WarpBinding link);

  @SuppressWarnings("unchecked")
  public void cueDown() {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.cueDown();
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != this.uplinks);

    for (Value linkKey: closedLinks) {
      closeUplink(linkKey);
    }
  }

  @SuppressWarnings("unchecked")
  public void sendDown(Value body) {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.sendDown(body);
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != this.uplinks);

    for (Value linkKey : closedLinks) {
      closeUplink(linkKey);
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final Envelope envelope = pushRequest.envelope();
    if (envelope instanceof CommandMessage) {
      onCommand((CommandMessage) envelope);
      pushRequest.didDeliver();
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void pushUpCommand(CommandMessage message) {
    onCommand(message);
  }

  protected void onCommand(CommandMessage message) {
    new WarpLaneRelayOnCommand<View>(this, message).run();
  }

  @Override
  protected void didUplink(U uplink) {
    new WarpLaneRelayDidUplink<View>(this, uplink).run();
  }

  protected void didEnter(Identity identity) {
    new WarpLaneRelayDidEnter<View>(this, identity).run();
  }

  protected void didLeave(Identity identity) {
    new WarpLaneRelayDidLeave<View>(this, identity).run();
  }
}

final class WarpLaneRelayOnCommand<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final CommandMessage message;

  WarpLaneRelayOnCommand(WarpLaneModel<View, ?> model, CommandMessage message) {
    super(model, 2);
    this.message = message;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidUplink<View extends WarpLaneView> extends LaneRelay<LaneModel<View, ?>, View> {
  final WarpUplink uplink;

  WarpLaneRelayDidUplink(LaneModel<View, ?> model, WarpUplink uplink) {
    super(model);
    this.uplink = uplink;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidUplink(this.uplink);
      }
      return view.dispatchDidUplink(this.uplink, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidEnter<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final Identity identity;

  WarpLaneRelayDidEnter(WarpLaneModel<View, ?> model, Identity identity) {
    super(model);
    this.identity = identity;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidEnter(this.identity);
      }
      return view.dispatchDidEnter(this.identity, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidLeave<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final Identity identity;

  WarpLaneRelayDidLeave(WarpLaneModel<View, ?> model, Identity identity) {
    super(model);
    this.identity = identity;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidLeave(this.identity);
      }
      return view.dispatchDidLeave(this.identity, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
