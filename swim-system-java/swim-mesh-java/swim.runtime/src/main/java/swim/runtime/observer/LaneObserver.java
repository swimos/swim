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
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;

@SuppressWarnings( {"UnusedReturnValue", "unused"})
public final class LaneObserver {

  static final AtomicReferenceFieldUpdater<LaneObserver, Observer[]> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(LaneObserver.class, Observer[].class, "observers");

  private Lane lane;
  private volatile Observer[] observers = new Observer[0];

  public LaneObserver() {
    this(null);
  }

  public LaneObserver(final Lane lane) {
    this.lane = lane;
  }

  public void observe(final Observer newObserver) {
    if (newObserver == null) {
      throw new NullPointerException();
    }

    do {
      final Observer[] newObservers;
      final Observer[] oldObservers = this.observers;
      final Observer[] oldArray = this.observers;
      final int oldCount = oldArray.length;
      final Observer[] newArray = new Observer[oldCount + 1];

      System.arraycopy(oldArray, 0, newArray, 0, oldCount);
      newArray[oldCount] = newObserver;
      newObservers = newArray;

      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
  }

  public void laneDidFail(Throwable error) {
    error.printStackTrace();
  }

  @SuppressWarnings("unchecked")
  public final <K, V> boolean dispatchDidUpdateKey(final Link link, final Boolean preemptive, final K key, final V newValue, final V oldValue) {
    return dispatch(link, preemptive, DidUpdateKey.class, p -> {
      ((DidUpdateKey<K, V>) p).didUpdate(key, newValue, oldValue);

      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <K, V> boolean dispatchDidRemoveKey(final Link link, final Boolean preemptive, final K key, final V oldValue) {
    return dispatch(link, preemptive, DidRemoveKey.class, p -> {
      ((DidRemoveKey<K, V>) p).didRemove(key, oldValue);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <K> boolean dispatchWillRemoveKey(final Link link, final Boolean preemptive, final K key) {
    return dispatch(link, preemptive, WillRemoveKey.class, p -> {
      ((WillRemoveKey<K>) p).willRemove(key);

      return null;
    }).complete;
  }

  public final boolean dispatchWillReceive(final Link link, final Boolean preemptive, final Value body) {
    return dispatch(link, preemptive, WillReceive.class, p -> {
      ((WillReceive) p).willReceive(body);

      return null;
    }).complete;
  }

  public final boolean dispatchDidConnect(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidConnect.class, p -> {
      ((DidConnect) p).didConnect();

      return null;
    }).complete;
  }

  public final boolean dispatchDidClose(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidClose.class, p -> {
      ((DidClose) p).didClose();

      return null;
    }).complete;
  }

  public final boolean dispatchDidFail(final Link link, final Boolean preemptive, final Throwable cause) {
    return dispatch(link, preemptive, DidFail.class, p -> {
      ((DidFail) p).didFail(cause);

      return null;
    }).complete;
  }

  public final boolean dispatchDidDisconnect(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidDisconnect.class, p -> {
      ((DidDisconnect) p).didDisconnect();

      return null;
    }).complete;
  }

  public final boolean dispatchDidReceive(final Link link, final Boolean preemptive, final Value body) {
    return dispatch(link, preemptive, DidReceive.class, p -> {
      ((DidReceive) p).didReceive(body);

      return null;
    }).complete;
  }

  public final boolean dispatchWillCommand(final Link link, final Boolean preemptive, final Value body) {
    return dispatch(link, preemptive, WillCommand.class, p -> {
      ((WillCommand) p).willCommand(body);

      return null;
    }).complete;
  }

  public final boolean dispatchDidCommand(final Link link, final Boolean preemptive, final Value body) {
    return dispatch(link, preemptive, DidCommand.class, p -> {
      ((DidCommand) p).didCommand(body);

      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <V> boolean dispatchOnCommand(final Link link, final Boolean preemptive, final V body) {
    return dispatch(link, preemptive, OnCommand.class, p -> {
      ((OnCommand<V>) p).onCommand(body);

      return null;
    }).complete;
  }

  public final boolean dispatchWillLink(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, WillLink.class, p -> {
      ((WillLink) p).willLink();

      return null;
    }).complete;
  }

  public final boolean dispatchOnLinkRequest(final Link link, final Boolean preemptive, final LinkRequest request) {
    return dispatch(link, preemptive, OnLinkRequest.class, p -> {
      ((OnLinkRequest) p).onLink(request);

      return null;
    }).complete;
  }

  public final boolean dispatchOnSyncRequest(final Link link, final Boolean preemptive, final SyncRequest request) {
    return dispatch(link, preemptive, OnSyncRequest.class, p -> {
      ((OnSyncRequest) p).onSync(request);

      return null;
    }).complete;
  }

  public final boolean dispatchOnUnlinkRequest(final Link link, final Boolean preemptive, final UnlinkRequest request) {
    return dispatch(link, preemptive, OnUnlinkRequest.class, p -> {
      ((OnUnlinkRequest) p).onUnlink(request);

      return null;
    }).complete;
  }

  public final boolean dispatchDidLink(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidLink.class, p -> {
      ((DidLink) p).didLink();

      return null;
    }).complete;
  }

  public final boolean dispatchWillClear(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, WillClear.class, p -> {
      ((WillClear) p).willClear();
      return null;
    }).complete;
  }

  public final boolean dispatchDidClear(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidClear.class, p -> {
      ((DidClear) p).didClear();
      return null;
    }).complete;
  }

  public final boolean dispatchDidSync(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidSync.class, p -> {
      ((DidSync) p).didSync();
      return null;
    }).complete;
  }

  public final boolean dispatchWillSync(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, WillSync.class, p -> {
      ((WillSync) p).willSync();
      return null;
    }).complete;
  }

  public final boolean dispatchWillUnlink(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, WillUnlink.class, p -> {
      ((WillUnlink) p).willUnlink();
      return null;
    }).complete;
  }

