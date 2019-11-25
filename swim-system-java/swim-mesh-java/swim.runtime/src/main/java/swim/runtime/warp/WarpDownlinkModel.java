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

import swim.runtime.DownlinkRelay;
import swim.runtime.DownlinkView;
import swim.runtime.Push;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;

public abstract class WarpDownlinkModel<View extends WarpDownlinkView> extends WarpDownlinkModem<View> {
  public WarpDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                           float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
  }

  @Override
  public final boolean keepLinked() {
    final Object views = this.views;
    if (views instanceof WarpDownlinkView) {
      return ((WarpDownlinkView) views).keepLinked();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        if (((WarpDownlinkView) viewArray[i]).keepLinked()) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public final boolean keepSynced() {
    final Object views = this.views;
    if (views instanceof WarpDownlinkView) {
      return ((WarpDownlinkView) views).keepSynced();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        if (((WarpDownlinkView) viewArray[i]).keepSynced()) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  protected void pushDownEvent(Push<EventMessage> push) {
    onEvent(push.message());
    new WarpDownlinkRelayOnEvent<View>(this, push).run();
  }

  @Override
  protected void pushDownLinked(Push<LinkedResponse> push) {
    didLink(push.message());
    new WarpDownlinkRelayDidLink<View>(this, push).run();
  }

  @Override
  protected void pushDownSynced(Push<SyncedResponse> push) {
    didSync(push.message());
    new WarpDownlinkRelayDidSync<View>(this, push).run();
  }

  @Override
  protected void pushDownUnlinked(Push<UnlinkedResponse> push) {
    didUnlink(push.message());
    new WarpDownlinkRelayDidUnlink<View>(this, push).run();
  }

  @Override
  protected void pullUpCommand(CommandMessage message) {
    onCommand(message);
    new WarpDownlinkRelayWillCommand<View>(this, message).run();
  }

  @Override
  protected void pullUpLink(LinkRequest request) {
    willLink(request);
    new WarpDownlinkRelayWillLink<View>(this, request).run();
  }

  @Override
  protected void pullUpSync(SyncRequest request) {
    willSync(request);
    new WarpDownlinkRelayWillSync<View>(this, request).run();
  }

  @Override
  protected void pullUpUnlink(UnlinkRequest request) {
    willUnlink(request);
    new WarpDownlinkRelayWillUnlink<View>(this, request).run();
  }
}

final class WarpDownlinkRelayOnEvent<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final Push<EventMessage> push;

  WarpDownlinkRelayOnEvent(WarpDownlinkModel<View> model, Push<EventMessage> push) {
    super(model, 2);
    this.push = push;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      final EventMessage message = this.push.message();
      if (preemptive) {
        view.downlinkWillReceive(message);
      }
      return view.dispatchWillReceive(message.body(), preemptive);
    } else if (phase == 1) {
      final EventMessage message = this.push.message();
      if (preemptive) {
        view.downlinkDidReceive(message);
      }
      return view.dispatchDidReceive(message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.push.bind();
    this.model.cueDown();
  }
}

final class WarpDownlinkRelayWillCommand<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final CommandMessage message;

  WarpDownlinkRelayWillCommand(WarpDownlinkModel<View> model, CommandMessage message) {
    super(model);
    this.message = message;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpDownlinkRelayWillLink<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final LinkRequest request;

  WarpDownlinkRelayWillLink(WarpDownlinkModel<View> model, LinkRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillLink(this.request);
      }
      return view.dispatchWillLink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpDownlinkRelayDidLink<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final Push<LinkedResponse> push;

  WarpDownlinkRelayDidLink(WarpDownlinkModel<View> model, Push<LinkedResponse> push) {
    super(model);
    this.push = push;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidLink(this.push.message());
      }
      return view.dispatchDidLink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.push.bind();
    this.model.cueDown();
  }
}

final class WarpDownlinkRelayWillSync<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final SyncRequest request;

  WarpDownlinkRelayWillSync(WarpDownlinkModel<View> model, SyncRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillSync(this.request);
      }
      return view.dispatchWillSync(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpDownlinkRelayDidSync<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final Push<SyncedResponse> push;

  WarpDownlinkRelayDidSync(WarpDownlinkModel<View> model, Push<SyncedResponse> push) {
    super(model);
    this.push = push;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidSync(this.push.message());
      }
      return view.dispatchDidSync(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.push.bind();
    this.model.cueDown();
  }
}

final class WarpDownlinkRelayWillUnlink<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final UnlinkRequest request;

  WarpDownlinkRelayWillUnlink(WarpDownlinkModel<View> model, UnlinkRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillUnlink(this.request);
      }
      return view.dispatchWillUnlink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpDownlinkRelayDidUnlink<View extends WarpDownlinkView> extends DownlinkRelay<WarpDownlinkModel<View>, View> {
  final Push<UnlinkedResponse> push;

  WarpDownlinkRelayDidUnlink(WarpDownlinkModel<View> model, Push<UnlinkedResponse> push) {
    super(model);
    this.push = push;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidUnlink(this.push.message());
      }
      return view.dispatchDidUnlink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.push.bind();
    // Don't cueDown model after unlinked.
  }
}
