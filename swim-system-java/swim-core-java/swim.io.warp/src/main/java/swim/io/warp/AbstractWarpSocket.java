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

package swim.io.warp;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.concurrent.PullRequest;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowContext;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpContext;
import swim.io.IpSocket;
import swim.warp.Envelope;
import swim.ws.WsClose;
import swim.ws.WsControl;
import swim.ws.WsPing;
import swim.ws.WsPong;

public abstract class AbstractWarpSocket implements WarpSocket, IpContext, FlowContext {
  protected WarpSocketContext context;

  @Override
  public WarpSocketContext warpSocketContext() {
    return this.context;
  }

  @Override
  public void setWarpSocketContext(WarpSocketContext context) {
    this.context = context;
  }

  @Override
  public long idleTimeout() {
    return -1L; // default timeout
  }

  @Override
  public void doRead() {
    // stub
  }

  @Override
  public void didRead(Envelope envelope) {
    // stub
  }

  @Override
  public void didRead(WsControl<?, ?> frame) {
    if (frame instanceof WsPing<?, ?>) {
      write(WsPong.from(frame.payload()));
    } else if (frame instanceof WsClose<?, ?>) {
      close();
    }
  }

  @Override
  public void doWrite() {
    // stub
  }

  @Override
  public void didWrite(Envelope envelope) {
    // stub
  }

  @Override
  public void didWrite(WsControl<?, ?> frame) {
    if (frame instanceof WsClose<?, ?>) {
      close();
    }
  }

  @Override
  public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
    // stub
  }

  @Override
  public void willConnect() {
    // stub
  }

  @Override
  public void didConnect() {
    // stub
  }

  @Override
  public void willSecure() {
    // stub
  }

  @Override
  public void didSecure() {
    // stub
  }

  @Override
  public void willBecome(IpSocket socket) {
    // stub
  }

  @Override
  public void didBecome(IpSocket socket) {
    // stub
  }

  @Override
  public void didTimeout() {
    // stub
  }

  @Override
  public void didDisconnect() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @Override
  public boolean isConnected() {
    return this.context.isConnected();
  }

  @Override
  public boolean isClient() {
    return this.context.isClient();
  }

  @Override
  public boolean isServer() {
    return this.context.isServer();
  }

  @Override
  public boolean isSecure() {
    return this.context.isSecure();
  }

  @Override
  public String securityProtocol() {
    return this.context.securityProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.context.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public Principal localPrincipal() {
    return this.context.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.context.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.context.remoteAddress();
  }

  @Override
  public Principal remotePrincipal() {
    return this.context.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.context.remoteCertificates();
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  public WarpSettings warpSettings() {
    return this.context.warpSettings();
  }

  public void feed(PullRequest<Envelope> pullRequest) {
    this.context.feed(pullRequest);
  }

  public void feed(Envelope envelope, float prio) {
    this.context.feed(envelope, prio);
  }

  public void feed(Envelope envelope) {
    this.context.feed(envelope);
  }

  public void write(WsControl<?, ? extends Envelope> frame) {
    this.context.write(frame);
  }

  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  public void close() {
    this.context.close();
  }
}
