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

package swim.runtime.warp;

import swim.api.Link;
import swim.api.SwimContext;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.WarpDownlink;
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
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.observable.Observer;
import swim.runtime.CellContext;
import swim.runtime.DownlinkView;
import swim.runtime.observer.LaneObserver;
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

public abstract class WarpDownlinkView extends DownlinkView implements WarpDownlink {

  protected static final int KEEP_LINKED = 1 << 0;
  protected static final int KEEP_SYNCED = 1 << 1;
  protected final Uri meshUri;
  protected final Uri hostUri;
  protected final Uri nodeUri;
  protected final Uri laneUri;
  protected final float prio;
  protected final float rate;
  protected final Value body;
  protected volatile int flags;

  public WarpDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                          Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                          float rate, Value body, int flags, LaneObserver observers) {
    super(cellContext, stage, observers);
    this.meshUri = meshUri.isDefined() ? meshUri : hostUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.flags = flags;
  }

  @Override
  public abstract WarpDownlinkModel<?> downlinkModel();

  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public abstract WarpDownlinkView hostUri(Uri hostUri);

  @Override
  public abstract WarpDownlinkView hostUri(String hostUri);

  @Override
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public abstract WarpDownlinkView nodeUri(Uri nodeUri);

  @Override
  public abstract WarpDownlinkView nodeUri(String nodeUri);

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public abstract WarpDownlinkView laneUri(Uri laneUri);

  @Override
  public abstract WarpDownlinkView laneUri(String laneUri);

  @Override
  public final float prio() {
    return this.prio;
  }

  @Override
  public abstract WarpDownlinkView prio(float prio);

  @Override
  public final float rate() {
    return this.rate;
  }

  @Override
  public abstract WarpDownlinkView rate(float rate);

  @Override
  public final Value body() {
    return this.body;
  }

  @Override
  public abstract WarpDownlinkView body(Value body);

  @Override
  public final boolean keepLinked() {
    return (this.flags & KEEP_LINKED) != 0;
  }

  @Override
  public abstract WarpDownlinkView keepLinked(boolean keepLinked);

  @Override
  public final boolean keepSynced() {
    return (this.flags & KEEP_SYNCED) != 0;
  }

  @Override
  public abstract WarpDownlinkView keepSynced(boolean keepSynced);

  @Override
  public WarpDownlinkView observe(Observer observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public WarpDownlinkView unobserve(Observer observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract WarpDownlinkView willReceive(WillReceive willReceive);

  @Override
  public abstract WarpDownlinkView didReceive(DidReceive didReceive);

  @Override
  public abstract WarpDownlinkView willCommand(WillCommand willCommand);

  @Override
  public abstract WarpDownlinkView willLink(WillLink willLink);

  @Override
  public abstract WarpDownlinkView didLink(DidLink didLink);

  @Override
  public abstract WarpDownlinkView willSync(WillSync willSync);

  @Override
  public abstract WarpDownlinkView didSync(DidSync didSync);

  @Override
  public abstract WarpDownlinkView willUnlink(WillUnlink willUnlink);

  @Override
  public abstract WarpDownlinkView didUnlink(DidUnlink didUnlink);

  @Override
  public abstract WarpDownlinkView didConnect(DidConnect didConnect);

  @Override
  public abstract WarpDownlinkView didDisconnect(DidDisconnect didDisconnect);

  @Override
  public abstract WarpDownlinkView didClose(DidClose didClose);

  @Override
  public abstract WarpDownlinkView didFail(DidFail didFail);

  public boolean dispatchWillReceive(Value body, boolean preemptive) {
    return this.observers.dispatchWillReceive(this, preemptive, body);
  }

  public boolean dispatchDidReceive(Value body, boolean preemptive) {
    return this.observers.dispatchDidReceive(this, preemptive, body);
  }

  public boolean dispatchWillCommand(Value body, boolean preemptive) {
    return this.observers.dispatchWillCommand(this, preemptive, body);
  }

  public boolean dispatchWillLink(boolean preemptive) {
    return this.observers.dispatchWillLink(this, preemptive);
  }

  public boolean dispatchDidLink(boolean preemptive) {
    return this.observers.dispatchDidLink(this, preemptive);
  }

  public boolean dispatchWillSync(boolean preemptive) {
    return this.observers.dispatchWillSync(this, preemptive);
  }

  public boolean dispatchDidSync(boolean preemptive) {
    return this.observers.dispatchDidSync(this, preemptive);
  }

  public boolean dispatchWillUnlink(boolean preemptive) {
    return this.observers.dispatchWillUnlink(this, preemptive);
  }

  public boolean dispatchDidUnlink(boolean preemptive) {
    return this.observers.dispatchDidUnlink(this, preemptive);
  }

  public void downlinkWillReceive(EventMessage message) {
    // stub
  }

  public void downlinkDidReceive(EventMessage message) {
    // stub
  }

  public void downlinkWillCommand(CommandMessage message) {
    // stub
  }

  public void downlinkWillLink(LinkRequest request) {
    // stub
  }

  public void downlinkDidLink(LinkedResponse response) {
    // stub
  }

  public void downlinkWillSync(SyncRequest request) {
    // stub
  }

  public void downlinkDidSync(SyncedResponse response) {
    // stub
  }

  public void downlinkWillUnlink(UnlinkRequest request) {
    // stub
  }

  public void downlinkDidUnlink(UnlinkedResponse response) {
    // stub
  }

  @Override
  public abstract WarpDownlinkModel<?> createDownlinkModel();

  @Override
  public abstract WarpDownlinkView open();

  @Override
  public void command(float prio, Value body, Cont<CommandMessage> cont) {
    downlinkModel().command(prio, body, cont);
  }

  @Override
  public void command(Value body, Cont<CommandMessage> cont) {
    downlinkModel().command(body, cont);
  }

  @Override
  public void command(float prio, Value body) {
    downlinkModel().command(prio, body);
  }

  @Override
  public void command(Value body) {
    downlinkModel().command(body);
  }

}
