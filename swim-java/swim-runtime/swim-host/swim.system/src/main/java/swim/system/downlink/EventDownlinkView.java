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

package swim.system.downlink;

import swim.api.DownlinkException;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.downlink.EventDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.CellContext;
import swim.system.LinkBinding;
import swim.system.warp.WarpDownlinkView;
import swim.uri.Uri;

public class EventDownlinkView<V> extends WarpDownlinkView implements EventDownlink<V> {

  protected final Form<V> valueForm;
  protected EventDownlinkModel model;

  public EventDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                           Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                           float rate, Value body, int flags, Form<V> valueForm,
                           Object observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    this.valueForm = valueForm;
    this.model = null;
  }

  public EventDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                           Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                           float rate, Value body, Form<V> valueForm) {
    this(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate, body,
         WarpDownlinkView.KEEP_LINKED, valueForm, null);
  }

  @Override
  public EventDownlinkModel downlinkModel() {
    return this.model;
  }

  @Override
  public EventDownlinkView<V> hostUri(Uri hostUri) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    hostUri, this.nodeUri, this.laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
  }

  @Override
  public EventDownlinkView<V> nodeUri(Uri nodeUri) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, nodeUri, this.laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> nodeUri(String nodeUri) {
    return this.nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public EventDownlinkView<V> laneUri(Uri laneUri) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, laneUri,
                                    this.prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> laneUri(String laneUri) {
    return this.laneUri(Uri.parse(laneUri));
  }

  @Override
  public EventDownlinkView<V> prio(float prio) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    prio, this.rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> rate(float rate) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    this.prio, rate, this.body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> body(Value body) {
    return new EventDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
                                    this.hostUri, this.nodeUri, this.laneUri,
                                    this.prio, this.rate, body, this.flags,
                                    this.valueForm, this.observers);
  }

  @Override
  public EventDownlinkView<V> keepLinked(boolean keepLinked) {
    if (keepLinked) {
      this.flags |= WarpDownlinkView.KEEP_LINKED;
    } else {
      this.flags &= ~WarpDownlinkView.KEEP_LINKED;
    }
    return this;
  }

  @Override
  public EventDownlinkView<V> keepSynced(boolean keepSynced) {
    if (keepSynced) {
      this.flags |= WarpDownlinkView.KEEP_SYNCED;
    } else {
      this.flags &= ~WarpDownlinkView.KEEP_SYNCED;
    }
    return this;
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> EventDownlinkView<V2> valueForm(Form<V2> valueForm) {
    return new EventDownlinkView<V2>(this.cellContext, this.stage, this.meshUri,
                                     this.hostUri, this.nodeUri, this.laneUri,
                                     this.prio, this.rate, this.body, this.flags,
                                     valueForm, this.typesafeObservers(this.observers));
  }

  @Override
  public <V2> EventDownlinkView<V2> valueClass(Class<V2> valueClass) {
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnEvent
    return observers;
  }

  @SuppressWarnings("unchecked")
  @Override
  public EventDownlinkView<V> observe(Object observer) {
    return (EventDownlinkView<V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public EventDownlinkView<V> unobserve(Object observer) {
    return (EventDownlinkView<V>) super.unobserve(observer);
  }

  @Override
  public EventDownlinkView<V> onEvent(OnEvent<V> onEvent) {
    return this.observe(onEvent);
  }

  @Override
  public EventDownlinkView<V> willReceive(WillReceive willReceive) {
    return this.observe(willReceive);
  }

  @Override
  public EventDownlinkView<V> didReceive(DidReceive didReceive) {
    return this.observe(didReceive);
  }

  @Override
  public EventDownlinkView<V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public EventDownlinkView<V> willLink(WillLink willLink) {
    return this.observe(willLink);
  }

  @Override
  public EventDownlinkView<V> didLink(DidLink didLink) {
    return this.observe(didLink);
  }

  @Override
  public EventDownlinkView<V> willSync(WillSync willSync) {
    return this.observe(willSync);
  }

  @Override
  public EventDownlinkView<V> didSync(DidSync didSync) {
    return this.observe(didSync);
  }

  @Override
  public EventDownlinkView<V> willUnlink(WillUnlink willUnlink) {
    return this.observe(willUnlink);
  }

  @Override
  public EventDownlinkView<V> didUnlink(DidUnlink didUnlink) {
    return this.observe(didUnlink);
  }

  @Override
  public EventDownlinkView<V> didConnect(DidConnect didConnect) {
    return this.observe(didConnect);
  }

  @Override
  public EventDownlinkView<V> didDisconnect(DidDisconnect didDisconnect) {
    return this.observe(didDisconnect);
  }

  @Override
  public EventDownlinkView<V> didClose(DidClose didClose) {
    return this.observe(didClose);
  }

  @Override
  public EventDownlinkView<V> didFail(DidFail didFail) {
    return this.observe(didFail);
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchOnEvent(V value, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnEvent<?>) {
        if (((OnEvent<?>) observers).isPreemptive() == preemptive) {
          try {
            ((OnEvent<V>) observers).onEvent(value);
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
          if (observer instanceof OnEvent<?>) {
            if (((OnEvent<?>) observer).isPreemptive() == preemptive) {
              try {
                ((OnEvent<V>) observer).onEvent(value);
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

  public void downlinkOnEvent(V value) {
    // hook
  }

  @Override
  public EventDownlinkModel createDownlinkModel() {
    return new EventDownlinkModel(this.meshUri, this.hostUri, this.nodeUri,
                                  this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public EventDownlinkView<V> open() {
    if (this.model == null) {
      final LinkBinding linkBinding = this.cellContext.bindDownlink(this);
      if (linkBinding instanceof EventDownlinkModel) {
        this.model = (EventDownlinkModel) linkBinding;
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

}
