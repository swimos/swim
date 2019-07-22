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
import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class LaneModel<View extends LaneView, U extends AbstractUplinkContext> extends AbstractTierBinding implements LaneBinding {
  protected LaneContext laneContext;

  protected volatile Object views; // View | LaneView[]

  protected volatile FingerTrieSeq<U> uplinks;

  public LaneModel() {
    this.uplinks = FingerTrieSeq.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.laneContext;
  }

  @Override
  public final NodeBinding node() {
    return this.laneContext.node();
  }

  @Override
  public final LaneBinding laneWrapper() {
    return this;
  }

  @Override
  public final LaneContext laneContext() {
    return this.laneContext;
  }

  @Override
  public void setLaneContext(LaneContext laneContext) {
    this.laneContext = laneContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.laneContext.unwrapLane(laneClass);
    }
  }

  protected abstract U createUplink(LinkBinding link);

  @Override
  public final Uri meshUri() {
    return this.laneContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.laneContext.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.laneContext.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.laneContext.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.laneContext.laneUri();
  }

  @Override
  public Policy policy() {
    return this.laneContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.laneContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.laneContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.laneContext.store();
  }

  @Override
  public Lane getLaneView(AgentContext agentContext) {
    final Object views = this.views;
    LaneView view;
    if (views instanceof LaneView) {
      view = (LaneView) views;
      if (agentContext == view.agentContext()) {
        return view;
      }
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        view = viewArray[i];
        if (agentContext == view.agentContext()) {
          return view;
        }
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void openLaneView(Lane view) {
    Object oldLaneViews;
    Object newLaneViews;
    do {
      oldLaneViews = this.views;
      if (oldLaneViews instanceof LaneView) {
        newLaneViews = new LaneView[]{(LaneView) oldLaneViews, (LaneView) view};
      } else if (oldLaneViews instanceof LaneView[]) {
        final LaneView[] oldLaneViewArray = (LaneView[]) oldLaneViews;
        final int n = oldLaneViewArray.length;
        final LaneView[] newLaneViewArray = new LaneView[n + 1];
        System.arraycopy(oldLaneViewArray, 0, newLaneViewArray, 0, n);
        newLaneViewArray[n] = (LaneView) view;
        newLaneViews = newLaneViewArray;
      } else {
        newLaneViews = (LaneView) view;
      }
    } while (!VIEWS.compareAndSet(this, oldLaneViews, newLaneViews));
    didOpenLaneView((View) view);
    activate((View) view);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void closeLaneView(Lane view) {
    Object oldLaneViews;
    Object newLaneViews;
    do {
      oldLaneViews = this.views;
      if (oldLaneViews instanceof LaneView) {
        if (oldLaneViews == view) {
          newLaneViews = null;
          continue;
        }
      } else if (oldLaneViews instanceof LaneView[]) {
        final LaneView[] oldLaneViewArray = (LaneView[]) oldLaneViews;
        final int n = oldLaneViewArray.length;
        if (n == 2) {
          if (oldLaneViewArray[0] == view) {
            newLaneViews = oldLaneViewArray[1];
            continue;
          } else if (oldLaneViewArray[1] == view) {
            newLaneViews = oldLaneViewArray[0];
            continue;
          }
        } else { // n > 2
          final LaneView[] newLaneViewArray = new LaneView[n - 1];
          int i = 0;
          while (i < n) {
            if (oldLaneViewArray[i] != view) {
              if (i < n - 1) {
                newLaneViewArray[i] = oldLaneViewArray[i];
              }
              i += 1;
            } else {
              break;
            }
          }
          if (i < n) {
            System.arraycopy(oldLaneViewArray, i + 1, newLaneViewArray, i, n - (i + 1));
            newLaneViews = newLaneViewArray;
            continue;
          }
        }
      }
      newLaneViews = oldLaneViews;
      break;
    } while (!VIEWS.compareAndSet(this, oldLaneViews, newLaneViews));
    if (oldLaneViews != newLaneViews) {
      ((View) view).didClose();
      didCloseLaneView((View) view);
    }
    if (newLaneViews == null) {
      close();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public FingerTrieSeq<LinkContext> uplinks() {
    return (FingerTrieSeq<LinkContext>) (FingerTrieSeq<?>) this.uplinks;
  }

  @SuppressWarnings("unchecked")
  @Override
  public LinkBinding getUplink(Value linkKey) {
    final FingerTrieSeq<U> uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
    for (int i = 0, n = uplinks.size(); i < n; i += 1) {
      final U uplink = uplinks.get(i);
      if (linkKey.equals(uplink.linkKey())) {
        return uplink.linkBinding();
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void openUplink(LinkBinding link) {
    FingerTrieSeq<U> oldUplinks;
    FingerTrieSeq<U> newUplinks;
    final U uplink = createUplink(link);
    if (uplink != null) {
      link.setLinkContext(uplink);
      do {
        oldUplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
        newUplinks = oldUplinks.appended(uplink);
      } while (!UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
      didUplink(uplink);
      // TODO: onEnter
    } else {
      UplinkError.rejectUnsupported(link);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void closeUplink(Value linkKey) {
    FingerTrieSeq<U> oldUplinks;
    FingerTrieSeq<U> newUplinks;
    U linkContext;
    do {
      oldUplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
      newUplinks = oldUplinks;
      linkContext = null;
      for (int i = 0, n = oldUplinks.size(); i < n; i += 1) {
        final U uplink = oldUplinks.get(i);
        if (linkKey.equals(uplink.linkKey())) {
          linkContext = uplink;
          newUplinks = oldUplinks.removed(i);
          break;
        }
      }
    } while (!UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
    if (linkContext != null) {
      linkContext.linkBinding().didCloseUp();
      // TODO: onLeave
    }
  }

  @Override
  public abstract void pushUp(PushRequest pushRequest);

  @Override
  public abstract void pushUpCommand(CommandMessage message);

  protected abstract void didOpenLaneView(View view);

  protected void didCloseLaneView(View view) {
    // stub
  }

  protected void didUplink(U uplink) {
    // stub
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.laneContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.laneContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.laneContext.closeDownlink(link);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.laneContext.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.laneContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.laneContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.laneContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.laneContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.laneContext.error(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).open();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].open();
      }
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).load();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].load();
      }
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).start();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].start();
      }
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).stop();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].stop();
      }
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).unload();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].unload();
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void willClose() {
    super.willClose();
    final FingerTrieSeq<U> uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
    for (int i = 0, n = uplinks.size(); i < n; i += 1) {
      uplinks.get(i).close();
    }
    final Object views = this.views;
    if (views instanceof LaneView) {
      ((LaneView) views).close();
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        viewArray[i].close();
      }
    }
    this.laneContext.close();
  }

  @Override
  public void didClose() {
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @SuppressWarnings("unchecked")
  protected static final AtomicReferenceFieldUpdater<LaneModel<?, ?>, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater((Class<LaneModel<?, ?>>) (Class<?>) LaneModel.class, Object.class, "views");

  @SuppressWarnings("unchecked")
  protected static final AtomicReferenceFieldUpdater<LaneModel<?, ?>, FingerTrieSeq<? extends LinkContext>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater((Class<LaneModel<?, ?>>) (Class<?>) LaneModel.class, (Class<FingerTrieSeq<? extends LinkContext>>) (Class<?>) FingerTrieSeq.class, "uplinks");
}
