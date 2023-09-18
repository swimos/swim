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

package swim.api.downlink;

import swim.api.Downlink;
import swim.api.ref.WarpRef;
import swim.dataflow.AbstractRecordStreamlet;
import swim.dataflow.Reifier;
import swim.streamlet.Inout;
import swim.streamlet.Inoutlet;
import swim.streamlet.Out;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletScope;
import swim.structure.Form;
import swim.structure.Value;

public class DownlinkStreamlet extends AbstractRecordStreamlet<Value, Value> {

  @Inout
  public final Inoutlet<Value, Value> hostUri = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> nodeUri = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> laneUri = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> prio = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> rate = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> body = this.inoutlet();
  @Inout
  public final Inoutlet<Value, Value> type = this.inoutlet();

  protected final WarpRef warp;

  @SuppressWarnings("checkstyle:VisibilityModifier")
  @Out
  public Outlet<Value> state;

  protected Downlink downlink;
  protected DownlinkRecord downlinkRecord;

  protected String inputHostUri;
  protected String inputNodeUri;
  protected String inputLaneUri;
  protected float inputPrio;
  protected float inputRate;
  protected Value inputBody;
  protected String inputType;

  public DownlinkStreamlet(WarpRef warp, StreamletScope<? extends Value> scope) {
    super(scope);
    this.warp = warp;
  }

  public DownlinkStreamlet(WarpRef warp) {
    this(warp, null);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Value getOutput(Outlet<? super Value> outlet) {
    if (outlet == this.state) {
      if (this.downlink instanceof ValueDownlink) {
        return ((ValueDownlink<Value>) this.downlink).get();
      } else if (this.downlinkRecord != null) {
        return this.downlinkRecord;
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void onRecohere(int version) {
    final String hostUri = this.castInput(this.hostUri, Form.forString());
    final String nodeUri = this.castInput(this.nodeUri, Form.forString());
    final String laneUri = this.castInput(this.laneUri, Form.forString());
    final float prio = this.castInput(this.prio, Form.forFloat(), 0f);
    final float rate = this.castInput(this.rate, Form.forFloat(), 0f);
    final Value body = this.getInput(this.body);
    final String type = this.castInput(this.type, Form.forString());
    if ((hostUri == null ? this.inputHostUri != null : !hostUri.equals(this.inputHostUri))
        || (nodeUri == null ? this.inputNodeUri != null : !nodeUri.equals(this.inputNodeUri))
        || (laneUri == null ? this.inputLaneUri != null : !laneUri.equals(this.inputLaneUri))
        || prio != this.inputPrio || rate != this.inputRate
        || (body == null ? this.inputBody != null : !body.equals(this.inputBody))
        || (type == null ? this.inputType != null : !type.equals(this.inputType))) {
      if (this.downlink != null) {
        this.downlink.close();
        this.downlink = null;
        this.downlinkRecord = null;
      }
      this.inputHostUri = hostUri;
      this.inputNodeUri = nodeUri;
      this.inputLaneUri = laneUri;
      this.inputPrio = prio;
      this.inputRate = rate;
      this.inputBody = body;
      this.inputType = type;
      final WarpRef warp = this.warp;
      if ("map".equals(type)) {
        MapDownlink<Value, Value> downlink = warp.downlinkMap();
        if (hostUri != null) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri != null) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri != null) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio != 0f) {
          downlink = downlink.prio(prio);
        }
        if (rate != 0f) {
          downlink = downlink.rate(rate);
        }
        if (body != null) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = (Outlet<Value>) (Outlet<?>) downlink;
        this.downlink = downlink;
        this.downlinkRecord = new MapDownlinkRecord(downlink);
      } else if ("value".equals(type)) {
        ValueDownlink<Value> downlink = warp.downlinkValue();
        if (hostUri != null) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri != null) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri != null) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio != 0f) {
          downlink = downlink.prio(prio);
        }
        if (rate != 0f) {
          downlink = downlink.rate(rate);
        }
        if (body != null) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = downlink;
        this.downlink = downlink;
      }
    }
  }

  public static Reifier reifier(WarpRef warp) {
    return new DownlinkReifier(warp);
  }

}
