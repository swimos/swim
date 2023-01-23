// Copyright 2015-2023 Swim.inc
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

package swim.system;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.Cont;
import swim.uri.Uri;

public abstract class DownlinkModel<View extends DownlinkView> extends AbstractDownlinkBinding implements LinkBinding {

  protected volatile Object views; // View | DownlinkView[]

  public DownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri) {
    super(meshUri, hostUri, nodeUri, laneUri);
    this.views = null;
  }

  public void addDownlink(View view) {
    do {
      final Object oldViews = DownlinkModel.VIEWS.get(this);
      final Object newViews;
      if (oldViews instanceof DownlinkView) {
        newViews = new DownlinkView[] {(DownlinkView) oldViews, view};
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
      if (DownlinkModel.VIEWS.compareAndSet(this, oldViews, newViews)) {
        this.didAddDownlink(view);
        if (oldViews == null) {
          this.openDown();
        }
        break;
      }
    } while (true);
  }

  public void removeDownlink(View view) {
    do {
      final Object oldViews = DownlinkModel.VIEWS.get(this);
      final Object newViews;
      if (oldViews instanceof DownlinkView) {
        if (oldViews == view) {
          newViews = null;
        } else {
          break;
        }
      } else if (oldViews instanceof DownlinkView[]) {
        final DownlinkView[] oldViewArray = (DownlinkView[]) oldViews;
        final int n = oldViewArray.length;
        if (n == 2) {
          if (oldViewArray[0] == view) {
            newViews = oldViewArray[1];
          } else if (oldViewArray[1] == view) {
            newViews = oldViewArray[0];
          } else {
            break;
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
          } else {
            break;
          }
        }
      } else {
        break;
      }
      if (DownlinkModel.VIEWS.compareAndSet(this, oldViews, newViews)) {
        this.didRemoveDownlink(view);
        if (newViews == null) {
          this.closeDown();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  protected void removeDownlinks() {
    final Object views = DownlinkModel.VIEWS.getAndSet(this, null);
    View view;
    if (views instanceof DownlinkView) {
      view = (View) views;
      this.didRemoveDownlink(view);
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      final int n = viewArray.length;
      for (int i = 0; i < n; i += 1) {
        view = (View) viewArray[i];
        this.didRemoveDownlink(view);
      }
    }
  }

  protected void didAddDownlink(View view) {
    // hook
  }

  protected void didRemoveDownlink(View view) {
    // hook
  }

  @SuppressWarnings("unchecked")
  @Override
  public void reopen() {
    final Object views = DownlinkModel.VIEWS.get(this);
    View view;
    if (views instanceof DownlinkView) {
      view = (View) views;
      view.close();
      view.open();
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      final int n = ((DownlinkView[]) views).length;
      for (int i = 0; i < n; i += 1) {
        view = (View) viewArray[i];
        view.close();
      }
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
    if (Cont.isNonFatal(error)) {
      new DownlinkRelayDidFail<View>(this, error).run();
    } else {
      error.printStackTrace();
    }
  }

  public void accumulateExecTime(long execDelta) {
    // hook
  }

  @SuppressWarnings("unchecked")
  protected static final AtomicReferenceFieldUpdater<DownlinkModel<?>, Object> VIEWS =
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
