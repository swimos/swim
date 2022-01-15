// Copyright 2015-2021 Swim Inc.
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
import swim.ws.WsCloseFrame;
import swim.ws.WsControlFrame;
import swim.ws.WsPingFrame;
import swim.ws.WsPongFrame;

public abstract class AbstractWarpSocket implements WarpSocket, IpContext, FlowContext {

  protected WarpSocketContext context;

  public AbstractWarpSocket() {
    // nop
  }

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
    // hook
  }

  @Override
  public void didRead(Envelope envelope) {
    // hook
  }

  @Override
  public void didRead(WsControlFrame<?, ?> frame) {
    if (frame instanceof WsPingFrame<?, ?>) {
      this.write(WsPongFrame.create(frame.payloadValue()));
    } else if (frame instanceof WsCloseFrame<?, ?>) {
      this.close();
    }
  }

  @Override
  public void doWrite() {
    // hook
  }

  @Override
  public void didWrite(Envelope envelope) {
    // hook
  }

  @Override
  public void didWrite(WsControlFrame<?, ?> frame) {
    if (frame instanceof WsCloseFrame<?, ?>) {
      this.close();
    }
  }

  @Override
  public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
    // hook
  }

  @Override
  public void willConnect() {
    // hook
  }

  @Override
  public void didConnect() {
    // hook
  }

  @Override
  public void willSecure() {
    // hook
  }

  @Override
  public void didSecure() {
    // hook
  }

  @Override
  public void willBecome(IpSocket socket) {
    // hook
  }

  @Override
  public void didBecome(IpSocket socket) {
    // hook
  }

  @Override
  public void didTimeout() {
    // hook
  }

  @Override
  public void didDisconnect() {
    // hook
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

  public void write(WsControlFrame<?, ? extends Envelope> frame) {
    this.context.write(frame);
  }

  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  public void close() {
    this.context.close();
  }

}