  public final boolean dispatchDidUnlink(final Link link, final Boolean preemptive) {
    return dispatch(link, preemptive, DidUnlink.class, p -> {
      ((DidUnlink) p).didUnlink();
      return null;
    }).complete;
  }

  public final boolean dispatchOnUnlinkedResponse(final Link link, final Boolean preemptive, final UnlinkedResponse unlinkedResponse) {
    return dispatch(link, preemptive, OnUnlinkedResponse.class, p -> {
      ((OnUnlinkedResponse) p).onUnlinked(unlinkedResponse);
      return null;
    }).complete;
  }

  public final boolean dispatchOnSyncedResponse(final Link link, final Boolean preemptive, final SyncedResponse syncedResponse) {
    return dispatch(link, preemptive, OnSyncedResponse.class, p -> {
      ((OnSyncedResponse) p).onSynced(syncedResponse);
      return null;
    }).complete;
  }

  public final boolean dispatchOnLinkedResponse(final Link link, final Boolean preemptive, final LinkedResponse response) {
    return dispatch(link, preemptive, OnLinkedResponse.class, p -> {
      ((OnLinkedResponse) p).onLinked(response);
      return null;
    }).complete;
  }

  public final boolean dispatchOnEventMessage(final Link link, final Boolean preemptive, final EventMessage message) {
    return dispatch(link, preemptive, OnEventMessage.class, p -> {
      ((OnEventMessage) p).onEvent(message);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <V> boolean dispatchOnEvent(final Link link, final Boolean preemptive, final V v) {
    return dispatch(link, preemptive, OnEvent.class, p -> {
      ((OnEvent<V>) p).onEvent(v);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <K, V> Map.Entry<Boolean, V> dispatchWillUpdateKey(final Link link, final Boolean preemptive, final K key, final V newValue) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillUpdateKey.class, p -> ((WillUpdateKey<K, V>) p).willUpdate(key, newValue));
    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public final <L> Map.Entry<Boolean, MapDownlink<?, ?>> dispatchWillDownlinkMap(final Link link, L key, MapDownlink<?, ?> downlink, boolean preemptive) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, WillDownlinkMap.class, p -> ((WillDownlinkMap<L>) p).willDownlink(key, downlink));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(downlink));
  }

  @SuppressWarnings("unchecked")
  public final <L> Map.Entry<Boolean, ValueDownlink<?>> dispatchWillDownlinkValue(final Link link, L key, ValueDownlink<?> downlink, boolean preemptive) {
    DispatchResult<ValueDownlink<?>> dispatchResult = dispatch(link, preemptive, WillDownlinkValue.class, p -> ((WillDownlinkValue<L>) p).willDownlink(key, downlink));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(downlink));
  }

  @SuppressWarnings("unchecked")
  public final <L> boolean dispatchDidDownlinkValue(final Link link, L key, ValueDownlink<?> downlink, boolean preemptive) {
    return dispatch(link, preemptive, DidDownlinkValue.class, p -> {
      ((DidDownlinkValue<L>) p).didDownlink(key, downlink);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public final <L> boolean dispatchDidDownlinkMap(final Link link, L key, MapDownlink<?, ?> downlink, boolean preemptive) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, DidDownlinkMap.class, p -> {
      ((DidDownlinkMap<L>) p).didDownlink(key, downlink);
      return null;
    });

    return dispatchResult.complete;
  }

  public final boolean dispatchWillDrop(final Link link, boolean preemptive, int lower) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, WillDrop.class, p -> {
      ((WillDrop) p).willDrop(lower);
      return null;
    });

    return dispatchResult.complete;
  }

