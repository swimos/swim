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

package swim.runtime;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.uri.Uri;

public abstract class DownlinkModel<View extends DownlinkView> extends AbstractDownlinkBinding implements LinkBinding {
  protected volatile Object views; // View | DownlinkView[]

  public DownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri) {
    super(meshUri, hostUri, nodeUri, laneUri);
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

  @SuppressWarnings("unchecked")
  protected void removeDownlinks() {
    final Object views = VIEWS.getAndSet(this, null);
    View view;
    if (views instanceof DownlinkView) {
      view = (View) views;
      didRemoveDownlink(view);
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      final int n = viewArray.length;
      for (int i = 0; i < n; i += 1) {
        view = (View) viewArray[i];
        didRemoveDownlink(view);
      }
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
    new DownlinkRelayDidConnect<View>(this).run();
  }

  @Override
  public void didDisconnect() {
    new DownlinkRelayDidDisconnect<View>(this).run();
  }

  @Override
  public void didCloseUp() {
    new DownlinkRelayDidClose<View>(this).run();
  }

  @Override
  public void didFail(Throwable error) {
    new DownlinkRelayDidFail<View>(this, error).run();
  }

  public void accumulateExecTime(long execDelta) {
    // hook
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<DownlinkModel<?>, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater((Class<DownlinkModel<?>>) (Class<?>) DownlinkModel.class, Object.class, "views");
}

final class DownlinkRelayDidConnect<View extends DownlinkView> extends DownlinkRelay<DownlinkModel<View>, View> {
  DownlinkRelayDidConnect(DownlinkModel<View> model) {
    super(model);
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
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
  protected boolean runPhase(View view, int phase, boolean preemptive) {
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
  protected boolean runPhase(View view, int phase, boolean preemptive) {
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
  protected boolean runPhase(View view, int phase, boolean preemptive) {
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
