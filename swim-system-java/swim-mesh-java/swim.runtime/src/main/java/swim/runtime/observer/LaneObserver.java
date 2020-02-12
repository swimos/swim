// Copyright 2015-2020 SWIM.AI inc.
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
package swim.runtime.observer;

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.WillDownlinkMap;
import swim.api.lane.function.WillDownlinkValue;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.OnEventMessage;
import swim.api.warp.function.OnLinkRequest;
import swim.api.warp.function.OnLinkedResponse;
import swim.api.warp.function.OnSyncRequest;
import swim.api.warp.function.OnSyncedResponse;
import swim.api.warp.function.OnUnlinkRequest;
import swim.api.warp.function.OnUnlinkedResponse;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.api.warp.function.WillUplink;
import swim.codec.Decoder;
import swim.collections.HashTrieMap;
import swim.concurrent.Conts;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.observable.Observer;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidSet;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillSet;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.observable.function.WillUpdateKey;
import swim.structure.Value;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;

public final class LaneObserver {

  @SuppressWarnings("rawtypes")
  private static final AtomicReferenceFieldUpdater<LaneObserver, HashTrieMap> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(LaneObserver.class, HashTrieMap.class, "observers");
  private volatile HashTrieMap<Class<?>, List<Observer>> observers = HashTrieMap.empty();
  private final Lane lane;

  public LaneObserver() {
    this(null);
  }

  public LaneObserver(final Lane lane) {
    this.lane = lane;
  }

  private static List<Class<?>> getObserverInterfaces(final Observer observer) {
    final List<Class<?>> interfaces = new ArrayList<>();
    Class<?> clazz = observer.getClass();

    while (clazz != Object.class) {
      for (final Class<?> intf : clazz.getInterfaces()) {
        if (Observer.class.isAssignableFrom(intf)) {
          interfaces.add(intf);
        }
      }

      clazz = clazz.getSuperclass();
    }

    return interfaces;
  }

  @SuppressWarnings("DuplicatedCode")
  public void unobserve(final Observer oldObserver) {
    if (oldObserver == null) {
      return;
    }

    final List<Class<?>> interfaces = getObserverInterfaces(oldObserver);
    HashTrieMap<Class<?>, List<Observer>> oldMap;
    HashTrieMap<Class<?>, List<Observer>> newMap;

    do {
      oldMap = observers;
      newMap = observers;

      for (Class<?> c : interfaces) {
        if (newMap.containsKey(c)) {
          List<Observer> observers = newMap.get(c);
          List<Observer> newObservers = new ArrayList<>(observers);

          newObservers.remove(oldObserver);
          if (newObservers.size() == 0) {
            newMap = newMap.removed(c);
          } else {
            newMap = newMap.updated(c, newObservers);
          }
        }
      }
    } while (!OBSERVERS.compareAndSet(this, oldMap, newMap));
  }

  @SuppressWarnings("DuplicatedCode")
  public void observe(final Observer newObserver) {
    if (newObserver == null) {
      return;
    }

    final List<Class<?>> interfaces = getObserverInterfaces(newObserver);
    HashTrieMap<Class<?>, List<Observer>> oldMap;
    HashTrieMap<Class<?>, List<Observer>> newMap;

    do {
      oldMap = observers;
      newMap = observers;

      for (Class<?> c : interfaces) {
        if (newMap.containsKey(c)) {
          List<Observer> observers = newMap.get(c);
          List<Observer> newObservers = new ArrayList<>(observers);

          newObservers.add(newObserver);
          newMap = newMap.updated(c, newObservers);
        } else {
          List<Observer> newObservers = new ArrayList<>();
          newObservers.add(newObserver);
          newMap = newMap.updated(c, newObservers);
        }
      }
    } while (!OBSERVERS.compareAndSet(this, oldMap, newMap));
  }

  public void laneDidFail(final Throwable error) {
    error.printStackTrace();
  }

  @SuppressWarnings("unchecked")
  public final <K, V> boolean dispatchDidUpdateKey(final Link link, final boolean preemptive, final K key, final V newValue, final V oldValue) {
    return voidDispatch(link, preemptive, DidUpdateKey.class, p -> ((DidUpdateKey<K, V>) p).didUpdate(key, newValue, oldValue));
  }

