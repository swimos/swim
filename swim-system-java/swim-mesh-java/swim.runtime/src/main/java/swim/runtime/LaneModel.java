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

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.lane.DemandMapLane;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncKeys;
import swim.api.policy.Policy;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.agent.AgentNode;
import swim.runtime.reflect.UplinkInfo;
import swim.store.StoreBinding;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class LaneModel<View extends LaneView, U extends AbstractUplinkContext> extends AbstractTierBinding implements LaneBinding {
  protected LaneContext laneContext;
  protected volatile Object views; // View | LaneView[]
  protected volatile FingerTrieSeq<U> uplinks;

  AgentNode metaNode;
  DemandMapLane<Value, UplinkInfo> metaUplinks;

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

  protected UplinkAddress createUplinkAddress(LinkBinding link) {
    return cellAddress().linkKey(LinkKeys.generateLinkKey());
  }

  @Override
  public LaneAddress cellAddress() {
    return this.laneContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.laneContext.edgeName();
  }

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
  public LinkContext getUplink(Value linkKey) {
    final FingerTrieSeq<U> uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
    for (int i = 0, n = uplinks.size(); i < n; i += 1) {
      final U uplink = uplinks.get(i);
      if (linkKey.equals(uplink.linkKey())) {
        return uplink;
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
      didOpenUplink(uplink);
      // TODO: onEnter
      final DemandMapLane<Value, UplinkInfo> metaUplinks = this.metaUplinks;
      if (metaUplinks != null) {
        metaUplinks.cue(link.linkKey());
      }
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
      final DemandMapLane<Value, UplinkInfo> metaUplinks = this.metaUplinks;
      if (metaUplinks != null) {
        metaUplinks.remove(linkKey);
      }
      // TODO: onLeave
      didCloseUplink(linkContext);
    }
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    if (metaLane instanceof AgentNode) {
      this.metaNode = (AgentNode) metaLane;
      openMetaLanes(lane, (AgentNode) metaLane);
    }
    this.laneContext.openMetaLane(lane, metaLane);
  }

  protected void openMetaLanes(LaneBinding lane, AgentNode metaLane) {
    openReflectLanes(lane, metaLane);
  }

  protected void openReflectLanes(LaneBinding lane, AgentNode metaLane) {
    this.metaUplinks = metaLane.demandMapLane()
        .keyForm(Form.forValue())
        .valueForm(UplinkInfo.uplinkForm())
        .observe(new LaneModelUplinksController(lane));
    metaLane.openLane(UPLINKS_URI, this.metaUplinks);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.laneContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.laneContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public abstract void pushUp(Push<?> push);

  @Override
  public abstract void pushUpCommand(Push<CommandMessage> push);

  protected abstract void didOpenLaneView(View view);

  protected void didCloseLaneView(View view) {
    // hook
  }

  protected void didOpenUplink(U uplink) {
    // hook
  }

  protected void didCloseUplink(U uplink) {
    // hook
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.laneContext.bindDownlink(downlink);
    link.setCellContext(this);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.laneContext.openDownlink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.laneContext.closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    this.laneContext.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.laneContext.reportDown(metric);
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
  public void fail(Object message) {
    this.laneContext.fail(message);
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
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaUplinks = null;
    }
  }

  @Override
  public void didFail(Throwable error) {
    if (Conts.isNonFatal(error)) {
      fail(error);
    } else {
      error.printStackTrace();
    }
  }

  public void accumulateExecTime(long execDelta) {
    // hook
  }

  static final Uri UPLINKS_URI = Uri.parse("uplinks");

  @SuppressWarnings("unchecked")
  protected static final AtomicReferenceFieldUpdater<LaneModel<?, ?>, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater((Class<LaneModel<?, ?>>) (Class<?>) LaneModel.class, Object.class, "views");

  @SuppressWarnings("unchecked")
  protected static final AtomicReferenceFieldUpdater<LaneModel<?, ?>, FingerTrieSeq<? extends LinkContext>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater((Class<LaneModel<?, ?>>) (Class<?>) LaneModel.class, (Class<FingerTrieSeq<? extends LinkContext>>) (Class<?>) FingerTrieSeq.class, "uplinks");
}

final class LaneModelUplinksController implements OnCueKey<Value, UplinkInfo>, OnSyncKeys<Value> {
  final LaneBinding lane;

  LaneModelUplinksController(LaneBinding lane) {
    this.lane = lane;
  }

  @Override
  public UplinkInfo onCue(Value linkKey, WarpUplink uplink) {
    final LinkContext linkContext = this.lane.getUplink(linkKey);
    if (linkContext == null) {
      return null;
    }
    return UplinkInfo.from(linkContext);
  }

  @Override
  public Iterator<Value> onSync(WarpUplink uplink) {
    return new LaneModelUplinksKeyIterator(this.lane.uplinks().iterator());
  }
}

final class LaneModelUplinksKeyIterator implements Iterator<Value> {
  final Iterator<LinkContext> uplinks;

  LaneModelUplinksKeyIterator(Iterator<LinkContext> uplinks) {
    this.uplinks = uplinks;
  }

  @Override
  public boolean hasNext() {
    return this.uplinks.hasNext();
  }

  @Override
  public Value next() {
    return this.uplinks.next().linkKey();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