  public final boolean dispatchWillTake(final Link link, boolean preemptive, int upper) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, WillTake.class, p -> {
      ((WillTake) p).willTake(upper);
      return null;
    });

    return dispatchResult.complete;
  }

  public final boolean dispatchDidTake(final Link link, boolean preemptive, int upper) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, DidTake.class, p -> {
      ((DidTake) p).didTake(upper);
      return null;
    });

    return dispatchResult.complete;
  }

  public final boolean dispatchDidDrop(final Link link, boolean preemptive, int lower) {
    DispatchResult<MapDownlink<?, ?>> dispatchResult = dispatch(link, preemptive, DidDrop.class, p -> {
      ((DidDrop) p).didDrop(lower);
      return null;
    });

    return dispatchResult.complete;
  }

  private <T extends Observer, R> DispatchResult<R> dispatch(final Link link, final Boolean preemptive,
                                                             final Dispatcher<R> dispatcher, Observer observer) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();

    try {
      if (lane != null) {
        SwimContext.setLane(lane);
      }
      if (link != null) {
        SwimContext.setLink(link);
      }

      boolean complete = true;
      R r = null;

      if (preemptive == null || observer.isPreemptive() == preemptive) {
        try {
          r = dispatcher.dispatch(observer);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            laneDidFail(error);
          }
          throw error;
        }
      } else if (preemptive) {
        complete = false;
      }

      return new DispatchResult<>(r, complete, true);
    } finally {
      if (lane != null) {
        SwimContext.setLane(oldLane);
      }
      if (oldLink != null) {
        SwimContext.setLink(oldLink);
      }
    }
  }

  private <T extends Observer, R> DispatchResult<R> dispatch(final Link link, final Boolean preemptive,
                                                             final Class<T> clazz, final Dispatcher<R> dispatcher) {
    DispatchResult<R> dispatchResult = null;

    boolean dispatched = false;

    for (Observer o : this.observers) {
      if (clazz.isAssignableFrom(o.getClass())) {
        dispatchResult = dispatch(link, preemptive, dispatcher, o);
        dispatched = true;
      }
    }

    return dispatchResult == null ? new DispatchResult<>(null, true, false) : dispatchResult;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRemoveIndex(Link link, int index, V oldValue, boolean preemptive) {
    return dispatch(link, preemptive, DidRemoveIndex.class, p -> {
      ((DidRemoveIndex<V>) p).didRemove(index, oldValue);
      return null;
    }).complete;
  }

  public boolean dispatchWillRemoveIndex(Link link, int index, boolean preemptive) {
    return dispatch(link, preemptive, WillRemoveIndex.class, p -> {
      ((WillRemoveIndex) p).willRemove(index);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidMoveIndex(Link link, int fromIndex, int toIndex, V value, boolean preemptive) {
    return dispatch(link, preemptive, DidMoveIndex.class, p -> {
      ((DidMoveIndex<V>) p).didMove(fromIndex, toIndex, value);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillMoveIndex(Link link, int fromIndex, int toIndex, V value, boolean preemptive) {
    return dispatch(link, preemptive, WillMoveIndex.class, p -> {
      ((WillMoveIndex<V>) p).willMove(fromIndex, toIndex, value);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidUpdateIndex(Link link, int index, V newValue, V oldValue, boolean preemptive) {
    return dispatch(link, preemptive, DidUpdateIndex.class, p -> {
      ((DidUpdateIndex<V>) p).didUpdate(index, newValue, oldValue);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> AbstractMap.SimpleImmutableEntry<Boolean, V> dispatchWillUpdateIndex(Link link, int index, V newValue, boolean preemptive) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillUpdateIndex.class, p -> ((WillUpdateIndex<V>) p).willUpdate(index, newValue));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public <V> AbstractMap.SimpleImmutableEntry<Boolean, V> dispatchWillSet(Link link, V newValue, boolean preemptive) {
    DispatchResult<V> dispatchResult = dispatch(link, preemptive, WillSet.class, p -> ((WillSet<V>) p).willSet(newValue));

    return new AbstractMap.SimpleImmutableEntry<>(dispatchResult.complete, dispatchResult.result(newValue));
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidSet(Link link, V newValue, V oldValue, boolean preemptive) {
    return dispatch(link, preemptive, DidSet.class, p -> {
      ((DidSet<V>) p).didSet(newValue, oldValue);
      return null;
    }).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillRespondHttp(Link link, HttpResponse<V> response, boolean preemptive) {
    return dispatch(link, preemptive, WillRespondHttp.class, (p -> {
      ((WillRespondHttp<V>) p).willRespond(response);
      return null;
    })).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRespondHttp(Link link, HttpResponse<V> response, boolean preemptive) {
    return dispatch(link, preemptive, DidRespondHttp.class, (p -> {
      ((DidRespondHttp<V>) p).didRespond(response);
      return null;
    })).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchWillRequestHttp(Link link, HttpRequest<V> request, boolean preemptive) {
    return dispatch(link, preemptive, WillRequestHttp.class, (p -> {
      ((WillRequestHttp<V>) p).willRequest(request);
      return null;
    })).complete;
  }

  @SuppressWarnings("unchecked")
  public Object dispatchDoRespondHttp(Link link, HttpRequest<Object> response, boolean preemptive) {
    DispatchResult<? extends HttpResponse<?>> dispatch = dispatch(link, preemptive, DoRespondHttp.class, (p -> ((DoRespondHttp<Object>) p).doRespond(response)));
    return Objects.requireNonNullElseGet(dispatch.v, () -> dispatch.complete);
  }

  @SuppressWarnings("unchecked")
  public <V> boolean dispatchDidRequestHttp(Link link, HttpRequest<V> request, boolean preemptive) {
    return dispatch(link, preemptive, DidRequestHttp.class, (p -> {
      ((DidRequestHttp<V>) p).didRequest(request);
      return null;
    })).complete;
  }

  @SuppressWarnings("unchecked")
  public <V> Decoder<Object> dispatchDecodeRequestHttp(Link link, HttpRequest<?> request) {
    return dispatch(link, null, DecodeRequestHttp.class, (p -> ((DecodeRequestHttp<Object>) p).decodeRequest(request))).v;
  }

  public boolean dispatchWillUplink(final Link link, final boolean preemptive, final WarpUplink uplink) {
    return dispatch(link, preemptive, WillUplink.class, (p -> {
      ((WillUplink) p).willUplink(uplink);
      return null;
    })).complete;
  }

  public boolean dispatchDidUplink(final Link link, final boolean preemptive, final WarpUplink uplink) {
    return dispatch(link, preemptive, DidUplink.class, (p -> {
      ((DidUplink) p).didUplink(uplink);
      return null;
    })).complete;
  }

  public boolean dispatchWillEnter(final Link link, final boolean preemptive, final Identity identity) {
    return dispatch(link, preemptive, WillEnter.class, (p -> {
      ((WillEnter) p).willEnter(identity);
      return null;
    })).complete;
  }

  public boolean dispatchDidEnter(final Link link, final boolean preemptive, final Identity identity) {
    return dispatch(link, preemptive, DidEnter.class, (p -> {
      ((DidEnter) p).didEnter(identity);
      return null;
    })).complete;
  }

  public boolean dispatchWillLeave(final Link link, final boolean preemptive, final Identity identity) {
    return dispatch(link, preemptive, WillLeave.class, (p -> {
      ((WillLeave) p).willLeave(identity);
      return null;
    })).complete;
  }

  public boolean dispatchDidLeave(final Link link, final boolean preemptive, final Identity identity) {
    return dispatch(link, preemptive, DidLeave.class, (p -> {
      ((DidLeave) p).didLeave(identity);
      return null;
    })).complete;
  }

  public interface Dispatcher<V> {

    V dispatch(Observer p);

  }

  public static class DispatchResult<V> {

    final V v;
    final boolean complete;
    final boolean dispatched;

    public DispatchResult(final V v, final boolean complete, final boolean dispatched) {
      this.v = v;
      this.complete = complete;
      this.dispatched = dispatched;
    }

    public V result(V v) {
      return complete && dispatched ? this.v : v;
    }

  }

}