  @SuppressWarnings("unchecked")
  public final <K, V> boolean dispatchDidRemoveKey(final Link link, final boolean preemptive, final K key, final V oldValue) {
    return voidDispatch(link, preemptive, DidRemoveKey.class, p -> ((DidRemoveKey<K, V>) p).didRemove(key, oldValue));
  }

  @SuppressWarnings("unchecked")
  public final <K> boolean dispatchWillRemoveKey(final Link link, final boolean preemptive, final K key) {
    return voidDispatch(link, preemptive, WillRemoveKey.class, p -> ((WillRemoveKey<K>) p).willRemove(key));
  }

  public final boolean dispatchWillReceive(final Link link, final boolean preemptive, final Value body) {
    return voidDispatch(link, preemptive, WillReceive.class, p -> ((WillReceive) p).willReceive(body));
  }

  public final boolean dispatchDidConnect(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidConnect.class, p -> ((DidConnect) p).didConnect());
  }

  public final boolean dispatchDidClose(final Link link, final Boolean preemptive) {
    return voidDispatch(link, preemptive, DidClose.class, p -> ((DidClose) p).didClose());
  }

  public final boolean dispatchDidFail(final Link link, final boolean preemptive, final Throwable cause) {
    return voidDispatch(link, preemptive, DidFail.class, p -> ((DidFail) p).didFail(cause));
  }

  public final boolean dispatchDidDisconnect(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidDisconnect.class, p -> ((DidDisconnect) p).didDisconnect());
  }

  public final boolean dispatchDidReceive(final Link link, final boolean preemptive, final Value body) {
    return voidDispatch(link, preemptive, DidReceive.class, p -> ((DidReceive) p).didReceive(body));
  }

  public final boolean dispatchWillCommand(final Link link, final boolean preemptive, final Value body) {
    return voidDispatch(link, preemptive, WillCommand.class, p -> ((WillCommand) p).willCommand(body));
  }

  public final boolean dispatchDidCommand(final Link link, final boolean preemptive, final Value body) {
    return voidDispatch(link, preemptive, DidCommand.class, p -> ((DidCommand) p).didCommand(body));
  }

  @SuppressWarnings("unchecked")
  public final <V> boolean dispatchOnCommand(final Link link, final boolean preemptive, final V body) {
    return voidDispatch(link, preemptive, OnCommand.class, p -> ((OnCommand<V>) p).onCommand(body));
  }

  public final boolean dispatchWillLink(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillLink.class, p -> ((WillLink) p).willLink());
  }

  public final boolean dispatchOnLinkRequest(final Link link, final boolean preemptive, final LinkRequest request) {
    return voidDispatch(link, preemptive, OnLinkRequest.class, p -> ((OnLinkRequest) p).onLink(request));
  }

  public final boolean dispatchOnSyncRequest(final Link link, final boolean preemptive, final SyncRequest request) {
    return voidDispatch(link, preemptive, OnSyncRequest.class, p -> ((OnSyncRequest) p).onSync(request));
  }

  public final boolean dispatchOnUnlinkRequest(final Link link, final boolean preemptive, final UnlinkRequest request) {
    return voidDispatch(link, preemptive, OnUnlinkRequest.class, p -> ((OnUnlinkRequest) p).onUnlink(request));
  }

  public final boolean dispatchDidLink(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidLink.class, p -> ((DidLink) p).didLink());
  }

  public final boolean dispatchWillClear(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillClear.class, p -> ((WillClear) p).willClear());
  }

  public final boolean dispatchDidClear(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidClear.class, p -> ((DidClear) p).didClear());
  }

  public final boolean dispatchDidSync(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidSync.class, p -> ((DidSync) p).didSync());
  }

  public final boolean dispatchWillSync(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillSync.class, p -> ((WillSync) p).willSync());
  }

  public final boolean dispatchWillUnlink(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillUnlink.class, p -> ((WillUnlink) p).willUnlink());
  }

  public final boolean dispatchDidUnlink(final Link link, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidUnlink.class, p -> ((DidUnlink) p).didUnlink());
  }

  public final boolean dispatchOnUnlinkedResponse(final Link link, final Boolean preemptive, final UnlinkedResponse unlinkedResponse) {
    return voidDispatch(link, preemptive, OnUnlinkedResponse.class, p -> ((OnUnlinkedResponse) p).onUnlinked(unlinkedResponse));
  }

  public final boolean dispatchOnSyncedResponse(final Link link, final Boolean preemptive, final SyncedResponse syncedResponse) {
    return voidDispatch(link, preemptive, OnSyncedResponse.class, p -> ((OnSyncedResponse) p).onSynced(syncedResponse));
  }

  public final boolean dispatchOnLinkedResponse(final Link link, final Boolean preemptive, final LinkedResponse response) {
    return voidDispatch(link, preemptive, OnLinkedResponse.class, p -> ((OnLinkedResponse) p).onLinked(response));
  }

  public final boolean dispatchOnEventMessage(final Link link, final Boolean preemptive, final EventMessage message) {
    return voidDispatch(link, preemptive, OnEventMessage.class, p -> ((OnEventMessage) p).onEvent(message));
  }

  @SuppressWarnings("unchecked")
  public final <V> boolean dispatchOnEvent(final Link link, final boolean preemptive, final V v) {
    return voidDispatch(link, preemptive, OnEvent.class, p -> ((OnEvent<V>) p).onEvent(v));
  }

  @SuppressWarnings("unchecked")
  public final <K, V> Map.Entry<Boolean, V> dispatchWillUpdateKey(final Link link, final boolean preemptive, final K key, final V newValue) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillUpdateKey.class, p -> ((WillUpdateKey<K, V>) p).willUpdate(key, newValue));
    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public final <L> Map.Entry<Boolean, MapDownlink<?, ?>> dispatchWillDownlinkMap(final Link link, final L key, final MapDownlink<?, ?> downlink, final boolean preemptive) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, WillDownlinkMap.class, p -> ((WillDownlinkMap<L>) p).willDownlink(key, downlink));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(downlink));
  }

  @SuppressWarnings("unchecked")
  public final <L> Map.Entry<Boolean, ValueDownlink<?>> dispatchWillDownlinkValue(final Link link, final L key, final ValueDownlink<?> downlink, final boolean preemptive) {
    DispatchResult<ValueDownlink<?>> dispatchResult = dispatch(link, preemptive, WillDownlinkValue.class, p -> ((WillDownlinkValue<L>) p).willDownlink(key, downlink));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(downlink));
  }

  @SuppressWarnings("unchecked")
  public final <L> boolean dispatchDidDownlinkValue(final Link link, final L key, final ValueDownlink<?> downlink, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidDownlinkValue.class, p -> ((DidDownlinkValue<L>) p).didDownlink(key, downlink));
  }

  @SuppressWarnings("unchecked")
  public final <L> boolean dispatchDidDownlinkMap(final Link link, final L key, final MapDownlink<?, ?> downlink, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidDownlinkMap.class, p -> ((DidDownlinkMap<L>) p).didDownlink(key, downlink));
  }

  public final boolean dispatchWillDrop(final Link link, final boolean preemptive, final int lower) {
    return voidDispatch(link, preemptive, WillDrop.class, p -> ((WillDrop) p).willDrop(lower));
  }

  public final boolean dispatchWillTake(final Link link, final boolean preemptive, final int upper) {
    return voidDispatch(link, preemptive, WillTake.class, p -> ((WillTake) p).willTake(upper));
  }

  public final boolean dispatchDidTake(final Link link, final boolean preemptive, final int upper) {
    return voidDispatch(link, preemptive, DidTake.class, p -> ((DidTake) p).didTake(upper));
  }

  public final boolean dispatchDidDrop(final Link link, final boolean preemptive, final int lower) {
    return voidDispatch(link, preemptive, DidDrop.class, p -> ((DidDrop) p).didDrop(lower));
  }

  private void setSwimContext(final Link link) {
    if (lane != null) {
      SwimContext.setLane(lane);
    }
    if (link != null) {
      SwimContext.setLink(link);
    }
  }

  private void clearSwimContext(final Link oldLink, final Lane oldLane) {
    if (lane != null) {
      SwimContext.setLane(oldLane);
    }
    if (oldLink != null) {
      SwimContext.setLink(oldLink);
    }
  }

  /**
   * Dispatches the provided observer by {@code observerType}. Multiple observers may be registered for the given type
   * and so only the last observer's return value will be returned along with whether or not it was a success.
   *
   * @param link         the associated downlink
   * @param preemptive   whether or not this is a preemptive call to the observer
   * @param observerType the class type of the requested observer
   * @param dispatcher   to invoke
   * @param <R>          the return type of the observer
   * @return whether or not any calls were successful
   */
  private <T extends Observer, R> DispatchResult<R> dispatch(final Link link, final Boolean preemptive,
                                                             final Class<T> observerType, final Dispatcher<R> dispatcher) {
    DispatchResult<R> dispatchResult = null;
    if (this.observers.containsKey(observerType)) {
      for (Observer o : this.observers.get(observerType)) {
        final Lane oldLane = SwimContext.getLane();
        final Link oldLink = SwimContext.getLink();

        try {
          setSwimContext(link);

          boolean complete = true;
          R r = null;

          if (preemptive == null || o.isPreemptive() == preemptive) {
            try {
              r = dispatcher.dispatch(o);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                laneDidFail(error);
              }
              throw error;
            }
          } else if (preemptive) {
            complete = false;
          }

          dispatchResult = new DispatchResult<>(r, complete, true);
        } finally {
          clearSwimContext(oldLink, oldLane);
        }
      }
    }

    return dispatchResult == null ? new DispatchResult<>(null, true, false) : dispatchResult;
  }

  /**
   * Dispatches the provided observer by {@code observerType} without returning its return value (if one is returned).
   * Multiple observers may be registered for the given type and so if any are successful then the method will return as
   * a success.
   *
   * @param link         the associated downlink
   * @param preemptive   whether or not this is a preemptive call to the observer
   * @param observerType the class type of the requested observer
   * @param dispatcher   to invoke
   * @param <T>          the observer's type
   * @return whether or not any calls were successful
   */
  private <T extends Observer> boolean voidDispatch(final Link link, final Boolean preemptive,
                                                    final Class<T> observerType, final VoidDispatcher dispatcher) {
    boolean complete = true;

    if (this.observers.containsKey(observerType)) {
      for (Observer o : this.observers.get(observerType)) {
        final Lane oldLane = SwimContext.getLane();
        final Link oldLink = SwimContext.getLink();

        try {
          setSwimContext(link);

          if (preemptive == null || o.isPreemptive() == preemptive) {
            try {
              dispatcher.dispatch(o);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                laneDidFail(error);
              }
              throw error;
            }
          } else if (preemptive) {
            complete = false;
          }

        } finally {
          clearSwimContext(oldLink, oldLane);
        }
      }
    }

    return complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRemoveIndex(final Link link, int index, final V oldValue, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidRemoveIndex.class, p -> ((DidRemoveIndex<V>) p).didRemove(index, oldValue));
  }

  public boolean dispatchWillRemoveIndex(final Link link, int index, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillRemoveIndex.class, p -> ((WillRemoveIndex) p).willRemove(index));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidMoveIndex(final Link link, final int fromIndex, final int toIndex, final V value, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidMoveIndex.class, p -> ((DidMoveIndex<V>) p).didMove(fromIndex, toIndex, value));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillMoveIndex(final Link link, final int fromIndex, final int toIndex, final V value, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillMoveIndex.class, p -> ((WillMoveIndex<V>) p).willMove(fromIndex, toIndex, value));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidUpdateIndex(final Link link, final int index, final V newValue, final V oldValue, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidUpdateIndex.class, p -> ((DidUpdateIndex<V>) p).didUpdate(index, newValue, oldValue));
  }

  @SuppressWarnings("unchecked")
  public <V> AbstractMap.SimpleImmutableEntry<Boolean, V> dispatchWillUpdateIndex(final Link link, final int index, final V newValue, final boolean preemptive) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillUpdateIndex.class, p -> ((WillUpdateIndex<V>) p).willUpdate(index, newValue));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public <V> AbstractMap.SimpleImmutableEntry<Boolean, V> dispatchWillSet(final Link link, final V newValue, final boolean preemptive) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillSet.class, p -> ((WillSet<V>) p).willSet(newValue));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidSet(final Link link, final V newValue, final V oldValue, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidSet.class, p -> ((DidSet<V>) p).didSet(newValue, oldValue));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillRespondHttp(final Link link, final HttpResponse<V> response, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillRespondHttp.class, (p -> ((WillRespondHttp<V>) p).willRespond(response)));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRespondHttp(final Link link, final HttpResponse<V> response, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidRespondHttp.class, (p -> ((DidRespondHttp<V>) p).didRespond(response)));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillRequestHttp(final Link link, final HttpRequest<V> request, final boolean preemptive) {
    return voidDispatch(link, preemptive, WillRequestHttp.class, (p -> ((WillRequestHttp<V>) p).willRequest(request)));
  }

  @SuppressWarnings("unchecked")
  public Object dispatchDoRespondHttp(final Link link, final HttpRequest<Object> response, final boolean preemptive) {
    DispatchResult<? extends HttpResponse<?>> dispatch = dispatch(link, preemptive, DoRespondHttp.class, (p -> ((DoRespondHttp<Object>) p).doRespond(response)));
    return Objects.requireNonNullElseGet(dispatch.v, () -> dispatch.complete);
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRequestHttp(final Link link, final HttpRequest<V> request, final boolean preemptive) {
    return voidDispatch(link, preemptive, DidRequestHttp.class, (p -> ((DidRequestHttp<V>) p).didRequest(request)));
  }

  @SuppressWarnings("unchecked")
  public Decoder<Object> dispatchDecodeRequestHttp(final Link link, final HttpRequest<?> request) {
    return dispatch(link, null, DecodeRequestHttp.class, (p -> ((DecodeRequestHttp<Object>) p).decodeRequest(request))).v;
  }

  public boolean dispatchWillUplink(final Link link, final boolean preemptive, final WarpUplink uplink) {
    return voidDispatch(link, preemptive, WillUplink.class, (p -> ((WillUplink) p).willUplink(uplink)));
  }

  public boolean dispatchDidUplink(final Link link, final boolean preemptive, final WarpUplink uplink) {
    return voidDispatch(link, preemptive, DidUplink.class, (p -> ((DidUplink) p).didUplink(uplink)));
  }

  public boolean dispatchWillEnter(final Link link, final boolean preemptive, final Identity identity) {
    return voidDispatch(link, preemptive, WillEnter.class, (p -> ((WillEnter) p).willEnter(identity)));
  }

  public boolean dispatchDidEnter(final Link link, final boolean preemptive, final Identity identity) {
    return voidDispatch(link, preemptive, DidEnter.class, (p -> ((DidEnter) p).didEnter(identity)));
  }

  public boolean dispatchWillLeave(final Link link, final boolean preemptive, final Identity identity) {
    return voidDispatch(link, preemptive, WillLeave.class, (p -> ((WillLeave) p).willLeave(identity)));
  }

  public boolean dispatchDidLeave(final Link link, final boolean preemptive, final Identity identity) {
    return voidDispatch(link, preemptive, DidLeave.class, (p -> ((DidLeave) p).didLeave(identity)));
  }

  public interface Dispatcher<V> {

    V dispatch(final Observer p);

  }

  public interface VoidDispatcher {

    void dispatch(final Observer p);

  }

  /**
   * The result of a {@link Dispatcher} call.
   *
   * @param <V> the type of the returned value
   */
  private static class DispatchResult<V> {

    final V v;
    final boolean complete;
    final boolean dispatched;

    public DispatchResult(final V v, final boolean complete, final boolean dispatched) {
      this.v = v;
      this.complete = complete;
      this.dispatched = dispatched;
    }

    public V result(final V v) {
      return complete && dispatched ? this.v : v;
    }

  }

}
