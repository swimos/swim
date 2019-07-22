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
  protected void pushDownEvent(EventMessage message) {
    onEvent(message);
    new WarpDownlinkRelayOnEvent<View>(this, message).run();
  }

  @Override
  protected void pushDownLinked(LinkedResponse response) {
    didLink(response);
    new WarpDownlinkRelayDidLink<View>(this, response).run();
  }

  @Override
  protected void pushDownSynced(SyncedResponse response) {
    didSync(response);
    new WarpDownlinkRelayDidSync<View>(this, response).run();
  }

  @Override
  protected void pushDownUnlinked(UnlinkedResponse response) {
    didUnlink(response);
    new WarpDownlinkRelayDidUnlink<View>(this, response).run();
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
  final EventMessage message;

  WarpDownlinkRelayOnEvent(WarpDownlinkModel<View> model, EventMessage message) {
    super(model, 2);
    this.message = message;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
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
  final LinkedResponse response;

  WarpDownlinkRelayDidLink(WarpDownlinkModel<View> model, LinkedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidLink(this.response);
      }
      return view.dispatchDidLink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
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
  final SyncedResponse response;

  WarpDownlinkRelayDidSync(WarpDownlinkModel<View> model, SyncedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidSync(this.response);
      }
      return view.dispatchDidSync(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
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
  final UnlinkedResponse response;

  WarpDownlinkRelayDidUnlink(WarpDownlinkModel<View> model, UnlinkedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidUnlink(this.response);
      }
      return view.dispatchDidUnlink(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    // Don't cueDown model after unlinked.
  }
}
