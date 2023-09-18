// Copyright 2015-2023 Nstream, inc.
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

package swim.system.downlink;

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
import swim.api.DownlinkException;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.downlink.ValueDownlink;
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
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.observable.function.DidSet;
import swim.observable.function.WillSet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.CellContext;
import swim.system.LinkBinding;
import swim.system.warp.WarpDownlinkView;
import swim.uri.Uri;
import swim.util.Cursor;

public class ValueDownlinkView<V> extends WarpDownlinkView implements ValueDownlink<V> {

  protected final Form<V> valueForm;
  protected ValueDownlinkModel model;
  protected Outlet<? extends V> input;
  protected Inlet<? super V>[] outputs; // TODO: unify with observers
  protected int version;

  public ValueDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                           Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                           float rate, Value body, int flags, Form<V> valueForm,
                           Object observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    this.valueForm = valueForm;
    this.model = null;

    this.input = null;
    this.outputs = null;
    this.version = -1;
  }

  public ValueDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                           Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                           float rate, Value body, Form<V> valueForm) {
    this(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate, body,
         WarpDownlinkView.KEEP_LINKED | WarpDownlinkView.KEEP_SYNCED | ValueDownlinkView.STATEFUL,
         valueForm, null);
  }

  @Override
  public ValueDownlinkModel downlinkModel() {
    return this.model;
  }

  @Override
  public ValueDownlinkView<V> hostUri(Uri hostUri) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    hostUri, this.nodeUri, this.laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
  }

  @Override
  public ValueDownlinkView<V> nodeUri(Uri nodeUri) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, nodeUri, this.laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> nodeUri(String nodeUri) {
    return this.nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public ValueDownlinkView<V> laneUri(Uri laneUri) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> laneUri(String laneUri) {
    return this.laneUri(Uri.parse(laneUri));
  }

  @Override
  public ValueDownlinkView<V> prio(float prio) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> rate(float rate) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    this.prio, rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> body(Value body) {
    return new ValueDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    this.prio, this.rate, body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> keepLinked(boolean keepLinked) {
    if (keepLinked) {
      this.flags |= WarpDownlinkView.KEEP_LINKED;
    } else {
      this.flags &= ~WarpDownlinkView.KEEP_LINKED;
    }
    return this;
  }

  @Override
  public ValueDownlinkView<V> keepSynced(boolean keepSynced) {
    if (keepSynced) {
      this.flags |= WarpDownlinkView.KEEP_SYNCED;
    } else {
      this.flags &= ~WarpDownlinkView.KEEP_SYNCED;
    }
    return this;
  }

  @Override
  public final boolean isStateful() {
    return (this.flags & ValueDownlinkView.STATEFUL) != 0;
  }

  @Override
  public ValueDownlinkView<V> isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= ValueDownlinkView.STATEFUL;
    } else {
      this.flags &= ~ValueDownlinkView.STATEFUL;
    }
    final ValueDownlinkModel model = this.model;
    if (this.model != null) {
      this.model.isStateful(isStateful);
    }
    return this;
  }

  void didSetStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= ValueDownlinkView.STATEFUL;
    } else {
      this.flags &= ~ValueDownlinkView.STATEFUL;
    }
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> ValueDownlinkView<V2> valueForm(Form<V2> valueForm) {
    return new ValueDownlinkView<V2>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, this.laneUri,
                                     this.prio, this.rate, this.body, this.flags,
                                     valueForm, this.typesafeObservers(this.observers));
  }

  @Override
  public <V2> ValueDownlinkView<V2> valueClass(Class<V2> valueClass) {
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillSet, DidSet
    return observers;
  }

  @SuppressWarnings("unchecked")
  @Override
  public ValueDownlinkView<V> observe(Object observer) {
    return (ValueDownlinkView<V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public ValueDownlinkView<V> unobserve(Object observer) {
    return (ValueDownlinkView<V>) super.unobserve(observer);
  }

  @Override
  public ValueDownlinkView<V> willSet(WillSet<V> willSet) {
    return this.observe(willSet);
  }

  @Override
  public ValueDownlinkView<V> didSet(DidSet<V> didSet) {
    return this.observe(didSet);
  }

  @Override
  public ValueDownlinkView<V> willReceive(WillReceive willReceive) {
    return this.observe(willReceive);
  }

  @Override
  public ValueDownlinkView<V> didReceive(DidReceive didReceive) {
    return this.observe(didReceive);
  }

  @Override
  public ValueDownlinkView<V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public ValueDownlinkView<V> willLink(WillLink willLink) {
    return this.observe(willLink);
  }

  @Override
  public ValueDownlinkView<V> didLink(DidLink didLink) {
    return this.observe(didLink);
  }

  @Override
  public ValueDownlinkView<V> willSync(WillSync willSync) {
    return this.observe(willSync);
  }

  @Override
  public ValueDownlinkView<V> didSync(DidSync didSync) {
    return this.observe(didSync);
  }

  @Override
  public ValueDownlinkView<V> willUnlink(WillUnlink willUnlink) {
    return this.observe(willUnlink);
  }

  @Override
  public ValueDownlinkView<V> didUnlink(DidUnlink didUnlink) {
    return this.observe(didUnlink);
  }

  @Override
  public ValueDownlinkView<V> didConnect(DidConnect didConnect) {
    return this.observe(didConnect);
  }

  @Override
  public ValueDownlinkView<V> didDisconnect(DidDisconnect didDisconnect) {
    return this.observe(didDisconnect);
  }

  @Override
  public ValueDownlinkView<V> didClose(DidClose didClose) {
    return this.observe(didClose);
  }

  @Override
  public ValueDownlinkView<V> didFail(DidFail didFail) {
    return this.observe(didFail);
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, V> dispatchWillSet(V newValue, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillSet<?>) {
        if (((WillSet<?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillSet<V>) observers).willSet(newValue);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.downlinkDidFail(error);
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
          if (observer instanceof WillSet<?>) {
            if (((WillSet<?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillSet<V>) observer).willSet(newValue);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.downlinkDidFail(error);
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
  public boolean dispatchDidSet(V newValue, V oldValue, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidSet<?>) {
        if (((DidSet<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidSet<V>) observers).didSet(newValue, oldValue);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.downlinkDidFail(error);
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
          if (observer instanceof DidSet<?>) {
            if (((DidSet<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidSet<V>) observer).didSet(newValue, oldValue);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.downlinkDidFail(error);
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

  public Value downlinkWillSetValue(Value newValue) {
    return newValue;
  }

  public void downlinkDidSetValue(Value newValue, Value oldValue) {
    // hook
  }

  public V downlinkWillSet(V newValue) {
    return newValue;
  }

  public void downlinkDidSet(V newValue, V oldValue) {
    this.decohere();
    this.recohere(0); // TODO: debounce and track version
  }

  @Override
  public ValueDownlinkModel createDownlinkModel() {
    return new ValueDownlinkModel(this.meshUri, this.hostUri, this.nodeUri,
                                  this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public ValueDownlinkView<V> open() {
    if (this.model == null) {
      final LinkBinding linkBinding = this.cellContext.bindDownlink(this);
      if (linkBinding instanceof ValueDownlinkModel) {
        this.model = (ValueDownlinkModel) linkBinding;
        this.model.addDownlink(this);
      } else {
        throw new DownlinkException("downlink type mismatch");
      }
    }
    return this;
  }

  @Override
  public void close() {
    super.close();
    this.model = null;
  }

  @Override
  public V get() {
    final V state = this.valueForm.cast(this.model.get());
    if (state == null) {
      return this.valueForm.unit();
    }
    return state;
  }

  @Override
  public V set(V newValue) {
    return this.model.set(this, newValue);
  }

  @Override
  public Outlet<? extends V> input() {
    return this.input;
  }

  @Override
  public void bindInput(Outlet<? extends V> input) {
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
    final Outlet<? extends V> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public Iterator<Inlet<? super V>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super V> output) {
    final Inlet<? super V>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super V>[] newOutputs = (Inlet<? super V>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super V> output) {
    final Inlet<? super V>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super V>[] newOutputs = (Inlet<? super V>[]) new Inlet<?>[n - 1];
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
    final Inlet<? super V>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super V> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final Inlet<? super V>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super V> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  @Override
  public void decohereOutput() {
    this.decohere();
  }

  @Override
  public void decohereInput() {
    this.decohere();
  }

  public void decohere() {
    if (this.version >= 0) {
      this.willDecohere();
      this.version = -1;
      this.onDecohere();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].decohereOutput();
      }
      this.didDecohere();
    }
  }

  @Override
  public void recohereOutput(int version) {
    this.recohere(version);
  }

  @Override
  public void recohereInput(int version) {
    this.recohere(version);
  }

  public void recohere(int version) {
    if (this.version < 0) {
      this.willRecohere(version);
      this.version = version;
      if (this.input != null) {
        this.input.recohereInput(version);
      }
      this.onRecohere(version);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected void willDecohere() {
    // hook
  }

  protected void onDecohere() {
    // hook
  }

  protected void didDecohere() {
    // hook
  }

  protected void willRecohere(int version) {
    // hook
  }

  protected void onRecohere(int version) {
    if (this.input != null) {
      final V value = this.input.get();
      this.set(value);
    }
  }

  protected void didRecohere(int version) {
    // hook
  }

  protected static final int STATEFUL = 1 << 2;

}
