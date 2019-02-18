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

package swim.runtime.downlink;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
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

public abstract class DownlinkModel<View extends DownlinkView> extends DownlinkModem {
  protected volatile Object views; // View | DownlinkView[]

  public DownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                       float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
  }

  @Override
  public final boolean keepLinked() {
    final Object views = this.views;
    if (views instanceof DownlinkView) {
      return ((DownlinkView) views).keepLinked();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        if (viewArray[i].keepLinked()) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public final boolean keepSynced() {
    final Object views = this.views;
    if (views instanceof DownlinkView) {
      return ((DownlinkView) views).keepSynced();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        if (viewArray[i].keepSynced()) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  protected void pushDownEvent(EventMessage message) {
    onEvent(message);
    new DownlinkRelayOnEvent<View>(this, message).run();
  }

  @Override
  protected void pushDownLinked(LinkedResponse response) {
    didLink(response);
    new DownlinkRelayDidLink<View>(this, response).run();
  }

  @Override
  protected void pushDownSynced(SyncedResponse response) {
    didSync(response);
    new DownlinkRelayDidSync<View>(this, response).run();
  }

  @Override
  protected void pushDownUnlinked(UnlinkedResponse response) {
    didUnlink(response);
    new DownlinkRelayDidUnlink<View>(this, response).run();
  }

  @Override
  protected void pullUpCommand(CommandMessage message) {
    onCommand(message);
    new DownlinkRelayWillCommand<View>(this, message).run();
  }

  @Override
  protected void pullUpLink(LinkRequest request) {
    willLink(request);
    new DownlinkRelayWillLink<View>(this, request).run();
  }

  @Override
  protected void pullUpSync(SyncRequest request) {
    willSync(request);
    new DownlinkRelayWillSync<View>(this, request).run();
  }

  @Override
  protected void pullUpUnlink(UnlinkRequest request) {
    willUnlink(request);
    new DownlinkRelayWillUnlink<View>(this, request).run();
  }

  public void addDownlink(View view) {
    Object oldViews;
    Object newViews;
    do {
      oldViews = this.views;
      if (oldViews instanceof DownlinkView) {
        newViews = new DownlinkView[]{(DownlinkView) oldViews, view};
      } else if (oldViews instanceof DownlinkView[]) {
        final DownlinkView[] oldViewArray = (DownlinkView[]) oldViews;
        final int n = oldViewArray.length;
        final DownlinkView[] newViewArray = new DownlinkView[n + 1];
        System.arraycopy(oldViewArray, 0, newViewArray, 0, n);
        newViewArray[n] = view;
        newViews = newViewArray;
      } else {
        newViews = view;
      }
    } while (!VIEWS.compareAndSet(this, oldViews, newViews));
    didAddDownlink(view);
    if (oldViews == null) {
      openDown();
    }
  }

  public void removeDownlink(View view) {
    Object oldViews;
    Object newViews;
    do {
      oldViews = this.views;
      if (oldViews instanceof DownlinkView) {
        if (oldViews == view) {
          newViews = null;
          continue;
        }
      } else if (oldViews instanceof DownlinkView[]) {
        final DownlinkView[] oldViewArray = (DownlinkView[]) oldViews;
        final int n = oldViewArray.length;
        if (n == 2) {
          if (oldViewArray[0] == view) {
            newViews = oldViewArray[1];
            continue;
          } else if (oldViewArray[1] == view) {
            newViews = oldViewArray[0];
            continue;
          }
        } else { // n > 2
          final DownlinkView[] newViewArray = new DownlinkView[n - 1];
          int i = 0;
          while (i < n) {
            if (oldViewArray[i] != view) {
              if (i < n - 1) {
                newViewArray[i] = oldViewArray[i];
              }
              i += 1;
            } else {
              break;
            }
          }
          if (i < n) {
            System.arraycopy(oldViewArray, i + 1, newViewArray, i, n - (i + 1));
            newViews = newViewArray;
            continue;
          }
        }
      }
      newViews = oldViews;
      break;
    } while (!VIEWS.compareAndSet(this, oldViews, newViews));
    if (oldViews != newViews) {
      didRemoveDownlink(view);
    }
    if (newViews == null) {
      closeDown();
    }
  }

  protected void didAddDownlink(View view) {
    // stub
  }

  protected void didRemoveDownlink(View view) {
    // stub
  }

  @SuppressWarnings("unchecked")
  @Override
  public void reopen() {
    final Object views = VIEWS.getAndSet(this, null);
    View view;
    if (views instanceof DownlinkView) {
      view = (View) views;
      view.close();
      didRemoveDownlink(view);
      closeDown();
      view.open();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      final int n = viewArray.length;
      for (int i = 0; i < n; i += 1) {
        view = (View) viewArray[i];
        view.close();
        didRemoveDownlink(view);
      }
      closeDown();
      for (int i = 0; i < n; i += 1) {
        view = (View) viewArray[i];
        view.open();
      }
    }
  }

  @Override
  public void didConnect() {
    super.didConnect();
    new DownlinkRelayDidConnect<View>(this).run();
  }

  @Override
  public void didDisconnect() {
    super.didDisconnect();
    new DownlinkRelayDidDisconnect<View>(this).run();
  }

  @Override
  public void didCloseUp() {
    super.didCloseUp();
    new DownlinkRelayDidClose<View>(this).run();
  }

  @Override
  public void didFail(Throwable error) {
    super.didFail(error);
    new DownlinkRelayDidFail<View>(this, error).run();
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<DownlinkModel<?>, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater((Class<DownlinkModel<?>>) (Class<?>) DownlinkModel.class, Object.class, "views");
}

final class DownlinkRelayOnEvent<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final EventMessage message;

  DownlinkRelayOnEvent(DownlinkModel<View> model, EventMessage message) {
    super(model, 2);
    this.message = message;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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
  void done() {
    this.model.cueDown();
  }
}

final class DownlinkRelayWillCommand<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final CommandMessage message;

  DownlinkRelayWillCommand(DownlinkModel<View> model, CommandMessage message) {
    super(model);
    this.message = message;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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

final class DownlinkRelayWillLink<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final LinkRequest request;

  DownlinkRelayWillLink(DownlinkModel<View> model, LinkRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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

final class DownlinkRelayDidLink<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final LinkedResponse response;

  DownlinkRelayDidLink(DownlinkModel<View> model, LinkedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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
  void done() {
    this.model.cueDown();
  }
}

final class DownlinkRelayWillSync<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final SyncRequest request;

  DownlinkRelayWillSync(DownlinkModel<View> model, SyncRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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

final class DownlinkRelayDidSync<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final SyncedResponse response;

  DownlinkRelayDidSync(DownlinkModel<View> model, SyncedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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
  void done() {
    this.model.cueDown();
  }
}

final class DownlinkRelayWillUnlink<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final UnlinkRequest request;

  DownlinkRelayWillUnlink(DownlinkModel<View> model, UnlinkRequest request) {
    super(model);
    this.request = request;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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

final class DownlinkRelayDidUnlink<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final UnlinkedResponse response;

  DownlinkRelayDidUnlink(DownlinkModel<View> model, UnlinkedResponse response) {
    super(model);
    this.response = response;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
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
  void done() {
    // Don't cueDown model after unlinked.
  }
}

final class DownlinkRelayDidConnect<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  DownlinkRelayDidConnect(DownlinkModel<View> model) {
    super(model);
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidConnect();
      }
      return view.dispatchDidConnect(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class DownlinkRelayDidDisconnect<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  DownlinkRelayDidDisconnect(DownlinkModel<View> model) {
    super(model);
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidDisconnect();
      }
      return view.dispatchDidDisconnect(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class DownlinkRelayDidClose<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  DownlinkRelayDidClose(DownlinkModel<View> model) {
    super(model);
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidClose();
      }
      return view.dispatchDidClose(preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class DownlinkRelayDidFail<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  final Throwable error;

  DownlinkRelayDidFail(DownlinkModel<View> model, Throwable error) {
    super(model);
    this.error = error;
  }

  @Override
  boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidFail(this.error);
      }
      return view.dispatchDidFail(this.error, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
