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

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import swim.api.DownlinkException;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.downlink.MapDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.collections.HashTrieMap;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateKey;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.warp.WarpDownlinkView;
import swim.streamlet.Inlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.KeyOutlet;
import swim.streamlet.MapInlet;
import swim.streamlet.MapOutlet;
import swim.streamlet.Outlet;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueCollection;
import swim.structure.collections.ValueCursor;
import swim.structure.collections.ValueEntry;
import swim.structure.collections.ValueMapEntrySet;
import swim.structure.collections.ValueOrderedMap;
import swim.structure.collections.ValueOrderedMapCursor;
import swim.structure.collections.ValueSet;
import swim.uri.Uri;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class MapDownlinkView<K, V> extends WarpDownlinkView implements MapDownlink<K, V> {
  protected final Form<K> keyForm;
  protected final Form<V> valueForm;
  protected MapDownlinkModel model;

  protected MapOutlet<K, V, ? extends Map<K, V>> input;
  protected HashTrieMap<K, KeyEffect> effects;
  protected HashTrieMap<K, KeyOutlet<K, V>> outlets;
  protected Inlet<? super MapDownlink<K, V>>[] outputs; // TODO: unify with observers
  protected int version;

  public MapDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                         Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                         float rate, Value body, int flags, Form<K> keyForm,
                         Form<V> valueForm, Object observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
          body, flags, observers);
    this.keyForm = keyForm;
    this.valueForm = valueForm;

    this.input = null;
    this.effects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  public MapDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                         Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                         float rate, Value body, Form<K> keyForm, Form<V> valueForm) {
    this(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
         body, KEEP_LINKED | KEEP_SYNCED | STATEFUL, keyForm, valueForm, null);
  }

  @Override
  public MapDownlinkModel downlinkModel() {
    return this.model;
  }

  @Override
  public MapDownlinkView<K, V> hostUri(Uri hostUri) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     hostUri, this.nodeUri, this.laneUri,
                                     this.prio, this.rate, this.body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> hostUri(String hostUri) {
    return hostUri(Uri.parse(hostUri));
  }

  @Override
  public MapDownlinkView<K, V> nodeUri(Uri nodeUri) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, nodeUri, this.laneUri,
                                     this.prio, this.rate, this.body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> nodeUri(String nodeUri) {
    return nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public MapDownlinkView<K, V> laneUri(Uri laneUri) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, laneUri,
                                     this.prio, this.rate, this.body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> laneUri(String laneUri) {
    return laneUri(Uri.parse(laneUri));
  }

  @Override
  public MapDownlinkView<K, V> prio(float prio) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, this.laneUri,
                                     prio, this.rate, this.body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> rate(float rate) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, this.laneUri,
                                     this.prio, rate, this.body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> body(Value body) {
    return new MapDownlinkView<K, V>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, this.laneUri,
                                     this.prio, this.rate, body, this.flags,
                                     this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> keepLinked(boolean keepLinked) {
    if (keepLinked) {
      this.flags |= KEEP_LINKED;
    } else {
      this.flags &= ~KEEP_LINKED;
    }
    return this;
  }

  @Override
  public MapDownlinkView<K, V> keepSynced(boolean keepSynced) {
    if (keepSynced) {
      this.flags |= KEEP_SYNCED;
    } else {
      this.flags &= ~KEEP_SYNCED;
    }
    return this;
  }

  @Override
  public final boolean isStateful() {
    return (this.flags & STATEFUL) != 0;
  }

  @Override
  public MapDownlinkView<K, V> isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= STATEFUL;
    } else {
      this.flags &= ~STATEFUL;
    }
    final MapDownlinkModel model = this.model;
    if (model != null) {
      model.isStateful(isStateful);
    }
    return this;
  }

  void didSetStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= STATEFUL;
    } else {
      this.flags &= ~STATEFUL;
    }
  }

  @Override
  public final Form<K> keyForm() {
    return this.keyForm;
  }

  @Override
  public <K2> MapDownlinkView<K2, V> keyForm(Form<K2> keyForm) {
    return new MapDownlinkView<K2, V>(this.cellContext, this.stage, this.meshUri,
                                      this.hostUri, this.nodeUri, this.laneUri,
                                      this.prio, this.rate, this.body, this.flags,
                                      keyForm, this.valueForm, typesafeObservers(this.observers));
  }

  @Override
  public <K2> MapDownlinkView<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> MapDownlinkView<K, V2> valueForm(Form<V2> valueForm) {
    return new MapDownlinkView<K, V2>(this.cellContext, this.stage, this.meshUri,
                                      this.hostUri, this.nodeUri, this.laneUri,
                                      this.prio, this.rate, this.body, this.flags,
                                      this.keyForm, valueForm, typesafeObservers(this.observers));
  }

  @Override
  public <V2> MapDownlinkView<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillUpdateKey, DidUpdateKey, WillRemoveKey, DidRemoveKey,
    //       WillDrop, DidDrop, WillTake, DidTake, WillClear, DidClear
    return observers;
  }

  @SuppressWarnings("unchecked")
  @Override
  public MapDownlinkView<K, V> observe(Object observer) {
    return (MapDownlinkView<K, V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public MapDownlinkView<K, V> unobserve(Object observer) {
    return (MapDownlinkView<K, V>) super.unobserve(observer);
  }

  @Override
  public MapDownlinkView<K, V> willUpdate(WillUpdateKey<K, V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public MapDownlinkView<K, V> didUpdate(DidUpdateKey<K, V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public MapDownlinkView<K, V> willRemove(WillRemoveKey<K> willRemove) {
    return observe(willRemove);
  }

  @Override
  public MapDownlinkView<K, V> didRemove(DidRemoveKey<K, V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public MapDownlink<K, V> willDrop(WillDrop willDrop) {
    return observe(willDrop);
  }

  @Override
  public MapDownlink<K, V> didDrop(DidDrop didDrop) {
    return observe(didDrop);
  }

  @Override
  public MapDownlink<K, V> willTake(WillTake willTake) {
    return observe(willTake);
  }

  @Override
  public MapDownlink<K, V> didTake(DidTake didTake) {
    return observe(didTake);
  }

  @Override
  public MapDownlinkView<K, V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public MapDownlinkView<K, V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public MapDownlinkView<K, V> willReceive(WillReceive willReceive) {
    return observe(willReceive);
  }

  @Override
  public MapDownlinkView<K, V> didReceive(DidReceive didReceive) {
    return observe(didReceive);
  }

  @Override
  public MapDownlinkView<K, V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public MapDownlinkView<K, V> willLink(WillLink willLink) {
    return observe(willLink);
  }

  @Override
  public MapDownlinkView<K, V> didLink(DidLink didLink) {
    return observe(didLink);
  }

  @Override
  public MapDownlinkView<K, V> willSync(WillSync willSync) {
    return observe(willSync);
  }

  @Override
  public MapDownlinkView<K, V> didSync(DidSync didSync) {
    return observe(didSync);
  }

  @Override
  public MapDownlinkView<K, V> willUnlink(WillUnlink willUnlink) {
    return observe(willUnlink);
  }

  @Override
  public MapDownlinkView<K, V> didUnlink(DidUnlink didUnlink) {
    return observe(didUnlink);
  }

  @Override
  public MapDownlinkView<K, V> didConnect(DidConnect didConnect) {
    return observe(didConnect);
  }

  @Override
  public MapDownlinkView<K, V> didDisconnect(DidDisconnect didDisconnect) {
    return observe(didDisconnect);
  }

  @Override
  public MapDownlinkView<K, V> didClose(DidClose didClose) {
    return observe(didClose);
  }

  @Override
  public MapDownlinkView<K, V> didFail(DidFail didFail) {
    return observe(didFail);
  }

  public Value downlinkWillUpdateValue(Value key, Value newValue) {
    return newValue;
  }

  public void downlinkDidUpdateValue(Value key, Value newValue, Value oldValue) {
  }

  public V downlinkWillUpdate(K key, V newValue) {
    return newValue;
  }

  public void downlinkDidUpdate(K key, V newValue, V oldValue) {
    invalidateInputKey(key, KeyEffect.UPDATE);
    reconcileInput(0); // TODO: debounce and track version
  }

  public void downlinkWillRemoveValue(Value key) {
  }

  public void downlinkDidRemoveValue(Value key, Value oldValue) {
  }

  public void downlinkWillRemove(K key) {
  }

  public void downlinkDidRemove(K key, V oldValue) {
    invalidateInputKey(key, KeyEffect.REMOVE);
    reconcileInput(0); // TODO: debounce and track version
  }

  public void downlinkWillDrop(int lower) {
  }

  public void downlinkDidDrop(int lower) {
  }

  public void downlinkWillTake(int upper) {
  }

  public void downlinkDidTake(int upper) {
  }

  public void downlinkWillClear() {
  }

  public void downlinkDidClear() {
  }

  @SuppressWarnings("unchecked")
  public Entry<Boolean, V> dispatchWillUpdate(K key, V newValue, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUpdateKey<?, ?>) {
        if (((WillUpdateKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillUpdateKey<K, V>) observers).willUpdate(key, newValue);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillUpdateKey<?, ?>) {
            if (((WillUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillUpdateKey<K, V>) observer).willUpdate(key, newValue);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return new AbstractMap.SimpleImmutableEntry<Boolean, V>(complete, newValue);
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidUpdate(K key, V newValue, V oldValue, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUpdateKey<?, ?>) {
        if (((DidUpdateKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidUpdateKey<K, V>) observers).didUpdate(key, newValue, oldValue);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidUpdateKey<?, ?>) {
            if (((DidUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidUpdateKey<K, V>) observer).didUpdate(key, newValue, oldValue);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchWillRemove(K key, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRemoveKey<?>) {
        if (((WillRemoveKey<?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRemoveKey<K>) observers).willRemove(key);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillRemoveKey<?>) {
            if (((WillRemoveKey<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRemoveKey<K>) observer).willRemove(key);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidRemove(K key, V oldValue, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRemoveKey<?, ?>) {
        if (((DidRemoveKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRemoveKey<K, V>) observers).didRemove(key, oldValue);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidRemoveKey<?, ?>) {
            if (((DidRemoveKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRemoveKey<K, V>) observer).didRemove(key, oldValue);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchWillDrop(int lower, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillDrop) {
        if (((WillDrop) observers).isPreemptive() == preemptive) {
          try {
            ((WillDrop) observers).willDrop(lower);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillDrop) {
            if (((WillDrop) observer).isPreemptive() == preemptive) {
              try {
                ((WillDrop) observer).willDrop(lower);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidDrop(int lower, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidDrop) {
        if (((DidDrop) observers).isPreemptive() == preemptive) {
          try {
            ((DidDrop) observers).didDrop(lower);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidDrop) {
            if (((DidDrop) observer).isPreemptive() == preemptive) {
              try {
                ((DidDrop) observer).didDrop(lower);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchWillTake(int upper, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillTake) {
        if (((WillTake) observers).isPreemptive() == preemptive) {
          try {
            ((WillTake) observers).willTake(upper);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillTake) {
            if (((WillTake) observer).isPreemptive() == preemptive) {
              try {
                ((WillTake) observer).willTake(upper);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidTake(int upper, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidTake) {
        if (((DidTake) observers).isPreemptive() == preemptive) {
          try {
            ((DidTake) observers).didTake(upper);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidTake) {
            if (((DidTake) observer).isPreemptive() == preemptive) {
              try {
                ((DidTake) observer).didTake(upper);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchWillClear(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillClear) {
        if (((WillClear) observers).isPreemptive() == preemptive) {
          try {
            ((WillClear) observers).willClear();
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillClear) {
            if (((WillClear) observer).isPreemptive() == preemptive) {
              try {
                ((WillClear) observer).willClear();
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidClear(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidClear) {
        if (((DidClear) observers).isPreemptive() == preemptive) {
          try {
            ((DidClear) observers).didClear();
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidClear) {
            if (((DidClear) observer).isPreemptive() == preemptive) {
              try {
                ((DidClear) observer).didClear();
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @Override
  public MapDownlinkModel createDownlinkModel() {
    return new MapDownlinkModel(this.meshUri, this.hostUri, this.nodeUri,
                                this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public MapDownlinkView<K, V> open() {
    if (this.model == null) {
      final LinkBinding linkBinding = this.cellContext.bindDownlink(this);
      if (linkBinding instanceof MapDownlinkModel) {
        this.model = (MapDownlinkModel) linkBinding;
        this.model.addDownlink(this);
      } else {
        throw new DownlinkException("downlink type mismatch");
      }
    }
    return this;
  }

  @Override
  public boolean isEmpty() {
    return this.model.isEmpty();
  }

  @Override
  public int size() {
    return this.model.size();
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean containsKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      return this.model.containsKey(key);
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean containsValue(Object valueObject) {
    final Class<?> valueType = this.valueForm.type();
    if (valueType == null || valueType.isInstance(valueObject)) {
      final Value value = this.valueForm.mold((V) valueObject).toValue();
      return this.model.containsValue(value);
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  @Override
  public int indexOf(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      return this.model.indexOf(key);
    }
    throw new IllegalArgumentException(keyObject.toString());
  }

  @SuppressWarnings("unchecked")
  @Override
  public V get(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value value = this.model.get(key);
      final V valueObject = this.valueForm.cast(value);
      if (valueObject != null) {
        return valueObject;
      }
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> getEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = this.model.getEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    final Entry<Value, Value> entry = this.model.getIndex(index);
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public Entry<K, V> firstEntry() {
    final Entry<Value, Value> entry = this.model.firstEntry();
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public K firstKey() {
    final Value key = this.model.firstKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public V firstValue() {
    final Value value = this.model.firstValue();
    final V object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @Override
  public Entry<K, V> lastEntry() {
    final Entry<Value, Value> entry = this.model.lastEntry();
    if (entry != null) {
      return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
    }
    return null;
  }

  @Override
  public K lastKey() {
    final Value key = this.model.lastKey();
    final K keyObject = this.keyForm.cast(key);
    if (keyObject != null) {
      return keyObject;
    }
    return this.keyForm.unit();
  }

  @Override
  public V lastValue() {
    final Value value = this.model.lastValue();
    final V object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    }
    return this.valueForm.unit();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> nextEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = this.model.nextEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public K nextKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value nextKey = this.model.nextKey(key);
      final K nextKeyObject = this.keyForm.cast(nextKey);
      if (nextKeyObject != null) {
        return nextKeyObject;
      }
      return this.keyForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public V nextValue(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value nextValue = this.model.nextValue(key);
      final V nextObject = this.valueForm.cast(nextValue);
      if (nextObject != null) {
        return nextObject;
      }
      return this.valueForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Entry<K, V> previousEntry(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Entry<Value, Value> entry = this.model.previousEntry(key);
      if (entry != null) {
        return new ValueEntry<K, V>(entry, this.keyForm, this.valueForm);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public K previousKey(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value previousKey = this.model.previousKey(key);
      final K previousKeyObject = this.keyForm.cast(previousKey);
      if (previousKeyObject != null) {
        return previousKeyObject;
      }
      return this.keyForm.unit();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public V previousValue(Object keyObject) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(keyObject)) {
      final Value key = this.keyForm.mold((K) keyObject).toValue();
      final Value previousValue = this.model.previousValue(key);
      final V previousObject = this.valueForm.cast(previousValue);
      if (previousObject != null) {
        return previousObject;
      }
      return this.valueForm.unit();
    }
    return null;
  }

  @Override
  public V put(K key, V value) {
    return this.model.put(this, key, value);
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      this.model.put(this, entry.getKey(), entry.getValue());
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public V remove(Object key) {
    return this.model.remove(this, (K) key);
  }

  @Override
  public void drop(int lower) {
    this.model.drop(this, lower);
  }

  @Override
  public void take(int upper) {
    this.model.take(this, upper);
  }

  @Override
  public void clear() {
    this.model.clear(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> headMap(K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueOrderedMap<K, V>(this.model.headMap(toKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) this.model.headMap((Value) toKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> tailMap(K fromKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      return new ValueOrderedMap<K, V>(this.model.tailMap(fromKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) this.model.tailMap((Value) fromKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMap<K, V> subMap(K fromKeyObject, K toKeyObject) {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      final Value fromKey = this.keyForm.mold(fromKeyObject).toValue();
      final Value toKey = this.keyForm.mold(toKeyObject).toValue();
      return new ValueOrderedMap<K, V>(this.model.subMap(fromKey, toKey), this.keyForm, this.valueForm);
    } else {
      return (OrderedMap<K, V>) (OrderedMap<?, ?>) this.model.subMap((Value) fromKeyObject, (Value) toKeyObject);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<Entry<K, V>> entrySet() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueMapEntrySet<K, V>(this.model.state, this.keyForm, this.valueForm);
    } else {
      return (Set<Entry<K, V>>) (Set<?>) this.model.entrySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<K> keySet() {
    if (this.keyForm != Form.forValue()) {
      return new ValueSet<K>(this.model.keySet(), this.keyForm);
    } else {
      return (Set<K>) this.model.keySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Collection<V> values() {
    if (this.valueForm != Form.forValue()) {
      return new ValueCollection<V>(this.model.values(), this.valueForm);
    } else {
      return (Collection<V>) this.model.values();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public OrderedMapCursor<K, V> iterator() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueOrderedMapCursor<K, V>(this.model.iterator(), this.keyForm, this.valueForm);
    } else {
      return (OrderedMapCursor<K, V>) (OrderedMapCursor<?, ?>) this.model.iterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Cursor<K> keyIterator() {
    if (this.keyForm != Form.forValue()) {
      return new ValueCursor<K>(this.model.keyIterator(), this.keyForm);
    } else {
      return (Cursor<K>) this.model.keyIterator();
    }
  }

  @SuppressWarnings("unchecked")
  public Cursor<V> valueIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueCursor<V>(this.model.valueIterator(), this.valueForm);
    } else {
      return (Cursor<V>) this.model.valueIterator();
    }
  }

  @Override
  public Comparator<? super K> comparator() {
    return null;
  }

  @Override
  public MapDownlink<K, V> get() {
    return this;
  }

  @Override
  public MapOutlet<K, V, ? extends Map<K, V>> input() {
    return this.input;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindInput(Outlet<? extends Map<K, V>> input) {
    if (input instanceof MapOutlet<?, ?, ?>) {
      bindInput((MapOutlet<K, V, ? extends Map<K, V>>) input);
    } else {
      throw new IllegalArgumentException(input.toString());
    }
  }

  public void bindInput(MapOutlet<K, V, ? extends Map<K, V>> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final MapOutlet<K, V, ? extends Map<K, V>> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public Outlet<V> outlet(K key) {
    KeyOutlet<K, V> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<K, V>(this, key);
      this.outlets = this.outlets.updated(key, outlet);
    }
    return outlet;
  }

  @Override
  public Iterator<Inlet<? super MapDownlink<K, V>>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super MapDownlink<K, V>> output) {
    final Inlet<? super MapDownlink<K, V>>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super MapDownlink<K, V>>[] newOutputs = (Inlet<? super MapDownlink<K, V>>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super MapDownlink<K, V>> output) {
    final Inlet<? super MapDownlink<K, V>>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super MapDownlink<K, V>>[] newOutputs = (Inlet<? super MapDownlink<K, V>>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.unbindOutputs();
      }
    }
    final Inlet<? super MapDownlink<K, V>>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super MapDownlink<K, V>> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.disconnectOutputs();
      }
    }
    final Inlet<? super MapDownlink<K, V>>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super MapDownlink<K, V>> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  @Override
  public void invalidateOutputKey(K key, KeyEffect effect) {
    invalidateKey(key, effect);
  }

  @Override
  public void invalidateInputKey(K key, KeyEffect effect) {
    invalidateKey(key, effect);
  }

  @SuppressWarnings("unchecked")
  public void invalidateKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      willInvalidateKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      onInvalidateKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<K, V, ? super MapDownlink<K, V>>) output).invalidateOutputKey(key, effect);
        } else {
          output.invalidateOutput();
        }
      }
      final KeyOutlet<K, V> outlet = this.outlets.get(key);
      if (outlet != null) {
        outlet.invalidateInput();
      }
      didInvalidateKey(key, effect);
    }
  }

  @Override
  public void invalidateOutput() {
    invalidate();
  }

  @Override
  public void invalidateInput() {
    invalidate();
  }

  public void invalidate() {
    if (this.version >= 0) {
      willInvalidate();
      this.version = -1;
      onInvalidate();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].invalidateOutput();
      }
      final Iterator<KeyOutlet<K, V>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().invalidateInput();
      }
      didInvalidate();
    }
  }

  @Override
  public void reconcileOutputKey(K key, int version) {
    reconcileKey(key, version);
  }

  @Override
  public void reconcileInputKey(K key, int version) {
    reconcileKey(key, version);
  }

  @SuppressWarnings("unchecked")
  public void reconcileKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        willReconcileKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        if (this.input != null) {
          this.input.reconcileInputKey(key, version);
        }
        onReconcileKey(key, effect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<K, V, ? super MapDownlink<K, V>>) output).reconcileOutputKey(key, version);
          }
        }
        final KeyOutlet<K, V> outlet = this.outlets.get(key);
        if (outlet != null) {
          outlet.reconcileInput(version);
        }
        didReconcileKey(key, effect, version);
      }
    }
  }

  @Override
  public void reconcileOutput(int version) {
    reconcile(version);
  }

  @Override
  public void reconcileInput(int version) {
    reconcile(version);
  }

  public void reconcile(int version) {
    if (this.version < 0) {
      willReconcile(version);
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        reconcileKey(keys.next(), version);
      }
      this.version = version;
      onReconcile(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].reconcileOutput(version);
      }
      didReconcile(version);
    }
  }

  protected void willInvalidateKey(K key, KeyEffect effect) {
    // stub
  }

  protected void onInvalidateKey(K key, KeyEffect effect) {
    // stub
  }

  protected void didInvalidateKey(K key, KeyEffect effect) {
    // stub
  }

  protected void willInvalidate() {
    // stub
  }

  protected void onInvalidate() {
    // stub
  }

  protected void didInvalidate() {
    // stub
  }

  protected void willUpdate(int version) {
    // stub
  }

  protected void didUpdate(int version) {
    // stub
  }

  protected void willReconcileKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void onReconcileKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value != null) {
          put(key, value);
        } else {
          remove(key);
        }
      }
    } else if (effect == KeyEffect.REMOVE) {
      if (containsKey(key)) {
        remove(key);
      }
    }
  }

  protected void didReconcileKey(K key, KeyEffect effect, int version) {
    // stub
  }

  protected void willReconcile(int version) {
    // stub
  }

  protected void onReconcile(int version) {
    // stub
  }

  protected void didReconcile(int version) {
    // stub
  }

  protected static final int STATEFUL = 1 << 2;
}
