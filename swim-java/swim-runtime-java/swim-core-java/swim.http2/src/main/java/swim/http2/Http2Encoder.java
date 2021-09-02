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

package swim.http2;

import swim.codec.Encoder;
import swim.codec.OutputBuffer;

public class Http2Encoder {

  public <T> Encoder<?, Http2DataFrame<T>> dataFrameEncoder(Http2DataFrame<T> frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2DataFrameEncoder<T>(this, frame);
  }

  public <T> Encoder<?, Http2DataFrame<T>> encodeDataFrame(OutputBuffer<?> output, Http2DataFrame<T> frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2DataFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2HeadersFrame> headersFrameEncoder(Http2HeadersFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2HeadersFrameEncoder(this, frame);
  }

  public Encoder<?, Http2HeadersFrame> encodeHeadersFrame(OutputBuffer<?> output, Http2HeadersFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2HeadersFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2PriorityFrame> priorityFrameEncoder(Http2PriorityFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2PriorityFrameEncoder(this, frame);
  }

  public Encoder<?, Http2PriorityFrame> encodePriorityFrame(OutputBuffer<?> output, Http2PriorityFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2PriorityFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2RstStreamFrame> rstStreamFrameEncoder(Http2RstStreamFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2RstStreamFrameEncoder(this, frame);
  }

  public Encoder<?, Http2RstStreamFrame> encodeRstStreamFrame(OutputBuffer<?> output, Http2RstStreamFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2RstStreamFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2SettingsFrame> settingsFrameEncoder(Http2SettingsFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2SettingsFrameEncoder(this, frame);
  }

  public Encoder<?, Http2SettingsFrame> encodeSettingsFrame(OutputBuffer<?> output, Http2SettingsFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2SettingsFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2PushPromiseFrame> pushPromiseFrameEncoder(Http2PushPromiseFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2PushPromiseFrameEncoder(this, frame);
  }

  public Encoder<?, Http2PushPromiseFrame> encodePushPromiseFrame(OutputBuffer<?> output, Http2PushPromiseFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2PushPromiseFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2PingFrame> pingFrameEncoder(Http2PingFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2PingFrameEncoder(this, frame);
  }

  public Encoder<?, Http2PingFrame> encodePingFrame(OutputBuffer<?> output, Http2PingFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2PingFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2GoawayFrame> goawayFrameEncoder(Http2GoawayFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2GoawayFrameEncoder(this, frame);
  }

  public Encoder<?, Http2GoawayFrame> encodeGoawayFrame(OutputBuffer<?> output, Http2GoawayFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2GoawayFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2WindowUpdateFrame> windowUpdateFrameEncoder(Http2WindowUpdateFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2WindowUpdateFrameEncoder(this, frame);
  }

  public Encoder<?, Http2WindowUpdateFrame> encodeWindowUpdateFrame(OutputBuffer<?> output, Http2WindowUpdateFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2WindowUpdateFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, Http2ContinuationFrame> continuationFrameEncoder(Http2ContinuationFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return new Http2ContinuationFrameEncoder(this, frame);
  }

  public Encoder<?, Http2ContinuationFrame> encodeContinuationFrame(OutputBuffer<?> output, Http2ContinuationFrame frame) {
    throw new UnsupportedOperationException(); // TODO: return Http2ContinuationFrameEncoder.encode(output, this, frame);
  }

  public Encoder<?, ?> settingEncoder(int identifier, int value) {
    throw new UnsupportedOperationException(); // TODO: return new Http2SettingEncoder(identifier, value);
  }

  public Encoder<?, ?> encodeSetting(OutputBuffer<?> output, int identifier, int value) {
    throw new UnsupportedOperationException(); // ODO: return Http2SettingEncoder.encode(output, this, identifier, value);
  }

}
